/**
 * Turn Submission API Route
 * Submit player input for current turn
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { classifyInput, shouldAdvanceTurn, canPlayerSubmitInput } from '@/lib/turn-contract/input-gating'
import { transitionPhase } from '@/lib/turn-contract/state-machine'
import { analyzeForRolls } from '@/lib/ai-dm/orchestrator'
import type { DMContext } from '@/lib/ai-dm/context-builder'

const SubmitInputSchema = z.object({
  turnContractId: z.string().uuid(),
  characterId: z.string().uuid().optional(),
  content: z.string().min(1).max(5000),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validation = SubmitInputSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { turnContractId, characterId, content } = validation.data

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

    // Get campaign and user's membership
    const [campaignData, membershipData] = await Promise.all([
      supabase.from('campaigns').select('mode').eq('id', campaignId).single(),
      supabase
        .from('campaign_members')
        .select('role')
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id)
        .single(),
    ])

    if (!campaignData.data || !membershipData.data) {
      return NextResponse.json(
        {
          error: 'Not a member of this campaign',
        },
        { status: 403 }
      )
    }

    const mode = campaignData.data.mode
    const isHost = membershipData.data.role === 'host'

    // Check if player can submit
    const { data: existingInputs } = await supabase
      .from('player_inputs')
      .select('*')
      .eq('turn_contract_id', turnContractId)

    const playerInputs = existingInputs || []
    const hasPlayerSubmitted = playerInputs.some((input) => input.user_id === user.id)

    const canSubmit = canPlayerSubmitInput(
      mode,
      turnContract.phase,
      user.id,
      turnContract.scenes.campaign_id, // Using as host ID placeholder - should get actual host
      hasPlayerSubmitted
    )

    if (!canSubmit.canSubmit) {
      return NextResponse.json(
        {
          error: canSubmit.reason || 'Cannot submit input at this time',
        },
        { status: 400 }
      )
    }

    // Get total player count
    const { count: totalPlayers } = await supabase
      .from('campaign_members')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('active', true)

    // Classify input
    const classification = classifyInput(
      {
        mode,
        phase: turnContract.phase,
        hostId: turnContract.scenes.campaign_id, // Placeholder
        currentPlayerId: user.id,
      },
      user.id,
      playerInputs.some((input) => input.classification === 'authoritative')
    )

    const serviceSupabase = createServiceClient()

    // Get character name if provided
    let characterName = 'Player'
    if (characterId) {
      const { data: character } = await supabase
        .from('characters')
        .select('name')
        .eq('id', characterId)
        .single()
      if (character) {
        characterName = character.name
      }
    }

    // Create player input
    const { data: playerInput, error: inputError } = await serviceSupabase
      .from('player_inputs')
      .insert({
        turn_contract_id: turnContractId,
        campaign_id: campaignId,
        user_id: user.id,
        character_id: characterId || null,
        classification,
        content,
        state_version: turnContract.state_version,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (inputError) {
      console.error('Input creation error:', inputError)
      return NextResponse.json(
        {
          error: 'Failed to submit input',
        },
        { status: 500 }
      )
    }

    // Create event in event_log so it appears in the UI immediately
    await serviceSupabase.from('event_log').insert({
      scene_id: turnContract.scene_id,
      type: 'player_action',
      content: {
        action: content,
        character_name: characterName,
        character_id: characterId,
      },
      player_id: user.id,
      turn_contract_id: turnContractId,
    })

    // Check if turn should advance
    const authoritativeCount =
      playerInputs.filter((input) => input.classification === 'authoritative').length +
      (classification === 'authoritative' ? 1 : 0)

    const shouldAdvance = shouldAdvanceTurn(mode, authoritativeCount, totalPlayers || 1)

    let pendingRolls: any[] = []
    let turnPhase = turnContract.phase

    if (shouldAdvance && turnContract.phase === 'awaiting_input') {
      // Step 1: Analyze player action to determine if dice rolls are needed
      // Build minimal context for roll analysis
      const [campaignData, sceneData, charactersData, entitiesData, eventsData] = await Promise.all([
        supabase.from('campaigns').select('*').eq('id', campaignId).single(),
        supabase.from('scenes').select('*').eq('id', turnContract.scene_id).single(),
        supabase.from('characters').select('*').eq('campaign_id', campaignId),
        supabase
          .from('entities')
          .select('*, entity_state!inner(*)')
          .eq('entity_state.scene_id', turnContract.scene_id),
        supabase
          .from('event_log')
          .select('*')
          .eq('scene_id', turnContract.scene_id)
          .order('created_at', { ascending: false })
          .limit(10),
      ])

      // Get all inputs including the one we just created
      const { data: allInputs } = await supabase
        .from('player_inputs')
        .select('*')
        .eq('turn_contract_id', turnContractId)
        .order('created_at', { ascending: true })

      const context: DMContext = {
        campaign: {
          id: campaignData.data?.id || '',
          name: campaignData.data?.name || '',
          setting: campaignData.data?.setting || '',
          dm_config: campaignData.data?.dm_config || {},
          strict_mode: campaignData.data?.strict_mode || false,
        },
        scene: {
          id: sceneData.data?.id || '',
          name: sceneData.data?.name || 'Scene',
          description: sceneData.data?.description || '',
          location: sceneData.data?.location || 'Unknown',
          environment: sceneData.data?.environment || 'Normal',
          npcs: entitiesData.data?.filter((e: any) => e.type === 'npc') || [],
          monsters: entitiesData.data?.filter((e: any) => e.type === 'monster') || [],
          current_state: sceneData.data?.current_state || '',
        },
        characters: charactersData.data || [],
        entities: entitiesData.data || [],
        turnContract: {
          ...turnContract,
          phase: 'awaiting_input',
        },
        playerInputs: allInputs || [],
        recentEvents: eventsData.data || [],
      }

      // Call AI to analyze if rolls are needed
      const rollAnalysis = await analyzeForRolls(context)

      if (rollAnalysis.success && rollAnalysis.data?.needs_rolls && rollAnalysis.data.dice_requests.length > 0) {
        // Insert dice roll requests
        const rollsToInsert = rollAnalysis.data.dice_requests.map((req, idx) => ({
          turn_contract_id: turnContractId,
          character_id: req.character_id || null,
          roll_type: req.roll_type,
          dice_notation: req.notation,
          notation: req.notation,
          ability: req.ability || null,
          skill: req.skill || null,
          dc: req.dc || null,
          advantage: req.advantage || false,
          disadvantage: req.disadvantage || false,
          description: req.description,
          reason: req.reason,
          roll_order: idx,
          resolved: false,
        }))

        const { data: insertedRolls, error: rollInsertError } = await serviceSupabase
          .from('dice_roll_requests')
          .insert(rollsToInsert)
          .select()

        if (rollInsertError) {
          console.error('Failed to insert roll requests:', rollInsertError)
        } else {
          pendingRolls = insertedRolls || []

          // Transition to awaiting_rolls phase
          const update = transitionPhase(turnContract, 'awaiting_rolls', {
            ai_task: `Waiting for ${pendingRolls.length} dice roll(s)`,
          })

          await serviceSupabase
            .from('turn_contracts')
            .update({
              ...update,
              pending_roll_ids: pendingRolls.map((r: any) => r.id),
            })
            .eq('id', turnContractId)
            .eq('state_version', turnContract.state_version)

          turnPhase = 'awaiting_rolls'
        }
      } else {
        // No rolls needed - go straight to resolving
        const update = transitionPhase(turnContract, 'resolving', {
          ai_task: 'Ready to resolve turn',
        })

        await serviceSupabase
          .from('turn_contracts')
          .update(update)
          .eq('id', turnContractId)
          .eq('state_version', turnContract.state_version)

        turnPhase = 'resolving'
      }
    }

    return NextResponse.json({
      success: true,
      input: playerInput,
      classification,
      shouldAdvance,
      turnPhase,
      pendingRolls,
    })
  } catch (error) {
    console.error('Submit input error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
