/**
 * D&D 5e Rules Wiki Categories
 * Category metadata for navigation and organization
 */

import type { CategoryMeta } from '@/types/rules'

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'core-mechanics',
    name: 'Core Mechanics',
    description: 'Fundamental rules that apply to all gameplay',
    icon: 'dice-d20',
    order: 1,
    subcategories: [
      { id: 'ability-checks', name: 'Ability Checks', order: 1 },
      { id: 'saving-throws', name: 'Saving Throws', order: 2 },
      { id: 'advantage-disadvantage', name: 'Advantage & Disadvantage', order: 3 },
      { id: 'proficiency', name: 'Proficiency Bonus', order: 4 },
    ],
  },
  {
    id: 'combat',
    name: 'Combat',
    description: 'Rules for battles, attacks, and tactical encounters',
    icon: 'sword',
    order: 2,
    subcategories: [
      { id: 'initiative', name: 'Initiative', order: 1 },
      { id: 'actions', name: 'Actions in Combat', order: 2 },
      { id: 'attack-rolls', name: 'Attack Rolls', order: 3 },
      { id: 'damage', name: 'Damage & Healing', order: 4 },
      { id: 'conditions', name: 'Conditions', order: 5 },
      { id: 'death-saves', name: 'Death Saving Throws', order: 6 },
      { id: 'movement', name: 'Movement & Position', order: 7 },
      { id: 'cover', name: 'Cover', order: 8 },
    ],
  },
  {
    id: 'spellcasting',
    name: 'Spellcasting',
    description: 'Rules for casting and managing magical abilities',
    icon: 'wand',
    order: 3,
    subcategories: [
      { id: 'spell-slots', name: 'Spell Slots', order: 1 },
      { id: 'casting', name: 'Casting a Spell', order: 2 },
      { id: 'concentration', name: 'Concentration', order: 3 },
      { id: 'components', name: 'Spell Components', order: 4 },
      { id: 'spell-attacks', name: 'Spell Attacks & Saves', order: 5 },
      { id: 'ritual-casting', name: 'Ritual Casting', order: 6 },
    ],
  },
  {
    id: 'character',
    name: 'Character',
    description: 'Character creation, classes, races, and progression',
    icon: 'user',
    order: 4,
    subcategories: [
      { id: 'ability-scores', name: 'Ability Scores', order: 1 },
      { id: 'skills', name: 'Skills', order: 2 },
      { id: 'classes', name: 'Classes', order: 3 },
      { id: 'races', name: 'Races', order: 4 },
      { id: 'backgrounds', name: 'Backgrounds', order: 5 },
      { id: 'leveling', name: 'Leveling Up', order: 6 },
      { id: 'multiclassing', name: 'Multiclassing', order: 7 },
    ],
  },
  {
    id: 'equipment',
    name: 'Equipment',
    description: 'Weapons, armor, items, and currency',
    icon: 'backpack',
    order: 5,
    subcategories: [
      { id: 'weapons', name: 'Weapons', order: 1 },
      { id: 'armor', name: 'Armor & Shields', order: 2 },
      { id: 'adventuring-gear', name: 'Adventuring Gear', order: 3 },
      { id: 'currency', name: 'Currency & Trading', order: 4 },
    ],
  },
  {
    id: 'gameplay',
    name: 'Gameplay',
    description: 'Exploration, social interaction, and downtime',
    icon: 'map',
    order: 6,
    subcategories: [
      { id: 'resting', name: 'Resting', order: 1 },
      { id: 'exploration', name: 'Exploration', order: 2 },
      { id: 'social', name: 'Social Interaction', order: 3 },
      { id: 'downtime', name: 'Downtime Activities', order: 4 },
      { id: 'environment', name: 'Environment & Hazards', order: 5 },
    ],
  },
]

/**
 * Get category by ID
 */
export function getCategoryById(id: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.id === id)
}

/**
 * Get subcategory info
 */
export function getSubcategoryInfo(
  categoryId: string,
  subcategoryId: string
): { category: CategoryMeta; subcategory: CategoryMeta['subcategories'][0] } | undefined {
  const category = getCategoryById(categoryId)
  if (!category) return undefined

  const subcategory = category.subcategories.find((s) => s.id === subcategoryId)
  if (!subcategory) return undefined

  return { category, subcategory }
}

/**
 * Get all subcategory IDs for a category
 */
export function getSubcategoryIds(categoryId: string): string[] {
  const category = getCategoryById(categoryId)
  return category?.subcategories.map((s) => s.id) || []
}

/**
 * Build a flat list of all navigation items
 */
export function getFlatNavItems(): Array<{
  categoryId: string
  categoryName: string
  subcategoryId: string
  subcategoryName: string
  path: string
}> {
  const items: Array<{
    categoryId: string
    categoryName: string
    subcategoryId: string
    subcategoryName: string
    path: string
  }> = []

  for (const category of CATEGORIES) {
    for (const subcategory of category.subcategories) {
      items.push({
        categoryId: category.id,
        categoryName: category.name,
        subcategoryId: subcategory.id,
        subcategoryName: subcategory.name,
        path: `${category.id}/${subcategory.id}`,
      })
    }
  }

  return items
}
