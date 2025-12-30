import { Command, CommandResult } from '../types'
import { getAllCommands } from '../registry'

export const helpCommand: Command = {
  name: 'help',
  aliases: ['?', 'rules'],
  description: 'Get help with commands or ask a D&D rules question',
  usage: '/help [command or rules question]',
  examples: ['/help', '/help spells', '/help how does grappling work?'],

  execute: async (args): Promise<CommandResult> => {
    // No args - show command list
    if (args.length === 0) {
      const commands = getAllCommands()

      const commandList = commands.map(cmd => {
        const aliases = cmd.aliases?.length ? ` (${cmd.aliases.join(', ')})` : ''
        return `**/${cmd.name}**${aliases}\n  ${cmd.description}`
      })

      return {
        type: 'text',
        title: 'Available Commands',
        content: commandList.join('\n\n') + '\n\n*Type `/help <question>` to ask a D&D rules question.*',
      }
    }

    // Check if first arg is a command name
    const firstArg = args[0].toLowerCase().replace(/^\//, '')
    const commands = getAllCommands()
    const matchedCommand = commands.find(cmd =>
      cmd.name === firstArg || cmd.aliases?.includes(firstArg)
    )

    if (matchedCommand && args.length === 1) {
      // Show help for specific command
      const aliases = matchedCommand.aliases?.length
        ? `\n**Aliases:** ${matchedCommand.aliases.map(a => '/' + a).join(', ')}`
        : ''

      const examples = matchedCommand.examples.length
        ? `\n\n**Examples:**\n${matchedCommand.examples.map(e => `  ${e}`).join('\n')}`
        : ''

      return {
        type: 'text',
        title: `/${matchedCommand.name}`,
        content: `${matchedCommand.description}${aliases}\n\n**Usage:** \`${matchedCommand.usage}\`${examples}`,
      }
    }

    // Treat as rules question
    const question = args.join(' ')

    try {
      const response = await fetch('/api/commands/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          type: 'error',
          content: data.error || 'Failed to get rules answer. Please try again.',
        }
      }

      return {
        type: 'text',
        title: 'Rules Reference',
        content: data.answer,
      }
    } catch (error) {
      return {
        type: 'error',
        content: 'Failed to connect to rules service. Please try again.',
      }
    }
  },
}
