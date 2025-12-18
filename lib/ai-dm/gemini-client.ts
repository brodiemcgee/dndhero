/**
 * Google Gemini API Client
 * Server-side only - handles AI DM responses with streaming support
 */

import { GoogleGenerativeAI, GenerativeModel, GenerateContentStreamResult } from '@google/generative-ai'

// Model configuration
const MODEL_NAME = 'gemini-2.0-flash'
const MAX_OUTPUT_TOKENS = 8192
const TEMPERATURE = 0.8
const TOP_P = 0.95
const TOP_K = 40

/**
 * Safety settings for D&D content
 * Allow fantasy violence but block harmful content
 */
const SAFETY_SETTINGS = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_ONLY_HIGH', // Allow fantasy violence
  },
]

/**
 * Generation config
 */
const GENERATION_CONFIG = {
  temperature: TEMPERATURE,
  topP: TOP_P,
  topK: TOP_K,
  maxOutputTokens: MAX_OUTPUT_TOKENS,
}

/**
 * Initialize Gemini client
 */
let genAI: GoogleGenerativeAI | null = null

export function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set')
    }

    genAI = new GoogleGenerativeAI(apiKey)
  }

  return genAI
}

/**
 * Get generative model instance
 */
export function getModel(): GenerativeModel {
  const client = getGeminiClient()

  return client.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: GENERATION_CONFIG,
    safetySettings: SAFETY_SETTINGS,
  })
}

/**
 * Generate content with structured output
 */
export async function generateContent(prompt: string): Promise<string> {
  const model = getModel()

  const result = await model.generateContent(prompt)
  const response = result.response
  const text = response.text()

  return text
}

/**
 * Generate content with streaming
 */
export async function generateContentStream(
  prompt: string
): Promise<GenerateContentStreamResult> {
  const model = getModel()

  const result = await model.generateContentStream(prompt)

  return result
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

  const model = getModel()
  const result = await model.generateContent(fullPrompt)
  const response = result.response
  const text = response.text()

  try {
    // Remove markdown code blocks if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return parsed as T
  } catch (error) {
    throw new Error(`Failed to parse structured output: ${error}\n\nRaw response: ${text}`)
  }
}

/**
 * Count tokens in text
 */
export async function countTokens(text: string): Promise<number> {
  const model = getModel()
  const result = await model.countTokens(text)

  return result.totalTokens
}

/**
 * Validate API key
 */
export async function validateApiKey(): Promise<boolean> {
  try {
    const model = getModel()
    await model.generateContent('Test')
    return true
  } catch (error) {
    return false
  }
}

/**
 * Estimate cost for token count
 * Gemini 1.5 Pro pricing (as of 2024):
 * - Input: $0.00025 per 1K tokens
 * - Output: $0.00050 per 1K tokens
 */
export function estimateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1000) * 0.00025
  const outputCost = (outputTokens / 1000) * 0.0005

  return inputCost + outputCost
}

/**
 * Get model info
 */
export function getModelInfo(): {
  name: string
  maxTokens: number
  temperature: number
  topP: number
  topK: number
} {
  return {
    name: MODEL_NAME,
    maxTokens: MAX_OUTPUT_TOKENS,
    temperature: TEMPERATURE,
    topP: TOP_P,
    topK: TOP_K,
  }
}
