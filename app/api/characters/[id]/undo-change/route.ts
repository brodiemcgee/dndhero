/**
 * Undo Character State Change API
 * POST: Reverses a specific character state change made by the AI DM
 * Only campaign hosts can undo changes
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const UndoChangeSchema = z.object({
  change_id: z.string().uuid(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: characterId } = await params
    const body = await request.json()

    // Validate request body
    const parseResult = UndoChangeSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.errors },
        { status: 400 }
      )
    }

    const { change_id } = parseResult.data

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const serviceClient = createServiceClient()

    // Get the change record
    const { data: change, error: changeError } = await serviceClient
      .from('character_state_changes')
      .select('*')
      .eq('id', change_id)
      .eq('character_id', characterId)
      .single()

    if (changeError || !change) {
      return NextResponse.json(
        { error: 'Change not found' },
        { status: 404 }
      )
    }

    // Check if already reversed
    if (change.is_reversed) {
      return NextResponse.json(
        { error: 'This change has already been reversed' },
        { status: 400 }
      )
    }

    // Verify user is the campaign host
    const { data: membership, error: memberError } = await serviceClient
      .from('campaign_members')
      .select('role')
      .eq('campaign_id', change.campaign_id)
      .eq('user_id', user.id)
      .single()

    if (memberError || !membership) {
      return NextResponse.json(
        { error: 'You are not a member of this campaign' },
        { status: 403 }
      )
    }

    if (membership.role !== 'host') {
      return NextResponse.json(
        { error: 'Only the campaign host can undo AI changes' },
        { status: 403 }
      )
    }

    // Restore the old value based on field_name
    const oldValue = change.old_value
    const fieldName = change.field_name

    // Build the update object
    const update: Record<string, unknown> = {}

    // Handle different field types
    switch (change.change_type) {
      case 'hp_change':
      case 'temp_hp':
      case 'death_saves':
        update[fieldName] = oldValue
        break

      case 'inventory_add':
      case 'inventory_remove':
        // For inventory, we need to restore the entire inventory array
        update.inventory = oldValue
        break

      case 'currency':
        // For currency, restore the currency object
        update.currency = oldValue
        break

      case 'condition_add':
      case 'condition_remove':
        update.conditions = oldValue
        break

      case 'spell_slot':
        update.spell_slots_used = oldValue
        break

      case 'xp_award':
        update.experience = oldValue
        break

      case 'equip':
      case 'unequip':
        update.equipment = oldValue
        break

      case 'rest':
        // Rest changes multiple fields - restore all from old_value
        if (typeof oldValue === 'object' && oldValue !== null) {
          Object.assign(update, oldValue)
        }
        break

      default:
        // Generic field update
        update[fieldName] = oldValue
    }

    // Update the character with the old value
    const { error: updateError } = await serviceClient
      .from('characters')
      .update(update)
      .eq('id', characterId)

    if (updateError) {
      console.error('Failed to restore character:', updateError)
      return NextResponse.json(
        { error: 'Failed to restore character state' },
        { status: 500 }
      )
    }

    // Mark the change as reversed
    const { error: markError } = await serviceClient
      .from('character_state_changes')
      .update({
        is_reversed: true,
        reversed_at: new Date().toISOString(),
        reversed_by: user.id,
      })
      .eq('id', change_id)

    if (markError) {
      console.error('Failed to mark change as reversed:', markError)
      // Don't fail the request - the character was already restored
    }

    return NextResponse.json({
      success: true,
      message: `Reverted: ${change.reason}`,
      character_id: characterId,
      change_id: change_id,
    })

  } catch (error) {
    console.error('Undo change error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: List reversible changes for a character
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: characterId } = await params

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const serviceClient = createServiceClient()

    // Get the character to find the campaign
    const { data: character, error: charError } = await serviceClient
      .from('characters')
      .select('campaign_id')
      .eq('id', characterId)
      .single()

    if (charError || !character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      )
    }

    // Verify user is in the campaign
    const { data: membership, error: memberError } = await serviceClient
      .from('campaign_members')
      .select('role')
      .eq('campaign_id', character.campaign_id)
      .eq('user_id', user.id)
      .single()

    if (memberError || !membership) {
      return NextResponse.json(
        { error: 'You are not a member of this campaign' },
        { status: 403 }
      )
    }

    // Get recent changes (last 24 hours, not reversed)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const { data: changes, error: changesError } = await serviceClient
      .from('character_state_changes')
      .select('id, change_type, field_name, reason, created_at, is_reversed')
      .eq('character_id', characterId)
      .eq('is_reversed', false)
      .gte('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    if (changesError) {
      console.error('Failed to fetch changes:', changesError)
      return NextResponse.json(
        { error: 'Failed to fetch changes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      character_id: characterId,
      changes: changes || [],
      can_undo: membership.role === 'host',
    })

  } catch (error) {
    console.error('Get changes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
