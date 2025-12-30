/**
 * ElevenLabs Text-to-Speech Client
 * Server-side only - handles TTS generation for DM messages
 */

// Voice configuration for different speaker types
export const VOICE_IDS = {
  narrator: 'pFZP5JQG7iQjIQuC4Bku',     // Lily - British female, warm narration (BG3-style)
  male_npc: 'ErXwobaYiN019PkySvjV',      // Antoni - Friendly male character
  female_npc: '21m00Tcm4TlvDq8ikWAM',    // Rachel - Clear female character
  creature: 'VR6AewLTigWG4xSOukaG',       // Arnold - Gravelly, ominous
  child: 'AZnzlk1XvdvUeBnXmlld',         // Domi - Young voice
  elderly: 'pqHfZKP75CvOlQylNhV4',       // Bill - Older male voice
} as const

export type SpeakerType = keyof typeof VOICE_IDS

export interface SpeechSegment {
  text: string
  speaker: SpeakerType
}

/**
 * Get API key from environment
 */
function getApiKey(): string {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY environment variable is not set')
  }
  return apiKey
}

/**
 * Generate speech for a single text segment
 */
export async function generateSpeech(
  text: string,
  voiceId: string,
  options?: {
    modelId?: string
    stability?: number
    similarityBoost?: number
  }
): Promise<ArrayBuffer> {
  const apiKey = getApiKey()

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: options?.modelId || 'eleven_turbo_v2_5', // Fast model for real-time
        voice_settings: {
          stability: options?.stability ?? 0.5,
          similarity_boost: options?.similarityBoost ?? 0.75,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`ElevenLabs API error: ${response.status} ${error}`)
  }

  return response.arrayBuffer()
}

/**
 * Generate speech for multiple segments with different voices
 * Concatenates audio buffers into a single output
 * Processes segments sequentially to avoid ElevenLabs concurrent request limits
 */
export async function generateMultiVoiceSpeech(
  segments: SpeechSegment[]
): Promise<ArrayBuffer> {
  if (segments.length === 0) {
    throw new Error('No segments provided for speech generation')
  }

  // If only one segment, generate directly
  if (segments.length === 1) {
    const voiceId = VOICE_IDS[segments[0].speaker] || VOICE_IDS.narrator
    return generateSpeech(segments[0].text, voiceId)
  }

  // Generate audio for each segment sequentially to avoid rate limits
  // ElevenLabs free/basic tiers have a 4 concurrent request limit
  const audioBuffers: ArrayBuffer[] = []
  for (const segment of segments) {
    const voiceId = VOICE_IDS[segment.speaker] || VOICE_IDS.narrator
    const buffer = await generateSpeech(segment.text, voiceId)
    audioBuffers.push(buffer)
  }

  // Concatenate all audio buffers
  return concatenateAudioBuffers(audioBuffers)
}

/**
 * Concatenate multiple audio buffers into one
 * Note: This is a simple concatenation that works for MP3 files
 */
function concatenateAudioBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
  const totalLength = buffers.reduce((sum, buf) => sum + buf.byteLength, 0)
  const result = new Uint8Array(totalLength)

  let offset = 0
  for (const buffer of buffers) {
    result.set(new Uint8Array(buffer), offset)
    offset += buffer.byteLength
  }

  return result.buffer
}

/**
 * Estimate audio duration from buffer size
 * MP3 at 128kbps ≈ 16KB per second
 */
export function estimateAudioDuration(bufferSize: number): number {
  const bytesPerSecond = 16000 // ~128kbps
  return bufferSize / bytesPerSecond
}

/**
 * Get available voices (for future voice selection feature)
 */
export async function getAvailableVoices(): Promise<any[]> {
  const apiKey = getApiKey()

  const response = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: {
      'xi-api-key': apiKey,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch voices: ${response.status}`)
  }

  const data = await response.json()
  return data.voices || []
}
