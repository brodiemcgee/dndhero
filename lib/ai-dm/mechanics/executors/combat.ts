/**
 * Combat Executor
 *
 * Executes attack intents - initiates dice rolls for attack resolution.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import {
  ClassifiedIntent,
  ValidationResult,
  CombatValidationResult,
  MechanicsResult,
  PipelineContext,
  AttackParams,
  DiceRollRequest,
} from '../types'

/**
 * Execute a combat intent
 */
export async function executeCombatIntent(
  supabase: SupabaseClient,
  intent: ClassifiedIntent,
  validation: ValidationResult,
  context: PipelineContext,
  dmMessageId?: string
): Promise<MechanicsResult> {
  const params = intent.params as unknown as AttackParams
  const combatValidation = validation as CombatValidationResult

  // Find the character for their attack bonus
  const character = context.characters.find(c => c.id === intent.characterId)
  if (!character) {
    return {
      success: false,
      outcome: 'failure',
      changes: [],
      narrativeContext: 'Character not found.',
      errors: ['Character not found'],
    }
  }

  // Combat doesn't immediately change state - it requires dice rolls
  // We return the required rolls and let the dice system handle it
  const attackRolls: DiceRollRequest[] = []

  // Determine if melee or ranged
  const isRanged = params.isRanged || false

  // Calculate attack modifier (simplified - would need weapon data for accuracy)
  // For now, assume STR for melee, DEX for ranged, or finesse allows either
  const strMod = Math.floor(((character.strength || 10) - 10) / 2)
  const dexMod = Math.floor(((character.dexterity || 10) - 10) / 2)
  const attackMod = isRanged ? dexMod : strMod

  // Add proficiency bonus (assume proficient)
  const profBonus = Math.ceil(1 + (character.level || 1) / 4)
  const totalAttackMod = attackMod + profBonus

  const modSign = totalAttackMod >= 0 ? '+' : ''

  attackRolls.push({
    characterId: intent.characterId,
    characterName: intent.characterName,
    rollType: 'attack_roll',
    notation: `1d20${modSign}${totalAttackMod}`,
    description: `Attack roll${params.weaponName ? ` with ${params.weaponName}` : ''} against ${params.targetName}`,
    reason: 'Attack',
  })

  // Build narrative context
  let narrative = `${intent.characterName} attacks ${params.targetName}`
  if (params.weaponName) {
    narrative += ` with ${params.weaponName}`
  }
  narrative += '. An attack roll is required to determine if the attack hits.'

  if (!combatValidation.targetFound) {
    narrative += ` Note: Target "${params.targetName}" was not found in the current scene - DM will adjudicate.`
  }

  return {
    success: true,
    outcome: 'success',
    changes: [], // No changes until dice are rolled and damage applied
    narrativeContext: narrative,
    rollsRequired: attackRolls,
  }
}
