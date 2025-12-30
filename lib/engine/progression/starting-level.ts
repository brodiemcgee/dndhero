/**
 * Starting Level Configuration
 * Based on D&D 5e DMG guidelines for starting at higher levels
 */

export interface StartingLevelTier {
  name: string
  levels: [number, number] // [min, max]
  description: string
  startingGold: {
    base: number
    roll: string // Dice notation for additional gold
  }
  normalEquipment: boolean // Whether they get standard starting equipment
  magicItems: {
    uncommon: number
    rare: number
    veryRare: number
    legendary: number
  }
}

export const STARTING_LEVEL_TIERS: StartingLevelTier[] = [
  {
    name: 'Tier 1: Local Heroes',
    levels: [1, 4],
    description: 'Standard starting equipment. Just beginning your adventure.',
    startingGold: { base: 0, roll: '' },
    normalEquipment: true,
    magicItems: { uncommon: 0, rare: 0, veryRare: 0, legendary: 0 },
  },
  {
    name: 'Tier 2: Heroes of the Realm',
    levels: [5, 10],
    description: 'Established adventurers with some wealth and a magic item.',
    startingGold: { base: 500, roll: '1d10 x 25' },
    normalEquipment: true,
    magicItems: { uncommon: 1, rare: 0, veryRare: 0, legendary: 0 },
  },
  {
    name: 'Tier 3: Masters of the Realm',
    levels: [11, 16],
    description: 'Powerful heroes with significant resources.',
    startingGold: { base: 5000, roll: '1d10 x 250' },
    normalEquipment: false, // Buy your own equipment with gold
    magicItems: { uncommon: 2, rare: 0, veryRare: 0, legendary: 0 },
  },
  {
    name: 'Tier 4: Masters of the World',
    levels: [17, 20],
    description: 'Legendary heroes with great wealth and powerful items.',
    startingGold: { base: 20000, roll: '1d10 x 250' },
    normalEquipment: false,
    magicItems: { uncommon: 3, rare: 1, veryRare: 0, legendary: 0 },
  },
]

/**
 * Get the tier for a given level
 */
export function getTierForLevel(level: number): StartingLevelTier {
  for (const tier of STARTING_LEVEL_TIERS) {
    if (level >= tier.levels[0] && level <= tier.levels[1]) {
      return tier
    }
  }
  // Default to first tier if somehow level is invalid
  return STARTING_LEVEL_TIERS[0]
}

/**
 * Get the tier index (0-3) for a given level
 */
export function getTierIndexForLevel(level: number): number {
  for (let i = 0; i < STARTING_LEVEL_TIERS.length; i++) {
    const tier = STARTING_LEVEL_TIERS[i]
    if (level >= tier.levels[0] && level <= tier.levels[1]) {
      return i
    }
  }
  return 0
}

/**
 * Roll starting gold for a level using the tier's formula
 */
export function rollStartingGold(level: number): number {
  const tier = getTierForLevel(level)

  if (!tier.startingGold.roll) {
    return tier.startingGold.base
  }

  // Parse dice notation like "1d10 x 25"
  const match = tier.startingGold.roll.match(/(\d+)d(\d+)\s*x\s*(\d+)/)
  if (!match) {
    return tier.startingGold.base
  }

  const [, numDice, dieSize, multiplier] = match
  let rollTotal = 0
  for (let i = 0; i < parseInt(numDice); i++) {
    rollTotal += Math.floor(Math.random() * parseInt(dieSize)) + 1
  }

  return tier.startingGold.base + rollTotal * parseInt(multiplier)
}

/**
 * Calculate average starting gold for a level
 */
export function getAverageStartingGold(level: number): number {
  const tier = getTierForLevel(level)

  if (!tier.startingGold.roll) {
    return tier.startingGold.base
  }

  // Parse dice notation like "1d10 x 25"
  const match = tier.startingGold.roll.match(/(\d+)d(\d+)\s*x\s*(\d+)/)
  if (!match) {
    return tier.startingGold.base
  }

  const [, numDice, dieSize, multiplier] = match
  const avgRoll = parseInt(numDice) * (parseInt(dieSize) + 1) / 2

  return tier.startingGold.base + avgRoll * parseInt(multiplier)
}

/**
 * Get a display string for starting wealth
 */
export function getStartingWealthDescription(level: number): string {
  const tier = getTierForLevel(level)

  if (level <= 4) {
    return 'Standard starting equipment from class and background'
  }

  const parts: string[] = []

  if (tier.startingGold.base > 0) {
    parts.push(`${tier.startingGold.base.toLocaleString()} gp`)
    if (tier.startingGold.roll) {
      parts[0] += ` + ${tier.startingGold.roll} gp`
    }
  }

  if (tier.normalEquipment) {
    parts.push('Standard starting equipment')
  }

  const itemParts: string[] = []
  if (tier.magicItems.uncommon > 0) {
    itemParts.push(`${tier.magicItems.uncommon} uncommon magic item${tier.magicItems.uncommon > 1 ? 's' : ''}`)
  }
  if (tier.magicItems.rare > 0) {
    itemParts.push(`${tier.magicItems.rare} rare magic item${tier.magicItems.rare > 1 ? 's' : ''}`)
  }
  if (tier.magicItems.veryRare > 0) {
    itemParts.push(`${tier.magicItems.veryRare} very rare magic item${tier.magicItems.veryRare > 1 ? 's' : ''}`)
  }
  if (tier.magicItems.legendary > 0) {
    itemParts.push(`${tier.magicItems.legendary} legendary magic item${tier.magicItems.legendary > 1 ? 's' : ''}`)
  }

  if (itemParts.length > 0) {
    parts.push(itemParts.join(', '))
  }

  return parts.join(', ')
}
