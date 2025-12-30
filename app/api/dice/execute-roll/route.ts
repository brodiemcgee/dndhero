/**
 * Execute Dice Roll API Route
 * Executes a pending dice roll request and updates the game state
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { rollDice } from '@/lib/engine/core/dice'
import { getAbilityModifier, getSkillBonus, getProficiencyBonus } from '@/lib/engine/core/abilities'
import { transitionPhase } from '@/lib/turn-contract/state-machine'

const ExecuteRollSchema = z.object({
  rollRequestId: z.string().uuid(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = ExecuteRollSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { rollRequestId } = validation.data
    const { client: supabase } = createClient(request)

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the dice roll request
    const { data: rollRequest, error: rollError } = await supabase
      .from('dice_roll_requests')
      .select(`
        *,
        turn_contracts!inner(
          id,
          scene_id,
          phase,
          state_version,
          pending_roll_ids,
          scenes!inner(campaign_id)
        )
      `)
      .eq('id', rollRequestId)
      .single()

    if (rollError || !rollRequest) {
      return NextResponse.json({ error: 'Roll request not found' }, { status: 404 })
    }

    // Check if already resolved
    if (rollRequest.resolved) {
      return NextResponse.json({ error: 'Roll already completed' }, { status: 400 })
    }

    const campaignId = rollRequest.turn_contracts.scenes.campaign_id
    const turnContractId = rollRequest.turn_contract_id

    // Verify user can execute this roll
    // Either they own the character OR they're the host (for NPC rolls)
    let canRoll = false
    let characterName = 'Unknown'

    if (rollRequest.character_id) {
      const { data: character } = await supabase
        .from('characters')
        .select('id, user_id, name')
        .eq('id', rollRequest.character_id)
        .single()

      if (character) {
        characterName = character.name
        canRoll = character.user_id === user.id
      }
    }

    // Check if host (can roll for NPCs or any character)
    if (!canRoll) {
      const { data: membership } = await supabase
        .from('campaign_members')
        .select('role')
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id)
        .single()

      canRoll = membership?.role === 'host'
    }

    if (!canRoll) {
      return NextResponse.json(
        { error: 'You cannot execute this roll' },
        { status: 403 }
      )
    }

    // Get character stats for modifier calculation if needed
    let notation = rollRequest.dice_notation || rollRequest.notation || '1d20'

    if (rollRequest.character_id && !notation.includes('+') && !notation.includes('-')) {
      // Need to calculate modifiers from character stats
      const { data: character } = await supabase
        .from('characters')
        .select('*')
        .eq('id', rollRequest.character_id)
        .single()

      if (character) {
        const profBonus = getProficiencyBonus(character.level || 1)
        let modifier = 0

        // Calculate modifier based on roll type
        if (rollRequest.roll_type === 'skill_check' && rollRequest.skill) {
          const abilityScore = getAbilityForSkill(rollRequest.skill, character)
          const isProficient = character.skill_proficiencies?.includes(rollRequest.skill) || false
          const isExpert = character.skill_expertises?.includes(rollRequest.skill) || false
          modifier = getSkillBonus(abilityScore, profBonus, isProficient, isExpert)
        } else if (rollRequest.ability) {
          const abilityScore = character[rollRequest.ability] || 10
          const isProficient = rollRequest.roll_type === 'saving_throw' &&
            character.saving_throw_proficiencies?.includes(rollRequest.ability)
          modifier = getAbilityModifier(abilityScore)
          if (isProficient) modifier += profBonus
        }

        // Update notation with modifier
        if (modifier >= 0) {
          notation = `1d20+${modifier}`
        } else {
          notation = `1d20${modifier}`
        }
      }
    }

    // Execute the roll server-side (cryptographically secure)
    const rollResult = rollDice(notation, {
      advantage: rollRequest.advantage || false,
      disadvantage: rollRequest.disadvantage || false,
    })

    // Determine success if DC is set
    const success = rollRequest.dc ? rollResult.total >= rollRequest.dc : null

    const serviceSupabase = createServiceClient()

    // Update the roll request with results and player_id for analytics
    const { error: updateError } = await serviceSupabase
      .from('dice_roll_requests')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        result_total: rollResult.total,
        result_rolls: rollResult.rolls,
        result_breakdown: rollResult.breakdown,
        result_critical: rollResult.critical || false,
        result_fumble: rollResult.fumble || false,
        success,
        player_id: user.id, // Track who rolled for analytics
      })
      .eq('id', rollRequestId)

    if (updateError) {
      console.error('Failed to update roll request:', updateError)
      return NextResponse.json({ error: 'Failed to save roll result' }, { status: 500 })
    }

    // Create event log entry for the roll
    await serviceSupabase.from('event_log').insert({
      scene_id: rollRequest.turn_contracts.scene_id,
      type: 'dice_roll',
      content: {
        roll_type: rollRequest.roll_type,
        description: rollRequest.description,
        character_name: characterName,
        character_id: rollRequest.character_id,
        notation,
        total: rollResult.total,
        breakdown: rollResult.breakdown,
        dc: rollRequest.dc,
        success,
        critical: rollResult.critical,
        fumble: rollResult.fumble,
      },
      player_id: user.id,
      turn_contract_id: turnContractId,
    })

    // Create a chat message for the roll result (so it appears in chat)
    await serviceSupabase.from('chat_messages').insert({
      campaign_id: campaignId,
      sender_type: 'system',
      sender_id: user.id,
      character_name: characterName,
      content: `${characterName} rolled ${rollRequest.description}: ${rollResult.total} (${rollResult.breakdown})${rollRequest.dc ? ` vs DC ${rollRequest.dc} - ${success ? 'Success!' : 'Failure'}` : ''}${rollResult.critical ? ' - CRITICAL!' : ''}${rollResult.fumble ? ' - FUMBLE!' : ''}`,
      message_type: 'dice_roll',
      metadata: {
        roll_request_id: rollRequestId,
        roll_type: rollRequest.roll_type,
        total: rollResult.total,
        breakdown: rollResult.breakdown,
        dc: rollRequest.dc,
        success,
        critical: rollResult.critical,
        fumble: rollResult.fumble,
      },
    })

    // Check if all pending rolls are now complete
    const { data: pendingRolls } = await supabase
      .from('dice_roll_requests')
      .select('id, resolved')
      .eq('turn_contract_id', turnContractId)
      .eq('resolved', false)

    const allRollsComplete = !pendingRolls || pendingRolls.length === 0

    if (allRollsComplete) {
      // Transition to resolving phase
      const turnContract = rollRequest.turn_contracts

      if (turnContract.phase === 'awaiting_rolls') {
        const update = transitionPhase(
          { ...turnContract, phase: 'awaiting_rolls' },
          'resolving',
          { ai_task: 'Resolving turn with completed dice rolls' }
        )

        await serviceSupabase
          .from('turn_contracts')
          .update(update)
          .eq('id', turnContractId)
          .eq('state_version', turnContract.state_version)

        // Auto-trigger turn resolution
        try {
          const resolveResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/turn/resolve`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': request.headers.get('Cookie') || '',
            },
            body: JSON.stringify({ turnContractId }),
          })

          if (!resolveResponse.ok) {
            console.error('Failed to auto-resolve turn:', await resolveResponse.text())
          }
        } catch (err) {
          console.error('Error auto-resolving turn:', err)
        }
      }
    }

    return NextResponse.json({
      success: true,
      roll: {
        total: rollResult.total,
        rolls: rollResult.rolls,
        breakdown: rollResult.breakdown,
        critical: rollResult.critical,
        fumble: rollResult.fumble,
        dc: rollRequest.dc,
        rollSuccess: success,
      },
      allRollsComplete,
    })
  } catch (error) {
    console.error('Execute roll error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper to get ability score for a skill
function getAbilityForSkill(skill: string, character: any): number {
  const skillToAbility: Record<string, string> = {
    acrobatics: 'dexterity',
    animal_handling: 'wisdom',
    arcana: 'intelligence',
    athletics: 'strength',
    deception: 'charisma',
    history: 'intelligence',
    insight: 'wisdom',
    intimidation: 'charisma',
    investigation: 'intelligence',
    medicine: 'wisdom',
    nature: 'intelligence',
    perception: 'wisdom',
    performance: 'charisma',
    persuasion: 'charisma',
    religion: 'intelligence',
    sleight_of_hand: 'dexterity',
    stealth: 'dexterity',
    survival: 'wisdom',
  }

  const ability = skillToAbility[skill] || 'dexterity'
  return character[ability] || 10
}
