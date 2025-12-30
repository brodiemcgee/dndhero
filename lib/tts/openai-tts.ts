/**
 * OpenAI Text-to-Speech Client
 * Much cheaper than ElevenLabs (~$15/1M chars vs ~$300/1M)
 *
 * Voices available:
 * - alloy: Neutral, balanced
 * - echo: Warm, conversational
 * - fable: British, expressive (good for narration)
 * - onyx: Deep, authoritative (good for DM)
 * - nova: Friendly, upbeat
 * - shimmer: Clear, gentle
 */

// Voice for DM narration - fable has a British, expressive storytelling quality
const DM_VOICE = 'fable'

// Model options: 'tts-1' (faster, cheaper) or 'tts-1-hd' (higher quality)
const TTS_MODEL = 'tts-1'

/**
 * Get API key from environment
 */
function getApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }
  return apiKey
}

/**
 * Generate speech using OpenAI TTS
 * Simple single-voice generation (no multi-voice complexity)
 */
export async function generateSpeechOpenAI(
  text: string,
  options?: {
    voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
    model?: 'tts-1' | 'tts-1-hd'
    speed?: number // 0.25 to 4.0, default 1.0
  }
): Promise<ArrayBuffer> {
  const apiKey = getApiKey()

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options?.model || TTS_MODEL,
      input: text,
      voice: options?.voice || DM_VOICE,
      speed: options?.speed || 1.0,
      response_format: 'mp3',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI TTS API error: ${response.status} ${error}`)
  }

  return response.arrayBuffer()
}

/**
 * Generate speech using OpenAI TTS with streaming response
 * Returns a ReadableStream for immediate playback
 */
export async function generateSpeechOpenAIStream(
  text: string,
  options?: {
    voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
    model?: 'tts-1' | 'tts-1-hd'
    speed?: number
  }
): Promise<{ stream: ReadableStream<Uint8Array>; response: Response }> {
  const apiKey = getApiKey()

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options?.model || TTS_MODEL,
      input: text,
      voice: options?.voice || DM_VOICE,
      speed: options?.speed || 1.0,
      response_format: 'mp3',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI TTS API error: ${response.status} ${error}`)
  }

  if (!response.body) {
    throw new Error('No response body from OpenAI TTS')
  }

  return { stream: response.body, response }
}

/**
 * Estimate cost for OpenAI TTS
 * $15 per 1M characters for tts-1
 * $30 per 1M characters for tts-1-hd
 */
export function estimateCost(text: string, model: 'tts-1' | 'tts-1-hd' = 'tts-1'): number {
  const chars = text.length
  const pricePerMillion = model === 'tts-1-hd' ? 30 : 15
  return (chars / 1_000_000) * pricePerMillion
}
