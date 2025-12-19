import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { campaignId, sceneId, content } = await request.json()

    // Validate input
    if (!campaignId || !content?.trim()) {
      return NextResponse.json(
        { error: 'Campaign ID and content are required' },
        { status: 400 }
      )
    }

    const trimmedContent = content.trim()
    if (trimmedContent.length > 5000) {
      return NextResponse.json(
        { error: 'Message too long (max 5000 characters)' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is campaign member
    const { data: membership, error: memberError } = await supabase
      .from('campaign_members')
      .select('role, active')
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id)
      .single()

    if (memberError || !membership?.active) {
      return NextResponse.json(
        { error: 'Not a member of this campaign' },
        { status: 403 }
      )
    }

    // Get user's character in this campaign
    const { data: character } = await supabase
      .from('characters')
      .select('id, name')
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id)
      .single()

    // Use service client for inserts (bypasses RLS for server operations)
    const serviceSupabase = createServiceClient()

    // Get current scene if not provided
    let activeSceneId = sceneId
    if (!activeSceneId) {
      const { data: scene } = await serviceSupabase
        .from('scenes')
        .select('id')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      activeSceneId = scene?.id
    }

    const timestamp = new Date().toISOString()

    // Insert message into chat_messages
    const { data: message, error: insertError } = await serviceSupabase
      .from('chat_messages')
      .insert({
        campaign_id: campaignId,
        scene_id: activeSceneId,
        sender_type: 'player',
        sender_id: user.id,
        character_id: character?.id || null,
        character_name: character?.name || 'Unknown',
        content: trimmedContent,
        message_type: 'chat',
        created_at: timestamp,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Failed to insert chat message:', insertError)
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }

    // Update debounce state
    const { error: upsertError } = await serviceSupabase
      .from('dm_debounce_state')
      .upsert({
        campaign_id: campaignId,
        last_player_message_at: timestamp,
        pending_message_count: 1, // Will be incremented by trigger or next message
        is_processing: false,
        updated_at: timestamp,
      }, {
        onConflict: 'campaign_id',
      })

    if (upsertError) {
      console.error('Failed to update debounce state:', upsertError)
      // Non-fatal - message was still sent
    }

    // Fire-and-forget: Schedule DM response after debounce
    // This is done via Edge Function or a simple setTimeout approach
    // For now, we'll trigger it via a separate endpoint after 3 seconds
    scheduleDebounce(campaignId, timestamp)

    return NextResponse.json({
      success: true,
      messageId: message.id,
    })

  } catch (error) {
    console.error('Chat send error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Simple debounce scheduler using fetch with AbortController
// In production, this should be an Edge Function
async function scheduleDebounce(campaignId: string, timestamp: string) {
  // Fire and forget - don't await
  setTimeout(async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000'

      await fetch(`${baseUrl}/api/chat/trigger-dm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, timestamp }),
      })
    } catch (error) {
      console.error('Failed to trigger DM:', error)
    }
  }, 3000) // 3 second debounce
}
