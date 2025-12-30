/**
 * Admin API: Assign Random Spells to Characters
 * Populates existing characters with appropriate random spells based on their class
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { DndClass, SpellLevel } from '@/types/spells'
import {
  getCantripsKnown,
  getSpellsKnownCount,
  getHighestSpellLevel,
  getSpellSlotsForLevel,
  CLASS_CASTER_CONFIGS,
  calculateMaxPreparedSpells,
} from '@/lib/engine/spells/caster-types'
import { getRandomSpells, isSpellcaster } from '@/data/spells'

interface CharacterRecord {
  id: string
  class: string
  level: number
  intelligence: number
  wisdom: number
  charisma: number
  known_spells: string[] | null
}

export async function POST(request: Request) {
  try {
    const { client: supabase } = createClient(request)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service client for admin operations
    const serviceSupabase = createServiceClient()

    // Fetch all characters that need spells assigned
    const { data: characters, error: fetchError } = await serviceSupabase
      .from('characters')
      .select('id, class, level, intelligence, wisdom, charisma, known_spells')
      .returns<CharacterRecord[]>()

    if (fetchError) {
      console.error('Error fetching characters:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 })
    }

    if (!characters || characters.length === 0) {
      return NextResponse.json({ message: 'No characters found', updated: 0 })
    }

    const results: { id: string; name: string; spellsAssigned: number; cantripAssigned: number }[] = []

    for (const character of characters) {
      const className = character.class as DndClass

      // Skip non-casters
      if (!isSpellcaster(className)) {
        continue
      }

      // Skip characters that already have spells
      if (character.known_spells && character.known_spells.length > 0) {
        continue
      }

      const config = CLASS_CASTER_CONFIGS[className]

      // Skip if class hasn't started casting at this level
      if (character.level < config.startsAtLevel) {
        continue
      }

      // Calculate number of cantrips
      const cantripCount = getCantripsKnown(className, character.level)

      // Calculate number of spells
      const highestSpellLevel = getHighestSpellLevel(className, character.level)
      let spellCount = 0

      if (config.spellKnowledge === 'known') {
        // Known casters: use spellsKnown table
        spellCount = getSpellsKnownCount(className, character.level)
      } else {
        // Prepared casters: calculate from ability mod + level
        const abilityMap: Record<string, keyof CharacterRecord> = {
          INT: 'intelligence',
          WIS: 'wisdom',
          CHA: 'charisma',
        }
        const abilityKey = config.spellcastingAbility ? abilityMap[config.spellcastingAbility] : null
        const abilityScore = abilityKey ? (character[abilityKey] as number) || 10 : 10
        const abilityMod = Math.floor((abilityScore - 10) / 2)
        spellCount = calculateMaxPreparedSpells(abilityMod, character.level)
      }

      // Get random spells
      const { cantrips, spells } = getRandomSpells(
        className,
        highestSpellLevel,
        cantripCount,
        spellCount
      )

      // Calculate spell slots
      const rawSlots = getSpellSlotsForLevel(className, character.level)
      const spellSlots: Record<string, { max: number; used: number }> = {}
      for (const [level, count] of Object.entries(rawSlots)) {
        if (count && count > 0) {
          spellSlots[level] = { max: count, used: 0 }
        }
      }

      // Merge cantrips and spells
      const allSpells = [...cantrips, ...spells]

      // Update character using SQL for type compatibility with strict Supabase types
      const spellsArray = `ARRAY[${allSpells.map(s => `'${s}'`).join(',')}]::text[]`
      const slotsJson = JSON.stringify(spellSlots)

      const { error: updateError } = await serviceSupabase.rpc('execute_sql' as never, {
        query: `UPDATE characters SET known_spells = ${spellsArray}, spell_slots = '${slotsJson}'::jsonb WHERE id = '${character.id}'`,
      } as never)

      if (updateError) {
        console.error(`Error updating character ${character.id}:`, updateError)
        continue
      }

      results.push({
        id: character.id,
        name: className,
        spellsAssigned: spells.length,
        cantripAssigned: cantrips.length,
      })
    }

    return NextResponse.json({
      message: `Successfully assigned spells to ${results.length} characters`,
      updated: results.length,
      details: results,
    })
  } catch (error) {
    console.error('Assign spells error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
