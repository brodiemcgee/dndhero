import { Command, CommandResult } from '../types'

/**
 * Client-safe dice parsing and rolling
 */
interface ParsedDice {
  count: number
  sides: number
  modifier: number
}

function parseDiceNotation(notation: string): ParsedDice {
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

  // Allow any reasonable die size for private rolls
  if (sides < 2 || sides > 100) {
    throw new Error(`Invalid die size: d${sides}. Must be between d2 and d100.`)
  }

  return { count, sides, modifier }
}

function rollDie(sides: number): number {
  // Use crypto.getRandomValues for browser-safe secure randomness
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return (array[0] % sides) + 1
}

interface DiceRollResult {
  notation: string
  rolls: number[]
  total: number
  modifier: number
  critical?: boolean
  fumble?: boolean
  breakdown: string
}

function rollDice(
  notation: string,
  options: { advantage?: boolean; disadvantage?: boolean } = {}
): DiceRollResult {
  const { advantage = false, disadvantage = false } = options

  if (advantage && disadvantage) {
    // They cancel out - roll normally
    return rollDice(notation, {})
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

    const critical = chosenRoll === 20
    const fumble = chosenRoll === 1

    const advLabel = advantage ? 'Advantage' : 'Disadvantage'
    const modStr = modifier !== 0 ? ` ${modifier > 0 ? '+' : ''}${modifier}` : ''

    return {
      notation,
      rolls,
      total,
      modifier,
      critical,
      fumble,
      breakdown: `${advLabel}: [${roll1}, ${roll2}] -> ${chosenRoll}${modStr} = **${total}**`,
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

  const modStr = modifier !== 0 ? ` ${modifier > 0 ? '+' : ''}${modifier}` : ''

  return {
    notation,
    rolls,
    total,
    modifier,
    critical,
    fumble,
    breakdown: `${notation}: [${rolls.join(', ')}]${modStr} = **${total}**`,
  }
}

export const rollCommand: Command = {
  name: 'roll',
  aliases: ['r'],
  description: 'Roll dice privately (not visible to other players)',
  usage: '/roll <dice> [adv|dis]',
  examples: ['/roll 1d20+5', '/roll 2d6', '/roll 1d20 adv', '/r d20'],

  execute: async (args): Promise<CommandResult> => {
    if (args.length === 0) {
      return {
        type: 'error',
        content: 'Usage: /roll <dice notation> [adv|dis]\n\nExamples:\n/roll 1d20+5\n/roll 2d6\n/roll d20 adv',
      }
    }

    const notation = args[0]
    const hasAdvantage = args.some(a =>
      ['adv', 'advantage', 'a'].includes(a.toLowerCase())
    )
    const hasDisadvantage = args.some(a =>
      ['dis', 'disadvantage', 'd'].includes(a.toLowerCase())
    )

    try {
      const result = rollDice(notation, {
        advantage: hasAdvantage,
        disadvantage: hasDisadvantage,
      })

      let statusLine = ''
      if (result.critical) {
        statusLine = '\n**CRITICAL HIT!**'
      } else if (result.fumble) {
        statusLine = '\n**FUMBLE!**'
      }

      return {
        type: 'text',
        title: 'Private Roll',
        content: `${result.breakdown}${statusLine}`,
        metadata: {
          total: result.total,
          critical: result.critical,
          fumble: result.fumble,
          rolls: result.rolls,
        },
      }
    } catch (error) {
      return {
        type: 'error',
        content: error instanceof Error ? error.message : 'Invalid dice notation',
      }
    }
  },
}
