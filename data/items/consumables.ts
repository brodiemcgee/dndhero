/**
 * D&D 5e Consumables Catalog
 * Potions, scrolls, and other single-use items
 */

import type { GenericItem } from '@/types/items'

export interface ConsumableEffect {
  type: 'healing' | 'buff' | 'restoration' | 'utility' | 'damage'
  value?: string // Dice notation or description
  duration?: string
  description: string
}

export interface ConsumableItem extends GenericItem {
  category: 'consumable'
  consumable: true
  effect: ConsumableEffect
}

export const CONSUMABLES: ConsumableItem[] = [
  // Healing Potions
  {
    id: 'potion-of-healing',
    name: 'Potion of Healing',
    category: 'consumable',
    description: 'A red liquid that glimmers when agitated. Drinking it restores hit points.',
    weight: 0.5,
    cost: { amount: 50, unit: 'gp' },
    consumable: true,
    effect: {
      type: 'healing',
      value: '2d4+2',
      description: 'Regain 2d4+2 hit points when you drink this potion.',
    },
  },
  {
    id: 'potion-of-greater-healing',
    name: 'Potion of Greater Healing',
    category: 'consumable',
    description: 'A bright red liquid that glimmers when agitated.',
    weight: 0.5,
    cost: { amount: 150, unit: 'gp' },
    rarity: 'uncommon',
    consumable: true,
    effect: {
      type: 'healing',
      value: '4d4+4',
      description: 'Regain 4d4+4 hit points when you drink this potion.',
    },
  },
  {
    id: 'potion-of-superior-healing',
    name: 'Potion of Superior Healing',
    category: 'consumable',
    description: 'A crimson liquid that glows faintly.',
    weight: 0.5,
    cost: { amount: 450, unit: 'gp' },
    rarity: 'rare',
    consumable: true,
    effect: {
      type: 'healing',
      value: '8d4+8',
      description: 'Regain 8d4+8 hit points when you drink this potion.',
    },
  },

  // Other Potions
  {
    id: 'antitoxin',
    name: 'Antitoxin',
    category: 'consumable',
    description: 'A vial of cloudy liquid that neutralizes poison.',
    weight: 0,
    cost: { amount: 50, unit: 'gp' },
    consumable: true,
    effect: {
      type: 'buff',
      duration: '1 hour',
      description: 'Advantage on saving throws against poison for 1 hour.',
    },
  },
  {
    id: 'potion-of-climbing',
    name: 'Potion of Climbing',
    category: 'consumable',
    description: 'A yellow liquid with a bitter taste.',
    weight: 0.5,
    cost: { amount: 75, unit: 'gp' },
    consumable: true,
    effect: {
      type: 'buff',
      duration: '1 hour',
      description: 'Gain climbing speed equal to walking speed and advantage on Strength (Athletics) checks to climb.',
    },
  },
  {
    id: 'potion-of-water-breathing',
    name: 'Potion of Water Breathing',
    category: 'consumable',
    description: 'A cloudy green fluid that smells of the sea.',
    weight: 0.5,
    cost: { amount: 180, unit: 'gp' },
    rarity: 'uncommon',
    consumable: true,
    effect: {
      type: 'buff',
      duration: '1 hour',
      description: 'Breathe underwater for 1 hour after drinking.',
    },
  },
  {
    id: 'potion-of-invisibility',
    name: 'Potion of Invisibility',
    category: 'consumable',
    description: 'A clear liquid that is invisible in its container.',
    weight: 0.5,
    cost: { amount: 500, unit: 'gp' },
    rarity: 'very_rare',
    consumable: true,
    effect: {
      type: 'buff',
      duration: '1 hour',
      description: 'Become invisible for 1 hour. The effect ends early if you attack or cast a spell.',
    },
  },

  // Alchemical Items
  {
    id: 'alchemists-fire',
    name: "Alchemist's Fire",
    category: 'consumable',
    description: 'A sticky, adhesive fluid that ignites when exposed to air.',
    weight: 1,
    cost: { amount: 50, unit: 'gp' },
    consumable: true,
    effect: {
      type: 'damage',
      value: '1d4',
      description: 'Throw at creature (ranged attack). On hit, target takes 1d4 fire damage at start of each turn until extinguished.',
    },
  },
  {
    id: 'acid-vial',
    name: 'Acid (vial)',
    category: 'consumable',
    description: 'A glass vial of corrosive acid.',
    weight: 1,
    cost: { amount: 25, unit: 'gp' },
    consumable: true,
    effect: {
      type: 'damage',
      value: '2d6',
      description: 'Throw at creature (ranged attack). On hit, target takes 2d6 acid damage.',
    },
  },
  {
    id: 'holy-water',
    name: 'Holy Water (flask)',
    category: 'consumable',
    description: 'Water blessed by a cleric or paladin.',
    weight: 1,
    cost: { amount: 25, unit: 'gp' },
    consumable: true,
    effect: {
      type: 'damage',
      value: '2d6',
      description: 'Throw at creature (ranged attack). Fiends and undead take 2d6 radiant damage.',
    },
  },

  // Other Consumables
  {
    id: 'healers-kit',
    name: "Healer's Kit",
    category: 'consumable',
    description: 'A leather pouch containing bandages, salves, and splints.',
    weight: 3,
    cost: { amount: 5, unit: 'gp' },
    charges: 10,
    max_charges: 10,
    consumable: true,
    effect: {
      type: 'restoration',
      description: 'Stabilize a dying creature without a Medicine check (uses 1 charge).',
    },
  },
  {
    id: 'oil-flask',
    name: 'Oil (flask)',
    category: 'consumable',
    description: 'A flask of oil that can be used as fuel or thrown.',
    weight: 1,
    cost: { amount: 1, unit: 'sp' },
    consumable: true,
    effect: {
      type: 'utility',
      description: 'Cover 5-foot area. If ignited, burns for 2 rounds dealing 5 fire damage per round.',
    },
  },
  {
    id: 'torch',
    name: 'Torch',
    category: 'consumable',
    description: 'A wooden rod wrapped in cloth soaked with tallow.',
    weight: 1,
    cost: { amount: 1, unit: 'cp' },
    consumable: true,
    effect: {
      type: 'utility',
      duration: '1 hour',
      description: 'Burns for 1 hour, providing bright light in 20-foot radius and dim light for additional 20 feet.',
    },
  },
  {
    id: 'rations',
    name: 'Rations (1 day)',
    category: 'consumable',
    description: 'Dry foods suitable for extended travel.',
    weight: 2,
    cost: { amount: 5, unit: 'sp' },
    consumable: true,
    effect: {
      type: 'utility',
      description: 'One day of food for one person.',
    },
  },
]

export function getConsumableById(id: string): ConsumableItem | undefined {
  return CONSUMABLES.find(c => c.id === id)
}

export function getConsumablesByType(effectType: ConsumableEffect['type']): ConsumableItem[] {
  return CONSUMABLES.filter(c => c.effect.type === effectType)
}
