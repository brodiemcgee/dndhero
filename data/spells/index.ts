/**
 * D&D 5e Spell Database
 * Complete PHB spell collection with utility functions
 */

import type { Spell, DndClass, SpellSchool, SpellLevel } from '@/types/spells'

// Import spell level files
import { CANTRIPS } from './cantrips'
import { LEVEL_1_SPELLS } from './level-1'
import { LEVEL_2_SPELLS } from './level-2'
import { LEVEL_3_SPELLS } from './level-3'
import { LEVEL_4_SPELLS } from './level-4'
import { LEVEL_5_SPELLS } from './level-5'
import { LEVEL_6_SPELLS } from './level-6'
import { LEVEL_7_SPELLS } from './level-7'
import { LEVEL_8_SPELLS } from './level-8'
import { LEVEL_9_SPELLS } from './level-9'

// Import class spell lists
import { CLASS_SPELL_LISTS, NON_CASTER_CLASSES } from './class-lists'

// Export class lists
export { CLASS_SPELL_LISTS, NON_CASTER_CLASSES }
export * from './class-lists'

// Combined master spell list
export const SPELLS: Spell[] = [
  ...CANTRIPS,
  ...LEVEL_1_SPELLS,
  ...LEVEL_2_SPELLS,
  ...LEVEL_3_SPELLS,
  ...LEVEL_4_SPELLS,
  ...LEVEL_5_SPELLS,
  ...LEVEL_6_SPELLS,
  ...LEVEL_7_SPELLS,
  ...LEVEL_8_SPELLS,
  ...LEVEL_9_SPELLS,
]

// Export individual spell level arrays
export {
  CANTRIPS,
  LEVEL_1_SPELLS,
  LEVEL_2_SPELLS,
  LEVEL_3_SPELLS,
  LEVEL_4_SPELLS,
  LEVEL_5_SPELLS,
  LEVEL_6_SPELLS,
  LEVEL_7_SPELLS,
  LEVEL_8_SPELLS,
  LEVEL_9_SPELLS,
}

// Spell lookup map for fast access
const spellMap = new Map<string, Spell>()
SPELLS.forEach(spell => spellMap.set(spell.id, spell))

/**
 * Get a spell by its ID
 */
export function getSpellById(id: string): Spell | undefined {
  return spellMap.get(id)
}

/**
 * Get multiple spells by their IDs
 */
export function getSpellsByIds(ids: string[]): Spell[] {
  return ids.map(id => spellMap.get(id)).filter((spell): spell is Spell => spell !== undefined)
}

/**
 * Get all spells for a specific class
 */
export function getSpellsByClass(className: DndClass): Spell[] {
  return SPELLS.filter(spell => spell.classes.includes(className))
}

/**
 * Get all spells of a specific level
 */
export function getSpellsByLevel(level: SpellLevel): Spell[] {
  return SPELLS.filter(spell => spell.level === level)
}

/**
 * Get all spells of a specific school
 */
export function getSpellsBySchool(school: SpellSchool): Spell[] {
  return SPELLS.filter(spell => spell.school === school)
}

/**
 * Get spells available to a class at a specific spell level
 */
export function getSpellsForClass(className: string, level: SpellLevel): Spell[] {
  const classList = CLASS_SPELL_LISTS[className]
  if (!classList) return []

  const spellIds = level === 0 ? classList.cantrips : classList[level]
  if (!spellIds) return []

  return spellIds
    .map(id => spellMap.get(id))
    .filter((spell): spell is Spell => spell !== undefined)
}

/**
 * Get all cantrips available to a class
 */
export function getCantripsForClass(className: string): Spell[] {
  return getSpellsForClass(className, 0)
}

/**
 * Get all spells (not cantrips) available to a class up to a max level
 */
export function getSpellsByClassAndLevel(className: string, maxLevel: number): Spell[] {
  const classList = CLASS_SPELL_LISTS[className]
  if (!classList) return []

  const spells: Spell[] = []
  for (let level = 1; level <= Math.min(maxLevel, 9); level++) {
    const spellIds = classList[level] || []
    spellIds.forEach(id => {
      const spell = spellMap.get(id)
      if (spell) spells.push(spell)
    })
  }

  return spells
}

/**
 * Search spells by name, description, or other criteria
 */
export function searchSpells(
  query: string,
  filters?: {
    classes?: DndClass[]
    levels?: SpellLevel[]
    schools?: SpellSchool[]
    concentration?: boolean
    ritual?: boolean
  }
): Spell[] {
  const normalizedQuery = query.toLowerCase().trim()

  return SPELLS.filter(spell => {
    // Search by name or description
    const matchesQuery = !normalizedQuery ||
      spell.name.toLowerCase().includes(normalizedQuery) ||
      spell.description.toLowerCase().includes(normalizedQuery)

    if (!matchesQuery) return false

    // Apply filters
    if (filters) {
      if (filters.classes?.length && !filters.classes.some(c => spell.classes.includes(c))) {
        return false
      }
      if (filters.levels?.length && !filters.levels.includes(spell.level)) {
        return false
      }
      if (filters.schools?.length && !filters.schools.includes(spell.school)) {
        return false
      }
      if (filters.concentration !== undefined && spell.concentration !== filters.concentration) {
        return false
      }
      if (filters.ritual !== undefined && spell.ritual !== filters.ritual) {
        return false
      }
    }

    return true
  })
}

