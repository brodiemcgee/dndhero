/**
 * DM Mechanics Pipeline
 *
 * Main orchestrator that ensures game mechanics are applied BEFORE narrative.
 *
 * Flow:
 * 1. Classify player intents (what are they trying to do?)
 * 2. Validate each intent (can they do it?)
 * 3. Execute valid intents (apply state changes)
 * 4. Generate narrative about what happened (AI tells the story)
 */

import { SupabaseClient } from '@supabase/supabase-js'
import {
  ClassifiedIntent,
  PipelineContext,
  PipelineResult,
  StateChange,
  MechanicsResult,
  PendingMessage,
  CharacterForPipeline,
  EntityForPipeline,
} from './mechanics/types'
import { classifyIntent, shouldProcessMechanically, describeIntent } from './intent-classifier'
import { validateIntent } from './mechanics/validators'
import { executeIntent, aggregateResults } from './mechanics/executors'

/**
 * Process a DM turn through the mechanics pipeline
 *
 * @param supabase - Supabase client
 * @param campaignId - Campaign ID
 * @param pendingMessages - Player messages to process
 * @param characters - Characters in the campaign (for context)
 * @param entities - NPCs/monsters in the scene
 * @param recentHistory - Recent message history for context
 * @param dmMessageId - Optional DM message ID for audit trail
 * @returns Pipeline result with state changes and narrative context
 */
export async function processDMTurn(
  supabase: SupabaseClient,
  campaignId: string,
  pendingMessages: PendingMessage[],
  characters: CharacterForPipeline[],
  entities: EntityForPipeline[],
  recentHistory?: string[],
  activeQuests?: Array<{ title: string; objectives: Array<{ description: string; is_completed: boolean }> }>,
  dmMessageId?: string
): Promise<PipelineResult> {
  const allChanges: StateChange[] = []
  const allErrors: string[] = []
  const narrativeContexts: string[] = []
  let intentsProcessed = 0
  let mechanicsApplied = 0
  let mechanicsFailed = 0

  // Build pipeline context
  const context: PipelineContext = {
    campaignId,
    characters,
    entities,
    pendingMessages,
    recentHistory,
    activeQuests,
  }

  console.log(`[DM Pipeline] Processing ${pendingMessages.length} message(s) for campaign ${campaignId}`)
  console.log(`[DM Pipeline] Characters available: ${characters.map(c => `${c.name}(${c.id})`).join(', ')}`)

  // Process each pending message
  for (const message of pendingMessages) {
    console.log(`[DM Pipeline] Processing message from ${message.characterName || 'unknown'} (id: ${message.characterId || 'none'}): "${message.content.slice(0, 50)}..."`)

    if (!message.characterId || !message.characterName) {
      // System message or unidentified - skip classification
      console.log(`[DM Pipeline] SKIPPING - no characterId/characterName`)
      narrativeContexts.push(`[Message: "${message.content.slice(0, 50)}..."]`)
      continue
    }

    // Find character data
    const character = characters.find(c => c.id === message.characterId)
    if (!character) {
      console.warn(`[DM Pipeline] Character not found: ${message.characterId}`)
      continue
    }

    try {
      // STAGE 1: Intent Classification
      console.log(`[DM Pipeline] Classifying intent for: "${message.content.slice(0, 100)}..."`)

      const intent = await classifyIntent(
        message.content,
        message.characterId,
        message.characterName,
        character.class,
        recentHistory
      )

      intentsProcessed++
      console.log(`[DM Pipeline] Classified as: ${intent.type} (confidence: ${intent.confidence})`)
      console.log(`[DM Pipeline] ${describeIntent(intent)}`)

      // Check if this needs mechanical processing
      console.log(`[DM Pipeline] shouldProcessMechanically check - requiresMechanics: ${intent.requiresMechanics}, confidence: ${intent.confidence}`)
      if (!shouldProcessMechanically(intent)) {
        // Pure roleplay - add to narrative context but no mechanics
        console.log(`[DM Pipeline] SKIPPING MECHANICS - treating as roleplay`)
        narrativeContexts.push(`${message.characterName} says: "${message.content}"`)
        continue
      }

      // STAGE 2: Validation
      console.log(`[DM Pipeline] Validating ${intent.type}...`)

      const validationResult = await validateIntent(intent, context)

      if (!validationResult.valid) {
        // Validation failed - add STRONG failure context for narrative
        mechanicsFailed++
        narrativeContexts.push(
          `⛔ TRANSACTION REJECTED: ${message.characterName} attempted to ${intent.type} but it FAILED and was NOT completed. Reason: ${validationResult.errors.join(', ')}. The game state was NOT modified. You MUST narrate this as a FAILED attempt - the character did NOT succeed.`
        )
        allErrors.push(...validationResult.errors)
        continue
      }

      if (validationResult.warnings?.length) {
        console.log(`[DM Pipeline] Warnings: ${validationResult.warnings.join(', ')}`)
      }

      // STAGE 3: Execution
      console.log(`[DM Pipeline] Executing ${intent.type}...`)

      const executionResult = await executeIntent(
        supabase,
        intent,
        validationResult,
        context,
        dmMessageId
      )

      if (executionResult.success) {
        mechanicsApplied++
        allChanges.push(...executionResult.changes)
        narrativeContexts.push(executionResult.narrativeContext)
      } else {
        mechanicsFailed++
        narrativeContexts.push(
          `${message.characterName}'s ${intent.type} failed: ${executionResult.errors?.join(', ') || 'Unknown error'}`
        )
        if (executionResult.errors) {
          allErrors.push(...executionResult.errors)
        }
      }

      // Handle any required rolls (store for later processing)
      if (executionResult.rollsRequired?.length) {
        for (const roll of executionResult.rollsRequired) {
          narrativeContexts.push(`[ROLL REQUIRED] ${roll.description}: ${roll.notation}`)
        }
      }

    } catch (error) {
      console.error(`[DM Pipeline] Error processing message:`, error)
      allErrors.push(`Error processing message: ${error instanceof Error ? error.message : 'Unknown'}`)
      mechanicsFailed++
    }
  }

  console.log(`[DM Pipeline] Complete. Intents: ${intentsProcessed}, Applied: ${mechanicsApplied}, Failed: ${mechanicsFailed}`)
  console.log(`[DM Pipeline] Narrative contexts collected: ${narrativeContexts.length}`)
  console.log(`[DM Pipeline] Final narrative:\n${narrativeContexts.join('\n\n')}`)

  return {
    success: mechanicsFailed === 0 || mechanicsApplied > 0,
    intentsProcessed,
    mechanicsApplied,
    mechanicsFailed,
    stateChanges: allChanges,
    narrative: narrativeContexts.join('\n\n'),
    errors: allErrors.length > 0 ? allErrors : undefined,
  }
}

