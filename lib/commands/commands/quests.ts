import { Command, CommandResult } from '../types'

interface QuestObjective {
  id: string
  description: string
  completed: boolean
  optional?: boolean
}

interface Quest {
  id: string
  campaign_id: string
  title: string
  description: string
  status: 'active' | 'completed' | 'failed' | 'abandoned'
  objectives: QuestObjective[]
  giver_name?: string
  reward_description?: string
  created_at: string
  completed_at?: string
}

/**
 * Format quest status with icon
 */
function formatStatus(status: Quest['status']): string {
  switch (status) {
    case 'active': return 'In Progress'
    case 'completed': return 'Completed'
    case 'failed': return 'Failed'
    case 'abandoned': return 'Abandoned'
    default: return status
  }
}

/**
 * Format a single quest for detailed display
 */
function formatQuestDetails(quest: Quest): string {
  const lines: string[] = []

  lines.push(`*${formatStatus(quest.status)}*`)
  lines.push('')

  if (quest.giver_name) {
    lines.push(`**Given by:** ${quest.giver_name}`)
  }

  lines.push('')
  lines.push(quest.description)
  lines.push('')

  // Objectives
  if (quest.objectives && quest.objectives.length > 0) {
    lines.push('**Objectives:**')
    quest.objectives.forEach(obj => {
      const checkbox = obj.completed ? '[x]' : '[ ]'
      const optional = obj.optional ? ' *(optional)*' : ''
      lines.push(`  ${checkbox} ${obj.description}${optional}`)
    })
  }

  // Reward
  if (quest.reward_description) {
    lines.push('')
    lines.push(`**Reward:** ${quest.reward_description}`)
  }

  return lines.join('\n')
}

export const questsCommand: Command = {
  name: 'quests',
  aliases: ['quest', 'q', 'journal'],
  description: 'Show your active quests and objectives',
  usage: '/quests [quest name]',
  examples: ['/quests', '/quests rescue'],

  execute: async (args, context): Promise<CommandResult> => {
    const { supabase, campaignId } = context

    // Fetch all quests for the campaign
    const { data: quests, error } = await supabase
      .from('quests')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        type: 'error',
        content: 'Could not load quest data.',
      }
    }

    if (!quests || quests.length === 0) {
      return {
        type: 'text',
        title: 'Quests',
        content: 'No quests yet. Your adventure awaits!',
      }
    }

    // If args provided, search for specific quest
    if (args.length > 0) {
      const searchTerm = args.join(' ').toLowerCase()

      const matches = quests.filter(q =>
        q.title.toLowerCase().includes(searchTerm) ||
        q.description.toLowerCase().includes(searchTerm)
      )

      if (matches.length === 0) {
        return {
          type: 'error',
          content: `No quest found matching "${args.join(' ')}".`,
        }
      }

      if (matches.length === 1) {
        return {
          type: 'text',
          title: matches[0].title,
          content: formatQuestDetails(matches[0]),
        }
      }

      // Multiple matches
      return {
        type: 'list',
        title: `Quests matching "${args.join(' ')}"`,
        content: matches.map(q => `**${q.title}** - ${formatStatus(q.status)}`),
      }
    }

    // No args - show quest summary
    const activeQuests = quests.filter(q => q.status === 'active')
    const completedQuests = quests.filter(q => q.status === 'completed')

    const lines: string[] = []

    // Active quests
    if (activeQuests.length > 0) {
      lines.push('**Active Quests:**')
      lines.push('')

      activeQuests.forEach(quest => {
        const objectives = quest.objectives || []
        const completed = objectives.filter((o: QuestObjective) => o.completed).length
        const total = objectives.length

        lines.push(`**${quest.title}**`)
        if (total > 0) {
          lines.push(`  Progress: ${completed}/${total} objectives`)
        }

        // Show uncompleted objectives
        const remaining = objectives.filter((o: QuestObjective) => !o.completed)
        remaining.slice(0, 2).forEach((obj: QuestObjective) => {
          const optional = obj.optional ? ' *(optional)*' : ''
          lines.push(`  [ ] ${obj.description}${optional}`)
        })

        if (remaining.length > 2) {
          lines.push(`  ... and ${remaining.length - 2} more`)
        }

        lines.push('')
      })
    } else {
      lines.push('No active quests.')
      lines.push('')
    }

    // Completed count
    if (completedQuests.length > 0) {
      lines.push(`*${completedQuests.length} completed quest${completedQuests.length > 1 ? 's' : ''}*`)
    }

    lines.push('')
    lines.push('`/quests <name>` for details')

    return {
      type: 'text',
      title: 'Quest Journal',
      content: lines.join('\n'),
    }
  },
}
