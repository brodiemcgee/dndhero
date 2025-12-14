/**
 * Turn Contract State Machine
 * Manages the lifecycle of a turn: awaiting_input → awaiting_rolls → resolving → complete
 */

export type TurnPhase = 'awaiting_input' | 'awaiting_rolls' | 'resolving' | 'complete'
export type TurnMode = 'single_player' | 'vote' | 'first_response_wins' | 'freeform'

export interface TurnContract {
  id: string
  scene_id: string
  turn_number: number
  phase: TurnPhase
  mode: TurnMode
  state_version: number
  narrative_context: string | null
  ai_task: string | null
  pending_since: Date
  completed_at: Date | null
  created_at: Date
}

export interface TurnTransition {
  from: TurnPhase
  to: TurnPhase
  timestamp: Date
  reason?: string
}

export interface TurnStateUpdate {
  phase: TurnPhase
  state_version: number
  narrative_context?: string
  ai_task?: string
  completed_at?: Date
}

/**
 * Valid state transitions
 */
const VALID_TRANSITIONS: Record<TurnPhase, TurnPhase[]> = {
  awaiting_input: ['awaiting_rolls', 'resolving', 'complete'], // Can skip rolls if none needed
  awaiting_rolls: ['resolving', 'awaiting_input'], // Back to input if invalid
  resolving: ['complete', 'awaiting_input'], // Back to input if resolution fails
  complete: [], // Terminal state
}

/**
 * Check if a state transition is valid
 */
export function isValidTransition(from: TurnPhase, to: TurnPhase): boolean {
  return VALID_TRANSITIONS[from].includes(to)
}

/**
 * Validate state transition
 */
export function validateTransition(
  currentPhase: TurnPhase,
  nextPhase: TurnPhase
): { valid: boolean; error?: string } {
  if (!isValidTransition(currentPhase, nextPhase)) {
    return {
      valid: false,
      error: `Invalid transition from ${currentPhase} to ${nextPhase}`,
    }
  }

  return { valid: true }
}

/**
 * Create a new turn contract
 */
export function createTurnContract(
  sceneId: string,
  turnNumber: number,
  mode: TurnMode,
  narrativeContext?: string
): Omit<TurnContract, 'id' | 'created_at'> {
  return {
    scene_id: sceneId,
    turn_number: turnNumber,
    phase: 'awaiting_input',
    mode,
    state_version: 1,
    narrative_context: narrativeContext || null,
    ai_task: null,
    pending_since: new Date(),
    completed_at: null,
  }
}

/**
 * Transition turn to next phase
 */
export function transitionPhase(
  currentTurn: TurnContract,
  nextPhase: TurnPhase,
  updates?: {
    narrative_context?: string
    ai_task?: string
  }
): TurnStateUpdate {
  const validation = validateTransition(currentTurn.phase, nextPhase)

  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const stateUpdate: TurnStateUpdate = {
    phase: nextPhase,
    state_version: currentTurn.state_version + 1,
    narrative_context: updates?.narrative_context,
    ai_task: updates?.ai_task,
  }

  // Mark as completed if transitioning to complete phase
  if (nextPhase === 'complete') {
    stateUpdate.completed_at = new Date()
  }

  return stateUpdate
}

/**
 * Calculate turn duration in seconds
 */
export function getTurnDuration(turn: TurnContract): number {
  const endTime = turn.completed_at || new Date()
  return Math.floor((endTime.getTime() - turn.pending_since.getTime()) / 1000)
}

/**
 * Check if turn is stale (based on mode)
 */
export function isTurnStale(
  turn: TurnContract,
  liveSoftNudgeSeconds: number,
  asyncSoftNudgeHours: number
): boolean {
  if (turn.phase === 'complete') {
    return false
  }

  const now = new Date()
  const elapsedMs = now.getTime() - turn.pending_since.getTime()
  const elapsedSeconds = elapsedMs / 1000
  const elapsedHours = elapsedSeconds / 3600

  // For single_player and first_response_wins, use live nudge threshold
  if (turn.mode === 'single_player' || turn.mode === 'first_response_wins') {
    return elapsedSeconds > liveSoftNudgeSeconds
  }

  // For vote and freeform, use async nudge threshold
  if (turn.mode === 'vote' || turn.mode === 'freeform') {
    return elapsedHours > asyncSoftNudgeHours
  }

  return false
}

/**
 * Get turn status description
 */
export function getTurnStatus(turn: TurnContract): string {
  switch (turn.phase) {
    case 'awaiting_input':
      return 'Waiting for player input'
    case 'awaiting_rolls':
      return 'Waiting for dice rolls to complete'
    case 'resolving':
      return 'AI DM is resolving the turn'
    case 'complete':
      return 'Turn complete'
    default:
      return 'Unknown status'
  }
}

/**
 * Check if turn can accept input
 */
export function canAcceptInput(turn: TurnContract): boolean {
  return turn.phase === 'awaiting_input'
}

/**
 * Check if turn can accept dice rolls
 */
export function canAcceptRolls(turn: TurnContract): boolean {
  return turn.phase === 'awaiting_rolls'
}

/**
 * Check if turn is being resolved
 */
export function isResolving(turn: TurnContract): boolean {
  return turn.phase === 'resolving'
}

/**
 * Check if turn is complete
 */
export function isComplete(turn: TurnContract): boolean {
  return turn.phase === 'complete'
}

/**
 * Get next expected action based on phase
 */
export function getExpectedAction(turn: TurnContract): string {
  switch (turn.phase) {
    case 'awaiting_input':
      return 'Players should provide their actions or decisions'
    case 'awaiting_rolls':
      return 'Players should complete any pending dice rolls'
    case 'resolving':
      return 'AI DM is processing the turn. Please wait...'
    case 'complete':
      return 'Turn is complete. New turn will begin shortly.'
    default:
      return 'Unknown phase'
  }
}

/**
 * Prepare turn for AI resolution
 */
export function prepareForResolution(
  turn: TurnContract,
  aiTask: string,
  narrativeContext?: string
): TurnStateUpdate {
  if (turn.phase !== 'awaiting_rolls' && turn.phase !== 'awaiting_input') {
    throw new Error('Can only prepare for resolution from awaiting_input or awaiting_rolls phase')
  }

  return {
    phase: 'resolving',
    state_version: turn.state_version + 1,
    ai_task: aiTask,
    narrative_context: narrativeContext,
  }
}

/**
 * Complete turn
 */
export function completeTurn(turn: TurnContract, narrativeContext: string): TurnStateUpdate {
  if (turn.phase !== 'resolving') {
    throw new Error('Can only complete turn from resolving phase')
  }

  return {
    phase: 'complete',
    state_version: turn.state_version + 1,
    narrative_context,
    completed_at: new Date(),
  }
}

/**
 * Reset turn to awaiting_input (for error recovery)
 */
export function resetTurn(turn: TurnContract, reason: string): TurnStateUpdate {
  return {
    phase: 'awaiting_input',
    state_version: turn.state_version + 1,
    ai_task: `Reset: ${reason}`,
  }
}
