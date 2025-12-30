import type { DndClass } from '@/types/character-options'
import { BARBARIAN } from './barbarian'
import { BARD } from './bard'
import { CLERIC } from './cleric'
import { DRUID } from './druid'
import { FIGHTER } from './fighter'
import { MONK } from './monk'
import { PALADIN } from './paladin'
import { RANGER } from './ranger'
import { ROGUE } from './rogue'
import { SORCERER } from './sorcerer'
import { WARLOCK } from './warlock'
import { WIZARD } from './wizard'

export const ALL_CLASSES: DndClass[] = [
  BARBARIAN,
  BARD,
  CLERIC,
  DRUID,
  FIGHTER,
  MONK,
  PALADIN,
  RANGER,
  ROGUE,
  SORCERER,
  WARLOCK,
  WIZARD,
]

export const CLASSES_BY_ID: Record<string, DndClass> = Object.fromEntries(
  ALL_CLASSES.map(cls => [cls.id, cls])
)

export function getClassById(id: string): DndClass | undefined {
  return CLASSES_BY_ID[id]
}

export function getClassByName(name: string): DndClass | undefined {
  return ALL_CLASSES.find(cls => cls.name.toLowerCase() === name.toLowerCase())
}

// Helper to get hit die value as number
export function getHitDieValue(hitDie: DndClass['hitDie']): number {
  return parseInt(hitDie.replace('d', ''), 10)
}

// Helper to check if class is a spellcaster
export function isSpellcaster(cls: DndClass): boolean {
  return cls.spellcasting !== undefined && cls.spellcasting.type !== 'none'
}

// Helper to get features at a specific level
export function getFeaturesAtLevel(cls: DndClass, level: number): DndClass['features'] {
  return cls.features.filter(f => f.level <= level)
}

// Re-export individual classes
export {
  BARBARIAN,
  BARD,
  CLERIC,
  DRUID,
  FIGHTER,
  MONK,
  PALADIN,
  RANGER,
  ROGUE,
  SORCERER,
  WARLOCK,
  WIZARD,
}
