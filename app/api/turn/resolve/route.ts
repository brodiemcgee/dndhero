/**
 * Turn Resolution API Route
 * Triggers AI DM to resolve the current turn
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { resolveTurn, validateResponseSafety } from '@/lib/ai-dm/orchestrator'
import { applyTurnResolution } from '@/lib/ai-dm/resolution-pipeline'
import { transitionPhase } from '@/lib/turn-contract/state-machine'
import type { DMContext } from '@/lib/ai-dm/context-builder'

export async function POST(request: Request) {
  try {
    const { turnContractId } = await request.json()

    if (!turnContractId) {
      return NextResponse.json(
        {
          error: 'Turn contract ID required',
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

    // Get turn contract
    const { data: turnContract, error: turnError } = await supabase
      .from('turn_contracts')
      .select('*, scenes!inner(campaign_id)')
      .eq('id', turnContractId)
      .single()

    if (turnError || !turnContract) {
      return NextResponse.json(
        {
          error: 'Turn contract not found',
        },
        { status: 404 }
      )
    }

    const campaignId = turnContract.scenes.campaign_id
    const sceneId = turnContract.scene_id

    // Verify user is campaign member
    const { data: membership } = await supabase
      .from('campaign_members')
      .select('role')
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json(
        {
          error: 'Not a member of this campaign',
        },
        { status: 403 }
      )
    }

    // Check turn is in correct phase
    if (turnContract.phase !== 'awaiting_input' && turnContract.phase !== 'awaiting_rolls') {
      return NextResponse.json(
        {
          error: `Turn is in ${turnContract.phase} phase, cannot resolve`,
        },
        { status: 400 }
      )
    }

    const serviceSupabase = createServiceClient()

    // Transition to resolving phase
    const resolvingUpdate = transitionPhase(turnContract, 'resolving', {
      ai_task: 'Resolving turn based on player input',
    })

    const { error: transitionError } = await serviceSupabase
      .from('turn_contracts')
      .update(resolvingUpdate)
      .eq('id', turnContractId)
      .eq('state_version', turnContract.state_version)

    if (transitionError) {
      return NextResponse.json(
        {
          error: 'Failed to update turn state (concurrent modification)',
        },
        { status: 409 }
      )
    }

    // Get all data needed for AI context
    const [campaignData, sceneData, charactersData, entitiesData, inputsData, eventsData] =
      await Promise.all([
        supabase.from('campaigns').select('*').eq('id', campaignId).single(),
        supabase.from('scenes').select('*').eq('id', sceneId).single(),
        supabase
          .from('characters')
          .select('*')
          .eq('campaign_id', campaignId),
        supabase
          .from('entities')
          .select('*, entity_state!inner(*)')
          .eq('entity_state.scene_id', sceneId),
        supabase
          .from('player_inputs')
          .select('*')
          .eq('turn_contract_id', turnContractId)
          .order('submitted_at', { ascending: true }),
        supabase
          .from('event_log')
          .select('*')
          .eq('scene_id', sceneId)
          .order('created_at', { ascending: false })
          .limit(20),
      ])

    if (!campaignData.data || !sceneData.data) {
      return NextResponse.json(
        {
          error: 'Failed to load game context',
        },
        { status: 500 }
      )
    }

    // Build AI DM context
    const context: DMContext = {
      campaign: {
        id: campaignData.data.id,
        name: campaignData.data.name,
        setting: campaignData.data.setting,
        dm_config: campaignData.data.dm_config || {},
        strict_mode: campaignData.data.strict_mode,
      },
      scene: {
        id: sceneData.data.id,
        name: sceneData.data.name || 'Scene',
        description: sceneData.data.description || '',
        location: sceneData.data.location || 'Unknown',
        environment: sceneData.data.environment || 'Normal',
        npcs: entitiesData.data?.filter((e) => e.type === 'npc') || [],
        monsters: entitiesData.data?.filter((e) => e.type === 'monster') || [],
        current_state: sceneData.data.current_state || '',
      },
      characters: charactersData.data || [],
      entities: entitiesData.data || [],
      turnContract: {
        ...turnContract,
        phase: 'resolving',
        state_version: resolvingUpdate.state_version,
      },
      playerInputs: inputsData.data || [],
      recentEvents: eventsData.data || [],
    }

    // Call AI DM
    const aiResult = await resolveTurn(context)

    if (!aiResult.success || !aiResult.data) {
      // Rollback to awaiting_input
      await serviceSupabase
        .from('turn_contracts')
        .update({
          phase: 'awaiting_input',
          state_version: resolvingUpdate.state_version + 1,
        })
        .eq('id', turnContractId)

      return NextResponse.json(
        {
          error: aiResult.error || 'AI DM failed to generate response',
        },
        { status: 500 }
      )
    }

    const resolution = aiResult.data as any

    // Validate safety
    const safety = validateResponseSafety(resolution)

    if (!safety.safe) {
      console.error('Unsafe AI response:', safety.issues)
      return NextResponse.json(
        {
          error: 'AI response failed safety validation',
          issues: safety.issues,
        },
        { status: 500 }
      )
    }

    // Apply resolution to database
    const applyResult = await applyTurnResolution(
      turnContractId,
      resolution,
      sceneId,
      campaignId
    )

    if (!applyResult.success) {
      return NextResponse.json(
        {
          error: 'Failed to apply turn resolution',
          details: applyResult.errors,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      narrative: resolution.narrative,
      entityUpdates: applyResult.updatedEntities,
      events: applyResult.createdEvents,
      tokensUsed: aiResult.tokensUsed,
      cost: aiResult.cost,
    })
  } catch (error) {
    console.error('Turn resolution error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
