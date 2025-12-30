/**
 * Character Import Schema
 * Validates and transforms imported character data
 */

import { z } from 'zod'
import { ExportedCharacterSchema, EXPORT_VERSION } from './export-schema'
import { getAbilityModifier, getSkillBonus } from '@/lib/engine/core/abilities'

// Minimum required fields for import
export const MinimalImportSchema = z.object({
  name: z.string().min(2).max(50),
  race: z.string().min(2),
  class: z.string().min(2),
  level: z.number().int().min(1).max(20),
  strength: z.number().int().min(1).max(30),
  dexterity: z.number().int().min(1).max(30),
  constitution: z.number().int().min(1).max(30),
  intelligence: z.number().int().min(1).max(30),
  wisdom: z.number().int().min(1).max(30),
  charisma: z.number().int().min(1).max(30),
})

// Full import schema (extends exported schema but makes metadata optional)
export const ImportCharacterSchema = ExportedCharacterSchema.omit({
  _export_version: true,
  _exported_at: true,
  _app_name: true,
}).extend({
  _export_version: z.string().optional(),
  _exported_at: z.string().optional(),
  _app_name: z.string().optional(),
})

export type ImportCharacter = z.infer<typeof ImportCharacterSchema>

/**
 * Import validation result
 */
export interface ImportValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  character?: ImportCharacter
}

/**
 * Validate imported character data
 */
export function validateImportData(data: unknown): ImportValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check if data is an object
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: ['Import data must be a JSON object'],
      warnings: [],
    }
  }

  const importData = data as Record<string, unknown>

  // Check minimum required fields first
  const minValidation = MinimalImportSchema.safeParse(importData)
  if (!minValidation.success) {
    return {
      valid: false,
      errors: minValidation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      warnings: [],
    }
  }

  // Check version compatibility
  if (importData._export_version) {
    const [major] = (importData._export_version as string).split('.')
    const [currentMajor] = EXPORT_VERSION.split('.')
    if (major !== currentMajor) {
      warnings.push(`Import version ${importData._export_version} may not be fully compatible with current version ${EXPORT_VERSION}`)
    }
  } else {
    warnings.push('No export version found - data may be from a different source')
  }

  // Check app source
  if (importData._app_name && importData._app_name !== 'dndhero') {
    warnings.push(`Character was exported from ${importData._app_name} - some features may not transfer`)
  }

  // Full validation
  const fullValidation = ImportCharacterSchema.safeParse(importData)
  if (!fullValidation.success) {
    // Add non-critical errors as warnings
    for (const error of fullValidation.error.errors) {
      warnings.push(`${error.path.join('.')}: ${error.message}`)
    }
  }

  // Validate ability scores are reasonable
  const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
  for (const ability of abilities) {
    const value = importData[ability] as number
    if (value && (value < 3 || value > 20)) {
      warnings.push(`${ability} value of ${value} is unusual (standard range is 3-20)`)
    }
  }

  // Validate level vs XP if both present
  if (importData.level && importData.xp !== undefined) {
    const level = importData.level as number
    const xp = importData.xp as number
    const expectedMinXP = getMinXPForLevel(level)
    if (xp < expectedMinXP) {
      warnings.push(`XP (${xp}) seems low for level ${level} (expected at least ${expectedMinXP})`)
    }
  }

  return {
    valid: true,
    errors,
    warnings,
    character: fullValidation.success ? fullValidation.data : minValidation.data as ImportCharacter,
  }
}

/**
 * Transform imported data into a new character record
 */
