/**
 * Executor Router
 *
 * Routes validated intents to the appropriate executor.
 * Executors apply actual game state changes to the database.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import {
  ClassifiedIntent,
  ValidationResult,
  MechanicsResult,
  PipelineContext,
  MechanicalIntentType,
  StateChange,
} from '../types'
import { executeEconomicIntent } from './economic'
import { executeSpellcastingIntent } from './spellcasting'
import { executeCombatIntent } from './combat'
import { executeRestIntent } from './rest'
import { executeInventoryIntent } from './inventory'

/**
 * Map of intent types to their executors
 */
const INTENT_EXECUTORS: Partial<Record<
  MechanicalIntentType,
  (
    supabase: SupabaseClient,
    intent: ClassifiedIntent,
    validation: ValidationResult,
    context: PipelineContext,
    dmMessageId?: string
  ) => Promise<MechanicsResult>
>> = {
  // Economic intents
  purchase: executeEconomicIntent,
  sell: executeEconomicIntent,
  trade: executeEconomicIntent,
  pay: executeEconomicIntent,
  steal: executeEconomicIntent,

  // Spellcasting intents
  cast_spell: executeSpellcastingIntent,
  cast_cantrip: executeSpellcastingIntent,

  // Combat intents
  attack: executeCombatIntent,

  // Rest intents
  short_rest: executeRestIntent,
  long_rest: executeRestIntent,

  // Inventory intents
  pickup_item: executeInventoryIntent,
  drop_item: executeInventoryIntent,
  give_item: executeInventoryIntent,
  use_item: executeInventoryIntent,
}

/**
 * Intents that don't require mechanical execution
 */
const NO_EXECUTION_INTENTS: MechanicalIntentType[] = [
  'roleplay',
  'skill_check', // Skill checks are handled separately via dice rolling
]

/**
 * Execute an intent after validation
 *
 * @param supabase - Supabase client for database operations
 * @param intent - The classified intent to execute
 * @param validation - The validation result (must be valid)
 * @param context - Pipeline context
 * @param dmMessageId - Optional DM message ID for audit trail
 * @returns MechanicsResult with changes applied
 */
export async function executeIntent(
  supabase: SupabaseClient,
  intent: ClassifiedIntent,
  validation: ValidationResult,
  context: PipelineContext,
  dmMessageId?: string
): Promise<MechanicsResult> {
  // Don't execute invalid intents
  if (!validation.valid) {
    return {
      success: false,
      outcome: 'failure',
      changes: [],
      narrativeContext: `Action failed: ${validation.errors.join(', ')}`,
      errors: validation.errors,
    }
  }

  // Skip execution for roleplay/skill check intents
  if (NO_EXECUTION_INTENTS.includes(intent.type)) {
    return {
      success: true,
      outcome: 'success',
      changes: [],
      narrativeContext: intent.type === 'roleplay'
        ? 'Pure roleplay - no mechanical changes needed.'
        : 'Skill check requested - awaiting dice roll.',
    }
  }

  // Find the appropriate executor
  const executor = INTENT_EXECUTORS[intent.type]

  if (!executor) {
    console.warn(`[Executor] No executor found for intent type: ${intent.type}`)
    return {
      success: true,
      outcome: 'success',
      changes: [],
      narrativeContext: `${intent.type} - handled narratively by DM.`,
    }
  }

  try {
    const result = await executor(supabase, intent, validation, context, dmMessageId)

    // Log execution result
    if (result.success) {
      console.log(`[Executor] ${intent.type} executed successfully for ${intent.characterName}`)
      console.log(`[Executor] Changes: ${result.changes.map(c => c.description).join(', ')}`)
    } else {
      console.log(`[Executor] ${intent.type} execution failed: ${result.errors?.join(', ')}`)
    }

    return result
  } catch (error) {
    console.error(`[Executor] Error executing ${intent.type}:`, error)
    return {
      success: false,
      outcome: 'failure',
      changes: [],
      narrativeContext: `Execution error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      errors: [`Execution error: ${error instanceof Error ? error.message : 'Unknown error'}`],
    }
  }
}

/**
 * Execute multiple intents in sequence
 * Each intent's changes are applied before the next is executed
 */
export async function executeIntents(
  supabase: SupabaseClient,
  intents: Array<{ intent: ClassifiedIntent; validation: ValidationResult }>,
  context: PipelineContext,
  dmMessageId?: string
): Promise<MechanicsResult[]> {
  const results: MechanicsResult[] = []

  for (const { intent, validation } of intents) {
    const result = await executeIntent(supabase, intent, validation, context, dmMessageId)
    results.push(result)

    // Don't stop on failure - let narrative handle failed actions
  }

  return results
}

/**
 * Aggregate multiple execution results into a single result
 */
export function aggregateResults(results: MechanicsResult[]): MechanicsResult {
  const allChanges: StateChange[] = []
  const allErrors: string[] = []
  let hasSuccess = false
  let hasFailure = false

  for (const result of results) {
    allChanges.push(...result.changes)
    if (result.errors) allErrors.push(...result.errors)
    if (result.success) hasSuccess = true
    else hasFailure = true
  }

  const outcome = hasSuccess && hasFailure ? 'partial' : hasSuccess ? 'success' : 'failure'

  // Build narrative context
  const narrativeContext = results
    .map(r => r.narrativeContext)
    .filter(Boolean)
    .join('\n')

  return {
    success: hasSuccess,
    outcome,
    changes: allChanges,
    narrativeContext,
    errors: allErrors.length > 0 ? allErrors : undefined,
  }
}

/**
 * Check if an intent type requires execution
 */
export function requiresExecution(intentType: MechanicalIntentType): boolean {
  return !NO_EXECUTION_INTENTS.includes(intentType)
}
