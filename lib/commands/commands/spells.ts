import { Command, CommandResult } from '../types'
import { getSpellsByIds, getSpellById, SPELLS } from '@/data/spells'
import type { Spell } from '@/types/spells'

/**
 * Format spell range for display
 */
function formatRange(range: Spell['range']): string {
  if (typeof range === 'string') return range
  if (range.type === 'feet') return `${range.distance} ft`
  if (range.type === 'miles') return `${range.distance} mile${range.distance > 1 ? 's' : ''}`
  return range.type
}

/**
 * Format spell duration for display
 */
function formatDuration(duration: Spell['duration'], concentration: boolean): string {
  const prefix = concentration ? 'Concentration, ' : ''
  if (typeof duration === 'string') return prefix + duration
  if (duration.type === 'rounds') return `${prefix}${duration.count} round${duration.count > 1 ? 's' : ''}`
  if (duration.type === 'minutes') return `${prefix}${duration.count} minute${duration.count > 1 ? 's' : ''}`
  if (duration.type === 'hours') return `${prefix}${duration.count} hour${duration.count > 1 ? 's' : ''}`
  if (duration.type === 'days') return `${prefix}${duration.count} day${duration.count > 1 ? 's' : ''}`
  return prefix + 'Special'
}

/**
 * Format a single spell for detailed display
 */
function formatSpellDetails(spell: Spell): string {
  const lines: string[] = []

  // Level and school
  const levelText = spell.level === 0
    ? `${spell.school.charAt(0).toUpperCase() + spell.school.slice(1)} cantrip`
    : `Level ${spell.level} ${spell.school}`
  lines.push(`*${levelText}*`)
  lines.push('')

  // Casting time, range, duration
  lines.push(`**Casting Time:** ${spell.castingTime}`)
  lines.push(`**Range:** ${formatRange(spell.range)}`)
  lines.push(`**Components:** ${spell.components.join(', ')}${spell.materialComponent ? ` (${spell.materialComponent})` : ''}`)
  lines.push(`**Duration:** ${formatDuration(spell.duration, spell.concentration)}`)

  // Tags
  const tags: string[] = []
  if (spell.ritual) tags.push('Ritual')
  if (spell.concentration) tags.push('Concentration')
  if (spell.attackRoll) tags.push('Attack Roll')
  if (spell.savingThrow) tags.push(`${spell.savingThrow} Save`)
  if (tags.length > 0) {
    lines.push(`**Tags:** ${tags.join(', ')}`)
  }
  lines.push('')

  // Description
  lines.push(spell.description)

  // Higher levels
  if (spell.higherLevels) {
    lines.push('')
    lines.push(`**At Higher Levels:** ${spell.higherLevels}`)
  }

  return lines.join('\n')
}

/**
 * Format spell for list display (one-liner)
 */
function formatSpellBrief(spell: Spell, isPrepared: boolean): string {
  const tags: string[] = []
  if (spell.ritual) tags.push('R')
  if (spell.concentration) tags.push('C')
  if (isPrepared) tags.push('*')

  const tagStr = tags.length > 0 ? ` [${tags.join('')}]` : ''
  return `${spell.name}${tagStr}`
}

