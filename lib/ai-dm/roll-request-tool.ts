/**
 * Roll Request Tool for AI DM
 * Allows the AI DM to request dice rolls from players
 */

import { ChatCompletionTool } from 'openai/resources/chat/completions'

// D&D 5e skills mapped to their ability scores
export const SKILL_TO_ABILITY: Record<string, string> = {
  acrobatics: 'dexterity',
  animal_handling: 'wisdom',
  arcana: 'intelligence',
  athletics: 'strength',
  deception: 'charisma',
  history: 'intelligence',
  insight: 'wisdom',
  intimidation: 'charisma',
  investigation: 'intelligence',
  medicine: 'wisdom',
  nature: 'intelligence',
  perception: 'wisdom',
  performance: 'charisma',
  persuasion: 'charisma',
  religion: 'intelligence',
  sleight_of_hand: 'dexterity',
  stealth: 'dexterity',
  survival: 'wisdom',
}

export const SKILLS = Object.keys(SKILL_TO_ABILITY)

export const ABILITIES = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
]

/**
 * Roll request tool definition for AI DM
 */
export const ROLL_REQUEST_TOOL: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'request_dice_roll',
    description:
      'Request a dice roll from a player character. Creates a clickable roll button in the chat that the player must complete. Use this when a situation requires a roll (ability check, saving throw, attack, skill check).',
    parameters: {
      type: 'object',
      properties: {
        character_name: {
          type: 'string',
          description:
            'Name of the character who must roll. Use exact character name from the party, or "party" if all characters should roll.',
        },
        roll_type: {
          type: 'string',
          enum: [
            'ability_check',
            'saving_throw',
            'attack_roll',
            'skill_check',
            'initiative',
            'custom',
          ],
          description: 'The type of roll being requested',
        },
        ability: {
          type: 'string',
          enum: ABILITIES,
          description:
            'The ability score for the roll. Required for ability checks and saving throws.',
        },
        skill: {
          type: 'string',
          enum: SKILLS,
          description:
            'The skill for skill checks (e.g., perception, stealth, athletics). The ability modifier will be determined automatically.',
        },
        dc: {
          type: 'integer',
          minimum: 1,
          maximum: 30,
          description:
            'Difficulty Class for the roll. If provided, success/failure will be shown. Omit for rolls where DC should be hidden.',
        },
        notation: {
          type: 'string',
          description:
            'Custom dice notation (e.g., "2d6+3") for custom roll types. Ignored for standard ability/skill checks.',
        },
        advantage: {
          type: 'boolean',
          description: 'Whether the roll should be made with advantage',
        },
        disadvantage: {
          type: 'boolean',
          description: 'Whether the roll should be made with disadvantage',
        },
        reason: {
          type: 'string',
          description:
            'Brief explanation of why this roll is needed (e.g., "to detect the hidden trap", "to resist the spell", "to climb the cliff")',
        },
      },
      required: ['character_name', 'roll_type', 'reason'],
    },
  },
}

export const ROLL_REQUEST_TOOLS: ChatCompletionTool[] = [ROLL_REQUEST_TOOL]

export const ROLL_REQUEST_TOOL_NAMES = ROLL_REQUEST_TOOLS.map(
  (t) => t.function.name
)

/**
 * Type for roll request parameters from AI
 */
export interface RollRequestParams {
  character_name: string
  roll_type:
    | 'ability_check'
    | 'saving_throw'
    | 'attack_roll'
    | 'skill_check'
    | 'initiative'
    | 'custom'
  ability?: string
  skill?: string
  dc?: number
  notation?: string
  advantage?: boolean
  disadvantage?: boolean
  reason: string
}
