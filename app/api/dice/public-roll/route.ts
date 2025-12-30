/**
 * Public Dice Roll API Route
 * Execute dice rolls and post results to campaign chat
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { rollDice } from '@/lib/engine/core/dice'

const PublicRollSchema = z.object({
  campaignId: z.string().uuid(),
  sceneId: z.string().uuid().optional(),
  characterId: z.string().uuid().optional(),
  notation: z.string().regex(/^\d*d\d+([+-]\d+)?$/, 'Invalid dice notation'),
  rollType: z
    .enum([
      'ability_check',
      'saving_throw',
      'attack_roll',
      'damage_roll',
      'initiative',
      'skill_check',
      'death_save',
      'custom',
    ])
    .default('custom'),
  rollLabel: z.string().optional(), // e.g., "Perception Check", "Attack Roll"
  dc: z.number().int().min(1).max(40).optional(),
  advantage: z.boolean().default(false),
  disadvantage: z.boolean().default(false),
  reason: z.string().optional(), // "to detect the hidden trap"
  rollRequestId: z.string().uuid().optional(), // If fulfilling an AI-requested roll
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validation = PublicRollSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const {
      campaignId,
      sceneId,
      characterId,
      notation,
      rollType,
      rollLabel,
      dc,
      advantage,
      disadvantage,
      reason,
      rollRequestId,
    } = validation.data

    const supabase = await createClient()

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

    // Verify user is campaign member
    const { data: membership, error: memberError } = await supabase
      .from('campaign_members')
      .select('role, active')
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id)
      .single()

    if (memberError || !membership?.active) {
      return NextResponse.json(
        {
          error: 'Not a member of this campaign',
        },
        { status: 403 }
      )
    }

    // Get character info (either specified or user's character in campaign)
    let characterName = 'Unknown'
    let actualCharacterId = characterId

    if (characterId) {
      // Verify character ownership
      const { data: character } = await supabase
        .from('characters')
        .select('id, name, user_id')
        .eq('id', characterId)
        .single()

      if (!character || character.user_id !== user.id) {
        return NextResponse.json(
          {
            error: 'Character not found or not owned by you',
          },
          { status: 403 }
        )
      }
      characterName = character.name
    } else {
      // Get user's character in this campaign
      const { data: character } = await supabase
        .from('characters')
        .select('id, name')
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id)
        .single()

      if (character) {
        characterName = character.name
        actualCharacterId = character.id
      }
    }

    // Execute the roll using the rules engine (server-side, cryptographically secure)
    const rollResult = rollDice(notation, { advantage, disadvantage })

    // Determine success/failure if DC provided
    let success: boolean | undefined
    if (dc !== undefined) {
      success = rollResult.total >= dc
    }

    // Build display content
    let displayLabel = rollLabel || rollType.replace(/_/g, ' ')
    displayLabel = displayLabel.charAt(0).toUpperCase() + displayLabel.slice(1)

    let content = `**${characterName}** rolls ${displayLabel}`
    if (reason) {
      content += ` ${reason}`
    }
    content += `\n${rollResult.breakdown}`
    if (dc !== undefined) {
      content += `\nDC ${dc}: ${success ? '**Success!**' : '**Failure**'}`
    }

    const serviceSupabase = createServiceClient()

    // Get current scene if not provided
    let activeSceneId = sceneId
    if (!activeSceneId) {
      const { data: scene } = await serviceSupabase
        .from('scenes')
        .select('id')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      activeSceneId = scene?.id
    }

    // Insert roll result as chat message
    const { data: message, error: insertError } = await serviceSupabase
      .from('chat_messages')
      .insert({
        campaign_id: campaignId,
        scene_id: activeSceneId,
        sender_type: 'system',
        sender_id: user.id,
        character_id: actualCharacterId || null,
        character_name: characterName,
        content,
        message_type: 'dice_roll',
        metadata: {
          notation,
          total: rollResult.total,
          rolls: rollResult.rolls,
          modifier: rollResult.modifier,
          breakdown: rollResult.breakdown,
          critical: rollResult.critical || false,
          fumble: rollResult.fumble || false,
          advantage,
          disadvantage,
          roll_type: rollType,
          roll_label: displayLabel,
          dc,
          success,
          reason,
          roll_request_id: rollRequestId,
        },
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Failed to insert roll message:', insertError)
      return NextResponse.json(
        {
          error: 'Failed to post roll to chat',
        },
        { status: 500 }
      )
    }

    // If this fulfills a roll request, update that message
    if (rollRequestId) {
      await serviceSupabase
        .from('chat_messages')
        .update({
          metadata: serviceSupabase.rpc('jsonb_set_nested', {
            target: 'metadata',
            path: ['pending'],
            value: false,
          }),
        })
        .eq('id', rollRequestId)
        .single()
    }

    return NextResponse.json({
      success: true,
      messageId: message.id,
      roll: {
        notation,
        total: rollResult.total,
        rolls: rollResult.rolls,
        breakdown: rollResult.breakdown,
        critical: rollResult.critical || false,
        fumble: rollResult.fumble || false,
        advantage,
        disadvantage,
        dc,
        rollSuccess: success,
      },
    })
  } catch (error) {
    console.error('Public roll error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
