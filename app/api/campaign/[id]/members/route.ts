/**
 * Campaign Members API Route
 * Get campaign members list
 */

import { createRouteClient as createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: campaignId } = params
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
    const { data: membership } = await supabase
      .from('campaign_members')
      .select('active')
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id)
      .single()

    if (!membership || !membership.active) {
      return NextResponse.json(
        {
          error: 'Not a member of this campaign',
        },
        { status: 403 }
      )
    }

    // Get all active members
    const { data: members, error: membersError } = await supabase
      .from('campaign_members')
      .select(
        `
        user_id,
        role,
        joined_at,
        profiles (
          username,
          avatar_url
        )
      `
      )
      .eq('campaign_id', campaignId)
      .eq('active', true)
      .order('joined_at', { ascending: true })

    if (membersError) {
      return NextResponse.json(
        {
          error: 'Failed to fetch members',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      members: members || [],
    })
  } catch (error) {
    console.error('Get members error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
