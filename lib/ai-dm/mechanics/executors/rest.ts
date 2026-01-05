/**
 * Rest Executor
 *
 * Executes rest intents - applies HP recovery and spell slot restoration.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import {
  ClassifiedIntent,
  ValidationResult,
  MechanicsResult,
  PipelineContext,
  StateChange,
  RestParams,
} from '../types'

/**
 * Execute a rest intent
 */
export async function executeRestIntent(
  supabase: SupabaseClient,
  intent: ClassifiedIntent,
  validation: ValidationResult,
  context: PipelineContext,
  dmMessageId?: string
): Promise<MechanicsResult> {
  const params = intent.params as unknown as RestParams
  const restType = intent.type === 'long_rest' ? 'long' : (params.restType || 'short')
  const changes: StateChange[] = []

  // Get character's current data
  const { data: character, error: fetchError } = await supabase
    .from('characters')
    .select('id, name, class, level, current_hp, max_hp, temp_hp, spell_slots, spell_slots_used, conditions, death_save_successes, death_save_failures')
    .eq('id', intent.characterId)
    .single()

  if (fetchError || !character) {
    return {
      success: false,
      outcome: 'failure',
      changes: [],
      narrativeContext: 'Character not found in database.',
      errors: ['Character not found'],
    }
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  const changeDescriptions: string[] = []

  if (restType === 'long') {
    // Long rest: Full HP recovery
    if (character.current_hp < character.max_hp) {
      changes.push({
        type: 'hp',
        characterId: character.id,
        characterName: character.name,
        description: `HP restored from ${character.current_hp} to ${character.max_hp}`,
        field: 'current_hp',
        before: character.current_hp,
        after: character.max_hp,
      })
      updates.current_hp = character.max_hp
      changeDescriptions.push(`HP fully restored to ${character.max_hp}`)
    }

    // Reset temp HP
    if (character.temp_hp > 0) {
      updates.temp_hp = 0
    }

    // Restore all spell slots
    if (character.spell_slots_used && Object.keys(character.spell_slots_used).length > 0) {
      changes.push({
        type: 'spell_slot',
        characterId: character.id,
        characterName: character.name,
        description: 'All spell slots restored',
        field: 'spell_slots_used',
        before: character.spell_slots_used,
        after: {},
      })
      updates.spell_slots_used = {}
      changeDescriptions.push('All spell slots restored')
    }

    // Reset death saves
    if (character.death_save_successes > 0 || character.death_save_failures > 0) {
      updates.death_save_successes = 0
      updates.death_save_failures = 0
    }

    // Remove certain conditions (exhaustion level reduction would be more complex)
    const conditionsToRemove = ['exhaustion'] // Simplified - in D&D 5e, exhaustion reduces by 1
    const oldConditions = [...(character.conditions || [])]
    const newConditions = oldConditions.filter(c => !conditionsToRemove.includes(c.toLowerCase()))

    if (newConditions.length !== oldConditions.length) {
      changes.push({
        type: 'condition_remove',
        characterId: character.id,
        characterName: character.name,
        description: 'Conditions cleared by rest',
        field: 'conditions',
        before: oldConditions,
        after: newConditions,
      })
      updates.conditions = newConditions
    }
  } else {
    // Short rest: Allow hit dice spending
    // For now, if they specified hit dice, roll them
    if (params.hitDiceToSpend && params.hitDiceToSpend > 0) {
      // We need to request dice rolls for hit dice
      const conMod = context.characters.find(c => c.id === intent.characterId)
        ? Math.floor(((context.characters.find(c => c.id === intent.characterId)?.constitution || 10) - 10) / 2)
        : 0

      // Get hit die based on class
      const hitDie = getHitDieForClass(character.class || '')
      const modSign = conMod >= 0 ? '+' : ''

      return {
        success: true,
        outcome: 'success',
        changes: [],
        narrativeContext: `${character.name} takes a short rest and spends ${params.hitDiceToSpend} hit dice to recover HP. Rolling ${params.hitDiceToSpend}${hitDie}${modSign}${conMod * params.hitDiceToSpend} for healing.`,
        rollsRequired: [
          {
            characterId: character.id,
            characterName: character.name,
            rollType: 'damage_roll', // Using damage_roll type for healing dice
            notation: `${params.hitDiceToSpend}${hitDie}${modSign}${conMod * params.hitDiceToSpend}`,
            description: `Hit dice healing (${params.hitDiceToSpend} dice)`,
            reason: 'Short rest recovery',
          },
        ],
      }
    }

    // Warlock short rest spell slot recovery
    if (character.class?.toLowerCase() === 'warlock') {
      if (character.spell_slots_used && Object.keys(character.spell_slots_used).length > 0) {
        changes.push({
          type: 'spell_slot',
          characterId: character.id,
          characterName: character.name,
          description: 'Pact Magic slots restored',
          field: 'spell_slots_used',
          before: character.spell_slots_used,
          after: {},
        })
        updates.spell_slots_used = {}
        changeDescriptions.push('Pact Magic spell slots restored')
      }
    }
  }

  // Apply updates if any
  if (Object.keys(updates).length > 1) { // More than just updated_at
    const { error: updateError } = await supabase
      .from('characters')
      .update(updates)
      .eq('id', character.id)

    if (updateError) {
      return {
        success: false,
        outcome: 'failure',
        changes: [],
        narrativeContext: 'Failed to apply rest benefits.',
        errors: [updateError.message],
      }
    }

    // Create audit log
    await supabase.from('character_state_changes').insert({
      character_id: character.id,
      campaign_id: context.campaignId,
      dm_message_id: dmMessageId || null,
      change_type: `${restType}_rest`,
      field_name: 'rest',
      old_value: {
        current_hp: character.current_hp,
        spell_slots_used: character.spell_slots_used,
        conditions: character.conditions,
      },
      new_value: {
        current_hp: updates.current_hp || character.current_hp,
        spell_slots_used: updates.spell_slots_used || character.spell_slots_used,
        conditions: updates.conditions || character.conditions,
      },
      reason: `${restType === 'long' ? 'Long' : 'Short'} rest`,
    })
  }

  // Build narrative
  let narrative = `${character.name} completes a ${restType} rest.`
  if (changeDescriptions.length > 0) {
    narrative += ` ${changeDescriptions.join('. ')}.`
  } else if (restType === 'long') {
    narrative += ' Already at full resources.'
  } else {
    narrative += ' Short rest completed.'
  }

  return {
    success: true,
    outcome: 'success',
    changes,
    narrativeContext: narrative,
  }
}

/**
 * Get hit die for a class
 */
function getHitDieForClass(className: string): string {
  const hitDice: Record<string, string> = {
    barbarian: 'd12',
    fighter: 'd10',
    paladin: 'd10',
    ranger: 'd10',
    bard: 'd8',
    cleric: 'd8',
    druid: 'd8',
    monk: 'd8',
    rogue: 'd8',
    warlock: 'd8',
    sorcerer: 'd6',
    wizard: 'd6',
  }

  return hitDice[className.toLowerCase()] || 'd8'
}
