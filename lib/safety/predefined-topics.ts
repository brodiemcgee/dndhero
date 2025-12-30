/**
 * Predefined safety topics for Lines and Veils system
 *
 * Lines = Hard limits - content that should NEVER appear in the game
 * Veils = Soft limits - content that can happen but should be "fade to black"
 */

export const PREDEFINED_SAFETY_TOPICS = {
  graphic_violence: {
    id: 'graphic_violence',
    name: 'Graphic Violence',
    description: 'Detailed descriptions of gore, dismemberment, or extreme violence',
  },
  harm_to_children: {
    id: 'harm_to_children',
    name: 'Harm to Children',
    description: 'Violence or danger directed at minors',
  },
  sexual_assault: {
    id: 'sexual_assault',
    name: 'Sexual Assault',
    description: 'Non-consensual sexual content of any kind',
  },
  torture: {
    id: 'torture',
    name: 'Torture',
    description: 'Scenes depicting torture or prolonged suffering',
  },
  suicide_self_harm: {
    id: 'suicide_self_harm',
    name: 'Suicide/Self-Harm',
    description: 'References to or depictions of self-harm or suicide',
  },
} as const

export type TopicId = keyof typeof PREDEFINED_SAFETY_TOPICS
export type SafetyLevel = 'line' | 'veil' | 'ok'

export interface SafetyTopic {
  id: string
  name: string
  description: string
}

export interface LinesVeilsSettings {
  topics: Partial<Record<TopicId, SafetyLevel>>
  custom_lines: string[]
  custom_veils: string[]
}

export interface AggregatedSafetySettings {
  lines: string[]        // Topic IDs that are lines for any member
  veils: string[]        // Topic IDs that are veils (but not lines)
  custom_lines: string[] // Deduplicated custom lines from all members
  custom_veils: string[] // Deduplicated custom veils (excluding those in custom_lines)
}

/**
 * Get default empty lines/veils settings
 */
export function getDefaultLinesVeils(): LinesVeilsSettings {
  return {
    topics: {},
    custom_lines: [],
    custom_veils: [],
  }
}

/**
 * Get all predefined topics as an array for iteration
 */
export function getPredefinedTopicsArray(): SafetyTopic[] {
  return Object.values(PREDEFINED_SAFETY_TOPICS)
}

/**
 * Get a topic by ID
 */
export function getTopicById(id: string): SafetyTopic | undefined {
  return PREDEFINED_SAFETY_TOPICS[id as TopicId]
}

/**
 * Get human-readable name for a topic ID (handles both predefined and custom)
 */
export function getTopicDisplayName(topicId: string): string {
  const predefined = getTopicById(topicId)
  if (predefined) {
    return predefined.name
  }
  // For custom topics, just return the ID (which is the custom text)
  return topicId
}
