/**
 * Campaign Safety Settings API
 * Returns aggregated Lines & Veils settings for a campaign
 *
 * Privacy: Only returns WHAT restrictions exist, not WHO set them
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient as createClient } from '@/lib/supabase/server'
import {
  aggregateCampaignSafetySettings,
  LinesVeilsSettings,
  AggregatedSafetySettings,
} from '@/lib/safety'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/campaign/[id]/safety-settings
 * Get aggregated safety settings for a campaign
 *
 * Returns anonymous aggregation - shows WHAT restrictions exist,
 * but not WHO set them (standard TTRPG privacy practice)
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: campaignId } = await context.params
    const { client: supabase } = createClient(request)

    // Verify user is authenticated
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

    // Verify user is a member of this campaign
    const { data: membership, error: memberError } = await supabase
      .from('campaign_members')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id)
      .eq('active', true)
      .single()

    if (memberError || !membership) {
      return NextResponse.json(
        { error: 'You are not a member of this campaign' },
        { status: 403 }
      )
    }

    // Get all active campaign members
    const { data: members, error: membersError } = await supabase
      .from('campaign_members')
      .select('user_id')
      .eq('campaign_id', campaignId)
      .eq('active', true)

    if (membersError) {
      console.error('Failed to fetch campaign members:', membersError)
      return NextResponse.json(
        { error: 'Failed to fetch campaign members' },
        { status: 500 }
      )
    }

    if (!members || members.length === 0) {
      // No members, return empty settings
      const emptySettings: AggregatedSafetySettings = {
        lines: [],
        veils: [],
        custom_lines: [],
        custom_veils: [],
      }
      return NextResponse.json({ settings: emptySettings })
    }

    // Get all members' profiles with lines_veils
    const memberIds = members.map((m) => m.user_id)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('lines_veils')
      .in('id', memberIds)

    if (profilesError) {
      console.error('Failed to fetch member profiles:', profilesError)
      return NextResponse.json(
        { error: 'Failed to fetch member settings' },
        { status: 500 }
      )
    }

    // Extract lines_veils settings from each profile
    const memberSettings: (LinesVeilsSettings | null)[] = (profiles || []).map(
      (p) => p.lines_veils as LinesVeilsSettings | null
    )

    // Aggregate settings (anonymous - no attribution)
    const aggregatedSettings = aggregateCampaignSafetySettings(memberSettings)

    return NextResponse.json({
      settings: aggregatedSettings,
    })
  } catch (error) {
    console.error('Campaign safety settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
