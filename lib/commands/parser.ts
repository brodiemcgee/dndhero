/**
 * Parsed command structure
 */
export interface ParsedCommand {
  name: string
  args: string[]
  raw: string
}

/**
 * Parse a command string into name and arguments
 *
 * Examples:
 *   "/roll 1d20+5"     -> { name: "roll", args: ["1d20+5"], raw: "/roll 1d20+5" }
 *   "/help grappling"  -> { name: "help", args: ["grappling"], raw: "/help grappling" }
 *   "/spells"          -> { name: "spells", args: [], raw: "/spells" }
 *   "/help how does opportunity attacks work" -> { name: "help", args: ["how", "does", ...], raw: "..." }
 */
export function parseCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim()

  // Must start with /
  if (!trimmed.startsWith('/')) {
    return null
  }

  // Remove the leading /
  const withoutSlash = trimmed.slice(1)

  // Split by whitespace
  const parts = withoutSlash.split(/\s+/).filter(p => p.length > 0)

  if (parts.length === 0) {
    return null
  }

  const [name, ...args] = parts

  return {
    name: name.toLowerCase(),
    args,
    raw: trimmed
  }
}

/**
 * Check if a string looks like a command (starts with /)
 */
export function isCommand(input: string): boolean {
  return input.trim().startsWith('/')
}

/**
 * Get the partial command name being typed
 * Returns the text after / up to the first space, or full text if no space
 *
 * Examples:
 *   "/sp"       -> "sp"
 *   "/spells"   -> "spells"
 *   "/roll 1d"  -> "roll"
 *   "/"         -> ""
 *   "hello"     -> null
 */
export function getPartialCommandName(input: string): string | null {
  const trimmed = input.trim()

  if (!trimmed.startsWith('/')) {
    return null
  }

  const withoutSlash = trimmed.slice(1)
  const spaceIndex = withoutSlash.indexOf(' ')

  if (spaceIndex === -1) {
    // No space yet, still typing command name
    return withoutSlash
  }

  // Space found, command name is complete
  return withoutSlash.slice(0, spaceIndex)
}

/**
 * Check if the user is still typing the command name (no space after command yet)
 */
export function isTypingCommandName(input: string): boolean {
  const trimmed = input.trim()

  if (!trimmed.startsWith('/')) {
    return false
  }

  const withoutSlash = trimmed.slice(1)
  return !withoutSlash.includes(' ')
}

/**
 * Join args back into a single string (for help questions, etc.)
 */
export function joinArgs(args: string[]): string {
  return args.join(' ')
}
