/**
 * NPC State Tool Processor
 * Handles HP changes, conditions, and other state updates for NPCs/monsters
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { ToolCall } from './openai-client'

// NPC state tool names
export const NPC_STATE_TOOL_NAMES = [
  'modify_npc_hp',
  'apply_npc_condition',
  'remove_npc_condition',
]

interface EntityWithState {
  id: string
  name: string
  type: string
  stat_block: {
    description?: string
    max_hp?: number
    armor_class?: number
  } | null
  entity_state: Array<{
    id: string
    current_hp: number
    temp_hp: number
    conditions: string[]
    scene_id: string
  }>
}

interface NpcChange {
  npc: string
  description: string
}

interface ProcessResult {
  success: boolean
  errors: string[]
  changes: NpcChange[]
}

/**
 * Filter tool calls to only NPC state-related tools
 */
export function filterNpcStateToolCalls(toolCalls: ToolCall[]): ToolCall[] {
  return toolCalls.filter((tc) => NPC_STATE_TOOL_NAMES.includes(tc.function.name))
}

/**
 * Process all NPC state-related tool calls from AI DM response
 */
export async function processNpcStateToolCalls(
  supabase: SupabaseClient,
  sceneId: string,
  toolCalls: ToolCall[]
): Promise<ProcessResult> {
  const changes: NpcChange[] = []
  const errors: string[] = []
  const npcStateToolCalls = filterNpcStateToolCalls(toolCalls)

  if (npcStateToolCalls.length === 0) {
    return { success: true, errors: [], changes: [] }
  }

  // Get all entities in this scene with their state
  const { data: entities, error: entityError } = await supabase
    .from('entities')
    .select(`
      id,
      name,
      type,
      stat_block,
      entity_state!inner(id, current_hp, temp_hp, conditions, scene_id)
    `)
    .eq('entity_state.scene_id', sceneId)

  if (entityError) {
    console.error('Failed to load entities:', entityError)
    return { success: false, errors: ['Failed to load entities'], changes: [] }
  }

  // Create a map for quick lookup (case-insensitive)
  const entityMap = new Map<string, EntityWithState>(
    (entities || []).map((e) => [e.name.toLowerCase(), e as EntityWithState])
  )

  for (const toolCall of npcStateToolCalls) {
    try {
      const args = JSON.parse(toolCall.function.arguments)
      const result = await processToolCall(
        supabase,
        toolCall.function.name,
        args,
        entityMap,
        sceneId
      )

      if (result.success && result.change) {
        changes.push(result.change)
      } else if (result.error) {
        errors.push(result.error)
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`Error processing ${toolCall.function.name}: ${errMsg}`)
      console.error(`Error processing NPC tool call ${toolCall.function.name}:`, error)
    }
  }

  return { success: errors.length === 0, errors, changes }
}

interface ToolCallResult {
  success: boolean
  error?: string
  change?: NpcChange
}

/**
 * Process a single NPC state tool call
 */
async function processToolCall(
  supabase: SupabaseClient,
  toolName: string,
  args: Record<string, unknown>,
  entityMap: Map<string, EntityWithState>,
  sceneId: string
): Promise<ToolCallResult> {
  // Get NPC name from args (handles both 'name' and 'npc_name' params)
  const npcName = (args.npc_name || args.name) as string
  if (!npcName) {
    return { success: false, error: `${toolName}: Missing NPC name` }
  }

  // Find the entity
  const entity = entityMap.get(npcName.toLowerCase())
  if (!entity) {
    return { success: false, error: `${toolName}: NPC "${npcName}" not found in current scene` }
  }

  // Get the entity_state for this scene
  const entityState = entity.entity_state.find((s) => s.scene_id === sceneId)
  if (!entityState) {
    return { success: false, error: `${toolName}: No state found for "${npcName}" in this scene` }
  }

  switch (toolName) {
    case 'modify_npc_hp':
      return await modifyNpcHp(supabase, entity, entityState, args)

    case 'apply_npc_condition':
      return await applyNpcCondition(supabase, entity, entityState, args)

    case 'remove_npc_condition':
      return await removeNpcCondition(supabase, entity, entityState, args)

    default:
      return { success: false, error: `Unknown NPC tool: ${toolName}` }
  }
}

