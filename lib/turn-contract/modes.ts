/**
 * Turn Mode Implementations
 * Handles mode-specific logic for single_player, vote, first_response_wins, and freeform
 */

import { PlayerInput } from './input-gating'

export type TurnMode = 'single_player' | 'vote' | 'first_response_wins' | 'freeform'

export interface ModeConfig {
  mode: TurnMode
  votingThreshold?: number // Percentage of players needed for vote (default 50%)
  autoAdvance?: boolean // Auto-advance when conditions met (default true)
  allowMultipleInputs?: boolean // Allow players to submit multiple inputs (default false)
}

export interface VoteOption {
  id: string
  content: string
  votes: number
  voters: string[] // player IDs who voted for this
}

export interface VoteResult {
  winningOption: VoteOption | null
  totalVotes: number
  threshold: number
  votesNeeded: number
  complete: boolean
}

/**
 * Single Player Mode
 * Only the host (DM) can submit authoritative input
 */
export const SINGLE_PLAYER_MODE: ModeConfig = {
  mode: 'single_player',
  autoAdvance: true,
  allowMultipleInputs: false,
}

/**
 * First Response Wins Mode
 * First player to submit gets authoritative control
 */
export const FIRST_RESPONSE_WINS_MODE: ModeConfig = {
  mode: 'first_response_wins',
  autoAdvance: true,
  allowMultipleInputs: false,
}

/**
 * Vote Mode
 * Players vote on actions, majority wins
 */
export const VOTE_MODE: ModeConfig = {
  mode: 'vote',
  votingThreshold: 50,
  autoAdvance: true,
  allowMultipleInputs: false,
}

/**
 * Freeform Mode
 * All players can contribute, AI DM synthesizes
 */
export const FREEFORM_MODE: ModeConfig = {
  mode: 'freeform',
  autoAdvance: false, // DM manually advances
  allowMultipleInputs: true,
}

/**
 * Get mode configuration
 */
export function getModeConfig(mode: TurnMode): ModeConfig {
  switch (mode) {
    case 'single_player':
      return SINGLE_PLAYER_MODE
    case 'first_response_wins':
      return FIRST_RESPONSE_WINS_MODE
    case 'vote':
      return VOTE_MODE
    case 'freeform':
      return FREEFORM_MODE
    default:
      throw new Error(`Unknown turn mode: ${mode}`)
  }
}

/**
 * Process vote inputs and determine winner
 */
export function processVoteInputs(
  inputs: PlayerInput[],
  totalPlayers: number,
  thresholdPercent: number = 50
): VoteResult {
  // Group inputs by content to find matching votes
  const voteMap = new Map<string, VoteOption>()

  for (const input of inputs) {
    const content = input.content.trim().toLowerCase()

    if (voteMap.has(content)) {
      const option = voteMap.get(content)!
      option.votes++
      option.voters.push(input.player_id)
    } else {
      voteMap.set(content, {
        id: input.id,
        content: input.content,
        votes: 1,
        voters: [input.player_id],
      })
    }
  }

  // Convert to array and sort by votes
  const options = Array.from(voteMap.values()).sort((a, b) => b.votes - a.votes)

  const totalVotes = inputs.length
  const threshold = Math.ceil((totalPlayers * thresholdPercent) / 100)
  const votesNeeded = Math.max(0, threshold - totalVotes)

  // Winner must have plurality AND meet threshold
  const winningOption = options[0] && totalVotes >= threshold ? options[0] : null

  return {
    winningOption,
    totalVotes,
    threshold,
    votesNeeded,
    complete: totalVotes >= threshold,
  }
}

/**
 * Check if vote is ready to advance
 */
export function isVoteReady(
  authoritativeInputs: PlayerInput[],
  totalPlayers: number,
  thresholdPercent: number = 50
): boolean {
  const threshold = Math.ceil((totalPlayers * thresholdPercent) / 100)
  return authoritativeInputs.length >= threshold
}

/**
 * Get vote status message
 */
