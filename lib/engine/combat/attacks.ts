/**
 * D&D 5e Attack System
 * Handles attack rolls, damage, and combat resolution
 */

import { rollDice, type DiceRoll } from '../core/dice'
import { getAbilityModifier, type AbilityScores } from '../core/abilities'
import { calculateAttackBonus, calculateDamageWithResistances, type Modifier } from '../core/modifiers'

export type AttackType = 'melee' | 'ranged' | 'spell'
export type DamageType =
  | 'acid'
  | 'bludgeoning'
  | 'cold'
  | 'fire'
  | 'force'
  | 'lightning'
  | 'necrotic'
  | 'piercing'
  | 'poison'
  | 'psychic'
  | 'radiant'
  | 'slashing'
  | 'thunder'

export interface AttackRoll {
  attackType: AttackType
  attackRoll: DiceRoll
  attackBonus: number
  totalAttack: number
  targetAC: number
  hit: boolean
  criticalHit: boolean
  criticalFumble: boolean
}

export interface DamageRoll {
  damageRoll: DiceRoll
  damageType: DamageType
  totalDamage: number
  effectiveDamage: number
  resistanceType: 'normal' | 'resistant' | 'vulnerable' | 'immune'
}

export interface AttackResult {
  attack: AttackRoll
  damage: DamageRoll | null
  description: string
}

/**
 * Make an attack roll
 */
export function makeAttackRoll(
  attackType: AttackType,
  abilityScores: AbilityScores,
  proficiencyBonus: number,
  isProficient: boolean,
  targetAC: number,
  additionalModifiers: Modifier[] = [],
  advantage?: boolean,
  disadvantage?: boolean
): AttackRoll {
  // Determine which ability to use
  const ability = attackType === 'melee' ? 'strength' : 'dexterity'
  const abilityMod = getAbilityModifier(abilityScores[ability])

  // Calculate attack bonus
  const bonusStack = calculateAttackBonus(abilityMod, proficiencyBonus, isProficient, additionalModifiers)

  // Roll the attack
  const attackRoll = rollDice('1d20', { advantage, disadvantage })

  const totalAttack = attackRoll.total + bonusStack.total

  // Determine if hit
  const hit = attackRoll.critical || totalAttack >= targetAC
  const criticalHit = attackRoll.critical || false
  const criticalFumble = attackRoll.fumble || false

  return {
    attackType,
    attackRoll,
    attackBonus: bonusStack.total,
    totalAttack,
    targetAC,
    hit: hit && !criticalFumble, // Natural 1 always misses
    criticalHit,
    criticalFumble,
  }
}

/**
 * Roll damage
 */
export function rollDamage(
  damageNotation: string,
  damageType: DamageType,
  isCritical: boolean = false,
  targetResistances: string[] = [],
  targetVulnerabilities: string[] = [],
  targetImmunities: string[] = []
): DamageRoll {
  // Roll damage dice
  let damageRoll: DiceRoll

  if (isCritical) {
    // Critical hit: double the dice (not the modifier)
    const parsed = damageNotation.match(/^(\d+)d(\d+)([+-]\d+)?$/)
    if (parsed) {
      const count = parseInt(parsed[1])
      const sides = parsed[2]
      const modifier = parsed[3] || ''
      const critNotation = `${count * 2}d${sides}${modifier}`
      damageRoll = rollDice(critNotation)
      damageRoll.critical = true
    } else {
      damageRoll = rollDice(damageNotation)
    }
  } else {
    damageRoll = rollDice(damageNotation)
  }

  const baseDamage = damageRoll.total

  // Apply resistances/vulnerabilities/immunities
  const { damage: effectiveDamage, type: resistanceType } = calculateDamageWithResistances(
    baseDamage,
    damageType,
    targetResistances,
    targetVulnerabilities,
    targetImmunities
  )

  return {
    damageRoll,
    damageType,
    totalDamage: baseDamage,
    effectiveDamage,
    resistanceType,
  }
}

/**
 * Perform a complete attack (roll to hit + damage)
 */
export function performAttack(
  attackType: AttackType,
  abilityScores: AbilityScores,
  proficiencyBonus: number,
  isProficient: boolean,
  targetAC: number,
  damageNotation: string,
  damageType: DamageType,
  targetResistances: string[] = [],
  targetVulnerabilities: string[] = [],
  targetImmunities: string[] = [],
  additionalModifiers: Modifier[] = [],
  advantage?: boolean,
  disadvantage?: boolean
): AttackResult {
  // Make attack roll
  const attack = makeAttackRoll(
    attackType,
    abilityScores,
    proficiencyBonus,
    isProficient,
    targetAC,
    additionalModifiers,
    advantage,
    disadvantage
  )

  // If miss, no damage
  if (!attack.hit) {
    return {
      attack,
      damage: null,
      description: attack.criticalFumble
        ? `Critical fumble! Attack roll: ${attack.attackRoll.breakdown}`
        : `Miss! Attack roll: ${attack.attackRoll.breakdown} = ${attack.totalAttack} vs AC ${targetAC}`,
    }
  }

  // Roll damage
  const damage = rollDamage(
    damageNotation,
    damageType,
    attack.criticalHit,
    targetResistances,
    targetVulnerabilities,
    targetImmunities
  )

  // Build description
  let description = attack.criticalHit
    ? `CRITICAL HIT! Attack roll: ${attack.attackRoll.breakdown}`
    : `Hit! Attack roll: ${attack.attackRoll.breakdown} = ${attack.totalAttack} vs AC ${targetAC}`

  description += `\nDamage: ${damage.damageRoll.breakdown} ${damageType}`

  if (damage.resistanceType !== 'normal') {
    description += `\nTarget is ${damage.resistanceType} to ${damageType}: ${damage.totalDamage} → ${damage.effectiveDamage} damage`
  }

  return {
    attack,
    damage,
    description,
  }
}

/**
 * Calculate weapon attack bonus
 */
export function getWeaponAttackBonus(
  weaponType: 'melee' | 'ranged',
  abilityScores: AbilityScores,
  proficiencyBonus: number,
  isProficient: boolean
): number {
  const ability = weaponType === 'melee' ? 'strength' : 'dexterity'
  const abilityMod = getAbilityModifier(abilityScores[ability])

  return abilityMod + (isProficient ? proficiencyBonus : 0)
}

/**
 * Check if an attack has advantage due to conditions
 */
export function hasAttackAdvantage(
  attackerConditions: string[],
  targetConditions: string[]
): { advantage: boolean; disadvantage: boolean } {
  let advantage = false
  let disadvantage = false

  // Attacker has advantage if target is:
  if (
    targetConditions.includes('prone') ||
    targetConditions.includes('paralyzed') ||
    targetConditions.includes('restrained') ||
    targetConditions.includes('stunned') ||
    targetConditions.includes('unconscious')
  ) {
    advantage = true
  }

  // Attacker has disadvantage if:
  if (
    attackerConditions.includes('poisoned') ||
    attackerConditions.includes('frightened') ||
    attackerConditions.includes('restrained')
  ) {
    disadvantage = true
  }

  // Attacker has disadvantage if target is invisible or heavily obscured
  if (targetConditions.includes('invisible')) {
    disadvantage = true
  }

  // Advantage and disadvantage cancel out in D&D 5e
  if (advantage && disadvantage) {
    return { advantage: false, disadvantage: false }
  }

  return { advantage, disadvantage }
}
