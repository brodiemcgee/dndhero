/**
 * D&D 5e Spellcasting System
 * Spell slots, concentration, spell saves, and spell attacks
 */

import { rollDice } from '../core/dice'
import { getSpellSaveDC, getSpellAttackBonus, type AbilityName, type AbilityScores } from '../core/abilities'

export type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type SpellSchool =
  | 'abjuration'
  | 'conjuration'
  | 'divination'
  | 'enchantment'
  | 'evocation'
  | 'illusion'
  | 'necromancy'
  | 'transmutation'

export type CastingTime = 'action' | 'bonus_action' | 'reaction' | 'minute' | 'hour'

export type SpellRange = 'self' | 'touch' | 'ranged'

export type SpellComponent = 'V' | 'S' | 'M'

export interface SpellSlots {
  [level: number]: {
    max: number
    used: number
  }
}

export interface Spell {
  name: string
  level: SpellLevel
  school: SpellSchool
  castingTime: CastingTime
  range: number | 'self' | 'touch'
  components: SpellComponent[]
  materialComponent?: string
  duration: number | 'instantaneous' | 'concentration'
  requiresConcentration: boolean
  description: string
  higherLevels?: string
  damageType?: string
  savingThrow?: AbilityName
  attackRoll?: boolean
}

export interface ConcentrationState {
  spellName: string
  spellLevel: SpellLevel
  duration: number // rounds remaining
  caster: string // entity ID
  startedAt: Date
}

/**
 * Calculate spell slots for a character by class and level
 * This is a simplified version - full implementation would need class-specific logic
 */
export function calculateSpellSlots(
  characterClass: string,
  level: number
): SpellSlots {
  const slots: SpellSlots = {}

  // Cantrips are level 0 and unlimited
  slots[0] = { max: Infinity, used: 0 }

  // Full casters (Wizard, Sorcerer, Cleric, Druid, Bard)
  const fullCasters = ['wizard', 'sorcerer', 'cleric', 'druid', 'bard']
  // Half casters (Paladin, Ranger)
  const halfCasters = ['paladin', 'ranger']
  // Third casters (Eldritch Knight, Arcane Trickster)
  const thirdCasters = ['eldritch_knight', 'arcane_trickster']

  const classLower = characterClass.toLowerCase()

  if (fullCasters.includes(classLower)) {
    return getFullCasterSlots(level)
  } else if (halfCasters.includes(classLower)) {
    return getHalfCasterSlots(level)
  } else if (thirdCasters.includes(classLower)) {
    return getThirdCasterSlots(level)
  } else if (classLower === 'warlock') {
    return getWarlockSlots(level)
  }

  // Non-caster classes
  return slots
}

/**
 * Full caster spell slot progression (5e PHB)
 */
function getFullCasterSlots(level: number): SpellSlots {
  const slots: SpellSlots = { 0: { max: Infinity, used: 0 } }

  if (level >= 1) {
    slots[1] = { max: level === 1 ? 2 : level === 2 ? 3 : 4, used: 0 }
  }
  if (level >= 3) {
    slots[2] = { max: level === 3 ? 2 : 3, used: 0 }
  }
  if (level >= 5) {
    slots[3] = { max: level === 5 ? 2 : 3, used: 0 }
  }
  if (level >= 7) {
    slots[4] = { max: level === 7 ? 1 : level === 8 ? 2 : 3, used: 0 }
  }
  if (level >= 9) {
    slots[5] = { max: level === 9 ? 1 : level >= 10 && level <= 17 ? 2 : 3, used: 0 }
  }
  if (level >= 11) {
    slots[6] = { max: level >= 11 && level <= 18 ? 1 : 2, used: 0 }
  }
  if (level >= 13) {
    slots[7] = { max: level >= 13 && level <= 19 ? 1 : 2, used: 0 }
  }
  if (level >= 15) {
    slots[8] = { max: 1, used: 0 }
  }
  if (level >= 17) {
    slots[9] = { max: 1, used: 0 }
  }

  return slots
}

/**
 * Half caster spell slot progression
 */
function getHalfCasterSlots(level: number): SpellSlots {
  const slots: SpellSlots = { 0: { max: Infinity, used: 0 } }

  // Half casters start at level 2
  const effectiveLevel = Math.ceil(level / 2)

  return getFullCasterSlots(effectiveLevel)
}

/**
 * Third caster spell slot progression
 */
function getThirdCasterSlots(level: number): SpellSlots {
  const slots: SpellSlots = { 0: { max: Infinity, used: 0 } }

  // Third casters start at level 3
  const effectiveLevel = Math.ceil(level / 3)

  return getFullCasterSlots(effectiveLevel)
}

/**
 * Warlock spell slot progression (unique)
 */
function getWarlockSlots(level: number): SpellSlots {
  const slots: SpellSlots = { 0: { max: Infinity, used: 0 } }

  // Warlocks have few slots but they're all the same level
  const slotLevel = Math.min(5, Math.ceil(level / 2))
  const slotCount = level < 2 ? 1 : level < 11 ? 2 : level < 17 ? 3 : 4

  slots[slotLevel] = { max: slotCount, used: 0 }

  return slots
}

/**
 * Check if spell slot is available
 */
export function hasSpellSlot(slots: SpellSlots, level: SpellLevel): boolean {
  const slot = slots[level]
  return slot && slot.used < slot.max
}

/**
 * Use a spell slot
 */
