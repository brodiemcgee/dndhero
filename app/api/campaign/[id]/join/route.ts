/**
 * Direct Campaign Join API Route
 * Join a campaign directly via campaign ID
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const campaignId = params.id
    const { client: supabase } = createClient(request)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'You must be logged in to join a campaign',
        },
        { status: 401 }
      )
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, name, mode, state')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        {
          error: 'Campaign not found',
        },
        { status: 404 }
      )
    }

    // Check if campaign is accepting new members
    if (campaign.state !== 'setup') {
      return NextResponse.json(
        {
          error: 'This campaign is no longer accepting new members',
        },
        { status: 400 }
      )
    }

    // Check if user was previously removed
    const serviceSupabase = createServiceClient()
    const { data: removedRecord } = await serviceSupabase
      .from('campaign_removed_users')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id)
      .single()

    if (removedRecord) {
      return NextResponse.json(
        {
          error: 'You have been removed from this campaign and cannot rejoin',
        },
        { status: 403 }
      )
    }

    // Check if already a member
    const { data: existingMembership } = await supabase
      .from('campaign_members')
      .select('active')
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id)
      .single()

    if (existingMembership && existingMembership.active) {
      // Already a member - just redirect them
      return NextResponse.json({
        success: true,
        campaign_id: campaignId,
        campaign: {
          id: campaignId,
          name: campaign.name,
          mode: campaign.mode,
        },
        message: 'You are already a member of this campaign',
      })
    }

    // Add user as member (or reactivate)
    if (existingMembership) {
      // Reactivate membership
      const { error: updateError } = await serviceSupabase
        .from('campaign_members')
        .update({
          active: true,
          joined_at: new Date().toISOString(),
        })
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Failed to reactivate membership:', updateError)
        return NextResponse.json(
          {
            error: 'Failed to join campaign',
          },
          { status: 500 }
        )
      }
    } else {
      // Create new membership
      const { error: memberError } = await serviceSupabase.from('campaign_members').insert({
        campaign_id: campaignId,
        user_id: user.id,
        role: 'player',
        active: true,
        joined_at: new Date().toISOString(),
      })

      if (memberError) {
        console.error('Member creation error:', memberError)
        return NextResponse.json(
          {
            error: 'Failed to join campaign',
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      campaign_id: campaignId,
      campaign: {
        id: campaignId,
        name: campaign.name,
        mode: campaign.mode,
      },
    })
  } catch (error) {
    console.error('Join campaign error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
