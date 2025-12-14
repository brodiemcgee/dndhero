/**
 * D&D 5e Ability Score and Proficiency Utilities
 */

// D&D 5e Proficiency Bonus by Level
const PROFICIENCY_BONUS_BY_LEVEL: Record<number, number> = {
  1: 2, 2: 2, 3: 2, 4: 2,
  5: 3, 6: 3, 7: 3, 8: 3,
  9: 4, 10: 4, 11: 4, 12: 4,
  13: 5, 14: 5, 15: 5, 16: 5,
  17: 6, 18: 6, 19: 6, 20: 6,
}

/**
 * Calculate ability modifier from ability score
 * Formula: (score - 10) / 2, rounded down
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

/**
 * Get proficiency bonus for a given character level
 */
export function getProficiencyBonus(level: number): number {
  if (level < 1 || level > 20) {
    throw new Error(`Invalid character level: ${level}. Must be between 1 and 20.`)
  }
  return PROFICIENCY_BONUS_BY_LEVEL[level]
}

/**
 * Calculate saving throw bonus
 */
export function getSavingThrowBonus(
  abilityScore: number,
  isProficient: boolean,
  level: number
): number {
  const modifier = getAbilityModifier(abilityScore)
  const proficiency = isProficient ? getProficiencyBonus(level) : 0
  return modifier + proficiency
}

/**
 * Calculate skill bonus
 */
export function getSkillBonus(
  abilityScore: number,
  isProficient: boolean,
  level: number
): number {
  const modifier = getAbilityModifier(abilityScore)
  const proficiency = isProficient ? getProficiencyBonus(level) : 0
  return modifier + proficiency
}

/**
 * Format modifier as string (e.g., +3, -1)
 */
export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`
}
