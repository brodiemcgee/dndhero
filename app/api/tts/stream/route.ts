import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getProviderType, isTTSConfigured } from '@/lib/tts/provider'
import { generateSpeechOpenAIStream } from '@/lib/tts/openai-tts'
import { estimateAudioDuration } from '@/lib/tts/elevenlabs-client'

/**
 * Streaming TTS endpoint
 * Streams audio directly from OpenAI to browser for immediate playback
 * Also caches the audio in background for future requests
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')
    const speed = parseFloat(searchParams.get('speed') || '1.0')

    if (!messageId) {
      return new Response('Message ID required', { status: 400 })
    }

    // Validate speed (0.5 to 1.5)
    const ttsSpeed = Math.min(Math.max(speed, 0.5), 1.5)

    const supabase = createServiceClient()

    // Fetch the message
    const { data: message, error: fetchError } = await supabase
      .from('chat_messages')
      .select('id, campaign_id, content, metadata, sender_type')
      .eq('id', messageId)
      .single()

    if (fetchError || !message) {
      return new Response('Message not found', { status: 404 })
    }

    if (message.sender_type !== 'dm') {
      return new Response('TTS only available for DM messages', { status: 400 })
    }

    // If cached audio exists, redirect to it
    if (message.metadata?.audio_url) {
      return Response.redirect(message.metadata.audio_url, 302)
    }

    if (!isTTSConfigured()) {
      return new Response('TTS not configured', { status: 503 })
    }

    const provider = getProviderType()

    if (provider === 'elevenlabs') {
      // ElevenLabs doesn't support streaming easily, redirect to generate endpoint
      return new Response('Use /api/tts/generate for ElevenLabs', { status: 400 })
    }

    // Stream from OpenAI
    console.log('TTS Stream [OpenAI]: Starting for message:', messageId, 'speed:', ttsSpeed)

    const { stream } = await generateSpeechOpenAIStream(message.content, { speed: ttsSpeed })

    // Tee the stream - one for response, one for caching
    const [responseStream, cacheStream] = stream.tee()

    // Background task to upload to storage (fire and forget)
    collectAndCache(cacheStream, message, supabase).catch(err => {
      console.error('TTS cache error:', err)
    })

    // Return streaming response
    return new Response(responseStream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    })

  } catch (error) {
    console.error('TTS stream error:', error)
    return new Response(
      error instanceof Error ? error.message : 'TTS streaming failed',
      { status: 500 }
    )
  }
}

/**
 * Collect streamed audio and upload to storage for caching
 */
async function collectAndCache(
  stream: ReadableStream<Uint8Array>,
  message: { id: string; campaign_id: string; metadata: Record<string, unknown> | null },
  supabase: ReturnType<typeof createServiceClient>
) {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) chunks.push(value)
    }

    // Combine chunks into single buffer
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    const audioBuffer = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      audioBuffer.set(chunk, offset)
      offset += chunk.length
    }

    // Upload to storage
    const audioPath = `tts/${message.campaign_id}/${message.id}.mp3`

    const { error: uploadError } = await supabase.storage
      .from('audio')
      .upload(audioPath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      })

    if (uploadError) {
      console.error('TTS cache upload error:', uploadError)
      return
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(audioPath)

    const audioDuration = estimateAudioDuration(audioBuffer.byteLength)

    // Update message metadata
    const updatedMetadata = {
      ...message.metadata,
      audio_url: publicUrl,
      audio_duration: audioDuration
    }

    await supabase
      .from('chat_messages')
      .update({ metadata: updatedMetadata })
      .eq('id', message.id)

    console.log('TTS Stream: Cached audio for message:', message.id)

  } catch (error) {
    console.error('TTS cache collection error:', error)
  }
}
