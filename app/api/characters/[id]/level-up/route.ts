/**
 * Character Level-Up API Route
 * POST: Applies level-up choices to a character
 * GET: Returns available level-up choices
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  canLevelUp,
  getLevelUpChoices,
  applyLevelUp,
  validateLevelUpChoices,
  type ProgressionCharacter,
  type LevelUpChoices,
} from '@/lib/engine/progression'

const LevelUpSchema = z.object({
  hp_roll: z.number().int().min(1).optional(),
  use_hp_roll: z.boolean().optional(),
  asi_choices: z.object({
    ability1: z.enum(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']).optional(),
    ability2: z.enum(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']).optional(),
    feat: z.string().optional(),
  }).optional(),
  subclass: z.string().optional(),
  new_spells: z.array(z.string()).optional(),
  skill_proficiency: z.string().optional(),
})

// Helper to convert DB character to ProgressionCharacter
function toProgressionCharacter(dbChar: Record<string, unknown>): ProgressionCharacter {
  return {
    id: dbChar.id as string,
    level: dbChar.level as number,
    experience_points: (dbChar.xp as number) || 0,
    class: dbChar.class as string,
    constitution: dbChar.constitution as number,
    max_hp: dbChar.max_hp as number,
    subclass: dbChar.subclass as string | null | undefined,
  }
}

// Helper to convert API input to LevelUpChoices
function toLevelUpChoices(input: z.infer<typeof LevelUpSchema>): LevelUpChoices {
  const choices: LevelUpChoices = {}

  if (input.use_hp_roll && input.hp_roll !== undefined) {
    choices.hpRollUsed = true
    choices.hpRoll = input.hp_roll
  }

  if (input.asi_choices) {
    if (input.asi_choices.feat) {
      choices.featChosen = input.asi_choices.feat
    } else if (input.asi_choices.ability1 || input.asi_choices.ability2) {
      choices.abilityScoreIncreases = {}
      if (input.asi_choices.ability1) {
        choices.abilityScoreIncreases[input.asi_choices.ability1] =
          (choices.abilityScoreIncreases[input.asi_choices.ability1] || 0) + 1
      }
      if (input.asi_choices.ability2) {
        choices.abilityScoreIncreases[input.asi_choices.ability2] =
          (choices.abilityScoreIncreases[input.asi_choices.ability2] || 0) + 1
      }
    }
  }

  if (input.subclass) {
    choices.subclassChosen = input.subclass
  }

  if (input.new_spells) {
    choices.spellsLearned = input.new_spells
  }

  return choices
}

export async function GET(
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

    // Get the character
    const { data: dbCharacter, error: charError } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single()

    if (charError || !dbCharacter) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      )
    }

    const character = dbCharacter as Record<string, unknown>

    if (character.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not own this character' },
        { status: 403 }
      )
    }

    // Convert to ProgressionCharacter
    const progChar = toProgressionCharacter(character)

    // Check if character can level up
    const canLevel = canLevelUp(progChar)

    if (!canLevel) {
      return NextResponse.json({
        can_level_up: false,
        current_level: progChar.level,
        current_xp: progChar.experience_points,
        message: 'Not enough XP to level up',
      })
    }

    // Get available choices for level-up
    const requirements = getLevelUpChoices(progChar)

    return NextResponse.json({
      can_level_up: requirements.canLevelUp,
      current_level: requirements.currentLevel,
      next_level: requirements.nextLevel,
      current_xp: progChar.experience_points,
      xp_progress: requirements.xpProgress,
      features_gained: requirements.featuresGained,
      requires_asi: requirements.requiresASI,
      requires_subclass: requirements.requiresSubclass,
      hp_options: requirements.hpOptions,
    })
  } catch (error) {
    console.error('Get level-up options error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const characterId = params.id
    const body = await request.json()

    // Validate input
    const validation = LevelUpSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
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
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the character
    const { data: dbCharacter, error: charError } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single()

    if (charError || !dbCharacter) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      )
    }

    const character = dbCharacter as Record<string, unknown>

    if (character.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not own this character' },
        { status: 403 }
      )
    }

    // Convert to ProgressionCharacter
    const progChar = toProgressionCharacter(character)

    // Check if character can level up
    if (!canLevelUp(progChar)) {
      return NextResponse.json(
        { error: 'Not enough XP to level up' },
        { status: 400 }
      )
    }

    // Convert input to LevelUpChoices
    const levelUpChoices = toLevelUpChoices(validation.data)

    // Validate level-up choices
    const validationResult = validateLevelUpChoices(progChar, levelUpChoices)

    if (!validationResult.valid) {
      return NextResponse.json(
        {
          error: 'Invalid level-up choices',
          details: validationResult.errors,
        },
        { status: 400 }
      )
    }

    // Apply level-up
    const updates = applyLevelUp(progChar, levelUpChoices)

    // Update the character using service client
    const serviceSupabase = createServiceClient()
    const { data: updatedCharacter, error: updateError } = await serviceSupabase
      .from('characters')
      .update({
        level: updates.level,
        max_hp: updates.max_hp,
        subclass: updates.subclass,
        updated_at: new Date().toISOString(),
      })
      .eq('id', characterId)
      .select()
      .single()

    if (updateError || !updatedCharacter) {
      console.error('Error applying level-up:', updateError)
      return NextResponse.json(
        { error: 'Failed to apply level-up' },
        { status: 500 }
      )
    }

    const updatedChar = updatedCharacter as Record<string, unknown>

    return NextResponse.json({
      success: true,
      character: updatedCharacter,
      message: `${character.name} is now level ${updatedChar.level}!`,
    })
  } catch (error) {
    console.error('Level-up error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
