/**
 * Rest Validator
 *
 * Validates short and long rest intents.
 */

import {
  ClassifiedIntent,
  ValidationResult,
  PipelineContext,
  RestParams,
} from '../types'

/**
 * Validate a rest intent
 */
export async function validateRestIntent(
  intent: ClassifiedIntent,
  context: PipelineContext
): Promise<ValidationResult> {
  const params = intent.params as unknown as RestParams
  const errors: string[] = []
  const warnings: string[] = []

  // Find the character
  const character = context.characters.find(c => c.id === intent.characterId)
  if (!character) {
    return {
      valid: false,
      errors: ['Character not found'],
    }
  }

  const restType = intent.type === 'long_rest' ? 'long' : params.restType || 'short'

  // Check for conditions that prevent resting
  const preventingConditions = ['poisoned', 'diseased']
  const hasPreventingCondition = character.conditions.some(c =>
    preventingConditions.includes(c.toLowerCase())
  )

  if (hasPreventingCondition) {
    warnings.push(`${character.name} is affected by a condition that may disrupt rest`)
  }

  // Check if already at full HP (for short rest)
  if (restType === 'short' && character.current_hp >= character.max_hp) {
    warnings.push(`${character.name} is already at full HP. Short rest may still restore other resources.`)
  }

  // Long rest specific checks
  if (restType === 'long') {
    // Check if character has had a long rest recently (we don't track this, so warn)
    warnings.push('Long rest requires 8 hours. Ensure safe location.')

    // Check if already at full resources
    const atFullHp = character.current_hp >= character.max_hp
    let hasUsedSlots = false

    if (character.spell_slots && character.spell_slots_used) {
      for (const [level, used] of Object.entries(character.spell_slots_used)) {
        if (typeof used === 'number' && used > 0) {
          hasUsedSlots = true
          break
        }
      }
    }

    if (atFullHp && !hasUsedSlots) {
      warnings.push(`${character.name} appears to be at full resources. Long rest may not be necessary.`)
    }
  }

  // Short rest hit dice check
  if (restType === 'short' && params.hitDiceToSpend) {
    // We don't track hit dice usage, so just validate it's reasonable
    if (params.hitDiceToSpend > (character.level || 1)) {
      errors.push(`Cannot spend ${params.hitDiceToSpend} hit dice. Maximum available: ${character.level || 1}`)
    }
    if (params.hitDiceToSpend < 0) {
      errors.push('Hit dice to spend must be positive')
    }
  }

  // Check for hostile entities in scene
  const hostileEntities = context.entities.filter(e => e.type === 'monster')
  if (hostileEntities.length > 0) {
    warnings.push(`Warning: ${hostileEntities.length} potentially hostile creature(s) in the area. Resting may be interrupted.`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
    adjustedValues: {
      restType,
      hitDiceToSpend: params.hitDiceToSpend,
    },
  }
}
