import type { Subclass } from './types'
import { BARBARIAN_SUBCLASSES } from './barbarian'
import { BARD_SUBCLASSES } from './bard'
import { CLERIC_SUBCLASSES } from './cleric'
import { DRUID_SUBCLASSES } from './druid'
import { FIGHTER_SUBCLASSES } from './fighter'
import { MONK_SUBCLASSES } from './monk'
import { PALADIN_SUBCLASSES } from './paladin'
import { RANGER_SUBCLASSES } from './ranger'
import { ROGUE_SUBCLASSES } from './rogue'
import { SORCERER_SUBCLASSES } from './sorcerer'
import { WARLOCK_SUBCLASSES } from './warlock'
import { WIZARD_SUBCLASSES } from './wizard'

/**
 * Map of class name to array of subclasses for that class
 */
export const SUBCLASSES: Record<string, Subclass[]> = {
  Barbarian: BARBARIAN_SUBCLASSES,
  Bard: BARD_SUBCLASSES,
  Cleric: CLERIC_SUBCLASSES,
  Druid: DRUID_SUBCLASSES,
  Fighter: FIGHTER_SUBCLASSES,
  Monk: MONK_SUBCLASSES,
  Paladin: PALADIN_SUBCLASSES,
  Ranger: RANGER_SUBCLASSES,
  Rogue: ROGUE_SUBCLASSES,
  Sorcerer: SORCERER_SUBCLASSES,
  Warlock: WARLOCK_SUBCLASSES,
  Wizard: WIZARD_SUBCLASSES,
}

/**
 * Subclass selection levels for each class in D&D 5e
 * Most classes pick their subclass at level 3, but some pick earlier
 */
const SUBCLASS_LEVELS: Record<string, number> = {
  Barbarian: 3,  // Primal Path
  Bard: 3,       // Bard College
  Cleric: 1,     // Divine Domain
  Druid: 2,      // Druid Circle
  Fighter: 3,    // Martial Archetype
  Monk: 3,       // Monastic Tradition
  Paladin: 3,    // Sacred Oath
  Ranger: 3,     // Ranger Archetype
  Rogue: 3,      // Roguish Archetype
  Sorcerer: 1,   // Sorcerous Origin
  Warlock: 1,    // Otherworldly Patron
  Wizard: 2,     // Arcane Tradition
}

/**
 * Returns the level at which a class picks their subclass
 * @param className - The name of the class (e.g., "Fighter", "Cleric")
 * @returns The level at which the class picks their subclass, or 3 as default
 */
export function getSubclassLevel(className: string): number {
  return SUBCLASS_LEVELS[className] ?? 3
}

/**
 * Get all subclasses for a specific class
 * @param className - The name of the class
 * @returns Array of subclasses, or empty array if class not found
 */
export function getSubclassesForClass(className: string): Subclass[] {
  return SUBCLASSES[className] ?? []
}

/**
 * Get a specific subclass by its ID
 * @param subclassId - The ID of the subclass
 * @returns The subclass, or undefined if not found
 */
export function getSubclassById(subclassId: string): Subclass | undefined {
  for (const subclasses of Object.values(SUBCLASSES)) {
    const found = subclasses.find(s => s.id === subclassId)
    if (found) return found
  }
  return undefined
}

/**
 * Get all subclasses as a flat array
 */
export const ALL_SUBCLASSES: Subclass[] = Object.values(SUBCLASSES).flat()

// Re-export types
export type { Subclass, SubclassFeature } from './types'

// Re-export individual subclass arrays
export {
  BARBARIAN_SUBCLASSES,
  BARD_SUBCLASSES,
  CLERIC_SUBCLASSES,
  DRUID_SUBCLASSES,
  FIGHTER_SUBCLASSES,
  MONK_SUBCLASSES,
  PALADIN_SUBCLASSES,
  RANGER_SUBCLASSES,
  ROGUE_SUBCLASSES,
  SORCERER_SUBCLASSES,
  WARLOCK_SUBCLASSES,
  WIZARD_SUBCLASSES,
}
