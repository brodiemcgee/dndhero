/**
 * Equipment and Inventory Type Definitions
 * Comprehensive D&D 5E item system with weapons, armor, and equipment
 */

// Item category classification
export type ItemCategory =
  | 'weapon'
  | 'armor'
  | 'shield'
  | 'adventuring_gear'
  | 'consumable'
  | 'magic_item'
  | 'tool'
  | 'ammunition'

// Weapon properties from D&D 5E
export type WeaponProperty =
  | 'finesse'
  | 'versatile'
  | 'two-handed'
  | 'light'
  | 'heavy'
  | 'reach'
  | 'thrown'
  | 'ammunition'
  | 'loading'
  | 'special'

// Armor type classification
export type ArmorType = 'light' | 'medium' | 'heavy' | 'shield'

// Damage type for weapons
export type DamageType =
  | 'slashing'
  | 'piercing'
  | 'bludgeoning'
  | 'acid'
  | 'cold'
  | 'fire'
  | 'force'
  | 'lightning'
  | 'necrotic'
  | 'poison'
  | 'psychic'
  | 'radiant'
  | 'thunder'

// Equipment slots for worn/wielded items
export type EquipSlot =
  | 'main_hand'
  | 'off_hand'
  | 'head'
  | 'chest'
  | 'hands'
  | 'feet'
  | 'neck'
  | 'ring_1'
  | 'ring_2'
  | 'cloak'
  | 'belt'

// Weapon range information
export interface WeaponRange {
  normal: number
  long?: number
}

// Base item interface
export interface BaseItem {
  id: string
  name: string
  category: ItemCategory
  description: string
  weight: number
  cost: {
    amount: number
    unit: 'cp' | 'sp' | 'gp' | 'pp'
  }
  rarity?: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary' | 'artifact'
  requires_attunement?: boolean
  magical?: boolean
}

// Weapon item with combat properties
export interface WeaponItem extends BaseItem {
  category: 'weapon'
  damage_dice: string
  damage_type: DamageType
  properties: WeaponProperty[]
  range?: WeaponRange
  versatile_damage?: string
  proficiency_category: 'simple' | 'martial'
}

// Armor item with defensive properties
export interface ArmorItem extends BaseItem {
  category: 'armor' | 'shield'
  armor_type: ArmorType
  base_ac: number
  max_dex_bonus?: number
  stealth_disadvantage: boolean
  strength_requirement?: number
  don_time?: string
  doff_time?: string
}

// Generic item
export interface GenericItem extends BaseItem {
  category: 'adventuring_gear' | 'consumable' | 'magic_item' | 'tool' | 'ammunition'
  charges?: number
  max_charges?: number
  consumable?: boolean
}

// Union type for all item types
export type Item = WeaponItem | ArmorItem | GenericItem

// Inventory item
export interface InventoryItem {
  item: Item
  quantity: number
  equipped?: boolean
  equip_slot?: EquipSlot
  attuned?: boolean
  identified?: boolean
  custom_notes?: string
}

// Equipped items map
export type EquippedItems = Partial<Record<EquipSlot, InventoryItem>>

// Constants
export const WEAPON_PROFICIENCY_CATEGORIES = {
  simple: 'Simple Weapons',
  martial: 'Martial Weapons',
} as const

export const ARMOR_PROFICIENCY_CATEGORIES = {
  light: 'Light Armor',
  medium: 'Medium Armor',
  heavy: 'Heavy Armor',
  shields: 'Shields',
} as const

export const EQUIPMENT_CONSTANTS = {
  CARRY_CAPACITY_MULTIPLIER: 15,
  ENCUMBRANCE_MULTIPLIER: 5,
  HEAVY_ENCUMBRANCE_MULTIPLIER: 10,
  PUSH_DRAG_LIFT_MULTIPLIER: 30,
  MAX_ATTUNEMENT_SLOTS: 3,
} as const

// Type guards
export function isWeaponItem(item: Item): item is WeaponItem {
  return item.category === 'weapon'
}

export function isArmorItem(item: Item): item is ArmorItem {
  return item.category === 'armor' || item.category === 'shield'
}

export function isGenericItem(item: Item): item is GenericItem {
  return !isWeaponItem(item) && !isArmorItem(item)
}

// Weapon property descriptions
export const WEAPON_PROPERTY_DESCRIPTIONS: Record<WeaponProperty, string> = {
  finesse: 'You can use your choice of Strength or Dexterity modifier for attack and damage rolls.',
  versatile: 'This weapon can be used with one or two hands. Using it with two hands deals more damage.',
  'two-handed': 'This weapon requires two hands to use.',
  light: 'This weapon is small and easy to handle, making it ideal for use when fighting with two weapons.',
  heavy: 'Creatures that are Small or Tiny have disadvantage on attack rolls with heavy weapons.',
  reach: 'This weapon adds 5 feet to your reach when you attack with it.',
  thrown: 'This weapon can be thrown to make a ranged attack.',
  ammunition: 'You can use this weapon to make a ranged attack only if you have ammunition.',
  loading: 'You can fire only one piece of ammunition per action.',
  special: 'This weapon has special rules governing its use.',
}
