/**
 * AI DM Orchestrator
 * Coordinates AI DM responses with game state and database updates
 */

import { generateStructuredOutput, generateContentStream, countTokens } from './gemini-client'
import { buildFullContext, DMContext, estimateContextTokens } from './context-builder'
import {
  validateTurnResolution,
  TurnResolution,
  getTurnResolutionSchemaString,
  validateSceneDescription,
  SceneDescription,
  getSceneDescriptionSchemaString,
} from './output-schemas'

export interface OrchestrationResult {
  success: boolean
  data?: TurnResolution | SceneDescription
  error?: string
  tokensUsed?: {
    input: number
    output: number
    total: number
  }
  cost?: number
}

export interface StreamChunk {
  type: 'narrative' | 'complete' | 'error'
  content: string
  complete?: boolean
  error?: string
}

/**
 * Resolve a turn with AI DM
 */
export async function resolveTurn(context: DMContext): Promise<OrchestrationResult> {
  try {
    // Build context
    const { fullPrompt } = buildFullContext(context, 'narrate_turn')

    // Count input tokens
    const inputTokens = await countTokens(fullPrompt)

    // Get schema
    const schema = getTurnResolutionSchemaString()

    // Generate structured output
    const rawOutput = await generateStructuredOutput<unknown>(fullPrompt, schema)

    // Validate output
    const validation = validateTurnResolution(rawOutput)

    if (!validation.success) {
      return {
        success: false,
        error: `AI DM response validation failed: ${validation.errors?.join(', ')}`,
      }
    }

    // Count output tokens (estimate)
    const outputText = JSON.stringify(rawOutput)
    const outputTokens = await countTokens(outputText)

    // Calculate cost
    const cost = estimateCost(inputTokens, outputTokens)

    return {
      success: true,
      data: validation.data,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens,
      },
      cost,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during turn resolution',
    }
  }
}

/**
 * Generate scene description
 */
export async function generateSceneDescription(context: DMContext): Promise<OrchestrationResult> {
  try {
    // Build context
    const { fullPrompt } = buildFullContext(context, 'describe_scene')

    // Count input tokens
    const inputTokens = await countTokens(fullPrompt)

    // Get schema
    const schema = getSceneDescriptionSchemaString()

    // Generate structured output
    const rawOutput = await generateStructuredOutput<unknown>(fullPrompt, schema)

    // Validate output
    const validation = validateSceneDescription(rawOutput)

    if (!validation.success) {
      return {
        success: false,
        error: `Scene description validation failed: ${validation.errors?.join(', ')}`,
      }
    }

    // Count output tokens
    const outputText = JSON.stringify(rawOutput)
    const outputTokens = await countTokens(outputText)

    // Calculate cost
    const cost = estimateCost(inputTokens, outputTokens)

    return {
      success: true,
      data: validation.data,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens,
      },
      cost,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error generating scene description',
    }
  }
}

/**
 * Stream narrative response
 */
export async function* streamNarrative(context: DMContext): AsyncGenerator<StreamChunk> {
  try {
    // Build context
    const { fullPrompt } = buildFullContext(context, 'narrate_turn')

    // Generate streaming response
    const result = await generateContentStream(fullPrompt)

    // Stream chunks
    for await (const chunk of result.stream) {
      const text = chunk.text()

      yield {
        type: 'narrative',
        content: text,
      }
    }

    // Final chunk
    yield {
      type: 'complete',
      content: '',
      complete: true,
    }
  } catch (error) {
    yield {
      type: 'error',
      content: '',
      error: error instanceof Error ? error.message : 'Unknown streaming error',
    }
  }
}

/**
 * Estimate cost for context
 */
function estimateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1000) * 0.00025
  const outputCost = (outputTokens / 1000) * 0.0005
  return inputCost + outputCost
}

/**
 * Pre-flight check before AI DM call
 */
export async function preflightCheck(context: DMContext): Promise<{
  canProceed: boolean
  warnings: string[]
  estimatedTokens: number
  estimatedCost: number
}> {
  const warnings: string[] = []

  // Estimate tokens
  const estimatedTokens = estimateContextTokens(context)

  // Check token limit
  if (estimatedTokens > 128000) {
    return {
      canProceed: false,
      warnings: ['Context exceeds maximum token limit (128k)'],
      estimatedTokens,
      estimatedCost: 0,
    }
  }

  if (estimatedTokens > 100000) {
    warnings.push('Context is very large (>100k tokens). Consider trimming event history.')
  }

  // Estimate cost (assuming ~2k output tokens)
  const estimatedCost = estimateCost(estimatedTokens, 2000)

  // Check for missing critical data
  if (!context.playerInputs || context.playerInputs.length === 0) {
    warnings.push('No player inputs found for this turn')
  }

  if (!context.characters || context.characters.length === 0) {
    warnings.push('No player characters found in scene')
  }

  if (!context.scene) {
    return {
      canProceed: false,
      warnings: ['Scene data is required but missing'],
      estimatedTokens,
      estimatedCost,
    }
  }

  return {
    canProceed: true,
    warnings,
    estimatedTokens,
    estimatedCost,
  }
}

/**
 * Validate AI DM response for safety
 */
export function validateResponseSafety(response: TurnResolution): {
  safe: boolean
  issues: string[]
} {
  const issues: string[] = []

  // Check narrative length
  if (response.narrative.length > 5000) {
    issues.push('Narrative exceeds maximum length')
  }

  if (response.narrative.length < 10) {
    issues.push('Narrative is too short')
  }

  // Check for excessive damage
  if (response.entity_updates) {
    for (const update of response.entity_updates) {
      if (update.hp_change && Math.abs(update.hp_change) > 500) {
        issues.push(`Excessive HP change detected: ${update.hp_change}`)
      }
    }
  }

  // Check for too many dice requests
  if (response.dice_requests && response.dice_requests.length > 20) {
    issues.push('Too many dice requests in single turn')
  }

  // Check for too many events
  if (response.events.length > 50) {
    issues.push('Too many events in single turn')
  }

  return {
    safe: issues.length === 0,
    issues,
  }
}

/**
 * Retry failed AI calls with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')

      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * baseDelayMs
        await sleep(delay)
      }
    }
  }

  throw lastError || new Error('All retry attempts failed')
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Process turn resolution and extract database updates
 */
export function extractDatabaseUpdates(resolution: TurnResolution): {
  entityUpdates: Array<{
    entity_id: string
    hp_change?: number
    current_hp?: number
    temp_hp?: number
    conditions_add?: string[]
    conditions_remove?: string[]
    concentration_broken?: boolean
  }>
  events: Array<{
    event_type: string
    narrative: string
    entity_ids?: string[]
    metadata?: Record<string, any>
  }>
  sceneUpdate?: {
    current_state?: string
    description?: string
  }
  narrativeContext: string
} {
  return {
    entityUpdates: resolution.entity_updates || [],
    events: resolution.events,
    sceneUpdate: resolution.scene_update,
    narrativeContext: resolution.next_turn_context || resolution.narrative,
  }
}
