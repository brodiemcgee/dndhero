/**
 * D&D 5e Character Option Type Definitions
 * Used for character creation - races, classes, and backgrounds
 */

// =============================================================================
// COMMON TYPES
// =============================================================================

export type AbilityName = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma'

export type Size = 'Small' | 'Medium' | 'Large'

export type DamageType =
  | 'acid' | 'bludgeoning' | 'cold' | 'fire' | 'force' | 'lightning'
  | 'necrotic' | 'piercing' | 'poison' | 'psychic' | 'radiant' | 'slashing' | 'thunder'

export type HitDie = 'd6' | 'd8' | 'd10' | 'd12'

export type SpellcastingType = 'full' | 'half' | 'third' | 'pact' | 'none'

export interface AbilityBonus {
  ability: AbilityName
  bonus: number
}

// =============================================================================
// RACES
// =============================================================================

export interface RacialTrait {
  id: string
  name: string
  description: string
  // Mechanical effects (optional - for automation)
  darkvision?: number
  resistances?: DamageType[]
  immunities?: string[]
  proficiencies?: {
    skills?: string[]
    weapons?: string[]
    armor?: string[]
    tools?: string[]
    languages?: string[]
  }
  speedBonus?: number
  cantrip?: string
  advantageOn?: string[]
}

export interface Subrace {
  id: string
  name: string
  description: string
  abilityBonuses: AbilityBonus[]
  traits: RacialTrait[]
}

export interface Race {
  id: string
  name: string
  description: string
  abilityBonuses: AbilityBonus[]
  size: Size
  speed: number
  languages: string[]
  traits: RacialTrait[]
  subraces?: Subrace[]
  source: 'SRD' | 'PHB' | 'custom'
}

// =============================================================================
// CLASSES
// =============================================================================

export interface ClassFeature {
  id: string
  name: string
  description: string
  level: number
  choices?: {
    count: number
    options: string[]
  }
}

export interface ClassSpellcasting {
  ability: AbilityName
  type: SpellcastingType
  ritualCasting: boolean
  cantripsKnown?: Record<number, number>
  spellsKnown?: Record<number, number>
}

export interface DndClass {
  id: string
  name: string
  description: string
  hitDie: HitDie
  primaryAbilities: AbilityName[]
  savingThrows: AbilityName[]
  armorProficiencies: string[]
  weaponProficiencies: string[]
  toolProficiencies?: string[]
  skillOptions: {
    count: number
    options: string[]
  }
  spellcasting?: ClassSpellcasting
  features: ClassFeature[]
  subclassLevel: number
  subclassName: string
  source: 'SRD' | 'PHB' | 'custom'
}

// =============================================================================
// BACKGROUNDS
// =============================================================================

export interface BackgroundFeature {
  name: string
  description: string
}

export interface SuggestedCharacteristics {
  personalityTraits: string[]
  ideals: string[]
  bonds: string[]
  flaws: string[]
}

export interface Background {
  id: string
  name: string
  description: string
  skillProficiencies: string[]
  toolProficiencies?: string[]
  languages?: number
  feature: BackgroundFeature
  suggestedCharacteristics: SuggestedCharacteristics
  source: 'SRD' | 'PHB' | 'custom'
}

// =============================================================================
// IMAGE TYPES
// =============================================================================

export type CharacterOptionType = 'race' | 'class' | 'background'

export interface CharacterOptionImage {
  id: string
  optionType: CharacterOptionType
  optionId: string
  url: string
  variantTags: string[]
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export interface CharacterOptionWithImage<T> {
  option: T
  imageUrl?: string
}

// Calculated stats for preview
export interface CalculatedAbility {
  base: number
  racialBonus: number
  total: number
  modifier: number
}

export interface CalculatedStats {
  abilities: Record<AbilityName, CalculatedAbility>
  hp: number
  ac: number
  speed: number
  initiative: number
  proficiencyBonus: number
}
