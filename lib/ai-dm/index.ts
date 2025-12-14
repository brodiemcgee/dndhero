/**
 * AI DM System
 * Complete integration of Google Gemini for D&D Dungeon Master AI
 */

// Gemini Client
export {
  getGeminiClient,
  getModel,
  generateContent,
  generateContentStream,
  generateStructuredOutput,
  countTokens,
  validateApiKey,
  estimateCost,
  getModelInfo,
} from './gemini-client'

// Context Builder
export {
  type Character,
  type Entity,
  type Scene,
  type Campaign,
  type EventLogEntry,
  type DMContext,
  type DiceRollRequest as ContextDiceRollRequest,
  buildSystemPrompt,
  buildGameStatePrompt,
  buildTaskPrompt,
  buildFullContext,
  estimateContextTokens,
  validateContextSize,
} from './context-builder'

// Output Schemas
export {
  DiceRollRequestSchema,
  EntityStateUpdateSchema,
  EventLogEntrySchema,
  TurnResolutionSchema,
  SceneDescriptionSchema,
  NPCDialogueSchema,
  CombatRoundSchema,
  type DiceRollRequest,
  type EntityStateUpdate,
  type EventLogEntry as SchemaEventLogEntry,
  type TurnResolution,
  type SceneDescription,
  type NPCDialogue,
  type CombatRound,
  validateTurnResolution,
  validateSceneDescription,
  getTurnResolutionSchemaString,
  getSceneDescriptionSchemaString,
} from './output-schemas'

// Orchestrator
export {
  type OrchestrationResult,
  type StreamChunk,
  resolveTurn,
  generateSceneDescription,
  streamNarrative,
  preflightCheck,
  validateResponseSafety,
  retryWithBackoff,
  extractDatabaseUpdates,
} from './orchestrator'
