/**
 * Create Character API Route
 * Creates a D&D 5e character (standalone or for a campaign)
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getProficiencyBonus } from '@/lib/engine/core/abilities'
import { getSpellSlotsForLevel, CLASS_CASTER_CONFIGS } from '@/lib/engine/spells/caster-types'
import type { DndClass } from '@/types/spells'

const CreateCharacterSchema = z.object({
  // campaign_id is now optional - if not provided, creates a standalone character
  campaign_id: z.string().uuid().optional().nullable(),
  name: z.string().min(2).max(50),
  race: z.string().min(2).max(50),
  class: z.string().min(2).max(50),
  level: z.number().int().min(1).max(20).default(1),
  background: z.string().min(2).max(100),
  alignment: z.string().optional(),

  // Ability scores
  strength: z.number().int().min(1).max(30),
  dexterity: z.number().int().min(1).max(30),
  constitution: z.number().int().min(1).max(30),
  intelligence: z.number().int().min(1).max(30),
  wisdom: z.number().int().min(1).max(30),
  charisma: z.number().int().min(1).max(30),

  // Calculated stats
  max_hp: z.number().int().min(1),
  armor_class: z.number().int().min(1),

  // Proficiencies
  skill_proficiencies: z.array(z.string()),
  saving_throw_proficiencies: z.array(z.string()),

  // Spellcasting (optional)
  spellcasting_ability: z.enum(['intelligence', 'wisdom', 'charisma']).optional(),
  spell_slots: z.record(z.object({ max: z.number(), used: z.number() })).optional(),
  cantrips: z.array(z.string()).optional().default([]),
  known_spells: z.array(z.string()).optional().default([]),
  prepared_spells: z.array(z.string()).optional().default([]),

  // Physical appearance (optional)
  gender: z.string().optional(),
  age: z.string().optional(),
  height: z.string().optional(),
  build: z.string().optional(),
  skin_tone: z.string().optional(),
  hair_color: z.string().optional(),
  hair_style: z.string().optional(),
  eye_color: z.string().optional(),
  distinguishing_features: z.string().optional(),
  clothing_style: z.string().optional(),

  // Flavor
  personality_traits: z.string().optional(),
  ideals: z.string().optional(),
  bonds: z.string().optional(),
  flaws: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validation = CreateCharacterSchema.safeParse(body)

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
        {
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const characterData = validation.data
    const serviceSupabase = createServiceClient()

    // Check character limit using database function
    const { data: canCreate, error: limitError } = await serviceSupabase
      .rpc('can_create_character', { check_user_id: user.id })

    if (limitError) {
      console.error('Error checking character limit:', limitError)
    }

    if (canCreate === false) {
      return NextResponse.json(
        {
          error: 'Character limit reached for your subscription tier. Upgrade your plan or delete existing characters.',
          code: 'CHARACTER_LIMIT_REACHED',
        },
        { status: 403 }
      )
    }

    // If campaign_id is provided, verify membership and check for existing character
    if (characterData.campaign_id) {
      // Verify user is a member of the campaign
      const { data: membership } = await supabase
        .from('campaign_members')
        .select('active')
        .eq('campaign_id', characterData.campaign_id)
        .eq('user_id', user.id)
        .single()

      if (!membership || !membership.active) {
        return NextResponse.json(
          {
            error: 'You are not a member of this campaign',
          },
          { status: 403 }
        )
      }

      // Check if user already has a character in this campaign
      const { data: existingChar } = await supabase
        .from('characters')
        .select('id')
        .eq('campaign_id', characterData.campaign_id)
        .eq('user_id', user.id)
        .single()

      if (existingChar) {
        return NextResponse.json(
          {
            error: 'You already have a character in this campaign',
          },
          { status: 400 }
        )
      }
    }

    // Calculate proficiency bonus
    const proficiencyBonus = getProficiencyBonus(characterData.level)

    // Ensure all numeric values are actually numbers (not strings)
    const ensureNumber = (val: any): number => {
      const num = Number(val)
      return isNaN(num) ? 0 : num
    }

    // Calculate spell slots based on class and level
    const dndClass = characterData.class as DndClass
    const rawSlots = getSpellSlotsForLevel(dndClass, characterData.level)
    const spellSlots: Record<string, { max: number; used: number }> = {}
    for (const [level, count] of Object.entries(rawSlots)) {
      if (count && count > 0) {
        spellSlots[level] = { max: count, used: 0 }
      }
    }

    // Merge cantrips and spells into known_spells array
    const allKnownSpells = [
      ...(characterData.cantrips || []),
      ...(characterData.known_spells || []),
    ]

    // Create character (campaign_id can be null for standalone characters)
    const { data: character, error: createError } = await serviceSupabase
      .from('characters')
      .insert({
        campaign_id: characterData.campaign_id || null,
        user_id: user.id,
        name: characterData.name,
        race: characterData.race,
        class: characterData.class,
        level: ensureNumber(characterData.level),
        background: characterData.background,
        alignment: characterData.alignment,

        strength: ensureNumber(characterData.strength),
        dexterity: ensureNumber(characterData.dexterity),
        constitution: ensureNumber(characterData.constitution),
        intelligence: ensureNumber(characterData.intelligence),
        wisdom: ensureNumber(characterData.wisdom),
        charisma: ensureNumber(characterData.charisma),

        current_hp: ensureNumber(characterData.max_hp),
        max_hp: ensureNumber(characterData.max_hp),
        temp_hp: 0,
        armor_class: ensureNumber(characterData.armor_class),

        proficiency_bonus: proficiencyBonus,
        skill_proficiencies: Array.isArray(characterData.skill_proficiencies)
          ? characterData.skill_proficiencies
          : [],
        saving_throw_proficiencies: Array.isArray(characterData.saving_throw_proficiencies)
          ? characterData.saving_throw_proficiencies
          : [],

        spellcasting_ability: characterData.spellcasting_ability,
        spell_slots: Object.keys(spellSlots).length > 0 ? spellSlots : {},
        known_spells: allKnownSpells,

        // Physical appearance
        gender: characterData.gender || null,
        age: characterData.age || null,
        height: characterData.height || null,
        build: characterData.build || null,
        skin_tone: characterData.skin_tone || null,
        hair_color: characterData.hair_color || null,
        hair_style: characterData.hair_style || null,
        eye_color: characterData.eye_color || null,
        distinguishing_features: characterData.distinguishing_features || null,
        clothing_style: characterData.clothing_style || null,

        // Personality traits (stored as arrays in database)
        personality_traits: characterData.personality_traits
          ? [characterData.personality_traits]
          : [],
        ideals: characterData.ideals ? [characterData.ideals] : [],
        bonds: characterData.bonds ? [characterData.bonds] : [],
        flaws: characterData.flaws ? [characterData.flaws] : [],

        // Initialize empty inventory/equipment
        inventory: [],
        equipment: {},

        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError || !character) {
      console.error('Character creation error:', createError)
      return NextResponse.json(
        {
          error: 'Failed to create character',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      character,
    })
  } catch (error) {
    console.error('Create character error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
