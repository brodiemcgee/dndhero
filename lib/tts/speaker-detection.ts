/**
 * Speaker Detection for Multi-Voice TTS
 * Uses GPT to identify dialogue and assign appropriate voice types
 */

import { SpeakerType } from './elevenlabs-client'

export interface SpeechSegment {
  text: string
  speaker: SpeakerType
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

/**
 * Detect speakers in DM narrative text and split into segments
 * Uses GPT to identify dialogue vs narration and character types
 */
export async function detectSpeakers(text: string): Promise<SpeechSegment[]> {
  if (!OPENAI_API_KEY) {
    // Fallback: return entire text as narrator
    return [{ text, speaker: 'narrator' }]
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a text analyzer for a D&D text-to-speech system. Your job is to split narrative text into segments and identify the speaker type for each segment.

Speaker types available:
- narrator: Third-person narration, scene descriptions, action descriptions
- male_npc: Male character dialogue (wizards, knights, innkeepers, etc.)
- female_npc: Female character dialogue (queens, witches, shopkeepers, etc.)
- creature: Monsters, beasts, dragons, demons, undead
- child: Young characters, halflings with childlike voices
- elderly: Old sages, ancient beings, wise mentors

Rules:
1. Split text at natural speaking boundaries (dialogue vs narration)
2. Quoted speech should be assigned to appropriate character type
3. Narration between quotes should be "narrator"
4. Keep segments in original order
5. Preserve exact text (don't modify wording)

Respond with a JSON array of segments. Example:
Input: "The old wizard strokes his beard. 'You seek the artifact?' he asks. The tavern falls silent."
Output: [
  {"text": "The old wizard strokes his beard.", "speaker": "narrator"},
  {"text": "'You seek the artifact?' he asks.", "speaker": "elderly"},
  {"text": "The tavern falls silent.", "speaker": "narrator"}
]`
          },
          {
            role: 'user',
            content: `Split this text into speaker segments:\n\n${text}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      }),
    })

    if (!response.ok) {
      console.error('GPT speaker detection failed:', response.status)
      return [{ text, speaker: 'narrator' }]
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return [{ text, speaker: 'narrator' }]
    }

    // Parse the JSON response
    const parsed = JSON.parse(content)
    const segments: SpeechSegment[] = parsed.segments || parsed

    // Validate and clean segments
    if (!Array.isArray(segments) || segments.length === 0) {
      return [{ text, speaker: 'narrator' }]
    }

    // Validate each segment has required fields
    const validSegments = segments.filter(
      (seg): seg is SpeechSegment =>
        typeof seg.text === 'string' &&
        seg.text.trim().length > 0 &&
        isValidSpeakerType(seg.speaker)
    )

    if (validSegments.length === 0) {
      return [{ text, speaker: 'narrator' }]
    }

    return validSegments

  } catch (error) {
    console.error('Speaker detection error:', error)
    // Fallback: return entire text as narrator
    return [{ text, speaker: 'narrator' }]
  }
}

/**
 * Simple fallback: Split by quotes (no AI required)
 * Less accurate but faster and free
 */
export function detectSpeakersSimple(text: string): SpeechSegment[] {
  const segments: SpeechSegment[] = []

  // Regex to match quoted speech and surrounding text
  const quoteRegex = /([^"']*)(["'][^"']+["'][^"']*)/g
  let lastIndex = 0
  let match

  while ((match = quoteRegex.exec(text)) !== null) {
    // Text before the quote (narration)
    if (match[1].trim()) {
      segments.push({ text: match[1].trim(), speaker: 'narrator' })
    }

    // The quoted part (dialogue) - default to male_npc
    if (match[2].trim()) {
      segments.push({ text: match[2].trim(), speaker: 'male_npc' })
    }

    lastIndex = quoteRegex.lastIndex
  }

  // Remaining text after last quote
  const remaining = text.slice(lastIndex).trim()
  if (remaining) {
    segments.push({ text: remaining, speaker: 'narrator' })
  }

  // If no segments found, return whole text as narrator
  if (segments.length === 0) {
    return [{ text, speaker: 'narrator' }]
  }

  return segments
}

/**
 * Check if a speaker type is valid
 */
function isValidSpeakerType(speaker: string): speaker is SpeakerType {
  const validTypes = ['narrator', 'male_npc', 'female_npc', 'creature', 'child', 'elderly']
  return validTypes.includes(speaker)
}
