import { Command, CommandResult } from '../types'

export const clearCommand: Command = {
  name: 'clear',
  aliases: ['cls'],
  description: 'Clear all command responses from the chat',
  usage: '/clear',
  examples: ['/clear'],

  execute: async (): Promise<CommandResult> => {
    return {
      type: 'text',
      content: '',
      metadata: {
        clearPrivateMessages: true,
      },
    }
  },
}
