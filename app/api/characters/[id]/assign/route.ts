/**
 * Assign Character to Campaign API Route
 * POST: Assigns a standalone character to a campaign
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const AssignSchema = z.object({
  campaign_id: z.string().uuid(),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validation = AssignSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid campaign_id' },
        { status: 400 }
      )
    }

    const { campaign_id } = validation.data
    const characterId = params.id

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

    // Get the character and verify ownership (including level for validation)
    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, user_id, campaign_id, name, level')
      .eq('id', characterId)
      .single()

    if (charError || !character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      )
    }

    if (character.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not own this character' },
        { status: 403 }
      )
    }

    // Check if character is already in a campaign
    if (character.campaign_id) {
      return NextResponse.json(
        { error: 'Character is already assigned to a campaign. Remove from current campaign first.' },
        { status: 400 }
      )
    }

    // Verify user is a member of the target campaign
    const { data: membership } = await supabase
      .from('campaign_members')
      .select('active')
      .eq('campaign_id', campaign_id)
      .eq('user_id', user.id)
      .single()

    if (!membership || !membership.active) {
      return NextResponse.json(
        { error: 'You are not a member of this campaign' },
        { status: 403 }
      )
    }

    // Check if user already has a character in this campaign
    const { data: existingChar } = await supabase
      .from('characters')
      .select('id')
      .eq('campaign_id', campaign_id)
      .eq('user_id', user.id)
      .single()

    if (existingChar) {
      return NextResponse.json(
        { error: 'You already have a character in this campaign' },
        { status: 400 }
      )
    }

    // Validate character level against campaign requirements
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, min_level, max_level')
      .eq('id', campaign_id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    const charLevel = character.level || 1
    const minLevel = campaign.min_level || 1
    const maxLevel = campaign.max_level || 20

    if (charLevel < minLevel || charLevel > maxLevel) {
      return NextResponse.json(
        {
          error: `Character level ${charLevel} does not meet campaign requirements`,
          message: `This campaign requires characters between Level ${minLevel} and Level ${maxLevel}.`,
          details: {
            character_level: charLevel,
            required_min: minLevel,
            required_max: maxLevel,
          },
        },
        { status: 400 }
      )
    }

    // Assign the character to the campaign
    const serviceSupabase = createServiceClient()
    const { error: updateError } = await serviceSupabase
      .from('characters')
      .update({
        campaign_id: campaign_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', characterId)

    if (updateError) {
      console.error('Error assigning character:', updateError)
      return NextResponse.json(
        { error: 'Failed to assign character to campaign' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${character.name} has been assigned to the campaign`,
    })
  } catch (error) {
    console.error('Assign character error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
