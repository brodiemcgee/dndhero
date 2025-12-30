/**
 * D&D 5e Character Progression System
 * Central interface for level-up mechanics, HP calculation, and feature tracking
 */

import { canLevelUp as canLevelUpByXP, getXPProgress, getXPForLevel } from './xp-thresholds'
import {
  getFeaturesAtLevel,
  isASILevel,
  getSubclassLevel,
  ASI_LEVELS,
  type ClassFeature,
} from './class-features'
import { getAbilityModifier } from '../core/abilities'

// Re-export commonly used functions
export { canLevelUpByXP, getXPProgress, getXPForLevel }
export { getFeaturesAtLevel, isASILevel, getSubclassLevel }
export type { ClassFeature }

// Character interface for progression
export interface ProgressionCharacter {
  id: string
  level: number
  experience_points?: number
  class: string
  constitution: number
  max_hp: number
  subclass?: string | null
}

// Level-up choices interface
export interface LevelUpChoices {
  hpRoll?: number
  hpRollUsed?: boolean
  abilityScoreIncreases?: {
    [abilityName: string]: number
  }
  featChosen?: string
  spellsLearned?: string[]
  subclassChosen?: string
  expertiseSkills?: string[]
  fightingStyle?: string
}

// Result of level-up requirements check
export interface LevelUpRequirements {
  canLevelUp: boolean
  reason?: string
  currentLevel: number
  nextLevel: number
  xpProgress?: {
    current: number
    needed: number
    percentage: number
  }
  featuresGained: ClassFeature[]
  requiresASI: boolean
  requiresSubclass: boolean
  requiresHPChoice: boolean
  hpOptions: {
    average: number
    rollMax: number
  }
}

/**
 * Check if a character can level up based on XP
 */
export function canLevelUp(character: ProgressionCharacter): boolean {
  if (character.level >= 20) {
    return false
  }

  const xp = character.experience_points || 0
  return canLevelUpByXP(character.level, xp)
}

/**
 * Get detailed level-up requirements and choices for a character
 */
export function getLevelUpChoices(character: ProgressionCharacter): LevelUpRequirements {
  const currentLevel = character.level
  const nextLevel = currentLevel + 1

  if (currentLevel >= 20) {
    return {
      canLevelUp: false,
      reason: 'Already at maximum level (20)',
      currentLevel,
      nextLevel: 20,
      featuresGained: [],
      requiresASI: false,
      requiresSubclass: false,
      requiresHPChoice: false,
      hpOptions: { average: 0, rollMax: 0 },
    }
  }

  const xp = character.experience_points || 0
  const xpCheck = canLevelUpByXP(currentLevel, xp)

  if (!xpCheck) {
    const progress = getXPProgress(currentLevel, xp)
    return {
      canLevelUp: false,
      reason: 'Not enough experience points',
      currentLevel,
      nextLevel,
      xpProgress: progress,
      featuresGained: [],
      requiresASI: false,
      requiresSubclass: false,
      requiresHPChoice: false,
      hpOptions: { average: 0, rollMax: 0 },
    }
  }

  const featuresGained = getFeaturesAtLevel(character.class, nextLevel)
  const requiresASI = isASILevel(character.class, nextLevel)
  const subclassLevel = getSubclassLevel(character.class)
  const requiresSubclass = nextLevel === subclassLevel && !character.subclass
  const hpOptions = getHPOptions(character.class, character.constitution)

  return {
    canLevelUp: true,
    currentLevel,
    nextLevel,
    xpProgress: getXPProgress(currentLevel, xp),
    featuresGained,
    requiresASI,
    requiresSubclass,
    requiresHPChoice: true,
    hpOptions,
  }
}

/**
 * Calculate HP increase for a level
 */
export function calculateHPIncrease(
  className: string,
  constitutionMod: number,
  isFirstLevel: boolean = false,
  roll?: number
): number {
  const hitDie = getHitDieForClass(className)

  if (isFirstLevel) {
    return hitDie + constitutionMod
  }

  if (roll !== undefined) {
    return Math.max(1, roll + constitutionMod)
  }

  const average = Math.floor(hitDie / 2) + 1
  return Math.max(1, average + constitutionMod)
}

