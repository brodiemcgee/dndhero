/**
 * D&D 5e Modifiers and Bonuses System
 * Handles temporary bonuses, penalties, and stacking rules
 */

export type ModifierType =
  | 'base'
  | 'ability'
  | 'proficiency'
  | 'circumstance'
  | 'item'
  | 'spell'
  | 'feature'
  | 'untyped'

export interface Modifier {
  name: string
  type: ModifierType
  value: number
  source: string
  duration?: number // Turns, or -1 for permanent
}

export interface ModifierStack {
  total: number
  modifiers: Modifier[]
  breakdown: string
}

/**
 * Stack modifiers according to D&D 5e rules
 * In 5e, most bonuses stack, but bonuses from the same source/feature don't
 * (Unlike older editions with typed bonuses)
 */
export function stackModifiers(modifiers: Modifier[]): ModifierStack {
  // In D&D 5e, most modifiers stack unless they're from the same source
  // We'll track unique sources and take the highest from each

  const sourceMap = new Map<string, Modifier>()

  for (const modifier of modifiers) {
    const existing = sourceMap.get(modifier.source)

    if (!existing || Math.abs(modifier.value) > Math.abs(existing.value)) {
      // Keep the highest absolute value from each source
      sourceMap.set(modifier.source, modifier)
    }
  }

  const stackedModifiers = Array.from(sourceMap.values())
  const total = stackedModifiers.reduce((sum, mod) => sum + mod.value, 0)

  const breakdown = stackedModifiers
    .map((mod) => `${mod.name} (${mod.value >= 0 ? '+' : ''}${mod.value})`)
    .join(', ')

  return {
    total,
    modifiers: stackedModifiers,
    breakdown,
  }
}

/**
 * Calculate total attack bonus
 */
export function calculateAttackBonus(
  baseModifier: number, // Usually STR or DEX mod
  proficiencyBonus: number,
  isProficient: boolean,
  additionalModifiers: Modifier[] = []
): ModifierStack {
  const allModifiers: Modifier[] = [
    {
      name: 'Ability',
      type: 'ability',
      value: baseModifier,
      source: 'ability_score',
    },
  ]

  if (isProficient) {
    allModifiers.push({
      name: 'Proficiency',
      type: 'proficiency',
      value: proficiencyBonus,
      source: 'proficiency',
    })
  }

  allModifiers.push(...additionalModifiers)

  return stackModifiers(allModifiers)
}

/**
 * Calculate total AC (Armor Class)
 */
export function calculateArmorClass(
  baseAC: number, // From armor
  dexModifier: number,
  maxDexBonus: number = Infinity, // Heavy armor limits dex bonus
  additionalModifiers: Modifier[] = []
): ModifierStack {
  const dexBonus = Math.min(dexModifier, maxDexBonus)

  const allModifiers: Modifier[] = [
    {
      name: 'Base AC',
      type: 'base',
      value: baseAC,
      source: 'armor',
    },
    {
      name: 'Dexterity',
      type: 'ability',
      value: dexBonus,
      source: 'dexterity',
    },
  ]

  allModifiers.push(...additionalModifiers)

  return stackModifiers(allModifiers)
}

/**
 * Apply advantage/disadvantage to a roll total
 * (Advantage/disadvantage in 5e affects the die roll itself, not the total,
 * but this is for tracking the effective bonus for display purposes)
 */
export function getAdvantageDisadvantageBonus(hasAdvantage: boolean, hasDisadvantage: boolean): number {
  // Advantage and disadvantage cancel each other out
  if (hasAdvantage && hasDisadvantage) {
    return 0
  }

  // Average bonus from advantage is roughly +5 on a d20
  if (hasAdvantage) {
    return 5 // Display purposes only
  }

  // Average penalty from disadvantage is roughly -5 on a d20
  if (hasDisadvantage) {
    return -5 // Display purposes only
  }

  return 0
}

/**
 * Calculate effective bonus for display
 * This is for showing players what their total modifier is
 */
export function calculateEffectiveBonus(
  baseModifiers: Modifier[],
  hasAdvantage: boolean = false,
  hasDisadvantage: boolean = false
): ModifierStack {
  const stack = stackModifiers(baseModifiers)

  const advantageBonus = getAdvantageDisadvantageBonus(hasAdvantage, hasDisadvantage)

  if (advantageBonus !== 0) {
    stack.total += advantageBonus
    stack.breakdown += ` ${advantageBonus > 0 ? '(+Adv' : '(-Disadv'} ~${Math.abs(advantageBonus)})`
  }

  return stack
}

/**
 * Calculate damage total with resistances/vulnerabilities
 */
export function calculateDamageWithResistances(
  baseDamage: number,
  damageType: string,
  resistances: string[] = [],
  vulnerabilities: string[] = [],
  immunities: string[] = []
): { damage: number; type: string } {
  // Immunity = 0 damage
  if (immunities.includes(damageType)) {
    return { damage: 0, type: 'immune' }
  }

  let damage = baseDamage

  // Resistance = half damage (rounded down)
  if (resistances.includes(damageType)) {
    damage = Math.floor(damage / 2)
    return { damage, type: 'resistant' }
  }

  // Vulnerability = double damage
  if (vulnerabilities.includes(damageType)) {
    damage = damage * 2
    return { damage, type: 'vulnerable' }
  }

  return { damage, type: 'normal' }
}