export function useSpellSlot(slots: SpellSlots, level: SpellLevel): SpellSlots {
  if (!hasSpellSlot(slots, level)) {
    throw new Error(`No spell slots available for level ${level}`)
  }

  return {
    ...slots,
    [level]: {
      ...slots[level],
      used: slots[level].used + 1,
    },
  }
}

/**
 * Restore all spell slots (long rest)
 */
export function restoreAllSpellSlots(slots: SpellSlots): SpellSlots {
  const restored: SpellSlots = {}

  for (const [level, slot] of Object.entries(slots)) {
    restored[parseInt(level)] = {
      max: slot.max,
      used: 0,
    }
  }

  return restored
}

/**
 * Restore some spell slots (short rest, for warlocks)
 */
export function restoreWarlockSlots(slots: SpellSlots): SpellSlots {
  // Warlocks restore all slots on short rest
  return restoreAllSpellSlots(slots)
}

/**
 * Check if caster can cast a spell
 */
export function canCastSpell(
  spell: Spell,
  slots: SpellSlots,
  isConcentrating: boolean
): { canCast: boolean; reason?: string } {
  // Cantrips don't require slots
  if (spell.level === 0) {
    if (spell.requiresConcentration && isConcentrating) {
      return { canCast: false, reason: 'Already concentrating on another spell' }
    }
    return { canCast: true }
  }

  // Check if slot is available
  if (!hasSpellSlot(slots, spell.level)) {
    return { canCast: false, reason: `No level ${spell.level} spell slots available` }
  }

  // Check concentration
  if (spell.requiresConcentration && isConcentrating) {
    return { canCast: false, reason: 'Already concentrating on another spell' }
  }

  return { canCast: true }
}

/**
 * Make a spell attack roll
 */
export function makeSpellAttack(
  spellcastingAbility: AbilityName,
  abilityScores: AbilityScores,
  proficiencyBonus: number,
  targetAC: number,
  advantage?: boolean,
  disadvantage?: boolean
): { hit: boolean; roll: number; total: number; critical: boolean } {
  const attackBonus = getSpellAttackBonus(spellcastingAbility, abilityScores, proficiencyBonus)
  const roll = rollDice('1d20', { advantage, disadvantage })

  const total = roll.total + attackBonus

  return {
    hit: roll.critical || total >= targetAC,
    roll: roll.rolls[0],
    total,
    critical: roll.critical || false,
  }
}

/**
 * Make a spell saving throw
 */
export function makeSpellSave(
  spellcastingAbility: AbilityName,
  casterAbilityScores: AbilityScores,
  casterProficiencyBonus: number,
  targetSaveAbility: AbilityName,
  targetAbilityScores: AbilityScores,
  targetProficiencyBonus: number,
  targetIsProficient: boolean,
  advantage?: boolean,
  disadvantage?: boolean
): { success: boolean; saveDC: number; saveRoll: number; saveTotal: number } {
  const saveDC = getSpellSaveDC(spellcastingAbility, casterAbilityScores, casterProficiencyBonus)

  const saveModifier = getAbilityModifier(targetAbilityScores[targetSaveAbility])
  const profBonus = targetIsProficient ? targetProficiencyBonus : 0

  const roll = rollDice('1d20', { advantage, disadvantage })
  const saveTotal = roll.total + saveModifier + profBonus

  return {
    success: saveTotal >= saveDC,
    saveDC,
    saveRoll: roll.rolls[0],
    saveTotal,
  }
}

/**
 * Start concentrating on a spell
 */
export function startConcentration(
  spellName: string,
  spellLevel: SpellLevel,
  duration: number,
  caster: string
): ConcentrationState {
  return {
    spellName,
    spellLevel,
    duration,
    caster,
    startedAt: new Date(),
  }
}

/**
 * Make a concentration check (when taking damage)
 * DC = 10 or half the damage taken, whichever is higher
 */
export function makeConcentrationCheck(
  damageTaken: number,
  constitutionScore: number,
  proficiencyBonus: number,
  isProficient: boolean
): { success: boolean; dc: number; roll: number } {
  const dc = Math.max(10, Math.floor(damageTaken / 2))

  const constitutionMod = getAbilityModifier(constitutionScore)
  const profBonus = isProficient ? proficiencyBonus : 0

  const roll = rollDice('1d20')
  const total = roll.total + constitutionMod + profBonus

  return {
    success: total >= dc,
    dc,
    roll: total,
  }
}

function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

/**
 * Break concentration (voluntarily or forced)
 */
export function breakConcentration(concentration: ConcentrationState | null): null {
  return null
}

/**
 * Decrement concentration duration
 */
export function decrementConcentration(concentration: ConcentrationState | null): ConcentrationState | null {
  if (!concentration) return null

  const newDuration = concentration.duration - 1

  if (newDuration <= 0) {
    return null // Concentration ends
  }

  return {
    ...concentration,
    duration: newDuration,
  }
}

/**
 * Calculate upcast damage (when casting at higher level)
 */
export function calculateUpcastDamage(
  baseDamage: string,
  baseLevel: SpellLevel,
  castLevel: SpellLevel,
  dicePerLevel: number
): string {
  if (castLevel <= baseLevel) {
    return baseDamage
  }

  const levelDifference = castLevel - baseLevel
  const additionalDice = levelDifference * dicePerLevel

  // Parse base damage (e.g., "3d6")
  const match = baseDamage.match(/^(\d+)d(\d+)([+-]\d+)?$/)

  if (!match) {
    return baseDamage
  }

  const baseCount = parseInt(match[1])
  const sides = match[2]
  const modifier = match[3] || ''

  const newCount = baseCount + additionalDice

  return `${newCount}d${sides}${modifier}`
}
