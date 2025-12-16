/**
 * Create Campaign API Route
 * Creates a new campaign and makes the user the host
 */

import { createRouteClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const CreateCampaignSchema = z.object({
  name: z.string().min(3, 'Campaign name must be at least 3 characters').max(100),
  setting: z.string().min(10, 'Setting description must be at least 10 characters').max(500),
  mode: z.enum(['single_player', 'vote', 'first_response_wins', 'freeform']),
  art_style: z.string().min(5).max(200).optional(),
  dm_config: z
    .object({
      tone: z.enum(['serious', 'balanced', 'humorous']).optional(),
      difficulty: z.enum(['easy', 'normal', 'hard', 'deadly']).optional(),
      house_rules: z.array(z.string()).optional(),
      narrative_style: z.enum(['concise', 'descriptive', 'epic']).optional(),
    })
    .optional(),
  strict_mode: z.boolean().default(false),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validation = CreateCampaignSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { client: supabase, getCookiesToSet } = createRouteClient(request)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          debug: {
            authError: authError?.message
          }
        },
        { status: 401 }
      )
    }

    // Use service client for profile check and campaign creation
    const serviceSupabase = createServiceClient()

    // Ensure user has a profile (create if missing)
    const { data: existingProfile } = await serviceSupabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!existingProfile) {
      // Create profile for user
      await serviceSupabase.from('profiles').insert({
        id: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
        email: user.email,
      })
    }

    // Check campaign quota
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Check campaign quota - count campaigns created this month
    const { count: campaignsThisMonth } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('host_id', user.id)
      .gte('created_at', startOfMonth.toISOString())

    // Get user's entitlements - use defaults if doesn't exist
    const { data: entitlements } = await supabase
      .from('entitlements')
      .select('max_campaigns_per_month')
      .eq('user_id', user.id)
      .maybeSingle()

    const maxCampaigns = entitlements?.max_campaigns_per_month || 2 // Default free tier
    const currentCount = campaignsThisMonth || 0

    if (maxCampaigns !== -1 && currentCount >= maxCampaigns) {
      return NextResponse.json(
        {
          error: 'Campaign limit reached',
          message: `You've reached your monthly campaign limit (${maxCampaigns}). Upgrade to create more campaigns.`,
          limit: maxCampaigns,
          current: currentCount,
        },
        { status: 403 }
      )
    }

    const campaignData = validation.data

    // Create campaign
    const { data: campaign, error: createError } = await serviceSupabase
      .from('campaigns')
      .insert({
        name: campaignData.name,
        setting: campaignData.setting,
        mode: campaignData.mode,
        art_style: campaignData.art_style || 'Fantasy pixel art',
        dm_config: campaignData.dm_config || {},
        strict_mode: campaignData.strict_mode,
        state: 'setup',
        host_id: user.id,
      })
      .select()
      .single()

    if (createError || !campaign) {
      console.error('Campaign creation error:', createError)
      return NextResponse.json(
        {
          error: 'Failed to create campaign',
          details: createError?.message,
        },
        { status: 500 }
      )
    }

    // Add user as host member
    const { error: memberError } = await serviceSupabase.from('campaign_members').insert({
      campaign_id: campaign.id,
      user_id: user.id,
      role: 'host',
      active: true,
      joined_at: new Date().toISOString(),
    })

    if (memberError) {
      console.error('Member creation error:', memberError)
      // Rollback campaign creation
      await serviceSupabase.from('campaigns').delete().eq('id', campaign.id)

      return NextResponse.json(
        {
          error: 'Failed to add host to campaign',
        },
        { status: 500 }
      )
    }

    // No need to update usage counters - we're counting campaigns directly

    const response = NextResponse.json({
      campaign,
    })

    // Set any cookies that need to be updated (for session refresh)
    const cookiesToSet = getCookiesToSet()
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    return response
  } catch (error) {
    console.error('Create campaign error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
