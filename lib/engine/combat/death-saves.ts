/**
 * D&D 5e Death Saving Throws
 * When a character reaches 0 HP
 */

import { rollDice } from '../core/dice'

export interface DeathSaves {
  successes: number // 0-3
  failures: number // 0-3
  isStabilized: boolean
  isDead: boolean
}

/**
 * Initialize death saves when character drops to 0 HP
 */
export function initializeDeathSaves(): DeathSaves {
  return {
    successes: 0,
    failures: 0,
    isStabilized: false,
    isDead: false,
  }
}

/**
 * Make a death saving throw
 * DC is always 10 in D&D 5e
 */
export function makeDeathSave(
  currentSaves: DeathSaves,
  advantage?: boolean,
  disadvantage?: boolean
): {
  saves: DeathSaves
  roll: number
  success: boolean
  critical: boolean
  fumble: boolean
  description: string
} {
  if (currentSaves.isStabilized || currentSaves.isDead) {
    throw new Error('Character is not making death saves')
  }

  const roll = rollDice('1d20', { advantage, disadvantage })
  const total = roll.total
  const success = total >= 10
  const critical = roll.critical || false
  const fumble = roll.fumble || false

  let newSaves = { ...currentSaves }
  let description = ''

  // Natural 20: Regain 1 HP and become conscious
  if (critical) {
    description = 'Natural 20! You regain 1 HP and become conscious!'
    newSaves.isStabilized = true
    // In actual implementation, would also set HP to 1
  }
  // Natural 1: Two failures
  else if (fumble) {
    newSaves.failures += 2
    description = `Natural 1! Two death save failures (${newSaves.failures}/3)`

    if (newSaves.failures >= 3) {
      newSaves.isDead = true
      description += ' - YOU DIED!'
    }
  }
  // Success
  else if (success) {
    newSaves.successes += 1
    description = `Death save success! (${newSaves.successes}/3 successes)`

    // Three successes: stabilized
    if (newSaves.successes >= 3) {
      newSaves.isStabilized = true
      description += ' - You are stabilized!'
    }
  }
  // Failure
  else {
    newSaves.failures += 1
    description = `Death save failure. (${newSaves.failures}/3 failures)`

    // Three failures: dead
    if (newSaves.failures >= 3) {
      newSaves.isDead = true
      description += ' - YOU DIED!'
    }
  }

  return {
    saves: newSaves,
    roll: total,
    success,
    critical,
    fumble,
    description,
  }
}

/**
 * Take damage while at 0 HP
 * Taking damage at 0 HP counts as one death save failure
 * If the damage equals or exceeds your max HP, you die instantly (massive damage rule)
 */
export function takeDamageAt0HP(
  currentSaves: DeathSaves,
  damage: number,
  maxHP: number,
  isCriticalHit: boolean = false
): DeathSaves {
  let newSaves = { ...currentSaves }

  // Massive damage: instant death
  if (damage >= maxHP) {
    newSaves.isDead = true
    return newSaves
  }

  // Critical hit while down: two failures
  if (isCriticalHit) {
    newSaves.failures += 2
  } else {
    newSaves.failures += 1
  }

  // Check for death
  if (newSaves.failures >= 3) {
    newSaves.isDead = true
  }

  return newSaves
}

/**
 * Stabilize a character (via healing or Medicine check)
 */
export function stabilize(currentSaves: DeathSaves): DeathSaves {
  return {
    successes: 0,
    failures: 0,
    isStabilized: true,
    isDead: false,
  }
}

/**
 * Heal a character at 0 HP
 * Any healing at 0 HP brings them back to consciousness
 */
export function healAt0HP(currentSaves: DeathSaves, healingAmount: number): {
  newHP: number
  saves: DeathSaves
} {
  return {
    newHP: healingAmount,
    saves: {
      successes: 0,
      failures: 0,
      isStabilized: true,
      isDead: false,
    },
  }
}

/**
 * Check if character should make death saves
 */
export function shouldMakeDeathSaves(currentHP: number, maxHP: number): boolean {
  return currentHP === 0
}

/**
 * Reset death saves (when healed above 0 HP)
 */
export function resetDeathSaves(): DeathSaves {
  return {
    successes: 0,
    failures: 0,
    isStabilized: true,
    isDead: false,
  }
}

/**
 * Get death save status description
 */
export function getDeathSaveStatus(saves: DeathSaves): string {
  if (saves.isDead) {
    return 'DEAD'
  }

  if (saves.isStabilized) {
    return 'Stabilized'
  }

  return `Making death saves (${saves.successes} successes, ${saves.failures} failures)`
}