export function getVoteStatusMessage(voteResult: VoteResult): string {
  if (voteResult.complete && voteResult.winningOption) {
    return `Vote complete! Winning action: "${voteResult.winningOption.content}" (${voteResult.winningOption.votes} votes)`
  }

  if (voteResult.totalVotes === 0) {
    return `Waiting for votes (need ${voteResult.threshold} votes to proceed)`
  }

  return `${voteResult.totalVotes}/${voteResult.threshold} votes received (${voteResult.votesNeeded} more needed)`
}

/**
 * Synthesize freeform inputs into narrative summary
 */
export function synthesizeFreeformInputs(inputs: PlayerInput[]): string {
  if (inputs.length === 0) {
    return 'No player inputs submitted.'
  }

  const sections: string[] = ['=== Player Actions ===']

  inputs.forEach((input, idx) => {
    sections.push(`\n[Player ${idx + 1}]`)
    sections.push(input.content)
  })

  return sections.join('\n')
}

/**
 * Get first authoritative input (for first_response_wins mode)
 */
export function getFirstAuthoritativeInput(inputs: PlayerInput[]): PlayerInput | null {
  const authoritativeInputs = inputs.filter((input) => input.classification === 'authoritative')

  if (authoritativeInputs.length === 0) {
    return null
  }

  // Sort by submitted_at and return first
  authoritativeInputs.sort((a, b) => a.submitted_at.getTime() - b.submitted_at.getTime())

  return authoritativeInputs[0]
}

/**
 * Get mode description for players
 */
export function getModeDescription(mode: TurnMode): string {
  switch (mode) {
    case 'single_player':
      return 'Single Player: Only the DM controls the narrative flow. Other players can observe and chat.'

    case 'first_response_wins':
      return 'First Response Wins: The first player to submit an action takes control of the turn. Be quick!'

    case 'vote':
      return 'Vote: Players vote on what action to take. The option with the most votes wins when the threshold is met.'

    case 'freeform':
      return 'Freeform: All players can contribute ideas and actions. The AI DM will synthesize everyone\'s input into the narrative.'

    default:
      return 'Unknown mode'
  }
}

/**
 * Check if mode allows multiple inputs per player
 */
export function allowsMultipleInputs(mode: TurnMode): boolean {
  return mode === 'freeform'
}

/**
 * Get expected player count for mode
 */
export function getRecommendedPlayerCount(mode: TurnMode): { min: number; max: number } {
  switch (mode) {
    case 'single_player':
      return { min: 1, max: 1 }

    case 'first_response_wins':
      return { min: 2, max: 8 }

    case 'vote':
      return { min: 3, max: 12 }

    case 'freeform':
      return { min: 2, max: 20 }

    default:
      return { min: 1, max: 1 }
  }
}

/**
 * Validate mode compatibility with player count
 */
export function validateModeForPlayerCount(
  mode: TurnMode,
  playerCount: number
): { valid: boolean; warning?: string } {
  const recommended = getRecommendedPlayerCount(mode)

  if (playerCount < recommended.min) {
    return {
      valid: false,
      warning: `${mode} mode requires at least ${recommended.min} player(s)`,
    }
  }

  if (playerCount > recommended.max) {
    return {
      valid: true,
      warning: `${mode} mode works best with ${recommended.max} or fewer players. Consider using freeform mode for larger groups.`,
    }
  }

  return { valid: true }
}

/**
 * Get input collection strategy for mode
 */
export function getInputStrategy(mode: TurnMode): {
  strategy: string
  description: string
} {
  switch (mode) {
    case 'single_player':
      return {
        strategy: 'host_only',
        description: 'Only collect input from the host (DM). All other inputs are ambient.',
      }

    case 'first_response_wins':
      return {
        strategy: 'first_wins',
        description: 'Accept inputs from all players. First to arrive becomes authoritative.',
      }

    case 'vote':
      return {
        strategy: 'collect_votes',
        description: 'Collect one vote from each player. Majority wins when threshold is met.',
      }

    case 'freeform':
      return {
        strategy: 'collect_all',
        description: 'Accept multiple inputs from all players. AI synthesizes all contributions.',
      }

    default:
      return {
        strategy: 'unknown',
        description: 'Unknown input strategy',
      }
  }
}
