/**
 * OpenAI API Client
 * Server-side only - handles AI DM responses
 */

import { CHARACTER_STATE_TOOLS } from './character-tools'
import { ChatCompletionTool } from 'openai/resources/chat/completions'
import { ROLL_REQUEST_TOOLS, ROLL_REQUEST_TOOL_NAMES } from './roll-request-tool'

// Model configuration
const MODEL_NAME = 'gpt-4o-mini'
const MAX_OUTPUT_TOKENS = 8192
const TEMPERATURE = 0.8

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenAIResponse {
  id: string
  choices: Array<{
    message: {
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * Get API key
 */
function getApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }
  return apiKey
}

/**
 * Generate content
 */
export async function generateContent(prompt: string): Promise<string> {
  const apiKey = getApiKey()

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: MAX_OUTPUT_TOKENS,
      temperature: TEMPERATURE,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${response.status} ${error}`)
  }

  const data: OpenAIResponse = await response.json()
  return data.choices[0]?.message?.content || ''
}

/**
 * Generate structured JSON output
 */
export async function generateStructuredOutput<T>(
  prompt: string,
  schema: string
): Promise<T> {
  const fullPrompt = `${prompt}

You must respond with valid JSON matching this schema:
${schema}

IMPORTANT: Only respond with the JSON object. Do not include any markdown formatting, code blocks, or explanatory text.`

  const apiKey = getApiKey()

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: 'You are an AI Dungeon Master for a D&D 5e game. Always respond with valid JSON only, no markdown or extra text.'
        },
        { role: 'user', content: fullPrompt }
      ],
      max_tokens: MAX_OUTPUT_TOKENS,
      temperature: TEMPERATURE,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${response.status} ${error}`)
  }

  const data: OpenAIResponse = await response.json()
  const text = data.choices[0]?.message?.content || '{}'

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned) as T
  } catch (error) {
    throw new Error(`Failed to parse structured output: ${error}\n\nRaw response: ${text}`)
  }
}

/**
 * Generate narrative with streaming, calling onChunk for each piece
 */
export async function generateNarrativeStreaming(
  prompt: string,
  onChunk: (chunk: string, fullText: string) => Promise<void>
): Promise<string> {
  const apiKey = getApiKey()

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: 'You are an expert Dungeon Master for a D&D 5e game. Be descriptive but concise (2-4 paragraphs). Use second person when addressing players. NEVER end with questions or prompts for action - always end on an atmospheric detail.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: MAX_OUTPUT_TOKENS,
      temperature: TEMPERATURE,
      stream: true,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${response.status} ${error}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('No response body')
  }

  const decoder = new TextDecoder()
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(line => line.trim() !== '')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content || ''
          if (content) {
            fullText += content
            await onChunk(content, fullText)
          }
        } catch {
          // Skip invalid JSON lines
        }
      }
    }
  }

  return fullText
}

/**
 * Count tokens in text (estimate)
 * OpenAI uses ~4 chars per token on average
 */
export async function countTokens(text: string): Promise<number> {
  return Math.ceil(text.length / 4)
}

/**
 * Estimate cost for token count
 * GPT-4o-mini pricing:
 * - Input: $0.00015 per 1K tokens
 * - Output: $0.0006 per 1K tokens
 */
export function estimateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1000) * 0.00015
  const outputCost = (outputTokens / 1000) * 0.0006
  return inputCost + outputCost
}

/**
 * Get model info
 */
export function getModelInfo(): {
  name: string
  maxTokens: number
  temperature: number
} {
  return {
    name: MODEL_NAME,
    maxTokens: MAX_OUTPUT_TOKENS,
    temperature: TEMPERATURE,
  }
}

/**
 * NPC/Entity management tools for the AI DM
 */
