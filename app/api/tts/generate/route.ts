import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getProviderType, isTTSConfigured } from '@/lib/tts/provider'
import { detectSpeakers } from '@/lib/tts/speaker-detection'
import { generateMultiVoiceSpeech, estimateAudioDuration } from '@/lib/tts/elevenlabs-client'
import { generateSpeechOpenAI } from '@/lib/tts/openai-tts'

/**
 * On-demand TTS generation endpoint
 * Called when user clicks "Play Voice" button
 * Returns cached audio URL if already generated, otherwise generates and caches
 *
 * Provider controlled by TTS_PROVIDER env var: 'openai' (default) | 'elevenlabs'
 */
export async function POST(request: NextRequest) {
  try {
    const { messageId, speed } = await request.json()

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    // Validate speed if provided (OpenAI supports 0.25 to 4.0, we limit to 0.5-1.5)
    const ttsSpeed = typeof speed === 'number' ? Math.min(Math.max(speed, 0.5), 1.5) : 1.0

    const supabase = createServiceClient()

    // Fetch the message
    const { data: message, error: fetchError } = await supabase
      .from('chat_messages')
      .select('id, campaign_id, content, metadata, sender_type')
      .eq('id', messageId)
      .single()

    if (fetchError || !message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    // Only generate TTS for DM messages
    if (message.sender_type !== 'dm') {
      return NextResponse.json(
        { error: 'TTS only available for DM messages' },
        { status: 400 }
      )
    }

    // Check if audio already exists (cached)
    if (message.metadata?.audio_url) {
      return NextResponse.json({
        audioUrl: message.metadata.audio_url,
        duration: message.metadata.audio_duration || null,
        cached: true
      })
    }

    // Check for API key based on provider
    if (!isTTSConfigured()) {
      return NextResponse.json(
        { error: 'TTS not configured' },
        { status: 503 }
      )
    }

    const provider = getProviderType()
    let audioArrayBuffer: ArrayBuffer

    if (provider === 'elevenlabs') {
      // ElevenLabs: Multi-voice with speaker detection
      console.log('TTS [ElevenLabs]: Starting speaker detection for message:', messageId)
      const segments = await detectSpeakers(message.content)
      console.log('TTS [ElevenLabs]: Speaker detection complete, segments:', segments.length)

      console.log('TTS [ElevenLabs]: Generating multi-voice speech...')
      audioArrayBuffer = await generateMultiVoiceSpeech(segments)
    } else {
      // OpenAI: Single voice, simpler and cheaper
      console.log('TTS [OpenAI]: Generating speech for message:', messageId, 'speed:', ttsSpeed)
      audioArrayBuffer = await generateSpeechOpenAI(message.content, { speed: ttsSpeed })
    }

    console.log('TTS: Audio generated, size:', audioArrayBuffer.byteLength)

    // Convert ArrayBuffer to Buffer for Node.js/Supabase compatibility
    const audioBuffer = Buffer.from(audioArrayBuffer)

    // Upload to Supabase Storage
    const audioPath = `tts/${message.campaign_id}/${messageId}.mp3`
    console.log('TTS: Uploading to storage at path:', audioPath)

    const { error: uploadError } = await supabase.storage
      .from('audio')
      .upload(audioPath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      })

    if (uploadError) {
      console.error('TTS upload error:', uploadError)
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(audioPath)

    const audioDuration = estimateAudioDuration(audioArrayBuffer.byteLength)

    // Update message metadata with audio URL (cache for future requests)
    const updatedMetadata = {
      ...message.metadata,
      audio_url: publicUrl,
      audio_duration: audioDuration
    }

    await supabase
      .from('chat_messages')
      .update({ metadata: updatedMetadata })
      .eq('id', messageId)

    console.log('TTS: Generation complete, URL:', publicUrl)

    return NextResponse.json({
      audioUrl: publicUrl,
      duration: audioDuration,
      cached: false
    })

  } catch (error) {
    console.error('TTS generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'TTS generation failed' },
      { status: 500 }
    )
  }
}
