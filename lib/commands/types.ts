import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Context passed to command execution
 */
export interface CommandContext {
  userId: string
  characterId: string
  campaignId: string
  sceneId?: string
  supabase: SupabaseClient
}

/**
 * Table data for structured command responses
 */
export interface TableData {
  headers: string[]
  rows: string[][]
}

/**
 * Action button for interactive command responses
 */
export interface CommandAction {
  label: string
  command: string
}

/**
 * Result returned by command execution
 */
export interface CommandResult {
  type: 'text' | 'table' | 'list' | 'error'
  title?: string
  content: string | string[] | TableData
  metadata?: Record<string, unknown>
  /** Optional action buttons to display */
  actions?: CommandAction[]
}

/**
 * Command definition
 */
export interface Command {
  /** Primary command name (without /) */
  name: string
  /** Alternative names for the command */
  aliases?: string[]
  /** Short description for help text */
  description: string
  /** Usage syntax */
  usage: string
  /** Example usages */
  examples: string[]
  /** Execute the command */
  execute: (args: string[], context: CommandContext) => Promise<CommandResult>
}

/**
 * Private message displayed in chat (client-side only)
 */
export interface PrivateMessage {
  id: string
  type: 'command_response'
  result: CommandResult
  created_at: string
}