export const NPC_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'add_npc_to_scene',
      description: 'Add an NPC or creature with a DISTINCT PERSONALITY to the current scene. Use when introducing new characters, allies, enemies, or creatures. Give each NPC memorable traits - avoid generic characters!',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Unique, memorable name (e.g., "Thalia Ironvow", "Grimjaw the Butcher", "Whisper")'
          },
          type: {
            type: 'string',
            enum: ['npc', 'monster'],
            description: 'Type of entity - use "npc" for friendly/neutral characters, "monster" for hostile creatures'
          },
          description: {
            type: 'string',
            description: 'Physical appearance AND personality hint. Example: "A wiry halfling with ink-stained fingers and a nervous laugh, constantly scribbling in a worn notebook"'
          },
          speech_pattern: {
            type: 'string',
            description: 'How they speak - accent, verbal tics, formal/informal, catchphrases. Examples: "Speaks in riddles", "Ends sentences with \'see?\'", "Formal and archaic", "Rapid-fire questions"'
          },
          personality_quirk: {
            type: 'string',
            description: 'A memorable behavioral quirk. Examples: "Constantly polishes a pocket watch", "Laughs nervously when lying", "Never makes eye contact", "Collects unusual insects"'
          },
          motivation: {
            type: 'string',
            description: 'What drives this NPC - their goal or desire. Examples: "Searching for lost sibling", "Wants revenge on local lord", "Just wants a quiet life", "Obsessed with ancient knowledge"'
          },
          disposition_to_party: {
            type: 'string',
            enum: ['friendly', 'neutral', 'suspicious', 'hostile', 'fearful', 'curious'],
            description: 'Initial attitude toward the player characters'
          },
          max_hp: {
            type: 'integer',
            description: 'Maximum hit points (optional, defaults to 10 for NPCs)'
          },
          armor_class: {
            type: 'integer',
            description: 'Armor class (optional, defaults to 10)'
          }
        },
        required: ['name', 'type', 'description']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'remove_npc_from_scene',
      description: 'Remove an NPC from the current scene. Use when an NPC leaves, is defeated, or is no longer relevant.',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of the NPC to remove'
          },
          reason: {
            type: 'string',
            description: 'Why the NPC is being removed (left, defeated, dismissed, etc.)'
          }
        },
        required: ['name', 'reason']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'modify_npc_hp',
      description: 'Apply damage or healing to an NPC in the current scene. Use negative values for damage, positive for healing. If HP reaches 0, the NPC is defeated.',
      parameters: {
        type: 'object',
        properties: {
          npc_name: {
            type: 'string',
            description: 'Name of the NPC or monster to modify'
          },
          hp_change: {
            type: 'integer',
            description: 'HP change amount (negative for damage, positive for healing)'
          },
          damage_type: {
            type: 'string',
            enum: ['slashing', 'piercing', 'bludgeoning', 'acid', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'poison', 'psychic', 'radiant', 'thunder', 'healing'],
            description: 'Type of damage or healing'
          },
          reason: {
            type: 'string',
            description: 'Source of damage/healing (player attack, spell, trap, etc.)'
          }
        },
        required: ['npc_name', 'hp_change', 'reason']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'apply_npc_condition',
      description: 'Apply a condition to an NPC (poisoned, frightened, stunned, etc.).',
      parameters: {
        type: 'object',
        properties: {
          npc_name: {
            type: 'string',
            description: 'Name of the NPC or monster'
          },
          condition: {
            type: 'string',
            enum: ['blinded', 'charmed', 'deafened', 'exhaustion', 'frightened', 'grappled', 'incapacitated', 'invisible', 'paralyzed', 'petrified', 'poisoned', 'prone', 'restrained', 'stunned', 'unconscious'],
            description: 'The condition to apply'
          },
          duration: {
            type: 'string',
            description: 'How long the condition lasts (e.g., "1 minute", "until end of next turn", "until cured")'
          },
          source: {
            type: 'string',
            description: 'What caused the condition (spell, attack, ability, etc.)'
          }
        },
        required: ['npc_name', 'condition', 'source']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'remove_npc_condition',
      description: 'Remove a condition from an NPC.',
      parameters: {
        type: 'object',
        properties: {
          npc_name: {
            type: 'string',
            description: 'Name of the NPC or monster'
          },
          condition: {
            type: 'string',
            enum: ['blinded', 'charmed', 'deafened', 'exhaustion', 'frightened', 'grappled', 'incapacitated', 'invisible', 'paralyzed', 'petrified', 'poisoned', 'prone', 'restrained', 'stunned', 'unconscious'],
            description: 'The condition to remove'
          },
          reason: {
            type: 'string',
            description: 'Why the condition ended (saved, cured, duration expired, etc.)'
          }
        },
        required: ['npc_name', 'condition', 'reason']
      }
    }
  }
]

