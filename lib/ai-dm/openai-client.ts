/**
 * OpenAI API Client
 * Server-side only - handles AI DM responses
 */

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
          content: 'You are an expert Dungeon Master for a D&D 5e game. Be descriptive but concise (2-4 paragraphs). Use second person when addressing players.'
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
  }
]

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
 * Generate narrative with optional tool calls (for quest management)
 */
export async function generateNarrativeWithTools(
  prompt: string,
  activeQuests: Array<{ title: string; objectives: Array<{ description: string; is_completed: boolean }> }> = [],
  onChunk?: (chunk: string, fullText: string) => Promise<void>
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

You have tools to manage quests:
- Use create_quest when an NPC gives the party a new mission or task
- Use update_quest_objective when players complete a specific objective
- Use complete_quest when all objectives are done or the quest fails

Only use these tools when quest-related events actually happen in the narrative. Don't force quest updates if none are warranted.${questContext}`

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
      tools: QUEST_TOOLS,
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
