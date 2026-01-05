import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const campaignId = request.nextUrl.searchParams.get('campaignId')

  if (!campaignId) {
    return NextResponse.json({ error: 'campaignId required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Get the most recent DM message
  const { data: message, error } = await supabase
    .from('chat_messages')
    .select('id, content, metadata, created_at')
    .eq('campaign_id', campaignId)
    .eq('sender_type', 'dm')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !message) {
    return NextResponse.json({ error: 'No DM message found', details: error }, { status: 404 })
  }

  return NextResponse.json({
    messageId: message.id,
    createdAt: message.created_at,
    contentPreview: message.content?.slice(0, 200) + '...',
    metadata: message.metadata,
    pipelineDebug: message.metadata?.pipelineDebug || 'not present',
  })
}
