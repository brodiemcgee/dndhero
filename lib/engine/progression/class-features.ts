/**
 * D&D 5e Class Features by Level
 * Defines features gained at each level for different classes
 */

export interface ClassFeature {
  name: string
  level: number
  description: string
  type: 'feature' | 'asi' | 'subclass_choice' | 'subclass_feature'
  isASI?: boolean
  subclassDependent?: boolean
}

// ASI levels vary by class
export const ASI_LEVELS: Record<string, number[]> = {
  Fighter: [4, 6, 8, 12, 14, 16, 19],
  Rogue: [4, 8, 10, 12, 16, 19],
  Wizard: [4, 8, 12, 16, 19],
  Cleric: [4, 8, 12, 16, 19],
  Druid: [4, 8, 12, 16, 19],
  Monk: [4, 8, 12, 16, 19],
  Paladin: [4, 8, 12, 16, 19],
  Ranger: [4, 8, 12, 16, 19],
  Sorcerer: [4, 8, 12, 16, 19],
  Warlock: [4, 8, 12, 16, 19],
  Barbarian: [4, 8, 12, 16, 19],
  Bard: [4, 8, 12, 16, 19],
}

// Subclass choice levels
export const SUBCLASS_LEVELS: Record<string, number> = {
  Fighter: 3,
  Wizard: 2,
  Rogue: 3,
  Cleric: 1,
  Druid: 2,
  Monk: 3,
  Paladin: 3,
  Ranger: 3,
  Sorcerer: 1,
  Warlock: 1,
  Barbarian: 3,
  Bard: 3,
}

// Fighter features
export const FIGHTER_FEATURES: ClassFeature[] = [
  { name: 'Fighting Style', level: 1, description: 'Choose a fighting style.', type: 'feature' },
  { name: 'Second Wind', level: 1, description: 'Regain 1d10 + fighter level HP as bonus action.', type: 'feature' },
  { name: 'Action Surge', level: 2, description: 'Take one additional action per turn.', type: 'feature' },
  { name: 'Martial Archetype', level: 3, description: 'Choose a martial archetype.', type: 'subclass_choice' },
  { name: 'Ability Score Improvement', level: 4, description: 'Increase ability scores.', type: 'asi', isASI: true },
  { name: 'Extra Attack', level: 5, description: 'Attack twice per Attack action.', type: 'feature' },
  { name: 'Ability Score Improvement', level: 6, description: 'Increase ability scores.', type: 'asi', isASI: true },
  { name: 'Martial Archetype Feature', level: 7, description: 'Archetype feature.', type: 'subclass_feature', subclassDependent: true },
  { name: 'Ability Score Improvement', level: 8, description: 'Increase ability scores.', type: 'asi', isASI: true },
  { name: 'Indomitable', level: 9, description: 'Reroll a failed saving throw.', type: 'feature' },
  { name: 'Martial Archetype Feature', level: 10, description: 'Archetype feature.', type: 'subclass_feature', subclassDependent: true },
  { name: 'Extra Attack (2)', level: 11, description: 'Attack three times per Attack action.', type: 'feature' },
  { name: 'Ability Score Improvement', level: 12, description: 'Increase ability scores.', type: 'asi', isASI: true },
  { name: 'Indomitable (2)', level: 13, description: 'Use Indomitable twice.', type: 'feature' },
  { name: 'Ability Score Improvement', level: 14, description: 'Increase ability scores.', type: 'asi', isASI: true },
  { name: 'Martial Archetype Feature', level: 15, description: 'Archetype feature.', type: 'subclass_feature', subclassDependent: true },
  { name: 'Ability Score Improvement', level: 16, description: 'Increase ability scores.', type: 'asi', isASI: true },
  { name: 'Action Surge (2)', level: 17, description: 'Use Action Surge twice.', type: 'feature' },
  { name: 'Martial Archetype Feature', level: 18, description: 'Archetype feature.', type: 'subclass_feature', subclassDependent: true },
  { name: 'Ability Score Improvement', level: 19, description: 'Increase ability scores.', type: 'asi', isASI: true },
  { name: 'Extra Attack (3)', level: 20, description: 'Attack four times per Attack action.', type: 'feature' },
]

