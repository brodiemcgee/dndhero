/**
 * Character API Route
 * DELETE: Deletes a standalone character (not in any campaign)
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
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

    // Only allow deletion of standalone characters (not in a campaign)
    if (character.campaign_id) {
      return NextResponse.json(
        { error: 'Cannot delete a character that is assigned to a campaign. Remove from campaign first.' },
        { status: 400 }
      )
    }

    // Delete the character using service client
    const serviceSupabase = createServiceClient()
    const { error: deleteError } = await serviceSupabase
      .from('characters')
      .delete()
      .eq('id', characterId)

    if (deleteError) {
      console.error('Error deleting character:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete character' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${character.name} has been deleted`,
    })
  } catch (error) {
    console.error('Delete character error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
