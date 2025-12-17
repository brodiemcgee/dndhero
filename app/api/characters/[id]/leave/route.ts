/**
 * Leave Campaign API Route
 * POST: Removes a character from its current campaign (returns to standalone)
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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

    // Get the character and verify ownership
    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, user_id, campaign_id, name')
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

    // Check if character is actually in a campaign
    if (!character.campaign_id) {
      return NextResponse.json(
        { error: 'Character is not assigned to any campaign' },
        { status: 400 }
      )
    }

    const campaignId = character.campaign_id
    const serviceSupabase = createServiceClient()

    // Clean up any entity records for this character in the campaign
    // First, get the entity ID if it exists
    const { data: entity } = await serviceSupabase
      .from('entities')
      .select('id')
      .eq('character_id', characterId)
      .eq('campaign_id', campaignId)
      .single()

    if (entity) {
      // Delete entity_state records (should cascade, but be explicit)
      await serviceSupabase
        .from('entity_state')
        .delete()
        .eq('entity_id', entity.id)

      // Delete the entity record
      await serviceSupabase
        .from('entities')
        .delete()
        .eq('id', entity.id)
    }

    // Remove the character from the campaign (set campaign_id to null)
    const { error: updateError } = await serviceSupabase
      .from('characters')
      .update({
        campaign_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', characterId)

    if (updateError) {
      console.error('Error removing character from campaign:', updateError)
      return NextResponse.json(
        { error: 'Failed to remove character from campaign' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${character.name} has left the campaign and is now available`,
    })
  } catch (error) {
    console.error('Leave campaign error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
