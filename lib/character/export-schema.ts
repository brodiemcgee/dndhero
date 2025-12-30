/**
 * Character Export Schema
 * Defines the structure for exported character data
 */

import { z } from 'zod'

// Version for schema migrations
export const EXPORT_VERSION = '1.0.0'

// Core character data that gets exported
export const ExportedCharacterSchema = z.object({
  // Export metadata
  _export_version: z.string(),
  _exported_at: z.string(),
  _app_name: z.literal('dndhero'),

  // Identity (some fields not exported for privacy)
  name: z.string(),
  race: z.string(),
  class: z.string(),
  level: z.number().int().min(1).max(20),
  background: z.string().nullable().optional(),
  alignment: z.string().nullable().optional(),

  // Ability scores
  strength: z.number().int().min(1).max(30),
  dexterity: z.number().int().min(1).max(30),
  constitution: z.number().int().min(1).max(30),
  intelligence: z.number().int().min(1).max(30),
  wisdom: z.number().int().min(1).max(30),
  charisma: z.number().int().min(1).max(30),

  // Combat stats
  max_hp: z.number().int().min(1),
  current_hp: z.number().int().min(0),
  temp_hp: z.number().int().min(0).default(0),
  armor_class: z.number().int().min(1),
  speed: z.number().int().min(0),
  initiative_bonus: z.number().int(),
  proficiency_bonus: z.number().int().min(2).max(6),

  // Experience
  xp: z.number().int().min(0),

  // Death saves
  death_save_successes: z.number().int().min(0).max(3).default(0),
  death_save_failures: z.number().int().min(0).max(3).default(0),
  inspiration: z.boolean().default(false),

  // Hit dice
  hit_dice_total: z.number().int().min(1),
  hit_dice_used: z.number().int().min(0).default(0),

  // Proficiencies
  skill_proficiencies: z.array(z.string()).default([]),
  saving_throw_proficiencies: z.array(z.string()).default([]),
  tool_proficiencies: z.array(z.string()).default([]),
  weapon_proficiencies: z.array(z.string()).default([]),
  armor_proficiencies: z.array(z.string()).default([]),
  language_proficiencies: z.array(z.string()).default([]),

  // Features and traits
  features: z.array(z.string()).default([]),
  traits: z.array(z.string()).default([]),

  // Appearance
  gender: z.string().nullable().optional(),
  age: z.string().nullable().optional(),
  height: z.string().nullable().optional(),
  build: z.string().nullable().optional(),
  skin_tone: z.string().nullable().optional(),
  hair_color: z.string().nullable().optional(),
  hair_style: z.string().nullable().optional(),
  eye_color: z.string().nullable().optional(),
  distinguishing_features: z.string().nullable().optional(),
  clothing_style: z.string().nullable().optional(),

  // Personality
  personality_traits: z.array(z.string()).default([]),
  ideals: z.array(z.string()).default([]),
  bonds: z.array(z.string()).default([]),
  flaws: z.array(z.string()).default([]),

  // Backstory
  backstory: z.string().nullable().optional(),
  allies_and_organizations: z.array(z.any()).default([]),
  additional_features: z.string().nullable().optional(),

  // Equipment
  equipment: z.record(z.any()).default({}),
  inventory: z.array(z.any()).default([]),
  currency: z.object({
    cp: z.number().default(0),
    sp: z.number().default(0),
    ep: z.number().default(0),
    gp: z.number().default(0),
    pp: z.number().default(0),
  }).default({ cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }),
  attacks: z.array(z.object({
    name: z.string(),
    attack_bonus: z.number(),
    damage: z.string(),
    damage_type: z.string(),
  })).default([]),

  // Spellcasting
  spellcasting_ability: z.string().nullable().optional(),
  spell_save_dc: z.number().int().nullable().optional(),
  spell_attack_bonus: z.number().int().nullable().optional(),
  cantrips: z.array(z.string()).default([]),
  known_spells: z.array(z.string()).default([]),
  prepared_spells: z.array(z.string()).default([]),
  spell_slots_used: z.record(z.number()).default({}),
})

export type ExportedCharacter = z.infer<typeof ExportedCharacterSchema>

/**
 * Fields that are excluded from export (sensitive/internal data)
 */
export const EXCLUDED_EXPORT_FIELDS = [
  'id',
  'user_id',
  'campaign_id',
  'created_at',
  'updated_at',
  'passive_perception', // Calculated field
]

/**
 * Prepare a character record for export
 */
export function prepareCharacterForExport(character: Record<string, unknown>): ExportedCharacter {
  // Remove excluded fields
  const exportData: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(character)) {
    if (!EXCLUDED_EXPORT_FIELDS.includes(key)) {
      exportData[key] = value
    }
  }

  // Add export metadata
  exportData._export_version = EXPORT_VERSION
  exportData._exported_at = new Date().toISOString()
  exportData._app_name = 'dndhero'

  return ExportedCharacterSchema.parse(exportData)
}

/**
 * Generate a filename for the export
 */
export function generateExportFilename(characterName: string): string {
  const sanitizedName = characterName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  const date = new Date().toISOString().split('T')[0]
  return `${sanitizedName}-${date}.json`
}
