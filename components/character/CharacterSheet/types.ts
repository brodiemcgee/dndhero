/**
 * Character Sheet Types
 * Complete D&D 5E character data structures
 */

// Currency breakdown
export interface Currency {
  cp: number  // Copper pieces
  sp: number  // Silver pieces
  ep: number  // Electrum pieces
  gp: number  // Gold pieces
  pp: number  // Platinum pieces
}

// Attack entry for the attacks table
export interface Attack {
  name: string
  attack_bonus: number
  damage: string
  damage_type: string
}

// Ally/Organization entry
export interface Ally {
  name: string
  description?: string
  symbol_url?: string
}

// Treasure item (separate from equipment)
export interface TreasureItem {
  name: string
  description?: string
  value?: string
}

// Spell slot tracking
export interface SpellSlots {
  [level: number]: {
    max: number
    used: number
  }
}

// Hit dice by type
export interface HitDice {
  d6?: number
  d8?: number
  d10?: number
  d12?: number
}

// Full character data matching database schema
export interface Character {
  id: string
  campaign_id: string | null
  user_id: string

  // Basic Info
  name: string
  race: string
  class: string
  background: string | null
  alignment: string
  level: number
  experience: number

  // Ability Scores
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number

  // Combat Stats
  max_hp: number
  current_hp: number
  temp_hp: number
  armor_class: number
  speed: number
  initiative_bonus: number
  proficiency_bonus: number

  // Death Saves
  death_save_successes: number
  death_save_failures: number

  // Hit Dice
  hit_dice: HitDice
  hit_dice_remaining: number

  // Proficiencies
  skill_proficiencies: string[]
  saving_throw_proficiencies: string[]
  tool_proficiencies: string[]
  language_proficiencies: string[]
  armor_proficiencies: string[]
  weapon_proficiencies: string[]

  // Inspiration & Passive Perception
  inspiration: boolean
  passive_perception: number

  // Inventory & Equipment
  inventory: any[]
  equipment: Record<string, any>
  currency: Currency
  attacks: Attack[]
  treasure: TreasureItem[]
  gold: number // Legacy field

  // Spellcasting
  spellcasting_class: string | null
  spellcasting_ability: string | null
  spell_save_dc: number | null
  spell_attack_bonus: number | null
  cantrips: string[]
  known_spells: string[]
  prepared_spells: string[]
  spell_slots: SpellSlots
  spell_slots_used: Record<number, number>

  // Features & Traits
  features: any[]
  traits: any[]
  additional_features: string | null

  // Appearance
  portrait_url: string | null
  gender: string | null
  age: string | null
  height: string | null
  weight: string | null
  build: string | null
  skin_tone: string | null
  hair_color: string | null
  hair_style: string | null
  eye_color: string | null
  distinguishing_features: string | null
  clothing_style: string | null

  // Personality
  personality_traits: string[]
  ideals: string[]
  bonds: string[]
  flaws: string[]

  // Backstory & Allies
  backstory: string | null
  allies_and_organizations: Ally[]

  // Metadata
  created_at: string
  updated_at: string

  // Joined data
  campaign_name?: string | null
}

// D&D 5E Skills with their associated abilities
export const SKILLS = {
  'Acrobatics': 'dexterity',
  'Animal Handling': 'wisdom',
  'Arcana': 'intelligence',
  'Athletics': 'strength',
  'Deception': 'charisma',
  'History': 'intelligence',
  'Insight': 'wisdom',
  'Intimidation': 'charisma',
  'Investigation': 'intelligence',
  'Medicine': 'wisdom',
  'Nature': 'intelligence',
  'Perception': 'wisdom',
  'Performance': 'charisma',
  'Persuasion': 'charisma',
  'Religion': 'intelligence',
  'Sleight of Hand': 'dexterity',
  'Stealth': 'dexterity',
  'Survival': 'wisdom',
} as const

export type SkillName = keyof typeof SKILLS
export type AbilityName = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma'

// Saving throw names
export const SAVING_THROWS: AbilityName[] = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma'
]

// Ability abbreviations
export const ABILITY_ABBREV: Record<AbilityName, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}

// Hit dice by class
export const CLASS_HIT_DICE: Record<string, string> = {
  Barbarian: 'd12',
  Bard: 'd8',
  Cleric: 'd8',
  Druid: 'd8',
  Fighter: 'd10',
  Monk: 'd8',
  Paladin: 'd10',
  Ranger: 'd10',
  Rogue: 'd8',
  Sorcerer: 'd6',
  Warlock: 'd8',
  Wizard: 'd6',
}

// Race base speeds
export const RACE_SPEEDS: Record<string, number> = {
  Human: 30,
  Elf: 30,
  'High Elf': 30,
  'Wood Elf': 35,
  'Dark Elf': 30,
  Dwarf: 25,
  'Hill Dwarf': 25,
  'Mountain Dwarf': 25,
  Halfling: 25,
  Dragonborn: 30,
  Gnome: 25,
  'Half-Elf': 30,
  'Half-Orc': 30,
  Tiefling: 30,
}

// Utility functions
export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

export function getSkillModifier(
  character: Character,
  skill: SkillName
): number {
  const ability = SKILLS[skill] as AbilityName
  const abilityMod = getModifier(character[ability])
  const isProficient = character.skill_proficiencies?.includes(skill)
  return abilityMod + (isProficient ? character.proficiency_bonus : 0)
}

export function getSavingThrowModifier(
  character: Character,
  ability: AbilityName
): number {
  const abilityMod = getModifier(character[ability])
  const isProficient = character.saving_throw_proficiencies?.includes(ability)
  return abilityMod + (isProficient ? character.proficiency_bonus : 0)
}
