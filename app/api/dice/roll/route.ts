/**
 * Dice Roll API Route
 * Execute dice rolls using the rules engine
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { rollDice } from '@/lib/engine/core/dice'

const RollDiceSchema = z.object({
  notation: z.string().regex(/^\d+d\d+([+-]\d+)?$/, 'Invalid dice notation'),
  advantage: z.boolean().default(false),
  disadvantage: z.boolean().default(false),
  characterId: z.string().uuid().optional(),
  description: z.string().optional(),
  rollType: z
    .enum([
      'ability_check',
      'saving_throw',
      'attack_roll',
      'damage_roll',
      'initiative',
      'skill_check',
      'death_save',
    ])
    .optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validation = RollDiceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { notation, advantage, disadvantage, characterId, description, rollType } =
      validation.data

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

    // If characterId provided, verify ownership
    if (characterId) {
      const { data: character } = await supabase
        .from('characters')
        .select('user_id')
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
    }

    // Execute the roll using the rules engine
    const rollResult = rollDice(notation, { advantage, disadvantage })

    // Note: dice_roll_results table doesn't exist in schema
    // Store roll results in event_log or dice_roll_requests instead if needed
    // For now, just return the roll result without storing

    return NextResponse.json({
      roll: {
        notation,
        total: rollResult.total,
        rolls: rollResult.rolls,
        breakdown: rollResult.breakdown,
        critical: rollResult.critical || false,
        fumble: rollResult.fumble || false,
        advantage,
        disadvantage,
      },
    })
  } catch (error) {
    console.error('Roll dice error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
