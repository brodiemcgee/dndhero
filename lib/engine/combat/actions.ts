/**
 * D&D 5e Action Economy
 * Actions, bonus actions, reactions, and movement
 */

export type ActionType = 'action' | 'bonus_action' | 'reaction' | 'movement' | 'free'

export interface Action {
  name: string
  type: ActionType
  description: string
  range?: number | 'self' | 'touch'
  requiresTarget?: boolean
}

export interface ActionEconomy {
  action: boolean // Can take action this turn
  bonusAction: boolean // Can take bonus action this turn
  reaction: boolean // Can take reaction (resets at start of turn)
  movement: number // Movement remaining (feet)
  freeActions: string[] // Free actions taken (for tracking)
}

/**
 * Standard D&D 5e actions
 */
export const STANDARD_ACTIONS: Record<string, Action> = {
  attack: {
    name: 'Attack',
    type: 'action',
    description: 'Make one melee or ranged attack',
    requiresTarget: true,
  },
  cast_spell: {
    name: 'Cast a Spell',
    type: 'action',
    description: 'Cast a spell with a casting time of 1 action',
  },
  dash: {
    name: 'Dash',
    type: 'action',
    description: 'Gain extra movement equal to your speed',
  },
  disengage: {
    name: 'Disengage',
    type: 'action',
    description: 'Your movement doesn't provoke opportunity attacks',
  },
  dodge: {
    name: 'Dodge',
    type: 'action',
    description: 'Until your next turn, attack rolls against you have disadvantage',
  },
  help: {
    name: 'Help',
    type: 'action',
    description: 'Aid another creature in a task or give advantage on their attack',
    requiresTarget: true,
  },
  hide: {
    name: 'Hide',
    type: 'action',
    description: 'Make a Dexterity (Stealth) check to hide',
  },
  ready: {
    name: 'Ready',
    type: 'action',
    description: 'Prepare an action to trigger later',
  },
  search: {
    name: 'Search',
    type: 'action',
    description: 'Make a Wisdom (Perception) or Intelligence (Investigation) check',
  },
  use_object: {
    name: 'Use an Object',
    type: 'action',
    description: 'Interact with an object or environment',
  },
  opportunity_attack: {
    name: 'Opportunity Attack',
    type: 'reaction',
    description: 'Make a melee attack when an enemy leaves your reach',
    requiresTarget: true,
  },
}

/**
 * Initialize action economy for a turn
 */
export function initializeTurnActions(speed: number): ActionEconomy {
  return {
    action: true,
    bonusAction: true,
    reaction: true,
    movement: speed,
    freeActions: [],
  }
}

/**
 * Use an action
 */
export function useAction(economy: ActionEconomy, actionType: ActionType): ActionEconomy {
  const newEconomy = { ...economy }

  switch (actionType) {
    case 'action':
      if (!economy.action) {
        throw new Error('No action available')
      }
      newEconomy.action = false
      break

    case 'bonus_action':
      if (!economy.bonusAction) {
        throw new Error('No bonus action available')
      }
      newEconomy.bonusAction = false
      break

    case 'reaction':
      if (!economy.reaction) {
        throw new Error('No reaction available')
      }
      newEconomy.reaction = false
      break

    case 'free':
      // Free actions can be taken multiple times
      break

    default:
      throw new Error(`Unknown action type: ${actionType}`)
  }

  return newEconomy
}

/**
 * Use movement
 */
export function useMovement(economy: ActionEconomy, distance: number): ActionEconomy {
  if (distance > economy.movement) {
    throw new Error(`Not enough movement: ${distance} > ${economy.movement}`)
  }

  return {
    ...economy,
    movement: economy.movement - distance,
  }
}

/**
 * Dash action (double movement)
 */
export function dash(economy: ActionEconomy, speed: number): ActionEconomy {
  const afterAction = useAction(economy, 'action')

  return {
    ...afterAction,
    movement: afterAction.movement + speed,
  }
}

/**
 * Check if action is available
 */
export function canUseAction(economy: ActionEconomy, actionType: ActionType): boolean {
  switch (actionType) {
    case 'action':
      return economy.action
    case 'bonus_action':
      return economy.bonusAction
    case 'reaction':
      return economy.reaction
    case 'free':
      return true
    case 'movement':
      return economy.movement > 0
    default:
      return false
  }
}

/**
 * Reset action economy at start of turn
 */
export function resetActions(speed: number): ActionEconomy {
  return initializeTurnActions(speed)
}

/**
 * Check if can make opportunity attack
 */
export function canOpportunityAttack(
  economy: ActionEconomy,
  targetMovingOutOfReach: boolean
): boolean {
  return economy.reaction && targetMovingOutOfReach
}

/**
 * Calculate movement cost for difficult terrain
 */
export function calculateDifficultTerrainCost(distance: number): number {
  return distance * 2 // Difficult terrain costs 2 feet for every 1 foot moved
}

/**
 * Calculate movement cost for standing up from prone
 */
export function calculateStandUpCost(speed: number): number {
  return Math.floor(speed / 2) // Standing up costs half your speed
}

/**
 * Calculate movement cost for crawling (while prone)
 */
export function calculateCrawlingCost(distance: number): number {
  return distance * 2 // Crawling costs 2 feet for every 1 foot moved
}
