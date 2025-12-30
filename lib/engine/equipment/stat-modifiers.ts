/**
 * Equipment Stat Modifier Engine
 * Calculates AC, attack bonuses, and other equipment effects
 */

import type { ArmorItem, WeaponItem, InventoryItem, EquippedItems } from '@/types/items'
import { getAbilityModifier } from '../core/abilities'
import { isArmorItem, isWeaponItem } from '@/types/items'

interface Character {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  level: number
  armor_proficiencies?: string[]
  weapon_proficiencies?: string[]
}

/**
 * Calculate total AC from equipped armor and shield
 */
export function calculateEquipmentAC(
  character: Character,
  equipment: EquippedItems
): {
  totalAC: number
  baseAC: number
  dexBonus: number
  shieldBonus: number
  breakdown: string[]
  hasStealthDisadvantage: boolean
} {
  const dexMod = getAbilityModifier(character.dexterity)
  const breakdown: string[] = []
  let hasStealthDisadvantage = false

  // Find equipped armor (chest slot)
  const chestItem = equipment.chest
  let baseAC = 10 // Unarmored
  let maxDexBonus: number | undefined = undefined

  if (chestItem && isArmorItem(chestItem.item)) {
    const armor = chestItem.item as ArmorItem
    baseAC = armor.base_ac
    maxDexBonus = armor.max_dex_bonus
    hasStealthDisadvantage = armor.stealth_disadvantage
    breakdown.push(`${armor.name}: ${armor.base_ac} AC`)
  } else {
    breakdown.push('Unarmored: 10 AC')
  }

  // Calculate dex bonus (capped if wearing medium/heavy armor)
  let dexBonus = dexMod
  if (maxDexBonus !== undefined) {
    dexBonus = Math.min(dexMod, maxDexBonus)
    if (dexMod > maxDexBonus) {
      breakdown.push(`DEX bonus: +${dexBonus} (capped from +${dexMod})`)
    } else {
      breakdown.push(`DEX bonus: +${dexBonus}`)
    }
  } else {
    breakdown.push(`DEX bonus: +${dexBonus}`)
  }

  // Find equipped shield (off_hand slot)
  const offHandItem = equipment.off_hand
  let shieldBonus = 0

  if (offHandItem && isArmorItem(offHandItem.item)) {
    const shield = offHandItem.item as ArmorItem
    if (shield.armor_type === 'shield') {
      shieldBonus = shield.base_ac // Typically +2
      breakdown.push(`Shield: +${shieldBonus}`)
    }
  }

  const totalAC = baseAC + dexBonus + shieldBonus

  return {
    totalAC,
    baseAC,
    dexBonus,
    shieldBonus,
    breakdown,
    hasStealthDisadvantage,
  }
}

/**
 * Check if character can equip armor based on proficiency and requirements
 */
export function canEquipArmor(
  character: Character,
  armor: ArmorItem
): { canEquip: boolean; reason?: string; speedPenalty?: number } {
  const proficiencies = character.armor_proficiencies || []

  // Check proficiency
  const armorTypeProf = `${armor.armor_type.charAt(0).toUpperCase()}${armor.armor_type.slice(1)} Armor`
  const hasProficiency = proficiencies.includes(armorTypeProf) ||
    proficiencies.includes('All Armor') ||
    (armor.armor_type === 'shield' && proficiencies.includes('Shields'))

  if (!hasProficiency) {
    return {
      canEquip: false,
      reason: `Not proficient with ${armor.armor_type} armor`,
    }
  }

  // Check strength requirement for heavy armor
  if (armor.strength_requirement && character.strength < armor.strength_requirement) {
    return {
      canEquip: true, // Can equip but with penalty
      reason: `STR ${armor.strength_requirement} required (you have ${character.strength})`,
      speedPenalty: 10, // -10 speed
    }
  }

  return { canEquip: true }
}

/**
 * Calculate weapon attack bonus
 */
export function getWeaponAttackBonus(
  character: Character,
  weapon: WeaponItem,
  isProficient: boolean
): {
  attackBonus: number
  damageBonus: number
  abilityUsed: 'STR' | 'DEX'
  damageDice: string
} {
  const strMod = getAbilityModifier(character.strength)
  const dexMod = getAbilityModifier(character.dexterity)

  // Determine which ability to use
  let abilityUsed: 'STR' | 'DEX' = 'STR'
  let abilityMod = strMod

  // Finesse weapons can use either STR or DEX
  if (weapon.properties.includes('finesse')) {
    if (dexMod > strMod) {
      abilityUsed = 'DEX'
      abilityMod = dexMod
    }
  }

  // Ranged weapons use DEX
  if (weapon.range && !weapon.properties.includes('thrown')) {
    abilityUsed = 'DEX'
    abilityMod = dexMod
  }

  // Calculate proficiency bonus
  const profBonus = isProficient ? Math.floor((character.level - 1) / 4) + 2 : 0

  return {
    attackBonus: abilityMod + profBonus,
    damageBonus: abilityMod,
    abilityUsed,
    damageDice: weapon.damage_dice,
  }
}

/**
 * Calculate total carry weight of inventory
 */
export function calculateCarryWeight(inventory: InventoryItem[]): {
  totalWeight: number
  maxCapacity: number
  encumbered: boolean
  heavilyEncumbered: boolean
} {
  const totalWeight = inventory.reduce((sum, invItem) => {
    return sum + (invItem.item.weight * invItem.quantity)
  }, 0)

  // These would need character STR - returning placeholders
  return {
    totalWeight,
    maxCapacity: 0, // Needs STR * 15
    encumbered: false,
    heavilyEncumbered: false,
  }
}

/**
 * Check if character is proficient with a weapon
 */
export function isWeaponProficient(
  character: Character,
  weapon: WeaponItem
): boolean {
  const proficiencies = character.weapon_proficiencies || []

  // Check for specific weapon proficiency
  if (proficiencies.includes(weapon.name)) {
    return true
  }

  // Check for category proficiency
  if (weapon.proficiency_category === 'simple' && proficiencies.includes('Simple Weapons')) {
    return true
  }

  if (weapon.proficiency_category === 'martial' && proficiencies.includes('Martial Weapons')) {
    return true
  }

  return false
}

/**
 * Get stealth disadvantage sources
 */
export function getStealthDisadvantageSources(equipment: EquippedItems): string[] {
  const sources: string[] = []

  for (const [slot, invItem] of Object.entries(equipment)) {
    if (invItem && isArmorItem(invItem.item)) {
      const armor = invItem.item as ArmorItem
      if (armor.stealth_disadvantage) {
        sources.push(armor.name)
      }
    }
  }

  return sources
}

/**
 * Count attuned items
 */
export function getAttunementSlotsUsed(equipment: EquippedItems): number {
  let count = 0

  for (const invItem of Object.values(equipment)) {
    if (invItem?.attuned) {
      count++
    }
  }

  return count
}

/**
 * Check if can attune to item
 */
export function canAttuneToItem(equipment: EquippedItems): boolean {
  return getAttunementSlotsUsed(equipment) < 3
}
