/**
 * Spell Slots API Route
 * GET: Returns current spell slot status
 * PATCH: Updates spell slot usage (cast/rest)
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSpellSlotsForLevel, canCastSpells, getHighestSpellLevel } from '@/lib/engine/spells/caster-types'
import type { DndClass, SpellLevel } from '@/types/spells'

const UseSpellSlotSchema = z.object({
  action: z.enum(['cast', 'short_rest', 'long_rest']),
  spell_level: z.number().int().min(1).max(9).optional(),
})

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
      .select('id, user_id, name, class, level, spell_slots_used')
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

    const characterClass = character.class as DndClass
    const characterLevel = character.level as number

    // Check if class can cast spells
    if (!canCastSpells(characterClass, characterLevel)) {
      return NextResponse.json({
        can_cast: false,
        message: `${character.class} cannot cast spells at level ${characterLevel}`,
      })
    }

    // Get spell slots for this class and level
    const maxSlots = getSpellSlotsForLevel(characterClass, characterLevel)
    const usedSlots = (character.spell_slots_used || {}) as Record<string, number>
    const highestLevel = getHighestSpellLevel(characterClass, characterLevel)

    // Calculate remaining slots
    const slots: Record<string, { max: number; used: number; remaining: number }> = {}

    for (const [levelStr, max] of Object.entries(maxSlots)) {
      const used = usedSlots[levelStr] || 0
      slots[levelStr] = {
        max,
        used,
        remaining: Math.max(0, max - used),
      }
    }

    return NextResponse.json({
      can_cast: true,
      character_name: character.name,
      character_class: character.class,
      character_level: characterLevel,
      highest_spell_level: highestLevel,
      slots,
    })
  } catch (error) {
    console.error('Get spell slots error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const characterId = params.id
    const body = await request.json()

    // Validate input
    const validation = UseSpellSlotSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { action, spell_level } = validation.data

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

    const characterClass = character.class as DndClass
    const characterLevel = character.level as number

    // Check if class can cast spells
    if (!canCastSpells(characterClass, characterLevel)) {
      return NextResponse.json(
        { error: `${character.class} cannot cast spells at level ${characterLevel}` },
        { status: 400 }
      )
    }

    const maxSlots = getSpellSlotsForLevel(characterClass, characterLevel)
    let usedSlots = { ...(character.spell_slots_used || {}) } as Record<string, number>
    let message = ''

    switch (action) {
      case 'cast':
        if (!spell_level) {
          return NextResponse.json(
            { error: 'spell_level is required for cast action' },
            { status: 400 }
          )
        }

        const levelKey = spell_level.toString()
        const maxForLevel = maxSlots[spell_level as SpellLevel] || 0

        if (maxForLevel === 0) {
          return NextResponse.json(
            { error: `No spell slots available at level ${spell_level}` },
            { status: 400 }
          )
        }

        const currentUsed = usedSlots[levelKey] || 0
        if (currentUsed >= maxForLevel) {
          return NextResponse.json(
            { error: `No level ${spell_level} spell slots remaining` },
            { status: 400 }
          )
        }

        usedSlots[levelKey] = currentUsed + 1
        message = `Used 1 level ${spell_level} spell slot`
        break

      case 'short_rest':
        // Warlocks recover all slots on short rest
        if (characterClass === 'Warlock') {
          usedSlots = {}
          message = 'All Pact Magic slots recovered (short rest)'
        } else {
          message = 'Short rest completed (no spell slots recovered for non-warlocks)'
        }
        break

      case 'long_rest':
        // All casters recover all slots on long rest
        usedSlots = {}
        message = 'All spell slots recovered (long rest)'
        break
    }

    // Update the character using service client
    const serviceSupabase = createServiceClient()
    const { data: updatedCharacter, error: updateError } = await serviceSupabase
      .from('characters')
      .update({
        spell_slots_used: usedSlots,
        updated_at: new Date().toISOString(),
      })
      .eq('id', characterId)
      .select('id, name, spell_slots_used')
      .single()

    if (updateError || !updatedCharacter) {
      console.error('Error updating spell slots:', updateError)
      return NextResponse.json(
        { error: 'Failed to update spell slots' },
        { status: 500 }
      )
    }

    const updatedChar = updatedCharacter as Record<string, unknown>

    // Return updated slot info
    const updatedUsedSlots = (updatedChar.spell_slots_used || {}) as Record<string, number>
    const slots: Record<string, { max: number; used: number; remaining: number }> = {}

    for (const [levelStr, max] of Object.entries(maxSlots)) {
      const used = updatedUsedSlots[levelStr] || 0
      slots[levelStr] = {
        max,
        used,
        remaining: Math.max(0, max - used),
      }
    }

    return NextResponse.json({
      success: true,
      message,
      slots,
    })
  } catch (error) {
    console.error('Update spell slots error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