export function transformImportToCharacter(
  importData: ImportCharacter,
  userId: string,
  campaignId?: string
): Record<string, unknown> {
  // Calculate derived fields
  const wisdomMod = getAbilityModifier(importData.wisdom)
  const isPerceptionProficient = importData.skill_proficiencies?.includes('Perception') ?? false
  const perceptionBonus = getSkillBonus(importData.wisdom, isPerceptionProficient, importData.level)
  const passivePerception = 10 + perceptionBonus

  // Build the character record
  const character: Record<string, unknown> = {
    // Required fields
    user_id: userId,
    campaign_id: campaignId || null,

    // Core character data
    name: importData.name,
    race: importData.race,
    class: importData.class,
    level: importData.level,
    background: importData.background || null,
    alignment: importData.alignment || null,

    // Ability scores
    strength: importData.strength,
    dexterity: importData.dexterity,
    constitution: importData.constitution,
    intelligence: importData.intelligence,
    wisdom: importData.wisdom,
    charisma: importData.charisma,

    // Combat stats
    max_hp: importData.max_hp || calculateDefaultHP(importData),
    current_hp: importData.current_hp || importData.max_hp || calculateDefaultHP(importData),
    temp_hp: importData.temp_hp || 0,
    armor_class: importData.armor_class || 10 + getAbilityModifier(importData.dexterity),
    speed: importData.speed || 30,
    initiative_bonus: importData.initiative_bonus ?? getAbilityModifier(importData.dexterity),
    proficiency_bonus: importData.proficiency_bonus || Math.floor((importData.level - 1) / 4) + 2,

    // Experience
    xp: importData.xp || 0,

    // Calculated field
    passive_perception: passivePerception,

    // Death saves
    death_save_successes: importData.death_save_successes || 0,
    death_save_failures: importData.death_save_failures || 0,
    inspiration: importData.inspiration || false,

    // Hit dice
    hit_dice_total: importData.hit_dice_total || importData.level,
    hit_dice_used: importData.hit_dice_used || 0,

    // Proficiencies
    skill_proficiencies: importData.skill_proficiencies || [],
    saving_throw_proficiencies: importData.saving_throw_proficiencies || [],
    tool_proficiencies: importData.tool_proficiencies || [],
    weapon_proficiencies: importData.weapon_proficiencies || [],
    armor_proficiencies: importData.armor_proficiencies || [],
    language_proficiencies: importData.language_proficiencies || [],

    // Features
    features: importData.features || [],
    traits: importData.traits || [],

    // Appearance
    gender: importData.gender || null,
    age: importData.age || null,
    height: importData.height || null,
    build: importData.build || null,
    skin_tone: importData.skin_tone || null,
    hair_color: importData.hair_color || null,
    hair_style: importData.hair_style || null,
    eye_color: importData.eye_color || null,
    distinguishing_features: importData.distinguishing_features || null,
    clothing_style: importData.clothing_style || null,

    // Personality
    personality_traits: importData.personality_traits || [],
    ideals: importData.ideals || [],
    bonds: importData.bonds || [],
    flaws: importData.flaws || [],

    // Backstory
    backstory: importData.backstory || null,
    allies_and_organizations: importData.allies_and_organizations || [],
    additional_features: importData.additional_features || null,

    // Equipment
    equipment: importData.equipment || {},
    inventory: importData.inventory || [],
    currency: importData.currency || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    attacks: importData.attacks || [],

    // Spellcasting
    spellcasting_ability: importData.spellcasting_ability || null,
    spell_save_dc: importData.spell_save_dc || null,
    spell_attack_bonus: importData.spell_attack_bonus || null,
    cantrips: importData.cantrips || [],
    known_spells: importData.known_spells || [],
    prepared_spells: importData.prepared_spells || [],
    spell_slots_used: importData.spell_slots_used || {},

    // Timestamps
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return character
}

/**
 * Calculate default HP based on class and constitution
 */
function calculateDefaultHP(data: ImportCharacter): number {
  const conMod = getAbilityModifier(data.constitution)

  // Hit dice by class
  const hitDice: Record<string, number> = {
    Barbarian: 12,
    Fighter: 10,
    Paladin: 10,
    Ranger: 10,
    Bard: 8,
    Cleric: 8,
    Druid: 8,
    Monk: 8,
    Rogue: 8,
    Warlock: 8,
    Sorcerer: 6,
    Wizard: 6,
  }

  const hitDie = hitDice[data.class] || 8

  // Level 1: max hit die + CON mod
  // Additional levels: average (rounded up) + CON mod per level
  const level1HP = hitDie + conMod
  const avgRoll = Math.ceil(hitDie / 2) + 1
  const additionalHP = (data.level - 1) * (avgRoll + conMod)

  return Math.max(1, level1HP + additionalHP)
}

/**
 * Get minimum XP for a given level
 */
function getMinXPForLevel(level: number): number {
  const xpThresholds: Record<number, number> = {
    1: 0, 2: 300, 3: 900, 4: 2700, 5: 6500,
    6: 14000, 7: 23000, 8: 34000, 9: 48000, 10: 64000,
    11: 85000, 12: 100000, 13: 120000, 14: 140000, 15: 165000,
    16: 195000, 17: 225000, 18: 265000, 19: 305000, 20: 355000,
  }
  return xpThresholds[level] || 0
}
