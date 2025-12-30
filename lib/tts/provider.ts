/**
 * TTS Provider Abstraction
 * Allows switching between different TTS providers via environment variable
 *
 * Set TTS_PROVIDER env var to: 'openai' | 'elevenlabs'
 * Default: 'openai' (cheaper)
 */

export interface TTSProvider {
  name: string
  generateSpeech(text: string): Promise<ArrayBuffer>
}

export type TTSProviderType = 'openai' | 'elevenlabs'

/**
 * Get the configured TTS provider type
 */
export function getProviderType(): TTSProviderType {
  const provider = process.env.TTS_PROVIDER?.toLowerCase()
  if (provider === 'elevenlabs') return 'elevenlabs'
  return 'openai' // Default to OpenAI (cheaper)
}

/**
 * Check if TTS is configured
 */
export function isTTSConfigured(): boolean {
  const provider = getProviderType()
  if (provider === 'openai') {
    return !!process.env.OPENAI_API_KEY
  }
  return !!process.env.ELEVENLABS_API_KEY
}
