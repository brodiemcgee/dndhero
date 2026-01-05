/**
 * Spellcasting Executor
 *
 * Executes spell casting intents - deducts spell slots.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import {
  ClassifiedIntent,
  ValidationResult,
  SpellValidationResult,
  MechanicsResult,
  PipelineContext,
  StateChange,
  SpellCastParams,
} from '../types'

/**
 * Execute a spellcasting intent
 */
export async function executeSpellcastingIntent(
  supabase: SupabaseClient,
  intent: ClassifiedIntent,
  validation: ValidationResult,
  context: PipelineContext,
  dmMessageId?: string
): Promise<MechanicsResult> {
  const params = intent.params as unknown as SpellCastParams
  const spellValidation = validation as SpellValidationResult
  const changes: StateChange[] = []

  // Cantrips don't use slots
  if (intent.type === 'cast_cantrip' || params.spellLevel === 0) {
    return {
      success: true,
      outcome: 'success',
      changes: [],
      narrativeContext: `${intent.characterName} casts the cantrip ${params.spellName}${params.targets?.length ? ` targeting ${params.targets.join(', ')}` : ''}.`,
    }
  }

  // Get character's current data
  const { data: character, error: fetchError } = await supabase
    .from('characters')
    .select('id, name, spell_slots, spell_slots_used')
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

  // Determine slot level to use
  const slotLevel = spellValidation.slotLevelUsed || params.upcastLevel || params.spellLevel
  const slotKey = slotLevel.toString()

  // Update spell slots used
  const oldSlotsUsed = { ...(character.spell_slots_used || {}) }
  const newSlotsUsed = { ...oldSlotsUsed }
  newSlotsUsed[slotKey] = (newSlotsUsed[slotKey] || 0) + 1

  // Update database
  const { error: updateError } = await supabase
    .from('characters')
    .update({
      spell_slots_used: newSlotsUsed,
      updated_at: new Date().toISOString(),
    })
    .eq('id', character.id)

  if (updateError) {
    return {
      success: false,
      outcome: 'failure',
      changes: [],
      narrativeContext: 'Failed to update spell slot usage.',
      errors: [updateError.message],
    }
  }

  // Create audit log
  await supabase.from('character_state_changes').insert({
    character_id: character.id,
    campaign_id: context.campaignId,
    dm_message_id: dmMessageId || null,
    change_type: 'spell_slot_use',
    field_name: 'spell_slots_used',
    old_value: oldSlotsUsed,
    new_value: newSlotsUsed,
    reason: `Cast ${params.spellName} (level ${slotLevel} slot)`,
  })

  changes.push({
    type: 'spell_slot',
    characterId: character.id,
    characterName: character.name,
    description: `Used level ${slotLevel} spell slot to cast ${params.spellName}`,
    field: 'spell_slots_used',
    before: oldSlotsUsed,
    after: newSlotsUsed,
  })

  // Build narrative context
  let narrative = `${intent.characterName} casts ${params.spellName}`
  if (slotLevel > params.spellLevel) {
    narrative += ` at ${slotLevel}th level`
  }
  if (params.targets?.length) {
    narrative += ` targeting ${params.targets.join(', ')}`
  }
  narrative += `. A level ${slotLevel} spell slot has been expended.`

  if (params.isConcentration) {
    narrative += ' This spell requires concentration.'
  }

  return {
    success: true,
    outcome: 'success',
    changes,
    narrativeContext: narrative,
  }
}
