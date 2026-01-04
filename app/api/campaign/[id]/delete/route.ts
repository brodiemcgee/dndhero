/**
 * Delete Campaign API Route
 * DELETE: Allows host to delete their campaign
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: campaignId } = await context.params
    const { client: supabase } = createClient(request)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is the host of this campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, host_id, name')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.host_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the campaign host can delete this campaign' },
        { status: 403 }
      )
    }

    // Use service client to delete (bypasses RLS)
    const serviceSupabase = createServiceClient()

    // Delete the campaign (cascades to campaign_members, characters, scenes, etc.)
    const { error: deleteError } = await serviceSupabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId)

    if (deleteError) {
      console.error('Failed to delete campaign:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete campaign' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Campaign "${campaign.name}" has been deleted`,
    })
  } catch (error) {
    console.error('Delete campaign error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
