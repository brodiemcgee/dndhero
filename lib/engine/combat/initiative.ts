/**
 * D&D 5e Initiative System
 * Determines turn order in combat
 */

import { rollDice } from '../core/dice'
import { getInitiativeModifier, type AbilityScores } from '../core/abilities'

export interface InitiativeRoll {
  entityId: string
  entityName: string
  roll: number
  modifier: number
  total: number
  rolledAt: Date
}

export interface CombatOrder {
  order: string[] // Entity IDs in turn order
  currentTurn: number // Index in order array
  round: number
  initiatives: InitiativeRoll[]
}

/**
 * Roll initiative for an entity
 */
export function rollInitiative(
  entityId: string,
  entityName: string,
  abilityScores: AbilityScores,
  bonuses: number = 0
): InitiativeRoll {
  const modifier = getInitiativeModifier(abilityScores, bonuses)
  const diceRoll = rollDice('1d20')

  return {
    entityId,
    entityName,
    roll: diceRoll.rolls[0],
    modifier,
    total: diceRoll.rolls[0] + modifier,
    rolledAt: new Date(),
  }
}

/**
 * Determine combat order from initiative rolls
 * Ties are broken by dexterity modifier (higher wins)
 * If still tied, maintain original order
 */
export function determineCombatOrder(
  initiatives: InitiativeRoll[],
  dexterityModifiers: Record<string, number>
): CombatOrder {
  // Sort by total (descending), then by dex modifier (descending)
  const sorted = [...initiatives].sort((a, b) => {
    if (b.total !== a.total) {
      return b.total - a.total // Higher initiative goes first
    }

    // Tie-breaker: dexterity modifier
    const aDex = dexterityModifiers[a.entityId] || 0
    const bDex = dexterityModifiers[b.entityId] || 0

    if (bDex !== aDex) {
      return bDex - aDex
    }

    // Still tied: maintain original order (whoever rolled first)
    return a.rolledAt.getTime() - b.rolledAt.getTime()
  })

  return {
    order: sorted.map((init) => init.entityId),
    currentTurn: 0,
    round: 1,
    initiatives: sorted,
  }
}

/**
 * Advance to next turn
 */
export function advanceTurn(combatOrder: CombatOrder): CombatOrder {
  const nextIndex = combatOrder.currentTurn + 1

  if (nextIndex >= combatOrder.order.length) {
    // Wrap around to start of order, increment round
    return {
      ...combatOrder,
      currentTurn: 0,
      round: combatOrder.round + 1,
    }
  }

  return {
    ...combatOrder,
    currentTurn: nextIndex,
  }
}

/**
 * Get current turn entity ID
 */
export function getCurrentTurnEntityId(combatOrder: CombatOrder): string {
  return combatOrder.order[combatOrder.currentTurn]
}

/**
 * Check if it's a specific entity's turn
 */
export function isEntityTurn(combatOrder: CombatOrder, entityId: string): boolean {
  return getCurrentTurnEntityId(combatOrder) === entityId
}

/**
 * Remove entity from combat order (when they die or flee)
 */
export function removeEntityFromCombat(
  combatOrder: CombatOrder,
  entityId: string
): CombatOrder {
  const newOrder = combatOrder.order.filter((id) => id !== entityId)
  const newInitiatives = combatOrder.initiatives.filter((init) => init.entityId !== entityId)

  // Adjust current turn index if needed
  let newCurrentTurn = combatOrder.currentTurn

  if (combatOrder.order[combatOrder.currentTurn] === entityId) {
    // If we're removing the current turn entity, don't advance the index
    // (next entity will be at the same index)
    newCurrentTurn = combatOrder.currentTurn
  } else if (combatOrder.currentTurn > combatOrder.order.indexOf(entityId)) {
    // If we're removing someone who already went this round, decrement index
    newCurrentTurn = combatOrder.currentTurn - 1
  }

  // Ensure index is valid
  if (newCurrentTurn >= newOrder.length) {
    newCurrentTurn = 0
  }

  return {
    order: newOrder,
    currentTurn: Math.max(0, newCurrentTurn),
    round: combatOrder.round,
    initiatives: newInitiatives,
  }
}

/**
 * Add entity to combat (late join or summon)
 */
export function addEntityToCombat(
  combatOrder: CombatOrder,
  initiative: InitiativeRoll,
  dexterityModifier: number
): CombatOrder {
  // Find where to insert based on initiative total
  const newInitiatives = [...combatOrder.initiatives, initiative]
  const dexModifiers: Record<string, number> = {}

  combatOrder.initiatives.forEach((init) => {
    dexModifiers[init.entityId] = dexterityModifier
  })
  dexModifiers[initiative.entityId] = dexterityModifier

  return determineCombatOrder(newInitiatives, dexModifiers)
}

/**
 * Check if combat is over (only one side remains)
 */
export function isCombatOver(
  combatOrder: CombatOrder,
  entityAlignments: Record<string, 'ally' | 'enemy'>
): boolean {
  const remainingAlignments = new Set(
    combatOrder.order.map((entityId) => entityAlignments[entityId])
  )

  // Combat ends when only one alignment remains (or none)
  return remainingAlignments.size <= 1
}