/**
 * Quest management tools for the AI DM
 */
export const QUEST_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'create_quest',
      description: 'Create a new quest when an NPC gives the party a mission or objective. Use this when players receive a new task or goal.',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Short, memorable title for the quest (e.g., "The Missing Merchant", "Clear the Goblin Cave")'
          },
          description: {
            type: 'string',
            description: 'Brief description of the quest objective'
          },
          quest_giver: {
            type: 'string',
            description: 'Name of the NPC who gave the quest (optional)'
          },
          objectives: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of specific objectives to complete the quest'
          }
        },
        required: ['title', 'objectives']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_quest_objective',
      description: 'Mark a quest objective as completed when players accomplish a specific goal',
      parameters: {
        type: 'object',
        properties: {
          quest_title: {
            type: 'string',
            description: 'Title of the quest containing the objective'
          },
          objective_description: {
            type: 'string',
            description: 'The objective text that was completed'
          }
        },
        required: ['quest_title', 'objective_description']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'complete_quest',
      description: 'Mark an entire quest as completed or failed',
      parameters: {
        type: 'object',
        properties: {
          quest_title: {
            type: 'string',
            description: 'Title of the quest to complete'
          },
          status: {
            type: 'string',
            enum: ['completed', 'failed'],
            description: 'Final status of the quest'
          }
        },
        required: ['quest_title', 'status']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'reveal_primary_quest',
      description: 'Reveal the hidden primary quest to players. Use this when the narrative naturally leads to the quest discovery. This should be a dramatic moment that involves all player characters. The quest will appear in their Quest Tracker once revealed.',
      parameters: {
        type: 'object',
        properties: {
          dramatic_moment: {
            type: 'string',
            description: 'Description of how the quest is being revealed (e.g., "A dying messenger delivers an urgent plea", "Ancient runes on the wall begin to glow", "The village elder reveals a dark secret")'
          },
          quest_giver: {
            type: 'string',
            description: 'Name of the NPC or entity revealing the quest (optional)'
          }
        },
        required: ['dramatic_moment']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_quest_progress',
      description: 'Update the estimated completion progress of the primary quest (0-100%). Call this after significant story beats to help pace the adventure. Primary quests should reach 100% in approximately 20-30 turns.',
      parameters: {
        type: 'object',
        properties: {
          quest_title: {
            type: 'string',
            description: 'Title of the quest to update progress for'
          },
          progress_percentage: {
            type: 'integer',
            description: 'Estimated completion percentage (0-100). Consider: 10-20% for early discoveries, 40-60% for mid-game challenges, 80-90% for approaching climax, 100% for quest complete.',
            minimum: 0,
            maximum: 100
          },
          reason: {
            type: 'string',
            description: 'Brief explanation of what progress was made (e.g., "Located the hidden entrance", "Defeated the guardian", "Obtained the artifact")'
          }
        },
        required: ['quest_title', 'progress_percentage', 'reason']
      }
    }
  }
]

/**
 * Scene art generation tool for the AI DM
 */
