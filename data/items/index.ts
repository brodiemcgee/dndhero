/**
 * Unified Item Catalog
 *
 * Central hub for looking up item prices and data across all categories.
 * Used by the DM Mechanics Pipeline for economic validation.
 */

import { WEAPONS, getWeaponById } from './weapons'
import { ARMOR, getArmorById } from './armor'
import { CONSUMABLES, getConsumableById, type ConsumableItem } from './consumables'
import { ADVENTURING_GEAR, getAdventuringGearById } from './adventuring-gear'
import type { Item, WeaponItem, ArmorItem, GenericItem } from '@/types/items'
import { CURRENCY_TO_COPPER } from '@/lib/ai-dm/mechanics/types'

// Re-export for convenience
export { WEAPONS, getWeaponById } from './weapons'
export { ARMOR, getArmorById } from './armor'
export { CONSUMABLES, getConsumableById, type ConsumableItem } from './consumables'
export { ADVENTURING_GEAR, getAdventuringGearById } from './adventuring-gear'

/**
 * Result of an item lookup
 */
export interface ItemLookupResult {
  found: boolean
  item?: Item | ConsumableItem
  priceInCp: number
  source: 'catalog' | 'not_found'
  category?: string
}

/**
 * All items combined for searching
 */
export const ALL_ITEMS: (Item | ConsumableItem)[] = [
  ...WEAPONS,
  ...ARMOR,
  ...CONSUMABLES,
  ...ADVENTURING_GEAR,
]

/**
 * Normalize item name for fuzzy matching
 */
function normalizeItemName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/['']/g, "'") // Normalize apostrophes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/^(a|an|the|some)\s+/i, '') // Remove articles
}

/**
 * Calculate price in copper pieces
 */
function calculatePriceInCp(cost: { amount: number; unit: string }): number {
  const multiplier = CURRENCY_TO_COPPER[cost.unit] || 100 // Default to GP if unknown
  return cost.amount * multiplier
}

/**
 * Look up an item by ID
 */
export function getItemById(id: string): Item | ConsumableItem | undefined {
  return (
    getWeaponById(id) ||
    getArmorById(id) ||
    getConsumableById(id) ||
    getAdventuringGearById(id)
  )
}

/**
 * Look up an item by name (case-insensitive, fuzzy matching)
 */
export function getItemByName(searchName: string): ItemLookupResult {
  const normalized = normalizeItemName(searchName)

  // Try exact match first
  for (const item of ALL_ITEMS) {
    if (normalizeItemName(item.name) === normalized) {
      return {
        found: true,
        item,
        priceInCp: calculatePriceInCp(item.cost),
        source: 'catalog',
        category: item.category,
      }
    }
  }

  // Try partial match (item name contains search or search contains item name)
  for (const item of ALL_ITEMS) {
    const itemNormalized = normalizeItemName(item.name)
    if (itemNormalized.includes(normalized) || normalized.includes(itemNormalized)) {
      return {
        found: true,
        item,
        priceInCp: calculatePriceInCp(item.cost),
        source: 'catalog',
        category: item.category,
      }
    }
  }

  // Try word-based matching for compound names
  const searchWords = normalized.split(' ').filter(w => w.length > 2)
  for (const item of ALL_ITEMS) {
    const itemWords = normalizeItemName(item.name).split(' ')
    const matchingWords = searchWords.filter(sw => itemWords.some(iw => iw.includes(sw) || sw.includes(iw)))
    if (matchingWords.length >= Math.max(1, searchWords.length * 0.5)) {
      return {
        found: true,
        item,
        priceInCp: calculatePriceInCp(item.cost),
        source: 'catalog',
        category: item.category,
      }
    }
  }

  // Not found
  return {
    found: false,
    priceInCp: 0,
    source: 'not_found',
  }
}

/**
 * Look up multiple items by name
 */
export function getItemsByNames(names: string[]): Map<string, ItemLookupResult> {
  const results = new Map<string, ItemLookupResult>()
  for (const name of names) {
    results.set(name, getItemByName(name))
  }
  return results
}

