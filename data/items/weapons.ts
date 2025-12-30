/**
 * D&D 5e Weapons Catalog
 * Standard weapons with proper stats
 */

import type { WeaponItem } from '@/types/items'

export const WEAPONS: WeaponItem[] = [
  // Simple Melee
  {
    id: 'club',
    name: 'Club',
    category: 'weapon',
    description: 'A simple wooden club.',
    weight: 2,
    cost: { amount: 1, unit: 'sp' },
    damage_dice: '1d4',
    damage_type: 'bludgeoning',
    properties: ['light'],
    proficiency_category: 'simple',
  },
  {
    id: 'dagger',
    name: 'Dagger',
    category: 'weapon',
    description: 'A simple blade for close combat.',
    weight: 1,
    cost: { amount: 2, unit: 'gp' },
    damage_dice: '1d4',
    damage_type: 'piercing',
    properties: ['finesse', 'light', 'thrown'],
    range: { normal: 20, long: 60 },
    proficiency_category: 'simple',
  },
  {
    id: 'handaxe',
    name: 'Handaxe',
    category: 'weapon',
    description: 'A small axe for throwing or melee.',
    weight: 2,
    cost: { amount: 5, unit: 'gp' },
    damage_dice: '1d6',
    damage_type: 'slashing',
    properties: ['light', 'thrown'],
    range: { normal: 20, long: 60 },
    proficiency_category: 'simple',
  },
  {
    id: 'mace',
    name: 'Mace',
    category: 'weapon',
    description: 'A heavy club with a metal head.',
    weight: 4,
    cost: { amount: 5, unit: 'gp' },
    damage_dice: '1d6',
    damage_type: 'bludgeoning',
    properties: [],
    proficiency_category: 'simple',
  },
  {
    id: 'quarterstaff',
    name: 'Quarterstaff',
    category: 'weapon',
    description: 'A simple wooden staff.',
    weight: 4,
    cost: { amount: 2, unit: 'sp' },
    damage_dice: '1d6',
    damage_type: 'bludgeoning',
    properties: ['versatile'],
    versatile_damage: '1d8',
    proficiency_category: 'simple',
  },

  // Martial Melee
  {
    id: 'shortsword',
    name: 'Shortsword',
    category: 'weapon',
    description: 'A light, agile blade.',
    weight: 2,
    cost: { amount: 10, unit: 'gp' },
    damage_dice: '1d6',
    damage_type: 'piercing',
    properties: ['finesse', 'light'],
    proficiency_category: 'martial',
  },
  {
    id: 'longsword',
    name: 'Longsword',
    category: 'weapon',
    description: 'A versatile blade for one or two hands.',
    weight: 3,
    cost: { amount: 15, unit: 'gp' },
    damage_dice: '1d8',
    damage_type: 'slashing',
    properties: ['versatile'],
    versatile_damage: '1d10',
    proficiency_category: 'martial',
  },
  {
    id: 'greatsword',
    name: 'Greatsword',
    category: 'weapon',
    description: 'A massive two-handed sword.',
    weight: 6,
    cost: { amount: 50, unit: 'gp' },
    damage_dice: '2d6',
    damage_type: 'slashing',
    properties: ['heavy', 'two-handed'],
    proficiency_category: 'martial',
  },
  {
    id: 'battleaxe',
    name: 'Battleaxe',
    category: 'weapon',
    description: 'A heavy axe for battle.',
    weight: 4,
    cost: { amount: 10, unit: 'gp' },
    damage_dice: '1d8',
    damage_type: 'slashing',
    properties: ['versatile'],
    versatile_damage: '1d10',
    proficiency_category: 'martial',
  },
  {
    id: 'greataxe',
    name: 'Greataxe',
    category: 'weapon',
    description: 'A massive two-handed axe.',
    weight: 7,
    cost: { amount: 30, unit: 'gp' },
    damage_dice: '1d12',
    damage_type: 'slashing',
    properties: ['heavy', 'two-handed'],
    proficiency_category: 'martial',
  },

  // Simple Ranged
  {
    id: 'shortbow',
    name: 'Shortbow',
    category: 'weapon',
    description: 'A simple bow for ranged attacks.',
    weight: 2,
    cost: { amount: 25, unit: 'gp' },
    damage_dice: '1d6',
    damage_type: 'piercing',
    properties: ['ammunition', 'two-handed'],
    range: { normal: 80, long: 320 },
    proficiency_category: 'simple',
  },
  {
    id: 'light-crossbow',
    name: 'Light Crossbow',
    category: 'weapon',
    description: 'A mechanical bow with loading mechanism.',
    weight: 5,
    cost: { amount: 25, unit: 'gp' },
    damage_dice: '1d8',
    damage_type: 'piercing',
    properties: ['ammunition', 'loading', 'two-handed'],
    range: { normal: 80, long: 320 },
    proficiency_category: 'simple',
  },

  // Martial Ranged
  {
    id: 'longbow',
    name: 'Longbow',
    category: 'weapon',
    description: 'A tall bow for long-range attacks.',
    weight: 2,
    cost: { amount: 50, unit: 'gp' },
    damage_dice: '1d8',
    damage_type: 'piercing',
    properties: ['ammunition', 'heavy', 'two-handed'],
    range: { normal: 150, long: 600 },
    proficiency_category: 'martial',
  },
]

export function getWeaponById(id: string): WeaponItem | undefined {
  return WEAPONS.find(w => w.id === id)
}

export function getWeaponsByProficiency(category: 'simple' | 'martial'): WeaponItem[] {
  return WEAPONS.filter(w => w.proficiency_category === category)
}
