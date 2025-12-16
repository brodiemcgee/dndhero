/**
 * Campaign Join API Route
 * Join a campaign via invite token or code
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const JoinCampaignSchema = z.object({
  token: z.string().optional(),
  code: z.string().optional(),
  email: z.string().email().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validation = JoinCampaignSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { token, code, email } = validation.data

    if (!token && !code) {
      return NextResponse.json(
        {
          error: 'Either token or code is required',
        },
        { status: 400 }
      )
    }

    const { client: supabase } = createClient(request)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const serviceSupabase = createServiceClient()

    // Find invite
    let inviteQuery = serviceSupabase
      .from('campaign_invites')
      .select('*')
      .gt('expires_at', new Date().toISOString())

    if (token) {
      inviteQuery = inviteQuery.eq('token', token)
    } else if (code) {
      inviteQuery = inviteQuery.eq('code', code)
    }

    const { data: invite, error: inviteError } = await inviteQuery.single()

    if (inviteError || !invite) {
      return NextResponse.json(
        {
          error: 'Invalid or expired invite',
        },
        { status: 404 }
      )
    }

    // Check if invite is email-specific
    if (invite.email && invite.email !== user.email) {
      return NextResponse.json(
        {
          error: 'This invite is for a different email address',
        },
        { status: 403 }
      )
    }

    // Check if invite has been fully used
    if (invite.uses >= invite.max_uses) {
      return NextResponse.json(
        {
          error: 'This invite has been fully used',
        },
        { status: 410 }
      )
    }

    const campaignId = invite.campaign_id

    // Check if user was previously removed
    const { data: removedRecord } = await supabase
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
      return NextResponse.json(
        {
          error: 'You are already a member of this campaign',
        },
        { status: 400 }
      )
    }

    // Get campaign details
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('name, mode')
      .eq('id', campaignId)
      .single()

    if (!campaign) {
      return NextResponse.json(
        {
          error: 'Campaign not found',
        },
        { status: 404 }
      )
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

    // Increment invite uses
    await serviceSupabase
      .from('campaign_invites')
      .update({
        uses: invite.uses + 1,
      })
      .eq('id', invite.id)

    return NextResponse.json({
      success: true,
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