/**
 * Validate a spell selection for a character
 * Returns an object with validation status and any errors
 */
export function validateSpellSelection(
  className: string,
  characterLevel: number,
  highestSpellLevel: number,
  selectedCantrips: string[],
  selectedSpells: string[],
  maxCantrips: number,
  maxSpells: number | null // null for prepared casters (validated elsewhere)
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check if class can cast spells
  if (NON_CASTER_CLASSES.includes(className)) {
    if (selectedCantrips.length > 0 || selectedSpells.length > 0) {
      errors.push(`${className} cannot cast spells`)
    }
    return { valid: errors.length === 0, errors }
  }

  const classList = CLASS_SPELL_LISTS[className]
  if (!classList) {
    errors.push(`Unknown class: ${className}`)
    return { valid: false, errors }
  }

  // Validate cantrip count
  if (selectedCantrips.length > maxCantrips) {
    errors.push(`Too many cantrips selected: ${selectedCantrips.length}/${maxCantrips}`)
  }

  // Validate spell count (for known casters)
  if (maxSpells !== null && selectedSpells.length > maxSpells) {
    errors.push(`Too many spells selected: ${selectedSpells.length}/${maxSpells}`)
  }

  // Validate each cantrip
  const validCantrips = classList.cantrips || []
  for (const cantripId of selectedCantrips) {
    if (!validCantrips.includes(cantripId)) {
      const spell = spellMap.get(cantripId)
      const name = spell?.name || cantripId
      errors.push(`${name} is not available to ${className}`)
    }
  }

  // Validate each spell
  for (const spellId of selectedSpells) {
    const spell = spellMap.get(spellId)
    if (!spell) {
      errors.push(`Unknown spell: ${spellId}`)
      continue
    }

    // Check spell level
    if (spell.level > highestSpellLevel) {
      errors.push(`${spell.name} (level ${spell.level}) is too high for a level ${characterLevel} ${className}`)
      continue
    }

    // Check class access
    const validSpellIds = classList[spell.level as 1|2|3|4|5|6|7|8|9] || []
    if (!validSpellIds.includes(spellId)) {
      errors.push(`${spell.name} is not available to ${className}`)
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Get a random selection of spells for a class
 * Useful for NPC generation or retroactively adding spells to characters
 */
export function getRandomSpells(
  className: string,
  highestSpellLevel: number,
  cantripCount: number,
  spellCount: number
): { cantrips: string[]; spells: string[] } {
  const classList = CLASS_SPELL_LISTS[className]
  if (!classList) {
    return { cantrips: [], spells: [] }
  }

  // Get random cantrips
  const availableCantrips = [...(classList.cantrips || [])]
  const cantrips: string[] = []
  for (let i = 0; i < Math.min(cantripCount, availableCantrips.length); i++) {
    const index = Math.floor(Math.random() * availableCantrips.length)
    cantrips.push(availableCantrips.splice(index, 1)[0])
  }

  // Get random spells (prioritize lower levels for variety)
  const availableSpells: string[] = []
  for (let level = 1; level <= Math.min(highestSpellLevel, 9); level++) {
    const spellIds = classList[level] || []
    availableSpells.push(...spellIds)
  }

  const spells: string[] = []
  for (let i = 0; i < Math.min(spellCount, availableSpells.length); i++) {
    const index = Math.floor(Math.random() * availableSpells.length)
    spells.push(availableSpells.splice(index, 1)[0])
  }

  return { cantrips, spells }
}

/**
 * Check if a class is a spellcaster
 */
export function isSpellcaster(className: string): boolean {
  return !NON_CASTER_CLASSES.includes(className) && CLASS_SPELL_LISTS[className] !== undefined
}

/**
 * Get spell statistics
 */
export function getSpellStats() {
  return {
    totalSpells: SPELLS.length,
    cantrips: CANTRIPS.length,
    level1: LEVEL_1_SPELLS.length,
    level2: LEVEL_2_SPELLS.length,
    level3: LEVEL_3_SPELLS.length,
    level4: LEVEL_4_SPELLS.length,
    level5: LEVEL_5_SPELLS.length,
    level6: LEVEL_6_SPELLS.length,
    level7: LEVEL_7_SPELLS.length,
    level8: LEVEL_8_SPELLS.length,
    level9: LEVEL_9_SPELLS.length,
  }
}
