import { Command, CommandResult, CommandAction, CommandContext } from '../types'

/**
 * Common dice options for quick rolling (private)
 */
const DICE_ACTIONS: CommandAction[] = [
  { label: 'd20', command: '/roll d20' },
  { label: 'd12', command: '/roll d12' },
  { label: 'd10', command: '/roll d10' },
  { label: 'd8', command: '/roll d8' },
  { label: 'd6', command: '/roll d6' },
  { label: 'd4', command: '/roll d4' },
  { label: 'd100', command: '/roll d100' },
  { label: 'Adv', command: '/roll adv' },
  { label: 'Dis', command: '/roll dis' },
]

/**
 * Common dice options for public rolling
 */
const PUBLIC_DICE_ACTIONS: CommandAction[] = [
  { label: 'd20 public', command: '/roll d20 public' },
  { label: 'd12 public', command: '/roll d12 public' },
  { label: 'd8 public', command: '/roll d8 public' },
  { label: 'd6 public', command: '/roll d6 public' },
]

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
  description: 'Roll dice (private by default, add "public" for visible roll)',
  usage: '/roll [dice] [adv|dis] [public]',
  examples: ['/roll', '/roll 1d20+5', '/roll 2d6 public', '/roll adv public', '/r d20'],

  execute: async (args, context): Promise<CommandResult> => {
    // Check for public keyword
    const isPublic = args.some(a => a.toLowerCase() === 'public')

    // Check for advantage/disadvantage keywords
    const advKeywords = ['adv', 'advantage', 'a']
    const disKeywords = ['dis', 'disadvantage', 'd']
    const allKeywords = [...advKeywords, ...disKeywords, 'public']

    const hasAdvantage = args.some(a => advKeywords.includes(a.toLowerCase()))
    const hasDisadvantage = args.some(a => disKeywords.includes(a.toLowerCase()))

    // Filter out keywords to find dice notation
    const diceArgs = args.filter(a => !allKeywords.includes(a.toLowerCase()))

    // Default to d20 if no dice specified
    let notation = diceArgs.length === 0 ? '1d20' : diceArgs[0]

    // Ensure notation has dice count prefix
    if (notation.startsWith('d')) {
      notation = '1' + notation
    }

    // For public rolls, call the API endpoint
    if (isPublic) {
      try {
        const response = await fetch('/api/dice/public-roll', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            campaignId: context.campaignId,
            sceneId: context.sceneId,
            characterId: context.characterId,
            notation,
            rollType: 'custom',
            advantage: hasAdvantage,
            disadvantage: hasDisadvantage,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          return {
            type: 'error',
            content: error.error || 'Failed to post roll',
            actions: PUBLIC_DICE_ACTIONS,
          }
        }

        const data = await response.json()

        let statusLine = ''
        if (data.roll.critical) {
          statusLine = ' **CRITICAL!**'
        } else if (data.roll.fumble) {
          statusLine = ' **FUMBLE!**'
        }

        return {
          type: 'text',
          title: 'Public Roll Posted',
          content: `Roll posted to chat: **${data.roll.total}**${statusLine}`,
          actions: PUBLIC_DICE_ACTIONS,
          metadata: {
            total: data.roll.total,
            critical: data.roll.critical,
            fumble: data.roll.fumble,
            rolls: data.roll.rolls,
            public: true,
          },
        }
      } catch (error) {
        return {
          type: 'error',
          content: error instanceof Error ? error.message : 'Failed to post roll',
          actions: PUBLIC_DICE_ACTIONS,
        }
      }
    }

    // Private roll - keep existing client-side behavior
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
        actions: DICE_ACTIONS,
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
        actions: DICE_ACTIONS,
      }
    }
  },
}
