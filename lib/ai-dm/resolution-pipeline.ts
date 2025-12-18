/**
 * Resolution Pipeline
 * Applies AI DM decisions to the database (dice → rules → DB commit)
 */

import { createServiceClient } from '../supabase/server'
import { TurnResolution, EntityStateUpdate, EventLogEntry } from './output-schemas'
import { compareAndSwap } from '../turn-contract/concurrency'
import type { Database } from '@/types/database'

type SupabaseClient = ReturnType<typeof createServiceClient>

export interface ResolutionResult {
  success: boolean
  errors: string[]
  warnings: string[]
  updatedEntities: string[]
  createdEvents: string[]
  turnContractId?: string
}

/**
 * Apply turn resolution to database
 */
export async function applyTurnResolution(
  turnContractId: string,
  resolution: TurnResolution,
  sceneId: string,
  campaignId: string
): Promise<ResolutionResult> {
  const supabase = createServiceClient()
  const errors: string[] = []
  const warnings: string[] = []
  const updatedEntities: string[] = []
  const createdEvents: string[] = []

  try {
    // Begin transaction-like operations
    // Note: Supabase doesn't support native transactions via API,
    // so we'll do careful sequential operations with rollback capability

    // 1. Apply entity state updates
    if (resolution.entity_updates && resolution.entity_updates.length > 0) {
      const entityResults = await applyEntityUpdates(supabase, resolution.entity_updates, sceneId)

      updatedEntities.push(...entityResults.updated)
      errors.push(...entityResults.errors)
      warnings.push(...entityResults.warnings)
    }

    // 2. Create event log entries
    if (resolution.events && resolution.events.length > 0) {
      const eventResults = await createEventLogs(
        supabase,
        resolution.events,
        campaignId,
        sceneId,
        turnContractId
      )

      createdEvents.push(...eventResults.created)
      errors.push(...eventResults.errors)
    }

    // 3. Update scene state
    if (resolution.scene_update) {
      const sceneResult = await updateScene(supabase, sceneId, resolution.scene_update)

      if (!sceneResult.success) {
        errors.push(sceneResult.error || 'Failed to update scene')
      }
    }

    // 4. Update turn contract
    const turnResult = await completeTurnContract(
      supabase,
      turnContractId,
      resolution.narrative,
      resolution.next_turn_context || null
    )

    if (!turnResult.success) {
      errors.push(turnResult.error || 'Failed to complete turn contract')
    }

    // 5. Create dice roll requests if needed
    if (resolution.dice_requests && resolution.dice_requests.length > 0) {
      const diceResults = await createDiceRollRequests(
        supabase,
        resolution.dice_requests,
        turnContractId
      )

      warnings.push(...diceResults.warnings)
      errors.push(...diceResults.errors)
    }

    return {
      success: errors.length === 0,
      errors,
      warnings,
      updatedEntities,
      createdEvents,
      turnContractId,
    }
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error in resolution pipeline'],
      warnings,
      updatedEntities,
      createdEvents,
    }
  }
}

/**
 * Apply entity state updates
 */
