/**
 * Turn Contract System
 * Manages the turn-based gameplay loop with state machine, input gating, and concurrency control
 */

// State Machine
export {
  type TurnPhase,
  type TurnMode,
  type TurnContract,
  type TurnTransition,
  type TurnStateUpdate,
  isValidTransition,
  validateTransition,
  createTurnContract,
  transitionPhase,
  getTurnDuration,
  isTurnStale,
  getTurnStatus,
  canAcceptInput,
  canAcceptRolls,
  isResolving,
  isComplete,
  getExpectedAction,
  prepareForResolution,
  completeTurn,
  resetTurn,
} from './state-machine'

// Input Gating
export {
  type InputClassification,
  type PlayerInput,
  type InputGatingRules,
  classifyInput,
  shouldAdvanceTurn,
  getInputStatus,
  getAuthoritativeInputs,
  getAmbientInputs,
  combineInputsForNarrative,
  canPlayerSubmitInput,
  validateInputContent,
} from './input-gating'

// Turn Modes
export {
  type ModeConfig,
  type VoteOption,
  type VoteResult,
  SINGLE_PLAYER_MODE,
  FIRST_RESPONSE_WINS_MODE,
  VOTE_MODE,
  FREEFORM_MODE,
  getModeConfig,
  processVoteInputs,
  isVoteReady,
  getVoteStatusMessage,
  synthesizeFreeformInputs,
  getFirstAuthoritativeInput,
  getModeDescription,
  allowsMultipleInputs,
  getRecommendedPlayerCount,
  validateModeForPlayerCount,
  getInputStrategy,
} from './modes'

// Concurrency Control
export {
  type VersionedEntity,
  type ConcurrencyError,
  type UpdateResult,
  type CompareAndSwapParams,
  validateVersion,
  createOptimisticUpdate,
  handleConcurrentUpdate,
  compareAndSwap,
  retryWithBackoff,
  UpdateQueue,
  detectConcurrentModification,
  getVersionDrift,
  isStale,
  getConflictMessage,
  mergeUpdates,
} from './concurrency'
