/**
 * Structured Output Schemas
 * Zod schemas for validating AI DM responses
 */

import { z } from 'zod'

/**
 * Dice roll request schema
 */
export const DiceRollRequestSchema = z.object({
  character_id: z.string().uuid(),
  roll_type: z.enum([
    'ability_check',
    'saving_throw',
    'attack_roll',
    'damage_roll',
    'initiative',
    'skill_check',
    'death_save',
  ]),
  ability: z
    .enum(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'])
    .optional(),
  skill: z
    .enum([
      'acrobatics',
      'animal_handling',
      'arcana',
      'athletics',
      'deception',
      'history',
      'insight',
      'intimidation',
      'investigation',
      'medicine',
      'nature',
      'perception',
      'performance',
      'persuasion',
      'religion',
      'sleight_of_hand',
      'stealth',
      'survival',
    ])
    .optional(),
  notation: z.string(), // e.g., "1d20+5", "2d6"
  dc: z.number().int().min(1).max(30).optional(), // Difficulty Class
  advantage: z.boolean().default(false),
  disadvantage: z.boolean().default(false),
  description: z.string(),
  reason: z.string(), // Why this roll is needed
})

export type DiceRollRequest = z.infer<typeof DiceRollRequestSchema>

/**
 * Entity state update schema
 */
export const EntityStateUpdateSchema = z.object({
  entity_id: z.string().uuid(),
  hp_change: z.number().int().optional(), // Positive = healing, negative = damage
  current_hp: z.number().int().min(0).optional(), // Direct HP set
  temp_hp: z.number().int().min(0).optional(),
  conditions_add: z.array(z.string()).optional(), // Conditions to add
  conditions_remove: z.array(z.string()).optional(), // Conditions to remove
  concentration_broken: z.boolean().optional(),
  reason: z.string(), // Why this update is happening
})

export type EntityStateUpdate = z.infer<typeof EntityStateUpdateSchema>

/**
 * Event log entry schema
 */
export const EventLogEntrySchema = z.object({
  event_type: z.enum([
    'narrative',
    'combat',
    'dialogue',
    'skill_check',
    'spell_cast',
    'item_use',
    'rest',
    'level_up',
    'death',
  ]),
  narrative: z.string(),
  entity_ids: z.array(z.string().uuid()).optional(),
  metadata: z.record(z.any()).optional(),
})

export type EventLogEntry = z.infer<typeof EventLogEntrySchema>

/**
 * Complete turn resolution schema
 */
export const TurnResolutionSchema = z.object({
  narrative: z.string().min(10).max(5000), // Main narrative text
  entity_updates: z.array(EntityStateUpdateSchema).optional(),
  dice_requests: z.array(DiceRollRequestSchema).optional(),
  events: z.array(EventLogEntrySchema),
  scene_update: z
    .object({
      current_state: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
  next_turn_context: z.string().optional(), // Context for next turn
  turn_complete: z.boolean(),
})

export type TurnResolution = z.infer<typeof TurnResolutionSchema>

/**
 * Scene description schema
 */
export const SceneDescriptionSchema = z.object({
  description: z.string().min(50).max(2000),
  mood: z.enum(['tense', 'peaceful', 'mysterious', 'exciting', 'dark', 'hopeful', 'dangerous']),
  points_of_interest: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      interaction_hint: z.string().optional(),
    })
  ),
  npcs_present: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      disposition: z.enum(['friendly', 'neutral', 'hostile', 'unknown']),
    })
  ),
  environmental_effects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        mechanical_effect: z.string().optional(),
      })
    )
    .optional(),
})

export type SceneDescription = z.infer<typeof SceneDescriptionSchema>

/**
 * NPC dialogue schema
 */
export const NPCDialogueSchema = z.object({
  npc_name: z.string(),
  dialogue: z.string(),
  emotion: z.enum([
    'angry',
    'fearful',
    'friendly',
    'neutral',
    'suspicious',
    'excited',
    'sad',
    'amused',
  ]),
  body_language: z.string().optional(),
  voice_tone: z.string().optional(),
})

export type NPCDialogue = z.infer<typeof NPCDialogueSchema>

/**
 * Combat round schema
 */
export const CombatRoundSchema = z.object({
  round_number: z.number().int().min(1),
  narrative: z.string(),
  entity_updates: z.array(EntityStateUpdateSchema),
  events: z.array(EventLogEntrySchema),
  combat_complete: z.boolean(),
  victor: z.enum(['players', 'enemies', 'draw']).optional(),
})

export type CombatRound = z.infer<typeof CombatRoundSchema>

