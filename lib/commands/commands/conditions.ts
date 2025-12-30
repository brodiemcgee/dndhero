import { Command, CommandResult } from '../types'

/**
 * D&D 5e condition descriptions
 */
const CONDITION_DESCRIPTIONS: Record<string, string> = {
  blinded: 'Cannot see. Auto-fail sight checks. Attack rolls have disadvantage, attacks against have advantage.',
  charmed: 'Cannot attack the charmer. Charmer has advantage on social checks.',
  deafened: 'Cannot hear. Auto-fail hearing checks.',
  frightened: 'Disadvantage on ability checks and attacks while source of fear is visible. Cannot willingly move closer to the source.',
  grappled: 'Speed becomes 0. Ends if grappler is incapacitated or you are moved apart.',
  incapacitated: 'Cannot take actions or reactions.',
  invisible: 'Impossible to see without special sense. Attacks against have disadvantage, your attacks have advantage.',
  paralyzed: 'Incapacitated and cannot move or speak. Auto-fail STR/DEX saves. Attacks have advantage, hits within 5ft are critical.',
  petrified: 'Transformed to stone. Incapacitated, unaware. Resistance to all damage. Immune to poison and disease.',
  poisoned: 'Disadvantage on attack rolls and ability checks.',
  prone: 'Can only crawl. Disadvantage on attacks. Melee attacks against have advantage, ranged have disadvantage.',
  restrained: 'Speed 0. Attacks have disadvantage. Attacks against have advantage. Disadvantage on DEX saves.',
  stunned: 'Incapacitated, cannot move, can only speak falteringly. Auto-fail STR/DEX saves. Attacks against have advantage.',
  unconscious: 'Incapacitated, cannot move or speak, unaware. Drop held items, fall prone. Auto-fail STR/DEX saves. Attacks have advantage, hits within 5ft are critical.',
  exhaustion: 'Cumulative levels (1-6). 1: Disadvantage on checks. 2: Speed halved. 3: Disadvantage on attacks/saves. 4: HP max halved. 5: Speed 0. 6: Death.',
  concentrating: 'Maintaining a concentration spell. Broken by casting another concentration spell, taking damage (CON save DC 10 or half damage), or being incapacitated.',
}

export const conditionsCommand: Command = {
  name: 'conditions',
  aliases: ['status', 'effects'],
  description: 'Show your current conditions and status effects',
  usage: '/conditions [condition name]',
  examples: ['/conditions', '/conditions frightened'],

  execute: async (args, context): Promise<CommandResult> => {
    const { supabase, characterId } = context

    // If an argument is provided, show info about that condition
    if (args.length > 0) {
      const conditionName = args.join(' ').toLowerCase()
      const description = CONDITION_DESCRIPTIONS[conditionName]

      if (description) {
        return {
          type: 'text',
          title: conditionName.charAt(0).toUpperCase() + conditionName.slice(1),
          content: description,
        }
      }

      // Check for partial match
      const matches = Object.keys(CONDITION_DESCRIPTIONS).filter(c =>
        c.includes(conditionName)
      )

      if (matches.length === 1) {
        return {
          type: 'text',
          title: matches[0].charAt(0).toUpperCase() + matches[0].slice(1),
          content: CONDITION_DESCRIPTIONS[matches[0]],
        }
      }

      if (matches.length > 1) {
        return {
          type: 'list',
          title: 'Multiple Matches',
          content: matches.map(m => `/${m}`),
        }
      }

      return {
        type: 'error',
        content: `Unknown condition: "${args.join(' ')}". Type /conditions to see all available conditions.`,
      }
    }

    // Fetch character conditions
    const { data: character, error } = await supabase
      .from('characters')
      .select('name, conditions, current_hp, max_hp')
      .eq('id', characterId)
      .single()

    if (error || !character) {
      return {
        type: 'error',
        content: 'Could not load character data.',
      }
    }

    const conditions = (character.conditions as string[]) || []

    if (conditions.length === 0) {
      // Show HP status and no active conditions
      const hpPercent = Math.round((character.current_hp / character.max_hp) * 100)
      let hpStatus = 'Healthy'
      if (character.current_hp <= 0) hpStatus = 'Down'
      else if (hpPercent <= 25) hpStatus = 'Bloodied'
      else if (hpPercent <= 50) hpStatus = 'Wounded'

      return {
        type: 'text',
        title: 'Status',
        content: `**${character.name}** has no active conditions.\n\nHP: ${character.current_hp}/${character.max_hp} (${hpStatus})\n\nType \`/conditions <name>\` to look up a condition's effects.`,
      }
    }

    // Show active conditions with descriptions
    const conditionList = conditions.map(c => {
      const normalized = c.toLowerCase()
      const desc = CONDITION_DESCRIPTIONS[normalized]
      return desc
        ? `**${c}**: ${desc}`
        : `**${c}**: (custom condition)`
    })

    return {
      type: 'list',
      title: `${character.name}'s Conditions`,
      content: conditionList,
    }
  },
}
