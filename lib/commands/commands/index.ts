/**
 * Command Registration
 * Imports and registers all available commands
 */

import { registerCommand } from '../registry'
import { rollCommand } from './roll'
import { statsCommand } from './stats'
import { conditionsCommand } from './conditions'
import { spellsCommand } from './spells'
import { inventoryCommand } from './inventory'
import { questsCommand } from './quests'
import { helpCommand } from './help'

// Register all commands
export function registerAllCommands(): void {
  registerCommand(rollCommand)
  registerCommand(statsCommand)
  registerCommand(conditionsCommand)
  registerCommand(spellsCommand)
  registerCommand(inventoryCommand)
  registerCommand(questsCommand)
  registerCommand(helpCommand)
}

// Auto-register on import
registerAllCommands()

// Export individual commands for testing
export {
  rollCommand,
  statsCommand,
  conditionsCommand,
  spellsCommand,
  inventoryCommand,
  questsCommand,
  helpCommand,
}
