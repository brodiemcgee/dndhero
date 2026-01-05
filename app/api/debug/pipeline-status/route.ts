import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const campaignId = request.nextUrl.searchParams.get('campaignId')

  if (!campaignId) {
    return NextResponse.json({ error: 'campaignId required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Get campaign with dm_config
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('id, name, dm_config')
    .eq('id', campaignId)
    .single()

  if (campaignError || !campaign) {
    return NextResponse.json({ error: 'Campaign not found', details: campaignError }, { status: 404 })
  }

  // Get characters with currency
  const { data: characters, error: charError } = await supabase
    .from('characters')
    .select('id, name, currency')
    .eq('campaign_id', campaignId)

  // Get recent pending messages
  const { data: pendingMessages } = await supabase
    .from('chat_messages')
    .select('id, content, character_id, character_name, sender_type')
    .eq('campaign_id', campaignId)
    .eq('sender_type', 'player')
    .is('dm_response_id', null)
    .order('created_at', { ascending: false })
    .limit(5)

  const dmConfig = campaign.dm_config || {}
  const pipelineEnabled = dmConfig.use_mechanics_pipeline === true

  return NextResponse.json({
    campaignId,
    campaignName: campaign.name,
    dmConfig,
    pipelineEnabled,
    characters: characters?.map(c => ({
      id: c.id,
      name: c.name,
      currency: c.currency,
    })),
    pendingMessages: pendingMessages?.map(m => ({
      id: m.id,
      characterId: m.character_id,
      characterName: m.character_name,
      content: m.content?.slice(0, 50) + '...',
    })),
  })
}
