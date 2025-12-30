import { Command, CommandResult, TableData } from '../types'

/**
 * Calculate ability modifier from score
 */
function getModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

/**
 * Format modifier as string with sign
 */
function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

export const statsCommand: Command = {
  name: 'stats',
  aliases: ['abilities', 'ability'],
  description: 'Show your ability scores, modifiers, and saving throws',
  usage: '/stats',
  examples: ['/stats'],

  execute: async (args, context): Promise<CommandResult> => {
    const { supabase, characterId } = context

    const { data: character, error } = await supabase
      .from('characters')
      .select(`
        name,
        class,
        level,
        strength,
        dexterity,
        constitution,
        intelligence,
        wisdom,
        charisma,
        proficiency_bonus,
        saving_throw_proficiencies,
        current_hp,
        max_hp,
        temp_hp,
        armor_class
      `)
      .eq('id', characterId)
      .single()

    if (error || !character) {
      return {
        type: 'error',
        content: 'Could not load character data.',
      }
    }

    const abilities = [
      { name: 'STR', full: 'Strength', score: character.strength },
      { name: 'DEX', full: 'Dexterity', score: character.dexterity },
      { name: 'CON', full: 'Constitution', score: character.constitution },
      { name: 'INT', full: 'Intelligence', score: character.intelligence },
      { name: 'WIS', full: 'Wisdom', score: character.wisdom },
      { name: 'CHA', full: 'Charisma', score: character.charisma },
    ]

    const savingProfs = character.saving_throw_proficiencies || []
    const profBonus = character.proficiency_bonus || 2

    const tableData: TableData = {
      headers: ['Ability', 'Score', 'Mod', 'Save'],
      rows: abilities.map(ab => {
        const mod = getModifier(ab.score)
        const isProficient = savingProfs.includes(ab.full.toLowerCase())
        const saveBonus = mod + (isProficient ? profBonus : 0)
        const profMark = isProficient ? '*' : ''

        return [
          ab.name,
          ab.score.toString(),
          formatModifier(mod),
          `${formatModifier(saveBonus)}${profMark}`,
        ]
      }),
    }

    // Build summary line
    const hpDisplay = character.temp_hp > 0
      ? `${character.current_hp}+${character.temp_hp}/${character.max_hp}`
      : `${character.current_hp}/${character.max_hp}`

    const summary = `**${character.name}** | Level ${character.level} ${character.class}\nHP: ${hpDisplay} | AC: ${character.armor_class} | Prof: +${profBonus}\n\n* = proficient in saving throw`

    return {
      type: 'table',
      title: 'Ability Scores',
      content: tableData,
      metadata: {
        summary,
      },
    }
  },
}