async function applyEntityUpdates(
  supabase: SupabaseClient,
  updates: EntityStateUpdate[],
  sceneId: string
): Promise<{ updated: string[]; errors: string[]; warnings: string[] }> {
  const updated: string[] = []
  const errors: string[] = []
  const warnings: string[] = []

  for (const update of updates) {
    try {
      // Fetch current entity state
      const { data: currentState, error: fetchError } = await supabase
        .from('entity_state')
        .select('*')
        .eq('entity_id', update.entity_id)
        .eq('scene_id', sceneId)
        .single()

      if (fetchError || !currentState) {
        errors.push(`Entity ${update.entity_id} not found in scene`)
        continue
      }

      // Calculate new HP
      let newHP = currentState.current_hp

      if (update.hp_change !== undefined) {
        newHP = Math.max(0, currentState.current_hp + update.hp_change)
      } else if (update.current_hp !== undefined) {
        newHP = Math.max(0, update.current_hp)
      }

      // Update conditions
      let newConditions = currentState.conditions || []

      if (update.conditions_add && update.conditions_add.length > 0) {
        newConditions = [...new Set([...newConditions, ...update.conditions_add])]
      }

      if (update.conditions_remove && update.conditions_remove.length > 0) {
        newConditions = newConditions.filter((c: string) => !update.conditions_remove!.includes(c))
      }

      // Check for death
      const isDead = newHP === 0

      // Update entity state
      const { error: updateError } = await supabase
        .from('entity_state')
        .update({
          current_hp: newHP,
          temp_hp: update.temp_hp ?? currentState.temp_hp,
          conditions: newConditions,
          is_concentrating: update.concentration_broken
            ? false
            : currentState.is_concentrating,
          updated_at: new Date().toISOString(),
        })
        .eq('entity_id', update.entity_id)
        .eq('scene_id', sceneId)

      if (updateError) {
        errors.push(`Failed to update entity ${update.entity_id}: ${updateError.message}`)
      } else {
        updated.push(update.entity_id)

        if (isDead) {
          warnings.push(`Entity ${update.entity_id} has reached 0 HP`)
        }
      }
    } catch (error) {
      errors.push(
        `Error updating entity ${update.entity_id}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  return { updated, errors, warnings }
}

/**
 * Create event log entries
 */
async function createEventLogs(
  supabase: SupabaseClient,
  events: EventLogEntry[],
  campaignId: string,
  sceneId: string,
  turnContractId: string
): Promise<{ created: string[]; errors: string[] }> {
  const created: string[] = []
  const errors: string[] = []

  for (const event of events) {
    try {
      const { data, error } = await supabase
        .from('event_log')
        .insert({
          scene_id: sceneId,
          turn_contract_id: turnContractId,
          type: event.event_type,
          content: { text: event.narrative, ...event.metadata },
          entity_ids: event.entity_ids || [],
          metadata: event.metadata || {},
        })
        .select('id')
        .single()

      if (error) {
        errors.push(`Failed to create event: ${error.message}`)
      } else if (data) {
        created.push(data.id)
      }
    } catch (error) {
      errors.push(
        `Error creating event: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  return { created, errors }
}

/**
 * Update scene state
 */
async function updateScene(
  supabase: SupabaseClient,
  sceneId: string,
  sceneUpdate: { current_state?: string; description?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (sceneUpdate.current_state !== undefined) {
      updateData.current_state = sceneUpdate.current_state
    }

    if (sceneUpdate.description !== undefined) {
      updateData.description = sceneUpdate.description
    }

    const { error } = await supabase.from('scenes').update(updateData).eq('id', sceneId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Complete turn contract
 */
async function completeTurnContract(
  supabase: SupabaseClient,
  turnContractId: string,
  narrative: string,
  nextTurnContext: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch current turn contract
    const { data: currentTurn, error: fetchError } = await supabase
      .from('turn_contracts')
      .select('*')
      .eq('id', turnContractId)
      .single()

    if (fetchError || !currentTurn) {
      return { success: false, error: 'Turn contract not found' }
    }

    // Update to complete phase
    const { error: updateError } = await supabase
      .from('turn_contracts')
      .update({
        phase: 'complete',
        state_version: currentTurn.state_version + 1,
        completed_at: new Date().toISOString(),
      })
      .eq('id', turnContractId)
      .eq('state_version', currentTurn.state_version) // Optimistic concurrency check

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Create dice roll requests
 */
async function createDiceRollRequests(
  supabase: SupabaseClient,
  diceRequests: any[],
  turnContractId: string
): Promise<{ warnings: string[]; errors: string[] }> {
  const warnings: string[] = []
  const errors: string[] = []

  for (const request of diceRequests) {
    try {
      const { error } = await supabase.from('dice_roll_requests').insert({
        turn_contract_id: turnContractId,
        character_id: request.character_id,
        roll_type: request.roll_type,
        ability: request.ability || null,
        skill: request.skill || null,
        notation: request.notation,
        dc: request.dc || null,
        advantage: request.advantage || false,
        disadvantage: request.disadvantage || false,
        description: request.description,
        reason: request.reason,
        resolved: false,
      })

      if (error) {
        errors.push(`Failed to create dice roll request: ${error.message}`)
      }
    } catch (error) {
      errors.push(
        `Error creating dice roll request: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  return { warnings, errors }
}

/**
 * Rollback resolution (best effort)
 */
export async function rollbackResolution(
  result: ResolutionResult,
  turnContractId: string
): Promise<{ success: boolean; errors: string[] }> {
  const supabase = createServiceClient()
  const errors: string[] = []

  try {
    // Delete created events
    if (result.createdEvents.length > 0) {
      const { error } = await supabase
        .from('event_log')
        .delete()
        .in('id', result.createdEvents)

      if (error) {
        errors.push(`Failed to rollback events: ${error.message}`)
      }
    }

    // Reset turn contract to resolving phase
    const { error: turnError } = await supabase
      .from('turn_contracts')
      .update({
        phase: 'resolving',
        updated_at: new Date().toISOString(),
      })
      .eq('id', turnContractId)

    if (turnError) {
      errors.push(`Failed to rollback turn contract: ${turnError.message}`)
    }

    return {
      success: errors.length === 0,
      errors,
    }
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown rollback error'],
    }
  }
}
