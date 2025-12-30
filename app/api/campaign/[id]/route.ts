/**
 * Campaign Detail API Route
 * Get and update campaign information
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ART_STYLES } from '@/lib/ai-dm/art-styles'

const UpdateCampaignSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  setting: z.string().min(10).max(500).optional(),
  art_style: z.enum(ART_STYLES).optional(),
  dm_config: z
    .object({
      tone: z.enum(['serious', 'balanced', 'humorous']).optional(),
      difficulty: z.enum(['easy', 'normal', 'hard', 'deadly']).optional(),
      house_rules: z.array(z.string()).optional(),
      narrative_style: z.enum(['concise', 'descriptive', 'epic']).optional(),
    })
    .optional(),
  strict_mode: z.boolean().optional(),
})

/**
 * GET /api/campaign/[id]
 * Get campaign details
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
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

    // Check if user is a member
    const { data: membership, error: membershipError } = await supabase
      .from('campaign_members')
      .select('role, active')
      .eq('campaign_id', id)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        {
          error: 'Not a member of this campaign',
        },
        { status: 403 }
      )
    }

    if (membership.active === false) {
      return NextResponse.json(
        {
          error: 'Not an active member of this campaign',
        },
        { status: 403 }
      )
    }

    // Get campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        {
          error: 'Campaign not found',
        },
        { status: 404 }
      )
    }

    // Get members
    const { data: members } = await supabase
      .from('campaign_members')
      .select(
        `
        user_id,
        role,
        active,
        joined_at,
        profiles (
          username,
          avatar_url
        )
      `
      )
      .eq('campaign_id', id)
      .eq('active', true)

    return NextResponse.json({
      campaign: {
        ...campaign,
        user_role: membership.role,
        members: members || [],
      },
    })
  } catch (error) {
    console.error('Get campaign error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/campaign/[id]
 * Update campaign (host only)
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // Validate input
    const validation = UpdateCampaignSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
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

    // Check if user is host
    const { data: membership } = await supabase
      .from('campaign_members')
      .select('role')
      .eq('campaign_id', id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json(
        {
          error: 'Only the host can update campaign settings',
        },
        { status: 403 }
      )
    }

    if (membership.role !== 'host') {
      return NextResponse.json(
        {
          error: 'Only the host can update campaign settings',
        },
        { status: 403 }
      )
    }

    const updates = validation.data

    // Update campaign
    const { data: updatedCampaign, error: updateError } = await supabase
      .from('campaigns')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        {
          error: updateError.message,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      campaign: updatedCampaign,
    })
  } catch (error) {
    console.error('Update campaign error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