/**
 * Get suggested items based on partial name (for autocomplete)
 */
export function suggestItems(partialName: string, limit = 5): (Item | ConsumableItem)[] {
  const normalized = normalizeItemName(partialName)
  if (normalized.length < 2) return []

  const matches: Array<{ item: Item | ConsumableItem; score: number }> = []

  for (const item of ALL_ITEMS) {
    const itemNormalized = normalizeItemName(item.name)

    // Calculate match score
    let score = 0
    if (itemNormalized === normalized) {
      score = 100 // Exact match
    } else if (itemNormalized.startsWith(normalized)) {
      score = 80 // Starts with
    } else if (itemNormalized.includes(normalized)) {
      score = 60 // Contains
    } else {
      continue // No match
    }

    matches.push({ item, score })
  }

  // Sort by score descending, then by name
  matches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.item.name.localeCompare(b.item.name)
  })

  return matches.slice(0, limit).map(m => m.item)
}

/**
 * Common item aliases that map to catalog items
 */
const ITEM_ALIASES: Record<string, string> = {
  // Healing potions
  'healing potion': 'potion-of-healing',
  'health potion': 'potion-of-healing',
  'hp potion': 'potion-of-healing',
  'red potion': 'potion-of-healing',
  'greater healing': 'potion-of-greater-healing',
  'greater healing potion': 'potion-of-greater-healing',

  // Weapons
  'sword': 'longsword',
  'great sword': 'greatsword',
  'short sword': 'shortsword',
  'bow': 'shortbow',
  'crossbow': 'light-crossbow',
  'staff': 'quarterstaff',
  'axe': 'handaxe',

  // Armor
  'leather armor': 'leather',
  'chain armor': 'chain-mail',
  'plate armor': 'plate',
  'chainmail': 'chain-mail',

  // Consumables
  'torch': 'torch',
  'rope': 'rope-hemp',
  'lantern': 'lantern-hooded',
  'food': 'rations',
  'water': 'waterskin',
  'beer': 'ale-mug',
  'drink': 'ale-mug',
}

/**
 * Look up item with alias support
 */
export function getItemByNameWithAliases(searchName: string): ItemLookupResult {
  const normalized = normalizeItemName(searchName)

  // Check aliases first
  const aliasId = ITEM_ALIASES[normalized]
  if (aliasId) {
    const item = getItemById(aliasId)
    if (item) {
      return {
        found: true,
        item,
        priceInCp: calculatePriceInCp(item.cost),
        source: 'catalog',
        category: item.category,
      }
    }
  }

  // Fall back to regular lookup
  return getItemByName(searchName)
}

/**
 * Format price for display
 */
export function formatPrice(priceInCp: number): string {
  if (priceInCp >= 100000) {
    const pp = Math.floor(priceInCp / 1000)
    return `${pp} pp`
  }
  if (priceInCp >= 100) {
    const gp = Math.floor(priceInCp / 100)
    const remainingCp = priceInCp % 100
    if (remainingCp === 0) return `${gp} gp`
    const sp = Math.floor(remainingCp / 10)
    return sp > 0 ? `${gp} gp ${sp} sp` : `${gp} gp`
  }
  if (priceInCp >= 10) {
    const sp = Math.floor(priceInCp / 10)
    return `${sp} sp`
  }
  return `${priceInCp} cp`
}

/**
 * Get all items in a category
 */
export function getItemsByCategory(category: string): (Item | ConsumableItem)[] {
  return ALL_ITEMS.filter(item => item.category === category)
}

/**
 * Get catalog stats
 */
export function getCatalogStats(): {
  weapons: number
  armor: number
  consumables: number
  adventuringGear: number
  total: number
} {
  return {
    weapons: WEAPONS.length,
    armor: ARMOR.length,
    consumables: CONSUMABLES.length,
    adventuringGear: ADVENTURING_GEAR.length,
    total: ALL_ITEMS.length,
  }
}
