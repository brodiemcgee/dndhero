/**
 * D&D 5e Experience Point Thresholds
 * Defines XP requirements for each level and progression utilities
 */

// Official D&D 5e XP thresholds for levels 1-20
export const XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 300,
  3: 900,
  4: 2700,
  5: 6500,
  6: 14000,
  7: 23000,
  8: 34000,
  9: 48000,
  10: 64000,
  11: 85000,
  12: 100000,
  13: 120000,
  14: 140000,
  15: 165000,
  16: 195000,
  17: 225000,
  18: 265000,
  19: 305000,
  20: 355000,
}

/**
 * Check if character has enough XP to level up
 */
export function canLevelUp(level: number, xp: number): boolean {
  if (level >= 20) {
    return false // Max level reached
  }

  const nextLevel = level + 1
  const xpNeeded = XP_THRESHOLDS[nextLevel]

  return xp >= xpNeeded
}

/**
 * Get XP required to reach a specific level
 */
export function getXPForLevel(level: number): number {
  if (level < 1 || level > 20) {
    throw new Error(`Invalid level: ${level}. Must be between 1 and 20.`)
  }

  return XP_THRESHOLDS[level]
}

/**
 * Calculate XP progress toward next level
 * Returns current progress, XP needed, and percentage complete
 */
export function getXPProgress(
  level: number,
  xp: number
): {
  current: number
  needed: number
  percentage: number
} {
  if (level >= 20) {
    return {
      current: 0,
      needed: 0,
      percentage: 100,
    }
  }

  const currentLevelXP = XP_THRESHOLDS[level]
  const nextLevelXP = XP_THRESHOLDS[level + 1]
  const xpIntoLevel = xp - currentLevelXP
  const xpNeededForLevel = nextLevelXP - currentLevelXP

  const percentage = Math.min(100, Math.max(0, (xpIntoLevel / xpNeededForLevel) * 100))

  return {
    current: Math.max(0, xpIntoLevel),
    needed: xpNeededForLevel,
    percentage: Math.round(percentage * 10) / 10,
  }
}

/**
 * Calculate total levels gained from XP
 */
export function getLevelFromXP(xp: number): number {
  for (let level = 20; level >= 1; level--) {
    if (xp >= XP_THRESHOLDS[level]) {
      return level
    }
  }
  return 1
}