export const SCENE_ART_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'generate_scene_art',
      description: 'Generate artwork for the current scene when describing a new location, dramatic moment, or significant environment change. Use sparingly - only for major scene transitions or especially evocative moments.',
      parameters: {
        type: 'object',
        properties: {
          scene_description: {
            type: 'string',
            description: 'Detailed visual description for the artist: environment, lighting, mood, key features, atmosphere. Be specific and evocative.'
          },
          location_name: {
            type: 'string',
            description: 'Name of the location (e.g., "The Whispering Caverns", "Thornwood Village Square")'
          },
          mood: {
            type: 'string',
            enum: ['tense', 'peaceful', 'mysterious', 'exciting', 'dark', 'hopeful', 'dangerous', 'epic'],
            description: 'Overall mood/atmosphere of the scene'
          }
        },
        required: ['scene_description', 'location_name']
      }
    }
  }
]

/**
 * Combined tools for AI DM - includes quest, NPC, character, scene art, and roll request tools
 */
export const ALL_DM_TOOLS: ChatCompletionTool[] = [
  ...QUEST_TOOLS as ChatCompletionTool[],
  ...NPC_TOOLS as ChatCompletionTool[],
  ...CHARACTER_STATE_TOOLS,
  ...SCENE_ART_TOOLS as ChatCompletionTool[],
  ...ROLL_REQUEST_TOOLS,
]

export const NPC_TOOL_NAMES = NPC_TOOLS.map(t => t.function.name)
export const SCENE_ART_TOOL_NAMES = SCENE_ART_TOOLS.map(t => t.function.name)
export const QUEST_TOOL_NAMES = QUEST_TOOLS.map(t => t.function.name)
export const PRIMARY_QUEST_TOOL_NAMES = ['reveal_primary_quest', 'update_quest_progress']
export { ROLL_REQUEST_TOOL_NAMES }

export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export interface NarrativeWithToolsResult {
  content: string
  toolCalls: ToolCall[]
}

/**
 * Generate narrative with optional tool calls (for quest and character management)
 */
