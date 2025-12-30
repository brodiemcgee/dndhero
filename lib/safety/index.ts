/**
 * Lines and Veils Safety System
 *
 * A TTRPG safety tool for managing sensitive content boundaries:
 * - Lines = Hard limits - content that should NEVER appear
 * - Veils = Soft limits - content handled "off-screen" (fade-to-black)
 *
 * Key principle: Always default to the deepest level
 * (If one player has a topic as "line" and another as "veil", it's a "line")
 */

export {
  PREDEFINED_SAFETY_TOPICS,
  type TopicId,
  type SafetyLevel,
  type SafetyTopic,
  type LinesVeilsSettings,
  type AggregatedSafetySettings,
  getDefaultLinesVeils,
  getPredefinedTopicsArray,
  getTopicById,
  getTopicDisplayName,
} from './predefined-topics'

export {
  aggregateCampaignSafetySettings,
  hasActiveRestrictions,
  getSafetySettingsSummary,
  sanitizeLinesVeilsSettings,
} from './aggregate-settings'

export {
  buildSafetyPromptSection,
  buildSafetyReminder,
} from './safety-prompt'
