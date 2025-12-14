/**
 * Start Game API Route
 * Transitions campaign from setup to active state
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Get campaign and verify host
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*, campaign_members!inner(role)')
      .eq('id', campaignId)
      .eq('campaign_members.user_id', user.id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        {
          error: 'Campaign not found',
        },
        { status: 404 }
      )
    }

    const membership = campaign.campaign_members[0]
    if (membership.role !== 'host') {
      return NextResponse.json(
        {
          error: 'Only the host can start the game',
        },
        { status: 403 }
      )
    }

    if (campaign.state !== 'setup') {
      return NextResponse.json(
        {
          error: `Campaign is already ${campaign.state}`,
        },
        { status: 400 }
      )
    }

    const serviceSupabase = createServiceClient()

    // Create initial scene (using only required columns that exist in production)
    const { data: scene, error: sceneError } = await serviceSupabase
      .from('scenes')
      .insert({
        campaign_id: campaignId,
        name: 'Opening Scene',
        location: campaign.setting || 'Unknown Location',
        // Optional columns commented out until they are added to production database
        // description: 'Your adventure begins...',
        // is_active: true,
        // state_version: 0,
        // summary: 'The party gathers at the start of their journey.',
        // objectives: [],
        // active_entities: [],
      })
      .select()
      .single()

    if (sceneError || !scene) {
      console.error('Scene creation error:', sceneError)
      return NextResponse.json(
        {
          error: 'Failed to create initial scene',
        },
        { status: 500 }
      )
    }

    // Create first turn contract (using only columns that exist in production)
    // Use 'group' mode to allow all players to act
    const { data: turnContract, error: turnError} = await serviceSupabase
      .from('turn_contracts')
      .insert({
        scene_id: scene.id,
        mode: 'group',  // Allow all players to respond
        phase: 'awaiting_input',
        prompt: `Your adventure begins in ${scene.location}. The party gathers, ready to start their quest. What do you do?`,
        // Columns commented out until they are added to production database
        // campaign_id: campaignId,
        // expected_state_version: 0,
      })
      .select()
      .single()

    if (turnError || !turnContract) {
      console.error('Turn contract creation error:', turnError)
      return NextResponse.json(
        {
          error: 'Failed to create turn contract',
        },
        { status: 500 }
      )
    }

    // Create initial narrative event (using only columns that exist in production)
    await serviceSupabase.from('event_log').insert({
      scene_id: scene.id,
      event_type: 'narration',
      content: `Welcome to ${campaign.name}! Your adventure begins in ${scene.location}. The DM awaits your first action.`,
      // Columns commented out until they are added to production database
      // campaign_id: campaignId,
      // metadata: { source: 'system' },
    })

    // Update campaign to active
    const { error: updateError } = await serviceSupabase
      .from('campaigns')
      .update({
        state: 'active',
        // started_at commented out until column is added to production database
        // started_at: new Date().toISOString(),
      })
      .eq('id', campaignId)

    if (updateError) {
      console.error('Campaign update error:', updateError)
      return NextResponse.json(
        {
          error: 'Failed to activate campaign',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sceneId: scene.id,
      turnContractId: turnContract.id,
    })
  } catch (error) {
    console.error('Start game error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