export async function generateNarrativeWithTools(
  prompt: string,
  activeQuests: Array<{ title: string; objectives: Array<{ description: string; is_completed: boolean }> }> = [],
  onChunk?: (chunk: string, fullText: string) => Promise<void>,
  tools: ChatCompletionTool[] = ALL_DM_TOOLS
): Promise<NarrativeWithToolsResult> {
  const apiKey = getApiKey()

  // Build quest context for the AI
  let questContext = ''
  if (activeQuests.length > 0) {
    questContext = '\n\nACTIVE QUESTS:\n'
    activeQuests.forEach(quest => {
      questContext += `- ${quest.title}\n`
      quest.objectives.forEach(obj => {
        questContext += `  ${obj.is_completed ? '[x]' : '[ ]'} ${obj.description}\n`
      })
    })
  }

  const systemPrompt = `You are an expert Dungeon Master for a D&D 5e game. Be descriptive but concise (2-4 paragraphs). Use second person when addressing players.

=== QUEST TRACKING (CRITICAL - USE PROACTIVELY) ===
You MUST track quests so players can see their objectives in the UI:
- create_quest: Use IMMEDIATELY when players accept a mission, task, or goal - even if implied!
  Examples: "I'll find the disturbance" → create quest. "I agree to help" → create quest.
  Include clear objectives that can be checked off.
- update_quest_objective: Mark objectives complete as players accomplish them
- complete_quest: Mark quest completed/failed when done

If a player commits to doing something meaningful, CREATE A QUEST for it!

=== NPC/CREATURE TRACKING (USE FOR ALL SIGNIFICANT CHARACTERS) ===
Track NPCs so they appear in the scene panel:
- add_npc_to_scene: Use when introducing ANY named NPC, ally, companion, or creature
  Examples: A guardian spirit appears → add it. A lynx joins the party → add it.
  Use type="npc" for friendly/neutral, type="monster" for hostile.
- remove_npc_from_scene: Use when NPCs leave, are defeated, or exit the scene

If a creature or character is named and interacting with players, ADD THEM TO THE SCENE!

=== CHARACTER STATE TOOLS (USE AUTOMATICALLY) ===
Keep character sheets accurate - players should NOT manually update:
- modify_hp: Damage or healing
- use_spell_slot: Leveled spells cast (not cantrips)
- modify_currency: Gold/coins gained or spent
- add_item_to_inventory / remove_item_from_inventory: Items gained or lost
- apply_condition / remove_condition: Status effects
- award_xp: After encounters or milestones (use "party" for all)
- equip_item / unequip_item: Equipment changes
- set_temp_hp: Temporary HP granted
- apply_rest: Short or long rests

IMPORTANT: When you narrate something happening (damage, loot, conditions, etc.), USE THE TOOLS to make it real in the game state. The UI updates automatically when you use tools.

=== MERCHANT TRANSACTIONS (CRITICAL - ENFORCE GAME ECONOMY) ===
When players buy, sell, or trade with merchants, you MUST use the game mechanics:

BUYING ITEMS:
1. CHECK the character's Currency (shown in their stats) - can they afford it?
2. If YES: Call BOTH tools together:
   - modify_currency with NEGATIVE gp/sp/cp (e.g., gp: -50 for a 50 gp item)
   - add_item_to_inventory with the purchased item
3. If NO: Narrate that they don't have enough gold. The merchant refuses or offers alternatives.

SELLING ITEMS:
1. CHECK that the item exists in their inventory
2. If YES: Call BOTH tools:
   - remove_item_from_inventory to remove the sold item
   - modify_currency with POSITIVE values (typically 50% of item value)
3. If NO: Narrate that they don't have that item to sell.

HAGGLING:
- If a player tries to negotiate prices, you may ask for a Charisma (Persuasion) check
- DC 10-15 for minor discounts (10-20% off), DC 20+ for significant deals

NEVER narrate a purchase completing without actually calling the tools!
Example: Player buys a longsword (15 gp) → Call modify_currency(gp: -15) AND add_item_to_inventory(item_name: "Longsword")

=== MESSAGE ENDINGS (NON-NEGOTIABLE) ===
NEVER end your message with questions or prompts for action.
BAD endings (NEVER USE): "What will you do?" / "What will you ask next?" / "The grove awaits..." / "What secrets will you uncover?"
GOOD endings: End with a sensory detail or NPC action - "The fire crackles softly." / "She turns away." / "Silence settles over the clearing."
Your final sentence MUST be atmospheric, not an invitation to act.${questContext}`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: MAX_OUTPUT_TOKENS,
      temperature: TEMPERATURE,
      tools: tools,
      tool_choice: 'auto',
      stream: !!onChunk,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${response.status} ${error}`)
  }

  if (onChunk) {
    // Streaming mode
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let fullText = ''
    let toolCalls: ToolCall[] = []
    const toolCallsInProgress: Map<number, { id: string; name: string; arguments: string }> = new Map()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(line => line.trim() !== '')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta

            // Handle text content
            if (delta?.content) {
              fullText += delta.content
              await onChunk(delta.content, fullText)
            }

            // Handle tool calls
            if (delta?.tool_calls) {
              for (const tc of delta.tool_calls) {
                const index = tc.index
                if (!toolCallsInProgress.has(index)) {
                  toolCallsInProgress.set(index, { id: tc.id || '', name: tc.function?.name || '', arguments: '' })
                }
                const existing = toolCallsInProgress.get(index)!
                if (tc.id) existing.id = tc.id
                if (tc.function?.name) existing.name = tc.function.name
                if (tc.function?.arguments) existing.arguments += tc.function.arguments
              }
            }
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    }

    // Convert in-progress tool calls to final format
    toolCalls = Array.from(toolCallsInProgress.values()).map(tc => ({
      id: tc.id,
      type: 'function' as const,
      function: {
        name: tc.name,
        arguments: tc.arguments
      }
    }))

    return { content: fullText, toolCalls }
  } else {
    // Non-streaming mode
    const data = await response.json()
    const choice = data.choices?.[0]

    return {
      content: choice?.message?.content || '',
      toolCalls: choice?.message?.tool_calls || []
    }
  }
}
