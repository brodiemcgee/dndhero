/**
 * D&D 5e Spell Type Definitions
 * Comprehensive spell data structures for spell preparation and slot tracking
 */

export type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type SpellSchool =
  | 'abjuration'
  | 'conjuration'
  | 'divination'
  | 'enchantment'
  | 'evocation'
  | 'illusion'
  | 'necromancy'
  | 'transmutation'

export type SpellComponent = 'V' | 'S' | 'M'

export type DndClass =
  | 'Barbarian'
  | 'Bard'
  | 'Cleric'
  | 'Druid'
  | 'Fighter'
  | 'Monk'
  | 'Paladin'
  | 'Ranger'
  | 'Rogue'
  | 'Sorcerer'
  | 'Warlock'
  | 'Wizard'

export type SpellDamageType =
  | 'acid'
  | 'bludgeoning'
  | 'cold'
  | 'fire'
  | 'force'
  | 'lightning'
  | 'necrotic'
  | 'piercing'
  | 'poison'
  | 'psychic'
  | 'radiant'
  | 'slashing'
  | 'thunder'
  | 'varies' // For spells like Glyph of Warding

export type CastingTime =
  | '1 action'
  | '1 bonus action'
  | '1 reaction'
  | '1 minute'
  | '10 minutes'
  | '1 hour'
  | '8 hours'
  | '12 hours'
  | '24 hours'

export type SpellRange =
  | 'Self'
  | 'Touch'
  | 'Sight'
  | 'Unlimited'
  | { type: 'feet'; distance: number }
  | { type: 'miles'; distance: number }
  | { type: 'self' }
  | { type: 'touch' }
  | { type: 'sight' }
  | { type: 'unlimited' }
  | { type: 'special' }

export type SpellDuration =
  | 'Instantaneous'
  | 'Until dispelled'
  | 'Special'
  | string // Allow flexible string durations like "1 hour", "10 minutes", etc.
  | { type: 'rounds'; count: number; concentration?: boolean }
  | { type: 'minutes'; count: number; concentration?: boolean }
  | { type: 'hours'; count: number; concentration?: boolean }
  | { type: 'days'; count: number; concentration?: boolean }

export type SpellAbilityName =
  | 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'
  | 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma'

/**
 * Complete spell definition with all D&D 5e properties
 */
export interface Spell {
  id: string
  name: string
  level: SpellLevel
  school: SpellSchool
  castingTime: CastingTime
  range: SpellRange
  components: SpellComponent[]
  materialComponent?: string
  duration: SpellDuration
  concentration: boolean
  ritual: boolean
  description: string
  higherLevels?: string
  classes: DndClass[]
  damageType?: SpellDamageType
  damageDice?: string
  damagePerLevel?: number
  savingThrow?: SpellAbilityName
  attackRoll?: boolean
  healingDice?: string
  healingPerLevel?: number
}

/**
 * Spell slots available and used for a character
 */
export interface SpellSlots {
  [level: number]: {
    max: number
    used: number
  }
}

/**
 * Spell preparation tracking
 */
export interface PreparedSpells {
  preparedSpellIds: string[]
  maxPrepared: number
  knownSpellIds: string[]
}

/**
 * Spell known tracking
 */
export interface KnownSpells {
  knownSpellIds: string[]
  maxKnown: number
}

/**
 * Character's complete spellcasting state
 */
export interface CharacterSpellcasting {
  spellSlots: SpellSlots
  preparedSpells?: PreparedSpells
  knownSpells?: KnownSpells
  concentration?: {
    spellId: string
    spellName: string
    spellLevel: SpellLevel
    startedAt: string
    durationRemaining: number
  }
}