/**
 * Get HP options for a character
 */
function getHPOptions(
  className: string,
  constitution: number
): { average: number; rollMax: number } {
  const hitDie = getHitDieForClass(className)
  const conMod = getAbilityModifier(constitution)
  const average = Math.floor(hitDie / 2) + 1 + conMod

  return {
    average: Math.max(1, average),
    rollMax: hitDie,
  }
}

/**
 * Get hit die size for a class
 */
function getHitDieForClass(className: string): number {
  const hitDice: Record<string, number> = {
    Barbarian: 12,
    Fighter: 10,
    Paladin: 10,
    Ranger: 10,
    Bard: 8,
    Cleric: 8,
    Druid: 8,
    Monk: 8,
    Rogue: 8,
    Warlock: 8,
    Sorcerer: 6,
    Wizard: 6,
  }

  return hitDice[className] || 8
}

/**
 * Get which levels grant ASI for a class
 */
export function getASILevels(className: string): number[] {
  return ASI_LEVELS[className] || ASI_LEVELS.Wizard
}

/**
 * Apply level-up to a character
 */
export function applyLevelUp(
  character: ProgressionCharacter,
  choices: LevelUpChoices
): Partial<ProgressionCharacter> {
  const requirements = getLevelUpChoices(character)

  if (!requirements.canLevelUp) {
    throw new Error(`Cannot level up: ${requirements.reason}`)
  }

  const updates: Partial<ProgressionCharacter> = {
    level: character.level + 1,
  }

  let hpIncrease: number
  if (choices.hpRollUsed && choices.hpRoll !== undefined) {
    const hitDie = getHitDieForClass(character.class)
    if (choices.hpRoll < 1 || choices.hpRoll > hitDie) {
      throw new Error(`Invalid HP roll: ${choices.hpRoll}. Must be between 1 and ${hitDie}.`)
    }
    hpIncrease = calculateHPIncrease(character.class, getAbilityModifier(character.constitution), false, choices.hpRoll)
  } else {
    hpIncrease = calculateHPIncrease(character.class, getAbilityModifier(character.constitution), false)
  }

  updates.max_hp = character.max_hp + hpIncrease

  if (requirements.requiresSubclass && choices.subclassChosen) {
    updates.subclass = choices.subclassChosen
  }

  return updates
}

/**
 * Validate level-up choices
 */
export function validateLevelUpChoices(
  character: ProgressionCharacter,
  choices: LevelUpChoices
): { valid: boolean; errors: string[] } {
  const requirements = getLevelUpChoices(character)
  const errors: string[] = []

  if (!requirements.canLevelUp) {
    errors.push(requirements.reason || 'Cannot level up')
    return { valid: false, errors }
  }

  if (choices.hpRollUsed) {
    if (choices.hpRoll === undefined) {
      errors.push('HP roll value is required when choosing to roll')
    } else {
      const hitDie = getHitDieForClass(character.class)
      if (choices.hpRoll < 1 || choices.hpRoll > hitDie) {
        errors.push(`HP roll must be between 1 and ${hitDie}`)
      }
    }
  }

  if (requirements.requiresSubclass && !choices.subclassChosen) {
    errors.push('Subclass choice is required at this level')
  }

  if (requirements.requiresASI) {
    const hasASI = choices.abilityScoreIncreases && Object.keys(choices.abilityScoreIncreases).length > 0
    const hasFeat = choices.featChosen

    if (!hasASI && !hasFeat) {
      errors.push('Must choose either ability score increases or a feat')
    }

    if (hasASI && hasFeat) {
      errors.push('Cannot choose both ability score increases and a feat')
    }

    if (hasASI && choices.abilityScoreIncreases) {
      const totalIncrease = Object.values(choices.abilityScoreIncreases).reduce((sum, val) => sum + val, 0)
      if (totalIncrease !== 2) {
        errors.push('Ability score increases must total exactly 2 points')
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
