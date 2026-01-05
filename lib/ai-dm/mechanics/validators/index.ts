/**
 * Validator Router
 *
 * Routes classified intents to the appropriate validator based on intent type.
 * Validators check if an action is POSSIBLE before execution.
 */

import { ClassifiedIntent, ValidationResult, PipelineContext, MechanicalIntentType } from '../types'
import { validateEconomicIntent } from './economic'
import { validateSpellcastingIntent } from './spellcasting'
import { validateCombatIntent } from './combat'
import { validateRestIntent } from './rest'
import { validateInventoryIntent } from './inventory'

/**
 * Map of intent types to their validators
 */
const INTENT_VALIDATORS: Partial<Record<MechanicalIntentType, (intent: ClassifiedIntent, context: PipelineContext) => Promise<ValidationResult>>> = {
  // Economic intents
  purchase: validateEconomicIntent,
  sell: validateEconomicIntent,
  trade: validateEconomicIntent,
  pay: validateEconomicIntent,
  steal: validateEconomicIntent,

  // Spellcasting intents
  cast_spell: validateSpellcastingIntent,
  cast_cantrip: validateSpellcastingIntent,

  // Combat intents
  attack: validateCombatIntent,

  // Rest intents
  short_rest: validateRestIntent,
  long_rest: validateRestIntent,

  // Inventory intents
  pickup_item: validateInventoryIntent,
  drop_item: validateInventoryIntent,
  give_item: validateInventoryIntent,
  use_item: validateInventoryIntent,
}

/**
 * Intents that don't require mechanical validation
 */
const NO_VALIDATION_INTENTS: MechanicalIntentType[] = [
  'roleplay',
  'skill_check', // Skill checks are handled by dice rolling, not validation
]

/**
 * Validate an intent
 *
 * @param intent - The classified intent to validate
 * @param context - Pipeline context with character/campaign data
 * @returns Validation result with success/failure and any errors
 */
export async function validateIntent(
  intent: ClassifiedIntent,
  context: PipelineContext
): Promise<ValidationResult> {
  // Skip validation for roleplay/skill check intents
  if (NO_VALIDATION_INTENTS.includes(intent.type)) {
    return {
      valid: true,
      errors: [],
    }
  }

  // Find the appropriate validator
  const validator = INTENT_VALIDATORS[intent.type]

  if (!validator) {
    console.warn(`[Validator] No validator found for intent type: ${intent.type}`)
    // Default to valid for unknown intent types (let the executor handle it)
    return {
      valid: true,
      errors: [],
      warnings: [`No specific validator for ${intent.type}, proceeding with caution`],
    }
  }

  try {
    const result = await validator(intent, context)

    // Log validation result
    if (result.valid) {
      console.log(`[Validator] ${intent.type} validated successfully for ${intent.characterName}`)
    } else {
      console.log(`[Validator] ${intent.type} validation failed: ${result.errors.join(', ')}`)
    }

    return result
  } catch (error) {
    console.error(`[Validator] Error validating ${intent.type}:`, error)
    return {
      valid: false,
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
    }
  }
}

/**
 * Validate multiple intents in sequence
 * Stops at first failure if stopOnFailure is true
 */
export async function validateIntents(
  intents: ClassifiedIntent[],
  context: PipelineContext,
  stopOnFailure = false
): Promise<Map<string, ValidationResult>> {
  const results = new Map<string, ValidationResult>()

  for (const intent of intents) {
    const result = await validateIntent(intent, context)
    results.set(intent.originalInput, result)

    if (stopOnFailure && !result.valid) {
      break
    }
  }

  return results
}

/**
 * Check if an intent type requires validation
 */
export function requiresValidation(intentType: MechanicalIntentType): boolean {
  return !NO_VALIDATION_INTENTS.includes(intentType)
}
