/**
 * D&D 5e Dice Rolling System
 * Cryptographically secure, supports advantage/disadvantage, critical hits
 */

import { webcrypto } from 'crypto'

// Types
export interface DiceRoll {
  notation: string
  rolls: number[]
  total: number
  modifier: number
  advantage?: boolean
  disadvantage?: boolean
  critical?: boolean
  fumble?: boolean
  breakdown: string
}

export interface ParsedDice {
  count: number
  sides: number
  modifier: number
}

/**
 * Cryptographically secure random number generator
 */
export function secureRandom(min: number, max: number): number {
  const range = max - min + 1
  const bytesNeeded = Math.ceil(Math.log2(range) / 8)
  const maxValue = Math.pow(256, bytesNeeded)
  const cutoff = maxValue - (maxValue % range)

  let randomValue: number

  do {
    const randomBytes = new Uint8Array(bytesNeeded)
    webcrypto.getRandomValues(randomBytes)
    randomValue = randomBytes.reduce((acc, byte, i) => acc + byte * Math.pow(256, i), 0)
  } while (randomValue >= cutoff)

  return min + (randomValue % range)
}

/**
 * Roll a single die
 */
export function rollDie(sides: number): number {
  return secureRandom(1, sides)
}

/**
 * Parse dice notation (e.g., "1d20+5", "8d6", "2d10-3")
 */
export function parseDiceNotation(notation: string): ParsedDice {
  const cleaned = notation.replace(/\s/g, '').toLowerCase()

  // Match patterns like "1d20+5" or "8d6" or "2d10-3"
  const match = cleaned.match(/^(\d+)?d(\d+)([+-]\d+)?$/)

  if (!match) {
    throw new Error(`Invalid dice notation: ${notation}`)
  }

  const count = match[1] ? parseInt(match[1]) : 1
  const sides = parseInt(match[2])
  const modifier = match[3] ? parseInt(match[3]) : 0

  if (count < 1 || count > 100) {
    throw new Error(`Invalid dice count: ${count}. Must be between 1 and 100.`)
  }

  if (![2, 3, 4, 6, 8, 10, 12, 20, 100].includes(sides)) {
    throw new Error(`Invalid die size: d${sides}. Must be a standard die (d2, d4, d6, d8, d10, d12, d20, d100).`)
  }

  return { count, sides, modifier }
}

/**
 * Roll dice from notation
 */
export function rollDice(
  notation: string,
  options: {
    advantage?: boolean
    disadvantage?: boolean
  } = {}
): DiceRoll {
  const { advantage = false, disadvantage = false } = options

  // Can't have both advantage and disadvantage
  if (advantage && disadvantage) {
    throw new Error('Cannot have both advantage and disadvantage')
  }

  const parsed = parseDiceNotation(notation)
  const { count, sides, modifier } = parsed

  let rolls: number[] = []
  let total = 0

  // Special handling for advantage/disadvantage on d20 rolls
  if (sides === 20 && count === 1 && (advantage || disadvantage)) {
    const roll1 = rollDie(20)
    const roll2 = rollDie(20)
    rolls = [roll1, roll2]

    const chosenRoll = advantage
      ? Math.max(roll1, roll2)
      : Math.min(roll1, roll2)

    total = chosenRoll + modifier

    // Check for critical hit (natural 20) or fumble (natural 1)
    const critical = chosenRoll === 20
    const fumble = chosenRoll === 1

    return {
      notation,
      rolls,
      total,
      modifier,
      advantage,
      disadvantage,
      critical,
      fumble,
      breakdown: advantage
        ? `Advantage: rolled ${roll1} and ${roll2}, taking ${chosenRoll}${modifier !== 0 ? ` ${modifier > 0 ? '+' : ''}${modifier}` : ''} = ${total}${critical ? ' (CRITICAL!)' : ''}${fumble ? ' (FUMBLE!)' : ''}`
        : `Disadvantage: rolled ${roll1} and ${roll2}, taking ${chosenRoll}${modifier !== 0 ? ` ${modifier > 0 ? '+' : ''}${modifier}` : ''} = ${total}${fumble ? ' (FUMBLE!)' : ''}`,
    }
  }

  // Normal dice rolling
  for (let i = 0; i < count; i++) {
    rolls.push(rollDie(sides))
  }

  const rollSum = rolls.reduce((sum, roll) => sum + roll, 0)
  total = rollSum + modifier

  // Check for critical/fumble on single d20
  const critical = sides === 20 && count === 1 && rolls[0] === 20
  const fumble = sides === 20 && count === 1 && rolls[0] === 1

  return {
    notation,
    rolls,
    total,
    modifier,
    critical,
    fumble,
    breakdown: `${notation}: rolled [${rolls.join(', ')}]${modifier !== 0 ? ` ${modifier > 0 ? '+' : ''}${modifier}` : ''} = ${total}${critical ? ' (CRITICAL!)' : ''}${fumble ? ' (FUMBLE!)' : ''}`,
  }
}

/**
 * Roll multiple dice (for damage, etc.)
 */
export function rollMultipleDice(notations: string[]): DiceRoll[] {
  return notations.map((notation) => rollDice(notation))
}

/**
 * Roll with advantage
 */
export function rollWithAdvantage(notation: string): DiceRoll {
  return rollDice(notation, { advantage: true })
}

/**
 * Roll with disadvantage
 */
export function rollWithDisadvantage(notation: string): DiceRoll {
  return rollDice(notation, { disadvantage: true })
}

/**
 * Roll for critical hit damage (double dice)
 */
export function rollCriticalDamage(baseNotation: string): DiceRoll {
  const parsed = parseDiceNotation(baseNotation)
  const critNotation = `${parsed.count * 2}d${parsed.sides}${parsed.modifier > 0 ? '+' : ''}${parsed.modifier || ''}`
  const roll = rollDice(critNotation)

  return {
    ...roll,
    critical: true,
    breakdown: `CRITICAL HIT: ${roll.breakdown}`,
  }
}

/**
 * Helper: Roll 4d6 drop lowest (standard character generation)
 */
export function roll4d6DropLowest(): DiceRoll {
  const rolls = [rollDie(6), rollDie(6), rollDie(6), rollDie(6)]
  rolls.sort((a, b) => a - b)
  const kept = rolls.slice(1) // Drop the lowest
  const total = kept.reduce((sum, roll) => sum + roll, 0)

  return {
    notation: '4d6 drop lowest',
    rolls,
    total,
    modifier: 0,
    breakdown: `Rolled [${rolls.join(', ')}], dropped ${rolls[0]}, kept [${kept.join(', ')}] = ${total}`,
  }
}

/**
 * Generate ability scores (roll 4d6 drop lowest, 6 times)
 */
export function generateAbilityScores(): number[] {
  const scores: number[] = []
  for (let i = 0; i < 6; i++) {
    scores.push(roll4d6DropLowest().total)
  }
  return scores
}

/**
 * Validate a roll result (for client-submitted rolls, to prevent cheating)
 * This is a placeholder - in production, server always rolls
 */
export function validateRoll(claimed: DiceRoll): boolean {
  const { notation, rolls, total, modifier } = claimed

  try {
    const parsed = parseDiceNotation(notation)

    // Check roll count matches
    if (rolls.length !== parsed.count) {
      return false
    }

    // Check each roll is within die range
    for (const roll of rolls) {
      if (roll < 1 || roll > parsed.sides) {
        return false
      }
    }

    // Check total is correct
    const rollSum = rolls.reduce((sum, roll) => sum + roll, 0)
    if (total !== rollSum + modifier) {
      return false
    }

    return true
  } catch {
    return false
  }
}