/**
 * Validate turn resolution
 */
export function validateTurnResolution(data: unknown): {
  success: boolean
  data?: TurnResolution
  errors?: string[]
} {
  try {
    const validated = TurnResolutionSchema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      }
    }
    return { success: false, errors: ['Unknown validation error'] }
  }
}

/**
 * Validate scene description
 */
export function validateSceneDescription(data: unknown): {
  success: boolean
  data?: SceneDescription
  errors?: string[]
} {
  try {
    const validated = SceneDescriptionSchema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      }
    }
    return { success: false, errors: ['Unknown validation error'] }
  }
}

/**
 * Get JSON schema string for prompting
 */
export function getTurnResolutionSchemaString(): string {
  return JSON.stringify(
    {
      type: 'object',
      required: ['narrative', 'events', 'turn_complete'],
      properties: {
        narrative: {
          type: 'string',
          description: 'Main narrative text describing what happens',
          minLength: 10,
          maxLength: 5000,
        },
        entity_updates: {
          type: 'array',
          description: 'Updates to entity HP, conditions, etc.',
          items: {
            type: 'object',
            required: ['entity_id', 'reason'],
            properties: {
              entity_id: { type: 'string', format: 'uuid' },
              hp_change: { type: 'integer', description: 'HP change (negative for damage)' },
              current_hp: { type: 'integer', minimum: 0 },
              temp_hp: { type: 'integer', minimum: 0 },
              conditions_add: { type: 'array', items: { type: 'string' } },
              conditions_remove: { type: 'array', items: { type: 'string' } },
              concentration_broken: { type: 'boolean' },
              reason: { type: 'string' },
            },
          },
        },
        dice_requests: {
          type: 'array',
          description: 'Dice rolls needed from players',
          items: {
            type: 'object',
            required: ['character_id', 'roll_type', 'notation', 'description', 'reason'],
            properties: {
              character_id: { type: 'string', format: 'uuid' },
              roll_type: {
                type: 'string',
                enum: [
                  'ability_check',
                  'saving_throw',
                  'attack_roll',
                  'damage_roll',
                  'initiative',
                  'skill_check',
                  'death_save',
                ],
              },
              ability: {
                type: 'string',
                enum: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'],
              },
              skill: { type: 'string' },
              notation: { type: 'string', description: 'Dice notation like "1d20+5"' },
              dc: { type: 'integer', minimum: 1, maximum: 30 },
              advantage: { type: 'boolean', default: false },
              disadvantage: { type: 'boolean', default: false },
              description: { type: 'string' },
              reason: { type: 'string' },
            },
          },
        },
        events: {
          type: 'array',
          description: 'Events to log in the event log',
          items: {
            type: 'object',
            required: ['event_type', 'narrative'],
            properties: {
              event_type: {
                type: 'string',
                enum: [
                  'narrative',
                  'combat',
                  'dialogue',
                  'skill_check',
                  'spell_cast',
                  'item_use',
                  'rest',
                  'level_up',
                  'death',
                ],
              },
              narrative: { type: 'string' },
              entity_ids: { type: 'array', items: { type: 'string', format: 'uuid' } },
              metadata: { type: 'object' },
            },
          },
        },
        scene_update: {
          type: 'object',
          description: 'Updates to the scene state',
          properties: {
            current_state: { type: 'string' },
            description: { type: 'string' },
          },
        },
        next_turn_context: {
          type: 'string',
          description: 'Context to carry over to next turn',
        },
        turn_complete: {
          type: 'boolean',
          description: 'Whether this turn is complete',
        },
      },
    },
    null,
    2
  )
}

/**
 * Get scene description schema string
 */
export function getSceneDescriptionSchemaString(): string {
  return JSON.stringify(
    {
      type: 'object',
      required: ['description', 'mood', 'points_of_interest', 'npcs_present'],
      properties: {
        description: { type: 'string', minLength: 50, maxLength: 2000 },
        mood: {
          type: 'string',
          enum: ['tense', 'peaceful', 'mysterious', 'exciting', 'dark', 'hopeful', 'dangerous'],
        },
        points_of_interest: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name', 'description'],
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              interaction_hint: { type: 'string' },
            },
          },
        },
        npcs_present: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name', 'description', 'disposition'],
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              disposition: {
                type: 'string',
                enum: ['friendly', 'neutral', 'hostile', 'unknown'],
              },
            },
          },
        },
        environmental_effects: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name', 'description'],
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              mechanical_effect: { type: 'string' },
            },
          },
        },
      },
    },
    null,
    2
  )
}
