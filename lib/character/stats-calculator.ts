/**
 * Character Stats Calculator
 * Centralized logic for calculating character stats during creation
 */

import type {
  Race,
  Subrace,
  DndClass,
  Background,
  AbilityName,
  AbilityBonus,
  RacialTrait,
} from '@/types/character-options'

// =============================================================================
// TYPES
// =============================================================================

export interface AbilityScores {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export interface CalculatedAbility {
  base: number
  racialBonus: number
  total: number
  modifier: number
}

export interface CalculatedAbilities {
  strength: CalculatedAbility
  dexterity: CalculatedAbility
  constitution: CalculatedAbility
  intelligence: CalculatedAbility
  wisdom: CalculatedAbility
  charisma: CalculatedAbility
}

export interface SavingThrow {
  ability: AbilityName
  modifier: number
  proficient: boolean
}

export interface SkillInfo {
  name: string
  ability: AbilityName
  modifier: number
  proficient: boolean
}

export interface CharacterPreviewData {
  // Identity
  name: string
  race: Race | null
  subrace: Subrace | null
  class: DndClass | null
  background: Background | null
  level: number

  // Abilities
  baseAbilities: AbilityScores

  // Selected proficiencies
  selectedSkills: string[]
}

export interface CalculatedStats {
  abilities: CalculatedAbilities
  hp: number
  ac: number
  speed: number
  initiative: number
  proficiencyBonus: number
  savingThrows: SavingThrow[]
  languages: string[]
  traits: RacialTrait[]
  armorProficiencies: string[]
  weaponProficiencies: string[]
  toolProficiencies: string[]
}

// =============================================================================
// CONSTANTS
// =============================================================================

const ABILITY_NAMES: AbilityName[] = [
  'strength', 'dexterity', 'constitution',
  'intelligence', 'wisdom', 'charisma'
]

const SKILL_ABILITIES: Record<string, AbilityName> = {
  'Acrobatics': 'dexterity',
  'Animal Handling': 'wisdom',
  'Arcana': 'intelligence',
  'Athletics': 'strength',
  'Deception': 'charisma',
  'History': 'intelligence',
  'Insight': 'wisdom',
  'Intimidation': 'charisma',
  'Investigation': 'intelligence',
  'Medicine': 'wisdom',
  'Nature': 'intelligence',
  'Perception': 'wisdom',
  'Performance': 'charisma',
  'Persuasion': 'charisma',
  'Religion': 'intelligence',
  'Sleight of Hand': 'dexterity',
  'Stealth': 'dexterity',
  'Survival': 'wisdom',
}

const HIT_DIE_VALUES: Record<string, number> = {
  'd6': 6,
  'd8': 8,
  'd10': 10,
  'd12': 12,
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate ability modifier from score
 */
export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

/**
 * Format modifier as string (+2, -1, etc.)
 */
export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`
}

/**
 * Get proficiency bonus by level
 */
export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1
}

/**
 * Combine racial ability bonuses from race and subrace
 */
export function getCombinedAbilityBonuses(
  race: Race | null,
  subrace: Subrace | null
): AbilityBonus[] {
  const bonuses: AbilityBonus[] = []

  if (race) {
    bonuses.push(...race.abilityBonuses)
  }

  if (subrace) {
    bonuses.push(...subrace.abilityBonuses)
  }

  return bonuses
}

/**
 * Get total racial bonus for a specific ability
 */
export function getRacialBonus(
  ability: AbilityName,
  race: Race | null,
  subrace: Subrace | null
): number {
  const bonuses = getCombinedAbilityBonuses(race, subrace)
  return bonuses
    .filter(b => b.ability === ability)
    .reduce((sum, b) => sum + b.bonus, 0)
}

/**
 * Combine traits from race and subrace
 */
export function getCombinedTraits(
  race: Race | null,
  subrace: Subrace | null
): RacialTrait[] {
  const traits: RacialTrait[] = []

  if (race) {
    traits.push(...race.traits)
  }

  if (subrace) {
    traits.push(...subrace.traits)
  }

  return traits
}

/**
 * Calculate character speed from race and subrace
 */
export function getSpeed(race: Race | null, subrace: Subrace | null): number {
  if (!race) return 30 // Default

  let speed = race.speed

  // Check for speed bonuses in traits
  const traits = getCombinedTraits(race, subrace)
  for (const trait of traits) {
    if (trait.speedBonus) {
      speed += trait.speedBonus
    }
  }

  return speed
}

/**
 * Get darkvision range from traits (0 if none)
 */
export function getDarkvision(race: Race | null, subrace: Subrace | null): number {
  const traits = getCombinedTraits(race, subrace)

  // Get the highest darkvision value
  let darkvision = 0
  for (const trait of traits) {
    if (trait.darkvision && trait.darkvision > darkvision) {
      darkvision = trait.darkvision
    }
  }

  return darkvision
}

/**
 * Get languages from race
 */
export function getLanguages(race: Race | null, subrace: Subrace | null): string[] {
  const languages: string[] = []

  if (race) {
    languages.push(...race.languages)
  }

  // Check subrace traits for additional languages
  if (subrace) {
    for (const trait of subrace.traits) {
      if (trait.proficiencies?.languages) {
        languages.push(...trait.proficiencies.languages)
      }
    }
  }

  return languages
}

// =============================================================================
// MAIN CALCULATION FUNCTION
// =============================================================================

/**
 * Calculate all character stats from current selections
 */
export function calculateCharacterStats(data: CharacterPreviewData): CalculatedStats {
  const { race, subrace, class: dndClass, background, level, baseAbilities, selectedSkills } = data

  // Calculate abilities with racial bonuses
  const abilities: CalculatedAbilities = {} as CalculatedAbilities

  for (const ability of ABILITY_NAMES) {
    const base = baseAbilities[ability]
    const racialBonus = getRacialBonus(ability, race, subrace)
    const total = base + racialBonus
    const modifier = getModifier(total)

    abilities[ability] = { base, racialBonus, total, modifier }
  }

  // Calculate proficiency bonus
  const proficiencyBonus = getProficiencyBonus(level)

  // Calculate HP
  let hp = 0
  if (dndClass) {
    const hitDieValue = HIT_DIE_VALUES[dndClass.hitDie] || 8
    hp = hitDieValue + abilities.constitution.modifier

    // Check for Dwarven Toughness (Hill Dwarf)
    const traits = getCombinedTraits(race, subrace)
    const hasDwarvenToughness = traits.some(t => t.id === 'dwarven-toughness')
    if (hasDwarvenToughness) {
      hp += level
    }
  }

  // Calculate AC (base, no armor)
  const ac = 10 + abilities.dexterity.modifier

  // Calculate speed
  const speed = getSpeed(race, subrace)

  // Calculate initiative
  const initiative = abilities.dexterity.modifier

  // Calculate saving throws
  const savingThrows: SavingThrow[] = ABILITY_NAMES.map(ability => {
    const proficient = dndClass?.savingThrows.includes(ability) || false
    const modifier = abilities[ability].modifier + (proficient ? proficiencyBonus : 0)
    return { ability, modifier, proficient }
  })

  // Get languages
  const languages = getLanguages(race, subrace)

  // Get traits
  const traits = getCombinedTraits(race, subrace)

  // Get proficiencies
  const armorProficiencies = dndClass?.armorProficiencies || []
  const weaponProficiencies = dndClass?.weaponProficiencies || []

  // Combine tool proficiencies from class and background
  const toolProficiencies: string[] = []
  if (dndClass?.toolProficiencies) {
    toolProficiencies.push(...dndClass.toolProficiencies)
  }
  if (background?.toolProficiencies) {
    toolProficiencies.push(...background.toolProficiencies)
  }

  return {
    abilities,
    hp,
    ac,
    speed,
    initiative,
    proficiencyBonus,
    savingThrows,
    languages,
    traits,
    armorProficiencies,
    weaponProficiencies,
    toolProficiencies,
  }
}

// =============================================================================
// SKILL HELPERS
// =============================================================================

/**
 * Get skill modifier including proficiency if applicable
 */
export function getSkillModifier(
  skillName: string,
  abilities: CalculatedAbilities,
  proficiencyBonus: number,
  isProficient: boolean
): number {
  const ability = SKILL_ABILITIES[skillName]
  if (!ability) return 0

  const abilityMod = abilities[ability].modifier
  return abilityMod + (isProficient ? proficiencyBonus : 0)
}

/**
 * Get all skill proficiencies from background
 */
export function getBackgroundSkills(background: Background | null): string[] {
  return background?.skillProficiencies || []
}

/**
 * Get skill options available from class
 */
export function getClassSkillOptions(dndClass: DndClass | null): { count: number; options: string[] } {
  return dndClass?.skillOptions || { count: 0, options: [] }
}

// =============================================================================
// SUMMARY HELPERS (for card display)
// =============================================================================

/**
 * Get a summary of ability bonuses as displayable array
 */
export function getAbilityBonusSummary(
  race: Race | null,
  subrace: Subrace | null
): { ability: AbilityName; bonus: number }[] {
  return getCombinedAbilityBonuses(race, subrace)
}

/**
 * Get trait names only (for card preview)
 */
export function getTraitNames(race: Race | null, subrace: Subrace | null): string[] {
  return getCombinedTraits(race, subrace).map(t => t.name)
}

/**
 * Get level 1 class features
 */
export function getLevel1Features(dndClass: DndClass | null): string[] {
  if (!dndClass) return []
  return dndClass.features
    .filter(f => f.level === 1)
    .map(f => f.name)
}

/**
 * Check if a race has subraces
 */
export function hasSubraces(race: Race | null): boolean {
  return (race?.subraces?.length || 0) > 0
}

/**
 * Format hit die for display
 */
export function formatHitDie(dndClass: DndClass | null): string {
  if (!dndClass) return ''
  return dndClass.hitDie.toUpperCase() // d10 -> D10
}

/**
 * Check if class is a spellcaster
 */
export function isSpellcaster(dndClass: DndClass | null): boolean {
  return dndClass?.spellcasting !== undefined && dndClass.spellcasting.type !== 'none'
}
