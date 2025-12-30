/**
 * Character State Management Tools for AI DM
 * Allows AI to modify character inventory, currency, HP, conditions, spell slots, and XP
 */

import { ChatCompletionTool } from 'openai/resources/chat/completions'

// D&D 5e Standard Conditions
const DND_CONDITIONS = [
  'blinded',
  'charmed',
  'deafened',
  'exhaustion',
  'frightened',
  'grappled',
  'incapacitated',
  'invisible',
  'paralyzed',
  'petrified',
  'poisoned',
  'prone',
  'restrained',
  'stunned',
  'unconscious',
] as const

// Damage types
const DAMAGE_TYPES = [
  'slashing',
  'piercing',
  'bludgeoning',
  'acid',
  'cold',
  'fire',
  'force',
  'lightning',
  'necrotic',
  'poison',
  'psychic',
  'radiant',
  'thunder',
  'healing',
] as const

// Equipment slots
const EQUIPMENT_SLOTS = [
  'mainHand',
  'offHand',
  'armor',
  'shield',
  'head',
  'neck',
  'ring1',
  'ring2',
  'cloak',
  'belt',
  'hands',
  'feet',
] as const

export const CHARACTER_STATE_TOOLS: ChatCompletionTool[] = [
  // ============ INVENTORY MANAGEMENT ============
  {
    type: 'function',
    function: {
      name: 'add_item_to_inventory',
      description: 'Add an item to a character\'s inventory. Use for loot, purchases, quest rewards, or found items.',
      parameters: {
        type: 'object',
        properties: {
          character_name: {
            type: 'string',
            description: 'Name of the character receiving the item',
          },
          item_name: {
            type: 'string',
            description: 'Name of the item (use standard D&D names when possible)',
          },
          item_id: {
            type: 'string',
            description: 'Item ID from the catalog if known (e.g., "longsword", "leather_armor")',
          },
          quantity: {
            type: 'integer',
            default: 1,
            description: 'Number of items to add',
          },
          custom_description: {
            type: 'string',
            description: 'Custom description for non-standard items',
          },
          reason: {
            type: 'string',
            description: 'Why the character is receiving this item (loot, reward, purchase, etc.)',
          },
        },
        required: ['character_name', 'item_name', 'reason'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'remove_item_from_inventory',
      description: 'Remove an item from inventory. Use when items are sold, broken, consumed, lost, or given away.',
      parameters: {
        type: 'object',
        properties: {
          character_name: {
            type: 'string',
            description: 'Name of the character losing the item',
          },
          item_name: {
            type: 'string',
            description: 'Name of the item to remove',
          },
          quantity: {
            type: 'integer',
            default: 1,
            description: 'Number of items to remove',
          },
          reason: {
            type: 'string',
            description: 'Why the item is being removed (sold, broken, consumed, etc.)',
          },
        },
        required: ['character_name', 'item_name', 'reason'],
      },
    },
  },

  // ============ CURRENCY MANAGEMENT ============
  {
    type: 'function',
    function: {
      name: 'modify_currency',
      description: 'Add or subtract currency from a character. Use for loot, payments, rewards, or expenses. Positive values add, negative values subtract.',
      parameters: {
        type: 'object',
        properties: {
          character_name: {
            type: 'string',
            description: 'Name of the character',
          },
          cp: {
            type: 'integer',
            description: 'Copper pieces to add (negative to subtract)',
          },
          sp: {
            type: 'integer',
            description: 'Silver pieces to add (negative to subtract)',
          },
          ep: {
            type: 'integer',
            description: 'Electrum pieces to add (negative to subtract)',
          },
          gp: {
            type: 'integer',
            description: 'Gold pieces to add (negative to subtract)',
          },
          pp: {
            type: 'integer',
            description: 'Platinum pieces to add (negative to subtract)',
          },
          reason: {
            type: 'string',
            description: 'Why currency is changing (loot, payment, reward, etc.)',
          },
        },
        required: ['character_name', 'reason'],
      },
    },
  },

  // ============ COMBAT & HEALTH ============
  {
    type: 'function',
    function: {
      name: 'modify_hp',
      description: 'Apply damage or healing to a character. Positive = healing, negative = damage. Damage is absorbed by temp HP first.',
      parameters: {
        type: 'object',
        properties: {
          character_name: {
            type: 'string',
            description: 'Name of the character',
          },
          hp_change: {
            type: 'integer',
            description: 'HP change amount (positive for healing, negative for damage)',
          },
          damage_type: {
            type: 'string',
            enum: DAMAGE_TYPES as unknown as string[],
            description: 'Type of damage or healing',
          },
          reason: {
            type: 'string',
            description: 'Source of damage/healing (attack, spell, trap, potion, etc.)',
          },
        },
        required: ['character_name', 'hp_change', 'reason'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_temp_hp',
      description: 'Set temporary hit points for a character. Temp HP does not stack - new value replaces existing.',
      parameters: {
        type: 'object',
        properties: {
          character_name: {
            type: 'string',
            description: 'Name of the character',
          },
          temp_hp: {
            type: 'integer',
            minimum: 0,
            description: 'Amount of temporary HP',
          },
          source: {
            type: 'string',
            description: 'Source of temp HP (spell name, ability, etc.)',
          },
        },
        required: ['character_name', 'temp_hp', 'source'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'modify_death_saves',
      description: 'Track death saving throw results for a downed character (0 HP).',
      parameters: {
        type: 'object',
        properties: {
          character_name: {
            type: 'string',
            description: 'Name of the character',
          },
          successes: {
            type: 'integer',
            minimum: 0,
            maximum: 3,
            description: 'Number of death save successes to set',
          },
          failures: {
            type: 'integer',
            minimum: 0,
            maximum: 3,
            description: 'Number of death save failures to set',
          },
          reason: {
            type: 'string',
            description: 'Result of the death save roll',
          },
        },
        required: ['character_name', 'reason'],
      },
    },
  },

  // ============ CONDITIONS ============
  {
    type: 'function',
    function: {
      name: 'apply_condition',
      description: 'Apply a condition to a character (poisoned, frightened, etc.).',
      parameters: {
        type: 'object',
        properties: {
          character_name: {
            type: 'string',
            description: 'Name of the character',
          },
          condition: {
            type: 'string',
            enum: DND_CONDITIONS as unknown as string[],
            description: 'The condition to apply',
          },
          duration: {
            type: 'string',
            description: 'How long the condition lasts (e.g., "1 minute", "until end of next turn", "until cured")',
          },
          source: {
            type: 'string',
            description: 'What caused the condition (spell, attack, trap, etc.)',
          },
        },
        required: ['character_name', 'condition', 'source'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'remove_condition',
      description: 'Remove a condition from a character.',
      parameters: {
        type: 'object',
        properties: {
          character_name: {
            type: 'string',
            description: 'Name of the character',
          },
          condition: {
            type: 'string',
            enum: DND_CONDITIONS as unknown as string[],
            description: 'The condition to remove',
          },
          reason: {
            type: 'string',
            description: 'Why the condition ended (spell ended, made save, cured, etc.)',
          },
        },
        required: ['character_name', 'condition', 'reason'],
      },
    },
  },

  // ============ SPELL SLOTS ============
  {
    type: 'function',
    function: {
      name: 'use_spell_slot',
      description: 'Mark a spell slot as used when a character casts a leveled spell. Cantrips do not use slots.',
      parameters: {
        type: 'object',
        properties: {
          character_name: {
            type: 'string',
            description: 'Name of the spellcasting character',
          },
          spell_level: {
            type: 'integer',
            minimum: 1,
            maximum: 9,
            description: 'Level of the spell slot used (can upcast with higher slot)',
          },
          spell_name: {
            type: 'string',
            description: 'Name of the spell being cast',
          },
        },
        required: ['character_name', 'spell_level', 'spell_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'restore_spell_slots',
      description: 'Restore spell slots on rest. Long rest restores all slots. Short rest only restores warlock pact magic slots.',
      parameters: {
        type: 'object',
        properties: {
          character_name: {
            type: 'string',
            description: 'Name of the spellcasting character',
          },
          rest_type: {
            type: 'string',
            enum: ['short', 'long'],
            description: 'Type of rest taken',
          },
        },
        required: ['character_name', 'rest_type'],
      },
    },
  },

  // ============ EXPERIENCE & LEVELING ============
  {
    type: 'function',
    function: {
      name: 'award_xp',
      description: 'Award experience points for completing encounters or milestones. Use "party" as character_name to award to all characters.',
      parameters: {
        type: 'object',
        properties: {
          character_name: {
            type: 'string',
            description: 'Name of the character (or "party" for all characters)',
          },
          xp_amount: {
            type: 'integer',
            minimum: 1,
            maximum: 10000,
            description: 'Amount of XP to award',
          },
          reason: {
            type: 'string',
            description: 'What the XP is for (defeating enemies, completing quest, roleplay milestone, etc.)',
          },
        },
        required: ['character_name', 'xp_amount', 'reason'],
      },
    },
  },

  // ============ EQUIPMENT STATE ============
  {
    type: 'function',
    function: {
      name: 'equip_item',
      description: 'Equip an item from inventory to a slot (weapon, armor, etc.). Item must be in inventory.',
      parameters: {
        type: 'object',
        properties: {
          character_name: {
            type: 'string',
            description: 'Name of the character',
          },
          item_name: {
            type: 'string',
            description: 'Name of the item to equip (must be in inventory)',
          },
          slot: {
            type: 'string',
            enum: EQUIPMENT_SLOTS as unknown as string[],
            description: 'Equipment slot to use',
          },
        },
        required: ['character_name', 'item_name', 'slot'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'unequip_item',
      description: 'Unequip an item and return it to inventory.',
      parameters: {
        type: 'object',
        properties: {
          character_name: {
            type: 'string',
            description: 'Name of the character',
          },
          slot: {
            type: 'string',
            enum: EQUIPMENT_SLOTS as unknown as string[],
            description: 'Equipment slot to clear',
          },
          reason: {
            type: 'string',
            description: 'Why the item is being unequipped',
          },
        },
        required: ['character_name', 'slot', 'reason'],
      },
    },
  },

  // ============ REST & RECOVERY ============
  {
    type: 'function',
    function: {
      name: 'apply_rest',
      description: 'Apply rest effects to a character. Short rest: spend hit dice. Long rest: full HP recovery, reset spell slots, remove some conditions.',
      parameters: {
        type: 'object',
        properties: {
          character_name: {
            type: 'string',
            description: 'Name of the character (or "party" for all characters)',
          },
          rest_type: {
            type: 'string',
            enum: ['short', 'long'],
            description: 'Type of rest',
          },
          hit_dice_spent: {
            type: 'integer',
            minimum: 0,
            description: 'Number of hit dice spent during short rest for healing',
          },
        },
        required: ['character_name', 'rest_type'],
      },
    },
  },
]

// Export tool names for easy reference
export const CHARACTER_TOOL_NAMES = CHARACTER_STATE_TOOLS.map(
  (tool) => tool.function.name
)
