/**
 * D&D 5e Spellcasting Progression Configuration
 * Defines how each class casts spells
 */

import type { DndClass, SpellLevel } from '@/types/spells'

export type CasterType = 'full' | 'half' | 'third' | 'warlock' | 'none'
export type SpellKnowledge = 'prepared' | 'known' | 'none'
export type AbilityName = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'

export interface ClassCasterConfig {
  casterType: CasterType
  spellKnowledge: SpellKnowledge
  spellcastingAbility: AbilityName | null
  startsAtLevel: number
  cantripsKnown: Record<number, number>
  spellsKnown?: Record<number, number>
  ritualCasting: boolean
}

// Spell slot progression tables
export const SPELL_SLOT_PROGRESSION: Record<
  CasterType,
  Record<number, Partial<Record<SpellLevel, number>>>
> = {
  full: {
    1: { 1: 2 },
    2: { 1: 3 },
    3: { 1: 4, 2: 2 },
    4: { 1: 4, 2: 3 },
    5: { 1: 4, 2: 3, 3: 2 },
    6: { 1: 4, 2: 3, 3: 3 },
    7: { 1: 4, 2: 3, 3: 3, 4: 1 },
    8: { 1: 4, 2: 3, 3: 3, 4: 2 },
    9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
    10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
    11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
    12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
    13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
    14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
    15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
    16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
    17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
    18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
    19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
    20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 },
  },
  half: {
    1: {},
    2: { 1: 2 },
    3: { 1: 3 },
    4: { 1: 3 },
    5: { 1: 4, 2: 2 },
    6: { 1: 4, 2: 2 },
    7: { 1: 4, 2: 3 },
    8: { 1: 4, 2: 3 },
    9: { 1: 4, 2: 3, 3: 2 },
    10: { 1: 4, 2: 3, 3: 2 },
    11: { 1: 4, 2: 3, 3: 3 },
    12: { 1: 4, 2: 3, 3: 3 },
    13: { 1: 4, 2: 3, 3: 3, 4: 1 },
    14: { 1: 4, 2: 3, 3: 3, 4: 1 },
    15: { 1: 4, 2: 3, 3: 3, 4: 2 },
    16: { 1: 4, 2: 3, 3: 3, 4: 2 },
    17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
    18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
    19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
    20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
  },
  third: {
    1: {}, 2: {},
    3: { 1: 2 },
    4: { 1: 3 },
    5: { 1: 3 },
    6: { 1: 3 },
    7: { 1: 4, 2: 2 },
    8: { 1: 4, 2: 2 },
    9: { 1: 4, 2: 2 },
    10: { 1: 4, 2: 3 },
    11: { 1: 4, 2: 3 },
    12: { 1: 4, 2: 3 },
    13: { 1: 4, 2: 3, 3: 2 },
    14: { 1: 4, 2: 3, 3: 2 },
    15: { 1: 4, 2: 3, 3: 2 },
    16: { 1: 4, 2: 3, 3: 3 },
    17: { 1: 4, 2: 3, 3: 3 },
    18: { 1: 4, 2: 3, 3: 3 },
    19: { 1: 4, 2: 3, 3: 3, 4: 1 },
    20: { 1: 4, 2: 3, 3: 3, 4: 1 },
  },
  warlock: {
    1: { 1: 1 },
    2: { 1: 2 },
    3: { 2: 2 },
    4: { 2: 2 },
    5: { 3: 2 },
    6: { 3: 2 },
    7: { 4: 2 },
    8: { 4: 2 },
    9: { 5: 2 },
    10: { 5: 2 },
    11: { 5: 3 },
    12: { 5: 3 },
    13: { 5: 3 },
    14: { 5: 3 },
    15: { 5: 3 },
    16: { 5: 3 },
    17: { 5: 4 },
    18: { 5: 4 },
    19: { 5: 4 },
    20: { 5: 4 },
  },
  none: {},
}

