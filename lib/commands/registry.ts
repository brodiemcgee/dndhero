import { Command } from './types'

/**
 * Registry of all available commands
 */
const commandRegistry = new Map<string, Command>()

/**
 * Register a command in the registry
 */
export function registerCommand(command: Command): void {
  // Register by primary name
  commandRegistry.set(command.name.toLowerCase(), command)

  // Register by aliases
  command.aliases?.forEach(alias => {
    commandRegistry.set(alias.toLowerCase(), command)
  })
}

/**
 * Get a command by name or alias
 */
export function getCommand(name: string): Command | undefined {
  return commandRegistry.get(name.toLowerCase())
}

/**
 * Get all unique commands (excludes alias duplicates)
 */
export function getAllCommands(): Command[] {
  const seen = new Set<string>()
  const commands: Command[] = []

  commandRegistry.forEach(command => {
    if (!seen.has(command.name)) {
      seen.add(command.name)
      commands.push(command)
    }
  })

  // Sort alphabetically
  return commands.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Get command completions for autocomplete
 * Returns command names that start with the given partial
 */
export function getCompletions(partial: string): string[] {
  const lowerPartial = partial.toLowerCase()

  return getAllCommands()
    .filter(cmd => cmd.name.startsWith(lowerPartial))
    .map(cmd => cmd.name)
}

/**
 * Get the best completion match for a partial command
 * Returns the full command name or undefined if no match
 */
export function getBestCompletion(partial: string): string | undefined {
  const completions = getCompletions(partial)
  return completions.length > 0 ? completions[0] : undefined
}

/**
 * Check if a command exists
 */
export function hasCommand(name: string): boolean {
  return commandRegistry.has(name.toLowerCase())
}
