/**
 * Remove Campaign Member API Route
 * Remove a member from campaign (host only)
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const RemoveMemberSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().optional(),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: campaignId } = params
    const body = await request.json()

    // Validate input
    const validation = RemoveMemberSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { userId, reason } = validation.data

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

    // Check if current user is host
    const { data: hostMembership } = await supabase
      .from('campaign_members')
      .select('role')
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id)
      .single()

    if (!hostMembership || hostMembership.role !== 'host') {
      return NextResponse.json(
        {
          error: 'Only the host can remove members',
        },
        { status: 403 }
      )
    }

    // Can't remove yourself
    if (userId === user.id) {
      return NextResponse.json(
        {
          error: 'You cannot remove yourself from the campaign',
        },
        { status: 400 }
      )
    }

    // Check if user is a member
    const { data: targetMembership } = await supabase
      .from('campaign_members')
      .select('active')
      .eq('campaign_id', campaignId)
      .eq('user_id', userId)
      .single()

    if (!targetMembership || !targetMembership.active) {
      return NextResponse.json(
        {
          error: 'User is not a member of this campaign',
        },
        { status: 404 }
      )
    }

    const serviceSupabase = createServiceClient()

    // Deactivate membership
    const { error: deactivateError } = await serviceSupabase
      .from('campaign_members')
      .update({
        active: false,
      })
      .eq('campaign_id', campaignId)
      .eq('user_id', userId)

    if (deactivateError) {
      console.error('Deactivate member error:', deactivateError)
      return NextResponse.json(
        {
          error: 'Failed to remove member',
        },
        { status: 500 }
      )
    }

    // Add to removed users list (prevents rejoining)
    const { error: removedError } = await serviceSupabase
      .from('campaign_removed_users')
      .insert({
        campaign_id: campaignId,
        user_id: userId,
        removed_by: user.id,
        reason: reason || null,
        removed_at: new Date().toISOString(),
      })

    if (removedError) {
      console.error('Add to removed users error:', removedError)
      // Non-fatal - member is still deactivated
    }

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully',
    })
  } catch (error) {
    console.error('Remove member error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
