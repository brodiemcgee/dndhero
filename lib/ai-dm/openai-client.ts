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