/**
 * Build the narrative prompt for the AI DM based on pipeline results
 *
 * This tells the AI what ACTUALLY happened so it can narrate appropriately
 */
export function buildNarrativePrompt(
  playerMessages: PendingMessage[],
  pipelineResult: PipelineResult,
  characterContext: string,
  sceneContext?: string
): string {
  const sections: string[] = []

  // Character context
  sections.push(characterContext)

  // Scene context if available
  if (sceneContext) {
    sections.push(`CURRENT SCENE:\n${sceneContext}`)
  }

  // What the players said/did
  const playerActions = playerMessages
    .filter(m => m.characterName)
    .map(m => `${m.characterName}: "${m.content}"`)
    .join('\n')

  sections.push(`PLAYER ACTIONS:\n${playerActions}`)

  // CRITICAL: Tell the AI what mechanically happened
  if (pipelineResult.stateChanges.length > 0 || pipelineResult.narrative) {
    sections.push(`=== MECHANICAL OUTCOMES (ALREADY APPLIED - NARRATE THESE) ===`)

    if (pipelineResult.stateChanges.length > 0) {
      const changeDescriptions = pipelineResult.stateChanges
        .map(c => `- ${c.characterName}: ${c.description}`)
        .join('\n')
      sections.push(`STATE CHANGES:\n${changeDescriptions}`)
    }

    if (pipelineResult.narrative) {
      sections.push(`OUTCOME SUMMARY:\n${pipelineResult.narrative}`)
    }

    sections.push(`=== END MECHANICAL OUTCOMES ===`)
    sections.push(`IMPORTANT: The above changes have ALREADY been applied to the game state. Your job is to NARRATE what happened in an engaging way. Do NOT contradict the mechanical outcomes.`)
  }

  // Instructions for the AI
  sections.push(`
INSTRUCTIONS:
- Narrate the outcomes described above in an immersive, engaging way
- If a purchase succeeded, describe the merchant interaction and the exchange
- If an action failed, describe WHY it failed (e.g., not enough gold, spell slot depleted)
- Keep your response to 2-4 paragraphs
- End on an atmospheric detail, NOT a question or prompt
- Use second person when addressing player characters`)

  return sections.join('\n\n')
}

/**
 * Format state changes for UI display
 */
export function formatChangesForUI(changes: StateChange[]): string[] {
  return changes.map(change => {
    switch (change.type) {
      case 'currency':
        return `${change.characterName}: ${change.description}`
      case 'inventory_add':
        return `${change.characterName}: ${change.description}`
      case 'inventory_remove':
        return `${change.characterName}: ${change.description}`
      case 'hp':
        return `${change.characterName}: ${change.description}`
      case 'spell_slot':
        return `${change.characterName}: ${change.description}`
      case 'condition_add':
      case 'condition_remove':
        return `${change.characterName}: ${change.description}`
      case 'rest':
        return `${change.characterName}: ${change.description}`
      case 'xp':
        return `${change.characterName}: ${change.description}`
      default:
        return change.description
    }
  })
}

/**
 * Check if pipeline result requires dice rolls
 */
export function requiresDiceRolls(result: PipelineResult): boolean {
  return result.narrative.includes('[ROLL REQUIRED]')
}

/**
 * Extract required rolls from pipeline result
 */
export function extractRequiredRolls(result: PipelineResult): string[] {
  const rollPattern = /\[ROLL REQUIRED\] ([^\n]+)/g
  const matches = result.narrative.matchAll(rollPattern)
  return Array.from(matches, m => m[1])
}