// Class configurations
export const CLASS_CASTER_CONFIGS: Record<DndClass, ClassCasterConfig> = {
  Wizard: {
    casterType: 'full',
    spellKnowledge: 'prepared',
    spellcastingAbility: 'INT',
    startsAtLevel: 1,
    cantripsKnown: { 1: 3, 4: 4, 10: 5 },
    ritualCasting: true,
  },
  Cleric: {
    casterType: 'full',
    spellKnowledge: 'prepared',
    spellcastingAbility: 'WIS',
    startsAtLevel: 1,
    cantripsKnown: { 1: 3, 4: 4, 10: 5 },
    ritualCasting: true,
  },
  Druid: {
    casterType: 'full',
    spellKnowledge: 'prepared',
    spellcastingAbility: 'WIS',
    startsAtLevel: 1,
    cantripsKnown: { 1: 2, 4: 3, 10: 4 },
    ritualCasting: true,
  },
  Bard: {
    casterType: 'full',
    spellKnowledge: 'known',
    spellcastingAbility: 'CHA',
    startsAtLevel: 1,
    cantripsKnown: { 1: 2, 4: 3, 10: 4 },
    spellsKnown: { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 9: 12, 10: 14 },
    ritualCasting: true,
  },
  Sorcerer: {
    casterType: 'full',
    spellKnowledge: 'known',
    spellcastingAbility: 'CHA',
    startsAtLevel: 1,
    cantripsKnown: { 1: 4, 4: 5, 10: 6 },
    spellsKnown: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11 },
    ritualCasting: false,
  },
  Warlock: {
    casterType: 'warlock',
    spellKnowledge: 'known',
    spellcastingAbility: 'CHA',
    startsAtLevel: 1,
    cantripsKnown: { 1: 2, 4: 3, 10: 4 },
    spellsKnown: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 10 },
    ritualCasting: false,
  },
  Paladin: {
    casterType: 'half',
    spellKnowledge: 'prepared',
    spellcastingAbility: 'CHA',
    startsAtLevel: 2,
    cantripsKnown: {},
    ritualCasting: false,
  },
  Ranger: {
    casterType: 'half',
    spellKnowledge: 'known',
    spellcastingAbility: 'WIS',
    startsAtLevel: 2,
    cantripsKnown: {},
    spellsKnown: { 2: 2, 3: 3, 5: 4, 7: 5, 9: 6, 11: 7, 13: 8, 15: 9, 17: 10, 19: 11 },
    ritualCasting: false,
  },
  Barbarian: {
    casterType: 'none',
    spellKnowledge: 'none',
    spellcastingAbility: null,
    startsAtLevel: 21,
    cantripsKnown: {},
    ritualCasting: false,
  },
  Fighter: {
    casterType: 'none',
    spellKnowledge: 'none',
    spellcastingAbility: null,
    startsAtLevel: 21,
    cantripsKnown: {},
    ritualCasting: false,
  },
  Monk: {
    casterType: 'none',
    spellKnowledge: 'none',
    spellcastingAbility: null,
    startsAtLevel: 21,
    cantripsKnown: {},
    ritualCasting: false,
  },
  Rogue: {
    casterType: 'none',
    spellKnowledge: 'none',
    spellcastingAbility: null,
    startsAtLevel: 21,
    cantripsKnown: {},
    ritualCasting: false,
  },
}

/**
 * Calculate maximum prepared spells
 */
export function calculateMaxPreparedSpells(
  abilityModifier: number,
  characterLevel: number
): number {
  return Math.max(1, abilityModifier + characterLevel)
}

/**
 * Get spell slots for a character
 */
export function getSpellSlotsForLevel(
  characterClass: DndClass,
  characterLevel: number
): Partial<Record<SpellLevel, number>> {
  const config = CLASS_CASTER_CONFIGS[characterClass]
  if (config.casterType === 'none' || characterLevel < config.startsAtLevel) {
    return {}
  }

  return SPELL_SLOT_PROGRESSION[config.casterType][characterLevel] || {}
}

/**
 * Get number of cantrips known
 */
export function getCantripsKnown(characterClass: DndClass, characterLevel: number): number {
  const config = CLASS_CASTER_CONFIGS[characterClass]
  let cantrips = 0

  for (const [level, count] of Object.entries(config.cantripsKnown)) {
    if (characterLevel >= parseInt(level)) {
      cantrips = count
    }
  }

  return cantrips
}

/**
 * Check if class can cast spells at level
 */
export function canCastSpells(characterClass: DndClass, characterLevel: number): boolean {
  const config = CLASS_CASTER_CONFIGS[characterClass]
  return characterLevel >= config.startsAtLevel && config.casterType !== 'none'
}

/**
 * Get highest spell level available
 */
export function getHighestSpellLevel(
  characterClass: DndClass,
  characterLevel: number
): SpellLevel {
  const slots = getSpellSlotsForLevel(characterClass, characterLevel)
  const levels = Object.keys(slots).map(Number) as SpellLevel[]
  return levels.length > 0 ? Math.max(...levels) as SpellLevel : 0
}

/**
 * Get number of spells known for "known" casters (Bard, Sorcerer, Ranger, Warlock)
 * Returns 0 for "prepared" casters who prepare spells daily
 */
export function getSpellsKnownCount(
  characterClass: DndClass,
  characterLevel: number
): number {
  const config = CLASS_CASTER_CONFIGS[characterClass]

  // No spells known for non-casters or if class hasn't started casting yet
  if (config.casterType === 'none' || characterLevel < config.startsAtLevel) {
    return 0
  }

  // Prepared casters don't have a fixed "known" count - they prepare spells daily
  if (config.spellKnowledge === 'prepared') {
    return 0
  }

  // Get spells known from config
  if (!config.spellsKnown) {
    return 0
  }

  let spellsKnown = 0
  for (const [level, count] of Object.entries(config.spellsKnown)) {
    if (characterLevel >= parseInt(level)) {
      spellsKnown = count
    }
  }

  return spellsKnown
}

/**
 * Check if a class uses "known" spell mechanics (select specific spells)
 * vs "prepared" spell mechanics (access entire class list, prepare daily)
 */
export function usesKnownSpells(characterClass: DndClass): boolean {
  const config = CLASS_CASTER_CONFIGS[characterClass]
  return config.spellKnowledge === 'known'
}

/**
 * Check if a class uses "prepared" spell mechanics
 */
export function usesPreparedSpells(characterClass: DndClass): boolean {
  const config = CLASS_CASTER_CONFIGS[characterClass]
  return config.spellKnowledge === 'prepared'
}

/**
 * Get the caster configuration for a class
 */
export function getCasterConfig(characterClass: DndClass): ClassCasterConfig {
  return CLASS_CASTER_CONFIGS[characterClass]
}