/**
 * Modify NPC hit points
 */
async function modifyNpcHp(
  supabase: SupabaseClient,
  entity: EntityWithState,
  entityState: EntityWithState['entity_state'][0],
  args: Record<string, unknown>
): Promise<ToolCallResult> {
  const hpChange = args.hp_change as number
  const reason = args.reason as string
  const damageType = args.damage_type as string | undefined

  if (typeof hpChange !== 'number') {
    return { success: false, error: 'modify_npc_hp: hp_change must be a number' }
  }

  // Calculate new HP
  let newHp = entityState.current_hp + hpChange
  const maxHp = entity.stat_block?.max_hp || 10

  // Clamp HP between 0 and max
  newHp = Math.max(0, Math.min(maxHp, newHp))

  // Update entity_state
  const { error } = await supabase
    .from('entity_state')
    .update({ current_hp: newHp })
    .eq('id', entityState.id)

  if (error) {
    console.error('Failed to update NPC HP:', error)
    return { success: false, error: `Failed to update ${entity.name}'s HP` }
  }

  // Build description
  let description: string
  if (hpChange < 0) {
    const damageStr = damageType ? `${Math.abs(hpChange)} ${damageType} damage` : `${Math.abs(hpChange)} damage`
    description = `Took ${damageStr}: ${reason}`
    if (newHp <= 0) {
      description += ' (DEFEATED)'
    }
  } else {
    description = `Healed ${hpChange} HP: ${reason}`
  }

  return {
    success: true,
    change: {
      npc: entity.name,
      description,
    },
  }
}

/**
 * Apply a condition to an NPC
 */
async function applyNpcCondition(
  supabase: SupabaseClient,
  entity: EntityWithState,
  entityState: EntityWithState['entity_state'][0],
  args: Record<string, unknown>
): Promise<ToolCallResult> {
  const condition = args.condition as string
  const source = args.source as string
  const duration = args.duration as string | undefined

  if (!condition) {
    return { success: false, error: 'apply_npc_condition: Missing condition' }
  }

  // Check if already has condition
  const currentConditions = entityState.conditions || []
  if (currentConditions.includes(condition)) {
    return {
      success: true,
      change: {
        npc: entity.name,
        description: `Already ${condition}`,
      },
    }
  }

  // Add condition
  const newConditions = [...currentConditions, condition]

  const { error } = await supabase
    .from('entity_state')
    .update({ conditions: newConditions })
    .eq('id', entityState.id)

  if (error) {
    console.error('Failed to apply condition:', error)
    return { success: false, error: `Failed to apply ${condition} to ${entity.name}` }
  }

  const durationStr = duration ? ` (${duration})` : ''
  return {
    success: true,
    change: {
      npc: entity.name,
      description: `Now ${condition}${durationStr}: ${source}`,
    },
  }
}

/**
 * Remove a condition from an NPC
 */
async function removeNpcCondition(
  supabase: SupabaseClient,
  entity: EntityWithState,
  entityState: EntityWithState['entity_state'][0],
  args: Record<string, unknown>
): Promise<ToolCallResult> {
  const condition = args.condition as string
  const reason = args.reason as string

  if (!condition) {
    return { success: false, error: 'remove_npc_condition: Missing condition' }
  }

  const currentConditions = entityState.conditions || []

  // Check if has condition
  if (!currentConditions.includes(condition)) {
    return {
      success: true,
      change: {
        npc: entity.name,
        description: `Was not ${condition}`,
      },
    }
  }

  // Remove condition
  const newConditions = currentConditions.filter((c) => c !== condition)

  const { error } = await supabase
    .from('entity_state')
    .update({ conditions: newConditions })
    .eq('id', entityState.id)

  if (error) {
    console.error('Failed to remove condition:', error)
    return { success: false, error: `Failed to remove ${condition} from ${entity.name}` }
  }

  return {
    success: true,
    change: {
      npc: entity.name,
      description: `No longer ${condition}: ${reason}`,
    },
  }
}
