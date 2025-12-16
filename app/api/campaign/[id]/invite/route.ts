/**
 * Campaign Invite API Route
 * Generate invite links, codes, and send email invites
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'

const CreateInviteSchema = z.object({
  type: z.enum(['magic_link', 'code', 'email']),
  email: z.string().email().optional(), // Required for email type
  expiresInDays: z.number().min(1).max(30).default(7),
})

/**
 * POST /api/campaign/[id]/invite
 * Create a new invite
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: campaignId } = params
    const body = await request.json()

    // Validate input
    const validation = CreateInviteSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { type, email, expiresInDays } = validation.data

    if (type === 'email' && !email) {
      return NextResponse.json(
        {
          error: 'Email is required for email invites',
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
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json(
        {
          error: 'Only the host can create invites',
        },
        { status: 403 }
      )
    }

    if (membership.role !== 'host') {
      return NextResponse.json(
        {
          error: 'Only the host can create invites',
        },
        { status: 403 }
      )
    }

    // Get campaign name
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('name')
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

    // Calculate expiration
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    // Generate token/code based on type
    let token: string
    let code: string | null = null

    if (type === 'magic_link') {
      token = crypto.randomBytes(32).toString('hex')
    } else if (type === 'code') {
      // Generate 6-character alphanumeric code
      code = crypto.randomBytes(3).toString('hex').toUpperCase()
      token = crypto.randomBytes(16).toString('hex')
    } else {
      // email
      token = crypto.randomBytes(32).toString('hex')
    }

    const serviceSupabase = createServiceClient()

    // Create invite
    const { data: invite, error: inviteError } = await serviceSupabase
      .from('campaign_invites')
      .insert({
        campaign_id: campaignId,
        invite_type: type,
        token,
        code,
        email,
        created_by: user.id,
        expires_at: expiresAt.toISOString(),
        max_uses: type === 'code' ? 10 : 1, // Codes can be used multiple times
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Invite creation error:', inviteError)
      return NextResponse.json(
        {
          error: 'Failed to create invite',
        },
        { status: 500 }
      )
    }

    // TODO: Send email if type is 'email'
    // This would integrate with your email service (SendGrid, Resend, etc.)

    // Generate invite URL
    const baseUrl = request.headers.get('origin') || 'http://localhost:3000'
    let inviteUrl: string

    if (type === 'magic_link') {
      inviteUrl = `${baseUrl}/campaign/join?token=${token}`
    } else if (type === 'code') {
      inviteUrl = `${baseUrl}/campaign/join?code=${code}`
    } else {
      inviteUrl = `${baseUrl}/campaign/join?token=${token}&email=${encodeURIComponent(email!)}`
    }

    return NextResponse.json({
      invite: {
        id: invite.id,
        type: invite.invite_type,
        token: type === 'magic_link' ? token : undefined,
        code: code || undefined,
        url: inviteUrl,
        expiresAt: invite.expires_at,
        campaignName: campaign.name,
      },
    })
  } catch (error) {
    console.error('Create invite error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/campaign/[id]/invite
 * List all invites for a campaign (host only)
 */
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

    // Check if user is host
    const { data: membership } = await supabase
      .from('campaign_members')
      .select('role')
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json(
        {
          error: 'Only the host can view invites',
        },
        { status: 403 }
      )
    }

    if (membership.role !== 'host') {
      return NextResponse.json(
        {
          error: 'Only the host can view invites',
        },
        { status: 403 }
      )
    }

    // Get active invites (not expired, not fully used)
    const { data: invites, error: invitesError } = await supabase
      .from('campaign_invites')
      .select('*')
      .eq('campaign_id', campaignId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (invitesError) {
      return NextResponse.json(
        {
          error: 'Failed to fetch invites',
        },
        { status: 500 }
      )
    }

    // Filter out fully used invites
    const activeInvites = (invites || []).filter(
      (invite) => invite.uses < invite.max_uses
    )

    return NextResponse.json({
      invites: activeInvites,
    })
  } catch (error) {
    console.error('Get invites error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
