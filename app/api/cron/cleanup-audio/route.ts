import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Retention periods in days
const RETENTION_DAYS = {
  free: 30,      // 1 month for free tier
  paid: 90,      // 3 months for paid tiers (standard, premium)
}

/**
 * Cron job to clean up expired TTS audio files
 * Runs daily via Vercel Cron
 *
 * Retention policy:
 * - Free tier: 30 days
 * - Paid tiers (standard/premium): 90 days
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()
    const now = new Date()

    // Calculate cutoff dates
    const freeCutoff = new Date(now.getTime() - RETENTION_DAYS.free * 24 * 60 * 60 * 1000)
    const paidCutoff = new Date(now.getTime() - RETENTION_DAYS.paid * 24 * 60 * 60 * 1000)

    console.log('Audio cleanup: Starting...')
    console.log(`Free tier cutoff: ${freeCutoff.toISOString()}`)
    console.log(`Paid tier cutoff: ${paidCutoff.toISOString()}`)

    // Find all DM messages with audio that might be expired
    // We need to check each message's campaign owner's subscription tier
    const { data: messagesWithAudio, error: fetchError } = await supabase
      .from('chat_messages')
      .select(`
        id,
        campaign_id,
        created_at,
        metadata,
        campaigns!inner (
          owner_id
        )
      `)
      .eq('sender_type', 'dm')
      .not('metadata->audio_url', 'is', null)
      .lt('created_at', freeCutoff.toISOString()) // Only check messages older than free tier cutoff

    if (fetchError) {
      console.error('Audio cleanup: Failed to fetch messages:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    if (!messagesWithAudio || messagesWithAudio.length === 0) {
      console.log('Audio cleanup: No expired audio found')
      return NextResponse.json({
        success: true,
        message: 'No expired audio found',
        deleted: 0
      })
    }

    console.log(`Audio cleanup: Found ${messagesWithAudio.length} messages to check`)

    // Get unique owner IDs
    const ownerIds = [...new Set(messagesWithAudio.map(m => (m.campaigns as any).owner_id))]

    // Fetch subscription status for all owners
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('user_id, tier, status')
      .in('user_id', ownerIds)
      .eq('status', 'active')

    // Create a map of user_id -> tier
    const tierMap = new Map<string, string>()
    subscriptions?.forEach(sub => {
      tierMap.set(sub.user_id, sub.tier)
    })

    // Determine which messages to delete
    const toDelete: Array<{ id: string; campaignId: string; audioUrl: string }> = []

    for (const message of messagesWithAudio) {
      const ownerId = (message.campaigns as any).owner_id
      const tier = tierMap.get(ownerId) || 'free'
      const isPaid = tier === 'standard' || tier === 'premium' || tier === 'paid'
      const cutoffDate = isPaid ? paidCutoff : freeCutoff
      const messageDate = new Date(message.created_at)

      if (messageDate < cutoffDate) {
        toDelete.push({
          id: message.id,
          campaignId: message.campaign_id,
          audioUrl: message.metadata?.audio_url
        })
      }
    }

    console.log(`Audio cleanup: ${toDelete.length} messages have expired audio`)

    if (toDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired audio to delete',
        checked: messagesWithAudio.length,
        deleted: 0
      })
    }

    // Delete audio files from storage
    const filesToDelete = toDelete.map(m => `tts/${m.campaignId}/${m.id}.mp3`)

    const { error: deleteError } = await supabase.storage
      .from('audio')
      .remove(filesToDelete)

    if (deleteError) {
      console.error('Audio cleanup: Failed to delete files:', deleteError)
      // Continue to update metadata even if storage delete fails
    }

    // Update message metadata to remove audio_url
    for (const message of toDelete) {
      const { data: currentMessage } = await supabase
        .from('chat_messages')
        .select('metadata')
        .eq('id', message.id)
        .single()

      if (currentMessage) {
        const updatedMetadata = { ...currentMessage.metadata }
        delete updatedMetadata.audio_url
        delete updatedMetadata.audio_duration

        await supabase
          .from('chat_messages')
          .update({ metadata: updatedMetadata })
          .eq('id', message.id)
      }
    }

    console.log(`Audio cleanup: Successfully deleted ${toDelete.length} audio files`)

    return NextResponse.json({
      success: true,
      message: `Deleted ${toDelete.length} expired audio files`,
      checked: messagesWithAudio.length,
      deleted: toDelete.length
    })

  } catch (error) {
    console.error('Audio cleanup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Cleanup failed' },
      { status: 500 }
    )
  }
}
