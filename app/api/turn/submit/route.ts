/**
 * Turn Submission API Route
 * Submit player input for current turn
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { classifyInput, shouldAdvanceTurn, canPlayerSubmitInput } from '@/lib/turn-contract/input-gating'
import { transitionPhase } from '@/lib/turn-contract/state-machine'

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
    const hasPlayerSubmitted = playerInputs.some((input) => input.player_id === user.id)

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

    // Create player input
    const { data: playerInput, error: inputError } = await serviceSupabase
      .from('player_inputs')
      .insert({
        turn_contract_id: turnContractId,
        campaign_id: campaignId,
        player_id: user.id,
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

    // Check if turn should advance
    const authoritativeCount =
      playerInputs.filter((input) => input.classification === 'authoritative').length +
      (classification === 'authoritative' ? 1 : 0)

    const shouldAdvance = shouldAdvanceTurn(mode, authoritativeCount, totalPlayers || 1)

    if (shouldAdvance && turnContract.phase === 'awaiting_input') {
      // Transition to resolving (or awaiting_rolls if dice needed)
      // For simplicity, go straight to resolving - dice roll system can be added later
      const update = transitionPhase(turnContract, 'resolving', {
        ai_task: 'Ready to resolve turn',
      })

      await serviceSupabase
        .from('turn_contracts')
        .update(update)
        .eq('id', turnContractId)
        .eq('state_version', turnContract.state_version)
    }

    return NextResponse.json({
      success: true,
      input: playerInput,
      classification,
      shouldAdvance,
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
