/**
 * Spellcasting Validator
 *
 * Validates spell casting intents - checks spell knowledge and slot availability.
 */

import {
  ClassifiedIntent,
  SpellValidationResult,
  PipelineContext,
  SpellCastParams,
  CharacterForPipeline,
} from '../types'
import { getSpellsByIds, SPELLS } from '@/data/spells'

/**
 * Normalize spell name for comparison
 */
function normalizeSpellName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/['']/g, "'")
    .replace(/\s+/g, ' ')
}

/**
 * Find a spell by name in the database
 */
function findSpellByName(name: string): { id: string; name: string; level: number } | null {
  const normalized = normalizeSpellName(name)

  // Try exact match first
  for (const spell of SPELLS) {
    if (normalizeSpellName(spell.name) === normalized) {
      return { id: spell.id, name: spell.name, level: spell.level }
    }
  }

  // Try partial match
  for (const spell of SPELLS) {
    if (normalizeSpellName(spell.name).includes(normalized) || normalized.includes(normalizeSpellName(spell.name))) {
      return { id: spell.id, name: spell.name, level: spell.level }
    }
  }

  return null
}

/**
 * Check if character knows a spell (by ID or name)
 */
function characterKnowsSpell(
  character: CharacterForPipeline,
  spellName: string
): boolean {
  const normalizedSearch = normalizeSpellName(spellName)
  const spell = findSpellByName(spellName)

  // Check cantrips
  if (character.cantrips) {
    for (const cantrip of character.cantrips) {
      // Check if it's an ID
      const cantripSpell = SPELLS.find(s => s.id === cantrip)
      if (cantripSpell && normalizeSpellName(cantripSpell.name) === normalizedSearch) {
        return true
      }
      // Check if it's a name
      if (normalizeSpellName(cantrip) === normalizedSearch) {
        return true
      }
    }
  }

  // Check prepared spells first (takes priority)
  if (character.prepared_spells) {
    for (const preparedId of character.prepared_spells) {
      const preparedSpell = SPELLS.find(s => s.id === preparedId)
      if (preparedSpell && normalizeSpellName(preparedSpell.name) === normalizedSearch) {
        return true
      }
      if (normalizeSpellName(preparedId) === normalizedSearch) {
        return true
      }
    }
  }

  // Check known spells
  if (character.known_spells) {
    for (const knownId of character.known_spells) {
      const knownSpell = SPELLS.find(s => s.id === knownId)
      if (knownSpell && normalizeSpellName(knownSpell.name) === normalizedSearch) {
        return true
      }
      if (normalizeSpellName(knownId) === normalizedSearch) {
        return true
      }
    }
  }

  return false
}

/**
 * Check if spell is a cantrip in character's list
 */
function isCharacterCantrip(
  character: CharacterForPipeline,
  spellName: string
): boolean {
  if (!character.cantrips) return false

  const normalizedSearch = normalizeSpellName(spellName)

  for (const cantrip of character.cantrips) {
    const cantripSpell = SPELLS.find(s => s.id === cantrip)
    if (cantripSpell && normalizeSpellName(cantripSpell.name) === normalizedSearch) {
      return true
    }
    if (normalizeSpellName(cantrip) === normalizedSearch) {
      return true
    }
  }

  return false
}

/**
 * Get available spell slots at a given level
 */
function getAvailableSlots(
  character: CharacterForPipeline,
  level: number
): number {
  if (!character.spell_slots) return 0

  const levelKey = level.toString()
  const slotData = character.spell_slots[levelKey]

  if (!slotData) return 0

  let max = 0
  let used = 0

  if (typeof slotData === 'number') {
    max = slotData
    used = character.spell_slots_used?.[levelKey] || 0
  } else if (slotData && typeof slotData === 'object') {
    max = slotData.max || 0
    used = slotData.used ?? character.spell_slots_used?.[levelKey] ?? 0
  }

  return Math.max(0, max - used)
}

/**
 * Find lowest available slot at or above a given level
 */
function findAvailableSlot(
  character: CharacterForPipeline,
  minLevel: number
): number | null {
  for (let level = minLevel; level <= 9; level++) {
    if (getAvailableSlots(character, level) > 0) {
      return level
    }
  }
  return null
}

/**
 * Validate a spell casting intent
 */
export async function validateSpellcastingIntent(
  intent: ClassifiedIntent,
  context: PipelineContext
): Promise<SpellValidationResult> {
  const params = intent.params as unknown as SpellCastParams
  const errors: string[] = []
  const warnings: string[] = []

  // Find the character
  const character = context.characters.find(c => c.id === intent.characterId)
  if (!character) {
    return {
      valid: false,
      errors: ['Character not found'],
      spellFound: false,
      hasSpellSlot: false,
    }
  }

  const spellName = params.spellName || ''

  // Check if the spell exists in the database
  const spell = findSpellByName(spellName)
  const spellFound = spell !== null

  if (!spellFound) {
    // Spell not in our database - warn but allow (DM can improvise)
    warnings.push(`Spell "${spellName}" not found in database - proceeding with caution`)
  }

  // Determine if it's a cantrip
  const spellLevel = spell?.level ?? params.spellLevel ?? 0
  const isCantrip = spellLevel === 0 || intent.type === 'cast_cantrip'

  // Check if character knows the spell
  const knowsSpell = characterKnowsSpell(character, spellName)

  if (!knowsSpell) {
    // For cantrips, be strict
    if (isCantrip) {
      const knownCantrips = character.cantrips
        ? character.cantrips.map(c => {
            const s = SPELLS.find(sp => sp.id === c)
            return s ? s.name : c
          }).join(', ')
        : 'none'
      errors.push(`${character.name} doesn't know the cantrip "${spellName}". Known cantrips: ${knownCantrips || 'none'}`)
    } else {
      // For leveled spells, check prepared vs known
      const spellList = character.prepared_spells?.length
        ? character.prepared_spells.map(id => {
            const s = SPELLS.find(sp => sp.id === id)
            return s ? s.name : id
          }).join(', ')
        : character.known_spells?.map(id => {
            const s = SPELLS.find(sp => sp.id === id)
            return s ? s.name : id
          }).join(', ')

      errors.push(`${character.name} doesn't have "${spellName}" prepared/known. Available spells: ${spellList || 'none'}`)
    }
  }

  // Check spell slot availability for leveled spells
  let hasSpellSlot = true
  let slotLevelUsed: number | undefined

  if (!isCantrip && spellLevel > 0) {
    const castLevel = params.upcastLevel || spellLevel
    const availableSlot = findAvailableSlot(character, castLevel)

    if (availableSlot === null) {
      hasSpellSlot = false
      errors.push(`No spell slots available at level ${castLevel} or higher. ${character.name}'s magical reserves are depleted.`)
    } else {
      slotLevelUsed = availableSlot
      if (availableSlot > castLevel) {
        warnings.push(`Upcasting ${spellName} using level ${availableSlot} slot (no level ${castLevel} slots remaining)`)
      }
    }
  }

  // Check concentration (warning only - we don't track current concentration in this context)
  if (params.isConcentration) {
    warnings.push('This spell requires concentration. Any existing concentration spell will end.')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
    spellFound,
    hasSpellSlot,
    slotLevelUsed,
    isConcentrating: params.isConcentration,
  }
}
