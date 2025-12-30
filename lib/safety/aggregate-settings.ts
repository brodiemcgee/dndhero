/**
 * Aggregation logic for Lines and Veils safety settings
 *
 * Key principle: Always default to the deepest level
 * If one player has a topic as "line" and another as "veil", it becomes a "line" for the campaign
 */

import {
  LinesVeilsSettings,
  AggregatedSafetySettings,
  TopicId,
  PREDEFINED_SAFETY_TOPICS,
} from './predefined-topics'

/**
 * Aggregate safety settings from multiple campaign members
 *
 * Rules:
 * 1. If ANY member has a topic as "line" → it's a line for the campaign
 * 2. If ANY member has a topic as "veil" (and no one has it as "line") → it's a veil
 * 3. Custom entries are deduplicated (case-insensitive, trimmed)
 * 4. Custom lines trump custom veils if same text appears in both
 */
export function aggregateCampaignSafetySettings(
  memberSettings: (LinesVeilsSettings | null | undefined)[]
): AggregatedSafetySettings {
  const lines = new Set<string>()
  const veils = new Set<string>()
  const customLines = new Set<string>()
  const customVeils = new Set<string>()

  for (const settings of memberSettings) {
    if (!settings) continue

    // Process predefined topics
    if (settings.topics) {
      for (const [topicId, level] of Object.entries(settings.topics)) {
        // Validate that this is a known topic ID
        if (!(topicId in PREDEFINED_SAFETY_TOPICS)) continue

        if (level === 'line') {
          lines.add(topicId)
          // Line trumps veil - remove from veils if it was there
          veils.delete(topicId)
        } else if (level === 'veil' && !lines.has(topicId)) {
          // Only add as veil if it's not already a line
          veils.add(topicId)
        }
        // 'ok' means no restriction, so we don't add it anywhere
      }
    }

    // Process custom lines
    if (settings.custom_lines && Array.isArray(settings.custom_lines)) {
      for (const custom of settings.custom_lines) {
        const normalized = normalizeCustomEntry(custom)
        if (normalized) {
          customLines.add(normalized)
        }
      }
    }

    // Process custom veils
    if (settings.custom_veils && Array.isArray(settings.custom_veils)) {
      for (const custom of settings.custom_veils) {
        const normalized = normalizeCustomEntry(custom)
        if (normalized) {
          // Custom line trumps custom veil
          if (!customLines.has(normalized)) {
            customVeils.add(normalized)
          }
        }
      }
    }
  }

  return {
    lines: Array.from(lines).sort(),
    veils: Array.from(veils).sort(),
    custom_lines: Array.from(customLines).sort(),
    custom_veils: Array.from(customVeils).sort(),
  }
}

/**
 * Normalize a custom entry for deduplication
 * - Trim whitespace
 * - Convert to lowercase for comparison
 * - Returns null if empty after trimming
 */
function normalizeCustomEntry(entry: string): string | null {
  if (typeof entry !== 'string') return null
  const trimmed = entry.trim().toLowerCase()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Check if there are any active restrictions in the settings
 */
export function hasActiveRestrictions(settings: AggregatedSafetySettings): boolean {
  return (
    settings.lines.length > 0 ||
    settings.veils.length > 0 ||
    settings.custom_lines.length > 0 ||
    settings.custom_veils.length > 0
  )
}

/**
 * Get a summary string for display (e.g., "3 Lines, 2 Veils")
 */
export function getSafetySettingsSummary(settings: AggregatedSafetySettings): string {
  const linesCount = settings.lines.length + settings.custom_lines.length
  const veilsCount = settings.veils.length + settings.custom_veils.length

  const parts: string[] = []

  if (linesCount > 0) {
    parts.push(`${linesCount} Line${linesCount !== 1 ? 's' : ''}`)
  }

  if (veilsCount > 0) {
    parts.push(`${veilsCount} Veil${veilsCount !== 1 ? 's' : ''}`)
  }

  return parts.length > 0 ? parts.join(', ') : 'No restrictions'
}

/**
 * Validate and sanitize lines/veils settings from user input
 */
export function sanitizeLinesVeilsSettings(
  input: unknown
): LinesVeilsSettings {
  const result: LinesVeilsSettings = {
    topics: {},
    custom_lines: [],
    custom_veils: [],
  }

  if (!input || typeof input !== 'object') {
    return result
  }

  const data = input as Record<string, unknown>

  // Sanitize topics
  if (data.topics && typeof data.topics === 'object') {
    const topics = data.topics as Record<string, unknown>
    for (const [topicId, level] of Object.entries(topics)) {
      if (
        topicId in PREDEFINED_SAFETY_TOPICS &&
        (level === 'line' || level === 'veil' || level === 'ok')
      ) {
        result.topics[topicId as TopicId] = level
      }
    }
  }

  // Sanitize custom lines (max 20, max 100 chars each)
  if (data.custom_lines && Array.isArray(data.custom_lines)) {
    result.custom_lines = data.custom_lines
      .filter((item): item is string => typeof item === 'string')
      .map((s) => s.trim().slice(0, 100))
      .filter((s) => s.length > 0)
      .slice(0, 20)
  }

  // Sanitize custom veils (max 20, max 100 chars each)
  if (data.custom_veils && Array.isArray(data.custom_veils)) {
    result.custom_veils = data.custom_veils
      .filter((item): item is string => typeof item === 'string')
      .map((s) => s.trim().slice(0, 100))
      .filter((s) => s.length > 0)
      .slice(0, 20)
  }

  return result
}