// Wizard features
export const WIZARD_FEATURES: ClassFeature[] = [
  { name: 'Spellcasting', level: 1, description: 'Cast wizard spells.', type: 'feature' },
  { name: 'Arcane Recovery', level: 1, description: 'Recover spell slots on short rest.', type: 'feature' },
  { name: 'Arcane Tradition', level: 2, description: 'Choose arcane tradition.', type: 'subclass_choice' },
  { name: 'Ability Score Improvement', level: 4, description: 'Increase ability scores.', type: 'asi', isASI: true },
  { name: 'Arcane Tradition Feature', level: 6, description: 'Tradition feature.', type: 'subclass_feature', subclassDependent: true },
  { name: 'Ability Score Improvement', level: 8, description: 'Increase ability scores.', type: 'asi', isASI: true },
  { name: 'Arcane Tradition Feature', level: 10, description: 'Tradition feature.', type: 'subclass_feature', subclassDependent: true },
  { name: 'Ability Score Improvement', level: 12, description: 'Increase ability scores.', type: 'asi', isASI: true },
  { name: 'Arcane Tradition Feature', level: 14, description: 'Tradition feature.', type: 'subclass_feature', subclassDependent: true },
  { name: 'Ability Score Improvement', level: 16, description: 'Increase ability scores.', type: 'asi', isASI: true },
  { name: 'Spell Mastery', level: 18, description: 'Cast 1st and 2nd level spells at will.', type: 'feature' },
  { name: 'Ability Score Improvement', level: 19, description: 'Increase ability scores.', type: 'asi', isASI: true },
  { name: 'Signature Spells', level: 20, description: 'Always have two 3rd level spells prepared.', type: 'feature' },
]

// Rogue features
export const ROGUE_FEATURES: ClassFeature[] = [
  { name: 'Expertise', level: 1, description: 'Double proficiency for two skills.', type: 'feature' },
  { name: 'Sneak Attack', level: 1, description: 'Deal extra damage (1d6).', type: 'feature' },
  { name: "Thieves' Cant", level: 1, description: 'Secret rogue language.', type: 'feature' },
  { name: 'Cunning Action', level: 2, description: 'Dash, Disengage, or Hide as bonus action.', type: 'feature' },
  { name: 'Roguish Archetype', level: 3, description: 'Choose archetype.', type: 'subclass_choice' },
  { name: 'Ability Score Improvement', level: 4, description: 'Increase ability scores.', type: 'asi', isASI: true },
  { name: 'Uncanny Dodge', level: 5, description: 'Halve damage from seen attack.', type: 'feature' },
  { name: 'Expertise (2)', level: 6, description: 'Double proficiency for two more skills.', type: 'feature' },
  { name: 'Evasion', level: 7, description: 'No damage on DEX save success.', type: 'feature' },
  { name: 'Ability Score Improvement', level: 8, description: 'Increase ability scores.', type: 'asi', isASI: true },
  { name: 'Roguish Archetype Feature', level: 9, description: 'Archetype feature.', type: 'subclass_feature', subclassDependent: true },
  { name: 'Ability Score Improvement', level: 10, description: 'Increase ability scores.', type: 'asi', isASI: true },
  { name: 'Reliable Talent', level: 11, description: 'Minimum 10 on proficient ability checks.', type: 'feature' },
  { name: 'Ability Score Improvement', level: 12, description: 'Increase ability scores.', type: 'asi', isASI: true },
  { name: 'Roguish Archetype Feature', level: 13, description: 'Archetype feature.', type: 'subclass_feature', subclassDependent: true },
  { name: 'Blindsense', level: 14, description: 'Detect hidden creatures within 10 feet.', type: 'feature' },
  { name: 'Slippery Mind', level: 15, description: 'Wisdom saving throw proficiency.', type: 'feature' },
  { name: 'Ability Score Improvement', level: 16, description: 'Increase ability scores.', type: 'asi', isASI: true },
  { name: 'Roguish Archetype Feature', level: 17, description: 'Archetype feature.', type: 'subclass_feature', subclassDependent: true },
  { name: 'Elusive', level: 18, description: 'No attack has advantage against you.', type: 'feature' },
  { name: 'Ability Score Improvement', level: 19, description: 'Increase ability scores.', type: 'asi', isASI: true },
  { name: 'Stroke of Luck', level: 20, description: 'Turn miss into hit or treat ability check as 20.', type: 'feature' },
]

// Map class names to their features
export const CLASS_FEATURES: Record<string, ClassFeature[]> = {
  Fighter: FIGHTER_FEATURES,
  Wizard: WIZARD_FEATURES,
  Rogue: ROGUE_FEATURES,
}

/**
 * Get features gained at a specific level for a class
 */
export function getFeaturesAtLevel(className: string, level: number): ClassFeature[] {
  const features = CLASS_FEATURES[className] || []
  return features.filter((f) => f.level === level)
}

/**
 * Get all features up to a specific level
 */
export function getFeaturesUpToLevel(className: string, level: number): ClassFeature[] {
  const features = CLASS_FEATURES[className] || []
  return features.filter((f) => f.level <= level)
}

/**
 * Check if a level grants an ASI for a class
 */
export function isASILevel(className: string, level: number): boolean {
  const asiLevels = ASI_LEVELS[className] || ASI_LEVELS.Wizard
  return asiLevels.includes(level)
}

/**
 * Get the level at which a class chooses a subclass
 */
export function getSubclassLevel(className: string): number {
  return SUBCLASS_LEVELS[className] || 3
}
