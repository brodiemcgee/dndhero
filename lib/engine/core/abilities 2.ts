/**
 * D&D 5e Ability Scores and Modifiers
 */

export type AbilityName = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma'

export type SkillName =
  | 'acrobatics'
  | 'animal_handling'
  | 'arcana'
  | 'athletics'
  | 'deception'
  | 'history'
  | 'insight'
  | 'intimidation'
  | 'investigation'
  | 'medicine'
  | 'nature'
  | 'perception'
  | 'performance'
  | 'persuasion'
  | 'religion'
  | 'sleight_of_hand'
  | 'stealth'
  | 'survival'

export type SavingThrowName = AbilityName

export interface AbilityScores {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export interface Skills {
  [key: string]: {
    ability: AbilityName
    proficient: boolean
    expertise: boolean
  }
}

/**
 * Calculate ability modifier from ability score
 * D&D 5e rule: (score - 10) / 2, rounded down
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

/**
 * Calculate all ability modifiers
 */
export function getAllAbilityModifiers(scores: AbilityScores): Record<AbilityName, number> {
  return {
    strength: getAbilityModifier(scores.strength),
    dexterity: getAbilityModifier(scores.dexterity),
    constitution: getAbilityModifier(scores.constitution),
    intelligence: getAbilityModifier(scores.intelligence),
    wisdom: getAbilityModifier(scores.wisdom),
    charisma: getAbilityModifier(scores.charisma),
  }
}

/**
 * Format modifier with + or - sign
 */
export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`
}

/**
 * Calculate proficiency bonus from level
 */
export function getProficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2
}

/**
 * Skill to ability mapping (D&D 5e standard)
 */
export const SKILL_ABILITIES: Record<SkillName, AbilityName> = {
  acrobatics: 'dexterity',
  animal_handling: 'wisdom',
  arcana: 'intelligence',
  athletics: 'strength',
  deception: 'charisma',
  history: 'intelligence',
  insight: 'wisdom',
  intimidation: 'charisma',
  investigation: 'intelligence',
  medicine: 'wisdom',
  nature: 'intelligence',
  perception: 'wisdom',
  performance: 'charisma',
  persuasion: 'charisma',
  religion: 'intelligence',
  sleight_of_hand: 'dexterity',
  stealth: 'dexterity',
  survival: 'wisdom',
}

/**
 * Calculate skill modifier
 */
export function getSkillModifier(
  skillName: SkillName,
  abilityScores: AbilityScores,
  proficiencyBonus: number,
  proficient: boolean = false,
  expertise: boolean = false
): number {
  const ability = SKILL_ABILITIES[skillName]
  const abilityMod = getAbilityModifier(abilityScores[ability])

  let bonus = 0
  if (expertise) {
    bonus = proficiencyBonus * 2 // Expertise = double proficiency
  } else if (proficient) {
    bonus = proficiencyBonus
  }

  return abilityMod + bonus
}

/**
 * Calculate saving throw modifier
 */
export function getSavingThrowModifier(
  savingThrow: SavingThrowName,
  abilityScores: AbilityScores,
  proficiencyBonus: number,
  proficient: boolean = false
): number {
  const abilityMod = getAbilityModifier(abilityScores[savingThrow])
  const bonus = proficient ? proficiencyBonus : 0
  return abilityMod + bonus
}

/**
 * Calculate passive perception (widely used in D&D)
 */
export function getPassivePerception(
  abilityScores: AbilityScores,
  proficiencyBonus: number,
  perceptionProficient: boolean = false,
  perceptionExpertise: boolean = false
): number {
  const perceptionMod = getSkillModifier(
    'perception',
    abilityScores,
    proficiencyBonus,
    perceptionProficient,
    perceptionExpertise
  )
  return 10 + perceptionMod
}

/**
 * Calculate initiative modifier (dexterity + bonuses)
 */
export function getInitiativeModifier(
  abilityScores: AbilityScores,
  bonuses: number = 0
): number {
  return getAbilityModifier(abilityScores.dexterity) + bonuses
}

/**
 * Calculate spell save DC
 * Formula: 8 + proficiency bonus + spellcasting ability modifier
 */
export function getSpellSaveDC(
  spellcastingAbility: AbilityName,
  abilityScores: AbilityScores,
  proficiencyBonus: number
): number {
  const abilityMod = getAbilityModifier(abilityScores[spellcastingAbility])
  return 8 + proficiencyBonus + abilityMod
}

/**
 * Calculate spell attack bonus
 * Formula: proficiency bonus + spellcasting ability modifier
 */
export function getSpellAttackBonus(
  spellcastingAbility: AbilityName,
  abilityScores: AbilityScores,
  proficiencyBonus: number
): number {
  const abilityMod = getAbilityModifier(abilityScores[spellcastingAbility])
  return proficiencyBonus + abilityMod
}

/**
 * Validate ability scores (must be between 1 and 30)
 */
export function validateAbilityScores(scores: AbilityScores): boolean {
  const abilities: AbilityName[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']

  for (const ability of abilities) {
    const score = scores[ability]
    if (score < 1 || score > 30 || !Number.isInteger(score)) {
      return false
    }
  }

  return true
}

/**
 * Apply ability score increase (ASI)
 * Max ability score is 20 (except for special features)
 */
export function applyAbilityScoreIncrease(
  scores: AbilityScores,
  increases: Partial<AbilityScores>,
  maxScore: number = 20
): AbilityScores {
  const newScores = { ...scores }

  for (const [ability, increase] of Object.entries(increases)) {
    if (increase) {
      newScores[ability as AbilityName] = Math.min(
        newScores[ability as AbilityName] + increase,
        maxScore
      )
    }
  }

  return newScores
}
