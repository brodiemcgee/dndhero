/**
 * Build safety context section for AI DM prompts
 *
 * This creates the prompt instructions that tell the AI about
 * the campaign's lines and veils restrictions.
 */

import {
  AggregatedSafetySettings,
  getTopicById,
} from './predefined-topics'
import { hasActiveRestrictions } from './aggregate-settings'

/**
 * Build the safety boundaries section for the AI DM prompt
 *
 * This section is CRITICAL and must be placed prominently in the prompt
 * to ensure the AI respects player boundaries.
 */
export function buildSafetyPromptSection(
  settings: AggregatedSafetySettings
): string {
  if (!hasActiveRestrictions(settings)) {
    return ''
  }

  const sections: string[] = []

  sections.push('=== CONTENT SAFETY BOUNDARIES (CRITICAL - MUST FOLLOW) ===')
  sections.push(
    'The following restrictions are set by players and MUST be respected absolutely.\n'
  )

  // Hard limits (Lines)
  const allLines = [...settings.lines, ...settings.custom_lines]
  if (allLines.length > 0) {
    sections.push('HARD LIMITS (LINES) - These topics must NEVER appear in the game:')
    sections.push('Do not include, describe, reference, or allude to any of the following:\n')

    for (const topicId of settings.lines) {
      const topic = getTopicById(topicId)
      if (topic) {
        sections.push(`  - ${topic.name}: ${topic.description}`)
      }
    }

    for (const custom of settings.custom_lines) {
      sections.push(`  - Custom restriction: ${custom}`)
    }

    sections.push('')
  }

  // Soft limits (Veils)
  const allVeils = [...settings.veils, ...settings.custom_veils]
  if (allVeils.length > 0) {
    sections.push('SOFT LIMITS (VEILS) - Handle these topics "off-screen":')
    sections.push(
      'These topics may be referenced but must NOT be described in detail.'
    )
    sections.push(
      'Use fade-to-black techniques: "The scene fades...", "Some time later...", "We skip ahead..."\n'
    )

    for (const topicId of settings.veils) {
      const topic = getTopicById(topicId)
      if (topic) {
        sections.push(`  - ${topic.name}`)
      }
    }

    for (const custom of settings.custom_veils) {
      sections.push(`  - Custom: ${custom}`)
    }

    sections.push('')
  }

  // Enforcement instructions
  sections.push('ENFORCEMENT:')
  sections.push(
    '- If a player action would naturally lead to Line content, redirect the narrative away from it.'
  )
  sections.push(
    '- If a player action would lead to Veil content, use fade-to-black and skip ahead.'
  )
  sections.push(
    '- Never punish players for your narrative redirections - make the alternative path engaging.'
  )
  sections.push(
    '- If you absolutely cannot avoid referencing a topic, do so with maximum abstraction and brevity.'
  )
  sections.push('')

  return sections.join('\n')
}

/**
 * Build a shorter safety reminder for follow-up prompts
 * (when full context has already been established)
 */
export function buildSafetyReminder(
  settings: AggregatedSafetySettings
): string {
  if (!hasActiveRestrictions(settings)) {
    return ''
  }

  const allLines = [...settings.lines, ...settings.custom_lines]
  const allVeils = [...settings.veils, ...settings.custom_veils]

  const linesList = allLines
    .map((l) => {
      const topic = getTopicById(l)
      return topic ? topic.name : l
    })
    .join(', ')

  const veilsList = allVeils
    .map((v) => {
      const topic = getTopicById(v)
      return topic ? topic.name : v
    })
    .join(', ')

  let reminder = 'SAFETY REMINDER: '

  if (allLines.length > 0) {
    reminder += `Lines (NEVER): ${linesList}. `
  }

  if (allVeils.length > 0) {
    reminder += `Veils (fade-to-black): ${veilsList}.`
  }

  return reminder
}
