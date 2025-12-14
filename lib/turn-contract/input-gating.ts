/**
 * Input Gating System
 * Classifies player inputs as "authoritative" (turn-advancing) or "ambient" (context-only)
 */

export type InputClassification = 'authoritative' | 'ambient'

export interface PlayerInput {
  id: string
  turn_contract_id: string
  player_id: string
  character_id: string | null
  classification: InputClassification
  content: string
  submitted_at: Date
  acknowledged_at: Date | null
}

export interface InputGatingRules {
  mode: 'single_player' | 'vote' | 'first_response_wins' | 'freeform'
  phase: 'awaiting_input' | 'awaiting_rolls' | 'resolving' | 'complete'
  hostId: string
  currentPlayerId: string
}

/**
 * Classify input as authoritative or ambient
 */
export function classifyInput(
  rules: InputGatingRules,
  inputPlayerId: string,
  hasExistingAuthoritativeInput: boolean
): InputClassification {
  const { mode, phase, hostId, currentPlayerId } = rules

  // Inputs during resolving or complete phase are always ambient
  if (phase === 'resolving' || phase === 'complete') {
    return 'ambient'
  }

  // During awaiting_rolls, only dice roll confirmations are authoritative
  // This is handled separately by the dice roll system
  if (phase === 'awaiting_rolls') {
    return 'ambient'
  }

  // Phase must be awaiting_input at this point
  if (phase !== 'awaiting_input') {
    return 'ambient'
  }

  // Mode-specific logic for awaiting_input phase
  switch (mode) {
    case 'single_player':
      // Only the host's first input is authoritative
      if (inputPlayerId === hostId && !hasExistingAuthoritativeInput) {
        return 'authoritative'
      }
      return 'ambient'

    case 'first_response_wins':
      // First player to submit gets authoritative status
      if (!hasExistingAuthoritativeInput) {
        return 'authoritative'
      }
      return 'ambient'

    case 'vote':
      // All inputs during voting phase are authoritative
      // Vote resolution happens separately
      return 'authoritative'

    case 'freeform':
      // All inputs are authoritative in freeform mode
      // AI DM synthesizes all player inputs
      return 'authoritative'

    default:
      return 'ambient'
  }
}

/**
 * Check if input should trigger turn advancement
 */
export function shouldAdvanceTurn(
  mode: 'single_player' | 'vote' | 'first_response_wins' | 'freeform',
  authoritativeInputCount: number,
  totalPlayerCount: number,
  votingThresholdPercent: number = 50
): boolean {
  switch (mode) {
    case 'single_player':
      // Advance when host submits authoritative input
      return authoritativeInputCount >= 1

    case 'first_response_wins':
      // Advance when first authoritative input is received
      return authoritativeInputCount >= 1

    case 'vote':
      // Advance when voting threshold is met
      const requiredVotes = Math.ceil((totalPlayerCount * votingThresholdPercent) / 100)
      return authoritativeInputCount >= requiredVotes

    case 'freeform':
      // In freeform, don't auto-advance
      // DM manually triggers turn resolution or timeout occurs
      return false

    default:
      return false
  }
}

/**
 * Get input gating status for display
 */
export function getInputStatus(
  mode: 'single_player' | 'vote' | 'first_response_wins' | 'freeform',
  phase: 'awaiting_input' | 'awaiting_rolls' | 'resolving' | 'complete',
  authoritativeInputCount: number,
  totalPlayerCount: number,
  currentPlayerId: string,
  hostId: string,
  hasPlayerSubmitted: boolean
): string {
  if (phase !== 'awaiting_input') {
    return ''
  }

  switch (mode) {
    case 'single_player':
      if (currentPlayerId === hostId) {
        return hasPlayerSubmitted ? 'Your input has been submitted' : 'Your turn - submit your action'
      }
      return 'Waiting for DM...'

    case 'first_response_wins':
      if (authoritativeInputCount > 0) {
        return hasPlayerSubmitted ? 'Turn in progress' : 'Another player has taken the turn'
      }
      return hasPlayerSubmitted ? 'Your input is being processed' : 'First to respond controls the turn!'

    case 'vote':
      const votesNeeded = Math.ceil(totalPlayerCount / 2)
      const votesRemaining = votesNeeded - authoritativeInputCount
      if (votesRemaining <= 0) {
        return 'Votes collected, resolving turn...'
      }
      return hasPlayerSubmitted
        ? `Your vote submitted (${authoritativeInputCount}/${votesNeeded} votes)`
        : `Cast your vote (${authoritativeInputCount}/${votesNeeded} votes received)`

    case 'freeform':
      return hasPlayerSubmitted
        ? 'Your input has been added to the turn'
        : 'Share your actions or ideas'

    default:
      return ''
  }
}

/**
 * Filter inputs by classification
 */
export function getAuthoritativeInputs(inputs: PlayerInput[]): PlayerInput[] {
  return inputs.filter((input) => input.classification === 'authoritative')
}

export function getAmbientInputs(inputs: PlayerInput[]): PlayerInput[] {
  return inputs.filter((input) => input.classification === 'ambient')
}

/**
 * Get combined narrative from all inputs
 */
export function combineInputsForNarrative(
  authoritativeInputs: PlayerInput[],
  ambientInputs: PlayerInput[],
  includeAmbient: boolean = true
): string {
  const sections: string[] = []

  if (authoritativeInputs.length > 0) {
    sections.push('=== Authoritative Actions ===')
    authoritativeInputs.forEach((input, idx) => {
      sections.push(`[${idx + 1}] ${input.content}`)
    })
  }

  if (includeAmbient && ambientInputs.length > 0) {
    sections.push('\n=== Additional Context ===')
    ambientInputs.forEach((input, idx) => {
      sections.push(`[${idx + 1}] ${input.content}`)
    })
  }

  return sections.join('\n')
}

/**
 * Check if player can submit input
 */
export function canPlayerSubmitInput(
  mode: 'single_player' | 'vote' | 'first_response_wins' | 'freeform',
  phase: 'awaiting_input' | 'awaiting_rolls' | 'resolving' | 'complete',
  playerId: string,
  hostId: string,
  hasPlayerAlreadySubmitted: boolean
): { canSubmit: boolean; reason?: string } {
  // Can't submit if turn is not awaiting input
  if (phase !== 'awaiting_input') {
    return {
      canSubmit: false,
      reason: `Turn is in ${phase} phase, not accepting new inputs`,
    }
  }

  switch (mode) {
    case 'single_player':
      // Only host can submit in single player
      if (playerId !== hostId) {
        return { canSubmit: false, reason: 'Only the DM can submit in single player mode' }
      }
      if (hasPlayerAlreadySubmitted) {
        return { canSubmit: false, reason: 'You have already submitted your action' }
      }
      return { canSubmit: true }

    case 'first_response_wins':
      // All players can attempt, but only first is authoritative
      if (hasPlayerAlreadySubmitted) {
        return { canSubmit: false, reason: 'You have already submitted your action' }
      }
      return { canSubmit: true }

    case 'vote':
      // All players can vote once
      if (hasPlayerAlreadySubmitted) {
        return { canSubmit: false, reason: 'You have already cast your vote' }
      }
      return { canSubmit: true }

    case 'freeform':
      // All players can submit multiple times
      return { canSubmit: true }

    default:
      return { canSubmit: false, reason: 'Unknown turn mode' }
  }
}

/**
 * Validate input content
 */
export function validateInputContent(content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Input cannot be empty' }
  }

  if (content.length > 5000) {
    return { valid: false, error: 'Input exceeds maximum length (5000 characters)' }
  }

  return { valid: true }
}
