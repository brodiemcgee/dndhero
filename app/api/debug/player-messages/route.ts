import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const campaignId = request.nextUrl.searchParams.get('campaignId')

  if (!campaignId) {
    return NextResponse.json({ error: 'campaignId required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Get recent player messages (last 10)
  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('id, content, character_id, character_name, sender_type, sender_id, dm_response_id, created_at')
    .eq('campaign_id', campaignId)
    .eq('sender_type', 'player')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    return NextResponse.json({ error: 'Query failed', details: error }, { status: 500 })
  }

  return NextResponse.json({
    totalMessages: messages?.length || 0,
    messages: messages?.map(m => ({
      id: m.id,
      content: m.content?.slice(0, 100) + '...',
      character_id: m.character_id,
      character_name: m.character_name,
      sender_id: m.sender_id,
      dm_response_id: m.dm_response_id,
      created_at: m.created_at,
      hasPendingResponse: m.dm_response_id === null,
    })),
  })
}