export const spellsCommand: Command = {
  name: 'spells',
  aliases: ['spell'],
  description: 'Show your spells or look up a specific spell',
  usage: '/spells [spell name]',
  examples: ['/spells', '/spells fireball', '/spells magic missile'],

  execute: async (args, context): Promise<CommandResult> => {
    const { supabase, characterId } = context

    // Check if we have a character
    if (!characterId) {
      return {
        type: 'error',
        content: 'No character found. You need a character in this campaign to use this command.',
      }
    }

    // If an argument is provided, search for that spell
    if (args.length > 0) {
      const searchTerm = args.join(' ').toLowerCase()

      // First try exact match in character's spells
      const { data: character } = await supabase
        .from('characters')
        .select('cantrips, known_spells, prepared_spells')
        .eq('id', characterId)
        .single()

      const characterSpellIds = [
        ...(character?.cantrips || []),
        ...(character?.known_spells || []),
        ...(character?.prepared_spells || []),
      ]

      // Search all spells matching the query
      const matches = SPELLS.filter(s =>
        s.name.toLowerCase().includes(searchTerm) ||
        s.id.toLowerCase().includes(searchTerm)
      )

      if (matches.length === 0) {
        return {
          type: 'error',
          content: `No spell found matching "${args.join(' ')}".`,
        }
      }

      if (matches.length === 1) {
        const spell = matches[0]
        const hasSpell = characterSpellIds.includes(spell.id)
        return {
          type: 'text',
          title: `${spell.name}${hasSpell ? ' (Known)' : ''}`,
          content: formatSpellDetails(spell),
        }
      }

      // Multiple matches - show list
      return {
        type: 'list',
        title: `Spells matching "${args.join(' ')}"`,
        content: matches.slice(0, 10).map(s => {
          const hasSpell = characterSpellIds.includes(s.id)
          const levelLabel = s.level === 0 ? 'Cantrip' : `Lvl ${s.level}`
          return `**${s.name}** (${levelLabel})${hasSpell ? ' - Known' : ''}`
        }),
      }
    }

    // No args - show character's spells
    const { data: character, error } = await supabase
      .from('characters')
      .select(`
        name,
        class,
        cantrips,
        known_spells,
        prepared_spells,
        spell_slots,
        spell_slots_used,
        spellcasting_ability
      `)
      .eq('id', characterId)
      .single()

    if (error || !character) {
      return {
        type: 'error',
        content: 'Could not load character data.',
      }
    }

    const cantrips = getSpellsByIds(character.cantrips || [])
    const knownSpells = getSpellsByIds(character.known_spells || [])
    const preparedSpells = new Set(character.prepared_spells || [])

    // If no spells at all
    if (cantrips.length === 0 && knownSpells.length === 0) {
      return {
        type: 'text',
        title: 'Spells',
        content: `${character.name} doesn't know any spells.`,
      }
    }

    // Build spell list grouped by level
    const lines: string[] = []

    // Add spellcasting ability if present
    if (character.spellcasting_ability) {
      const ability = character.spellcasting_ability.toUpperCase().slice(0, 3)
      lines.push(`**Spellcasting:** ${ability}`)
      lines.push('')
    }

    // Format spell slots
    const slots = character.spell_slots || {}
    const slotsUsed = character.spell_slots_used || {}
    const slotParts: string[] = []

    for (let level = 1; level <= 9; level++) {
      const slotData = slots[level]
      if (slotData && slotData.max > 0) {
        const used = slotsUsed[level] || 0
        const remaining = slotData.max - used
        slotParts.push(`${level}: ${remaining}/${slotData.max}`)
      }
    }

    if (slotParts.length > 0) {
      lines.push(`**Slots:** ${slotParts.join(' | ')}`)
      lines.push('')
    }

    // Cantrips
    if (cantrips.length > 0) {
      lines.push('**Cantrips:**')
      cantrips.forEach(spell => {
        lines.push(`  ${formatSpellBrief(spell, false)}`)
      })
      lines.push('')
    }

    // Group spells by level
    const spellsByLevel = new Map<number, Spell[]>()
    knownSpells.forEach(spell => {
      if (spell.level > 0) {
        const level = spell.level
        if (!spellsByLevel.has(level)) {
          spellsByLevel.set(level, [])
        }
        spellsByLevel.get(level)!.push(spell)
      }
    })

    // Display spells by level
    const sortedLevels = Array.from(spellsByLevel.keys()).sort((a, b) => a - b)
    for (const level of sortedLevels) {
      const spells = spellsByLevel.get(level)!
      lines.push(`**Level ${level}:**`)
      spells.forEach(spell => {
        const isPrepared = preparedSpells.has(spell.id)
        lines.push(`  ${formatSpellBrief(spell, isPrepared)}`)
      })
      lines.push('')
    }

    // Legend
    lines.push('`* = prepared, C = concentration, R = ritual`')
    lines.push('`/spells <name>` for details')

    return {
      type: 'text',
      title: `${character.name}'s Spells`,
      content: lines.join('\n'),
    }
  },
}
