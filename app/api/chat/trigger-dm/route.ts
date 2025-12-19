import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateNarrativeStreaming } from '@/lib/ai-dm/openai-client'
import { detectSpeakers } from '@/lib/tts/speaker-detection'
import { generateMultiVoiceSpeech, estimateAudioDuration } from '@/lib/tts/elevenlabs-client'

export async function POST(request: NextRequest) {
  try {
    const { campaignId, timestamp } = await request.json()

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Check debounce state - only proceed if this is still the latest timestamp
    const { data: debounceState } = await supabase
      .from('dm_debounce_state')
      .select('*')
      .eq('campaign_id', campaignId)
      .single()

    // If there's a newer message, skip this trigger (debounce reset)
    // Compare as Date objects since PostgreSQL and JS use different timestamp formats
    if (debounceState && timestamp) {
      const dbTime = new Date(debounceState.last_player_message_at).getTime()
      const reqTime = new Date(timestamp).getTime()
      if (Math.abs(dbTime - reqTime) > 1000) { // Allow 1 second tolerance
        return NextResponse.json({ skipped: true, reason: 'newer_message' })
      }
    }

    // If already processing, skip
    if (debounceState?.is_processing) {
      return NextResponse.json({ skipped: true, reason: 'already_processing' })
    }

    // Set processing flag
    await supabase
      .from('dm_debounce_state')
      .update({ is_processing: true, updated_at: new Date().toISOString() })
      .eq('campaign_id', campaignId)

    try {
      // Get campaign and scene info
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('id, name, setting, dm_config, strict_mode')
        .eq('id', campaignId)
        .single()

      if (!campaign) {
        throw new Error('Campaign not found')
      }

      // Get active scene
      const { data: scene } = await supabase
        .from('scenes')
        .select('id, name, description, location, environment, current_state')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Get all pending messages (player messages without DM response)
      const { data: pendingMessages } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('sender_type', 'player')
        .is('dm_response_id', null)
        .order('created_at', { ascending: true })

      if (!pendingMessages || pendingMessages.length === 0) {
        // No pending messages, reset state and exit
        await supabase
          .from('dm_debounce_state')
          .update({
            is_processing: false,
            pending_message_count: 0,
            updated_at: new Date().toISOString()
          })
          .eq('campaign_id', campaignId)

        return NextResponse.json({ skipped: true, reason: 'no_pending_messages' })
      }

      // Get recent chat history (last 20 messages for context)
      const { data: recentHistory } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })
        .limit(20)

      // Get characters in the campaign
      const { data: characters } = await supabase
        .from('characters')
        .select('id, name, class, level, race')
        .eq('campaign_id', campaignId)

      // Build AI prompt
      const prompt = buildChatPrompt({
        campaign,
        scene,
        characters: characters || [],
        pendingMessages,
        recentHistory: (recentHistory || []).reverse(),
      })

      // Create placeholder DM message immediately
      const { data: dmMessage, error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          campaign_id: campaignId,
          scene_id: scene?.id,
          sender_type: 'dm',
          sender_id: null,
          character_id: null,
          character_name: 'Dungeon Master',
          content: '...',  // Placeholder while streaming
          message_type: 'narrative',
          metadata: { streaming: true },
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (insertError) {
        throw new Error(`Failed to insert DM response: ${insertError.message}`)
      }

      // Stream AI response and update message progressively
      let lastUpdateTime = Date.now()
      const updateInterval = 500 // Update DB every 500ms

      const finalContent = await generateNarrativeStreaming(
        prompt,
        async (chunk, fullText) => {
          // Throttle DB updates to avoid too many writes
          const now = Date.now()
          if (now - lastUpdateTime >= updateInterval) {
            await supabase
              .from('chat_messages')
              .update({ content: fullText })
              .eq('id', dmMessage.id)
            lastUpdateTime = now
          }
        }
      )

      // Generate TTS audio for the DM response (runs in background, non-blocking)
      let audioUrl: string | null = null
      let audioDuration: number | null = null

      try {
        // Only generate TTS if API key is available
        const hasElevenLabsKey = !!process.env.ELEVENLABS_API_KEY
        console.log('TTS: ELEVENLABS_API_KEY present:', hasElevenLabsKey)

        if (hasElevenLabsKey) {
          console.log('TTS: Starting speaker detection...')
          // Detect speakers in the DM's response
          const segments = await detectSpeakers(finalContent)
          console.log('TTS: Speaker detection complete, segments:', segments.length)

          console.log('TTS: Generating multi-voice speech...')
          // Generate multi-voice audio
          const audioBuffer = await generateMultiVoiceSpeech(segments)
          console.log('TTS: Audio generated, size:', audioBuffer.byteLength)

          // Upload to Supabase Storage
          const audioPath = `tts/${campaignId}/${dmMessage.id}.mp3`
          console.log('TTS: Uploading to storage at path:', audioPath)
          const { error: uploadError } = await supabase.storage
            .from('audio')
            .upload(audioPath, audioBuffer, {
              contentType: 'audio/mpeg',
              upsert: true,
            })

          if (uploadError) {
            console.error('TTS upload error:', uploadError)
          } else {
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('audio')
              .getPublicUrl(audioPath)

            audioUrl = publicUrl
            audioDuration = estimateAudioDuration(audioBuffer.byteLength)
            console.log('TTS: Upload successful, URL:', audioUrl)
          }
        } else {
          console.log('TTS: Skipping - no API key')
        }
      } catch (ttsError) {
        // TTS is optional - log error but don't fail the response
        console.error('TTS generation error:', ttsError instanceof Error ? ttsError.message : ttsError)
      }

      // Final update with complete content and optional audio
      const messageMetadata: Record<string, any> = { streaming: false }
      if (audioUrl) {
        messageMetadata.audio_url = audioUrl
        messageMetadata.audio_duration = audioDuration
      }

      await supabase
        .from('chat_messages')
        .update({
          content: finalContent,
          metadata: messageMetadata
        })
        .eq('id', dmMessage.id)

      // Link pending messages to this DM response
      const pendingIds = pendingMessages.map(m => m.id)
      await supabase
        .from('chat_messages')
        .update({ dm_response_id: dmMessage.id })
        .in('id', pendingIds)

      // Reset debounce state
      await supabase
        .from('dm_debounce_state')
        .update({
          is_processing: false,
          last_dm_response_at: new Date().toISOString(),
          pending_message_count: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('campaign_id', campaignId)

      return NextResponse.json({
        success: true,
        messageId: dmMessage.id,
        respondedTo: pendingIds.length,
      })

    } catch (error) {
      // Reset processing flag on error
      await supabase
        .from('dm_debounce_state')
        .update({ is_processing: false, updated_at: new Date().toISOString() })
        .eq('campaign_id', campaignId)

      throw error
    }

  } catch (error) {
    console.error('DM trigger error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

interface ChatContext {
  campaign: {
    id: string
    name: string
    setting: string | null
    dm_config: any
    strict_mode: boolean | null
  }
  scene: {
    id: string
    name: string
    description: string | null
    location: string | null
    environment: string | null
    current_state: string | null
  } | null
  characters: Array<{
    id: string
    name: string
    class: string | null
    level: number | null
    race: string | null
  }>
  pendingMessages: Array<{
    id: string
    character_name: string | null
    content: string
    created_at: string
  }>
  recentHistory: Array<{
    sender_type: string
    character_name: string | null
    content: string
  }>
}

function buildChatPrompt(context: ChatContext): string {
  const { campaign, scene, characters, pendingMessages, recentHistory } = context

  const dmConfig = campaign.dm_config || {}
  const tone = dmConfig.tone || 'balanced'
  const narrativeStyle = dmConfig.narrative_style || 'descriptive'

  let prompt = `You are an expert Dungeon Master for a D&D 5th Edition game.

CAMPAIGN: ${campaign.name}
SETTING: ${campaign.setting || 'Classic fantasy'}
TONE: ${tone}
STYLE: ${narrativeStyle}

`

  if (scene) {
    prompt += `CURRENT SCENE: ${scene.name}
Location: ${scene.location || 'Unknown'}
Environment: ${scene.environment || 'Standard'}
${scene.description ? `\nDescription: ${scene.description}` : ''}
${scene.current_state ? `\nCurrent State: ${scene.current_state}` : ''}

`
  }

  if (characters.length > 0) {
    prompt += `PLAYER CHARACTERS:\n`
    characters.forEach(char => {
      prompt += `- ${char.name}: Level ${char.level || 1} ${char.race || ''} ${char.class || 'Adventurer'}\n`
    })
    prompt += '\n'
  }

  // Include recent history for context
  if (recentHistory.length > 0) {
    prompt += `RECENT CONVERSATION:\n`
    recentHistory.slice(-10).forEach(msg => {
      const speaker = msg.sender_type === 'dm' ? 'DM' : (msg.character_name || 'Player')
      prompt += `${speaker}: ${msg.content}\n`
    })
    prompt += '\n'
  }

  // The messages to respond to
  prompt += `PLAYER MESSAGES TO RESPOND TO:\n`
  pendingMessages.forEach(msg => {
    prompt += `${msg.character_name || 'Player'}: ${msg.content}\n`
  })

  prompt += `
YOUR TASK:
Respond to the player messages above as the Dungeon Master. Consider ALL the messages together - they may be from the same player adding more detail, or from multiple players acting together.

Guidelines:
- Be descriptive but concise (2-4 paragraphs max)
- Use second person ("you") when addressing players
- React to what players say and do
- Describe the environment and NPC reactions
- Keep the story engaging and moving forward
- If players attempt actions, narrate the results (assume reasonable success for simple actions)
- For risky actions, you may describe partial success or interesting consequences

Write your response as narrative prose only. Do not use JSON or any special formatting.`

  return prompt
}

