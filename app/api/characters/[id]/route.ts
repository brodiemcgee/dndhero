/**
 * Character API Route
 * DELETE: Deletes a standalone character (not in any campaign)
 * PATCH: Updates editable character fields
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAbilityModifier, getSkillBonus } from '@/lib/engine/core/abilities'

// Schema for PATCH requests - only editable fields
const UpdateCharacterSchema = z.object({
  // Basic info
  name: z.string().min(2).max(50).optional(),
  background: z.string().min(2).max(100).optional().nullable(),
  alignment: z.string().optional().nullable(),

  // Ability scores
  strength: z.number().int().min(1).max(30).optional(),
  dexterity: z.number().int().min(1).max(30).optional(),
  constitution: z.number().int().min(1).max(30).optional(),
  intelligence: z.number().int().min(1).max(30).optional(),
  wisdom: z.number().int().min(1).max(30).optional(),
  charisma: z.number().int().min(1).max(30).optional(),

  // Combat stats
  current_hp: z.number().int().min(0).optional(),
  temp_hp: z.number().int().min(0).optional(),
  armor_class: z.number().int().min(1).optional(),
  speed: z.number().int().min(0).optional(),
  initiative_bonus: z.number().int().optional(),

  // Death saves
  inspiration: z.boolean().optional(),
  death_save_successes: z.number().int().min(0).max(3).optional(),
  death_save_failures: z.number().int().min(0).max(3).optional(),

  // Proficiencies
  skill_proficiencies: z.array(z.string()).optional(),
  tool_proficiencies: z.array(z.string()).optional(),
  language_proficiencies: z.array(z.string()).optional(),

  // Appearance
  gender: z.string().optional().nullable(),
  age: z.string().optional().nullable(),
  height: z.string().optional().nullable(),
  build: z.string().optional().nullable(),
  skin_tone: z.string().optional().nullable(),
  hair_color: z.string().optional().nullable(),
  hair_style: z.string().optional().nullable(),
  eye_color: z.string().optional().nullable(),
  distinguishing_features: z.string().optional().nullable(),
  clothing_style: z.string().optional().nullable(),

  // Personality
  personality_traits: z.array(z.string()).optional(),
  ideals: z.array(z.string()).optional(),
  bonds: z.array(z.string()).optional(),
  flaws: z.array(z.string()).optional(),

  // Backstory
  backstory: z.string().optional().nullable(),
  allies_and_organizations: z.array(z.any()).optional(),
  additional_features: z.string().optional().nullable(),

  // Equipment & Inventory
  equipment: z.record(z.any()).optional(),
  inventory: z.array(z.any()).optional(),
  currency: z.object({
    cp: z.number(),
    sp: z.number(),
    ep: z.number(),
    gp: z.number(),
    pp: z.number(),
  }).optional(),
  attacks: z.array(z.object({
    name: z.string(),
    attack_bonus: z.number(),
    damage: z.string(),
    damage_type: z.string(),
  })).optional(),

  // Spellcasting
  cantrips: z.array(z.string()).optional(),
  known_spells: z.array(z.string()).optional(),
  prepared_spells: z.array(z.string()).optional(),
  spell_slots_used: z.record(z.number()).optional(),
})

// Locked fields that cannot be updated via PATCH
const LOCKED_FIELDS = [
  'id',
  'user_id',
  'campaign_id',
  'race',
  'class',
  'created_at',
]

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const characterId = params.id
    const body = await request.json()

    // Check for locked fields in request
    const lockedFieldsInRequest = LOCKED_FIELDS.filter(field => field in body)
    if (lockedFieldsInRequest.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot update locked fields',
          locked_fields: lockedFieldsInRequest,
        },
        { status: 400 }
      )
    }

    // Validate input
    const validation = UpdateCharacterSchema.safeParse(body)
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

    // Get the character and verify ownership
    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single()

    if (charError || !character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      )
    }

    if (character.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not own this character' },
        { status: 403 }
      )
    }

    const updates = validation.data

    // Recalculate passive_perception if wisdom changes or skill_proficiencies change
    const recalculatedFields: Record<string, unknown> = {}

    const wisdomChanged = updates.wisdom !== undefined
    const skillProfsChanged = updates.skill_proficiencies !== undefined

    if (wisdomChanged || skillProfsChanged) {
      const wisdom = updates.wisdom ?? character.wisdom
      const skillProficiencies = updates.skill_proficiencies ?? character.skill_proficiencies
      const level = character.level

      // Passive perception = 10 + Perception skill modifier
      const isPerceptionProficient = skillProficiencies?.includes('Perception') ?? false
      const perceptionBonus = getSkillBonus(wisdom, isPerceptionProficient, level)
      recalculatedFields.passive_perception = 10 + perceptionBonus
    }

    // Merge updates with recalculated fields
    const finalUpdates = {
      ...updates,
      ...recalculatedFields,
      updated_at: new Date().toISOString(),
    }

    // Update the character using service client
    const serviceSupabase = createServiceClient()
    const { data: updatedCharacter, error: updateError } = await serviceSupabase
      .from('characters')
      .update(finalUpdates)
      .eq('id', characterId)
      .select()
      .single()

    if (updateError || !updatedCharacter) {
      console.error('Error updating character:', updateError)
      return NextResponse.json(
        { error: 'Failed to update character' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      character: updatedCharacter,
    })
  } catch (error) {
    console.error('Update character error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Get the character and verify ownership
    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, user_id, campaign_id, name')
      .eq('id', characterId)
      .single()

    if (charError || !character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      )
    }

    if (character.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not own this character' },
        { status: 403 }
      )
    }

    // Only allow deletion of standalone characters (not in a campaign)
    if (character.campaign_id) {
      return NextResponse.json(
        { error: 'Cannot delete a character that is assigned to a campaign. Remove from campaign first.' },
        { status: 400 }
      )
    }

    // Delete the character using service client
    const serviceSupabase = createServiceClient()
    const { error: deleteError } = await serviceSupabase
      .from('characters')
      .delete()
      .eq('id', characterId)

    if (deleteError) {
      console.error('Error deleting character:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete character' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${character.name} has been deleted`,
    })
  } catch (error) {
    console.error('Delete character error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
