# D&D Hero - Turn System Code Reference

Quick reference guide with actual code snippets from the implementation.

## File Locations

All turn system code is in `/lib/turn-contract/`:

```
/Users/brodie/documents/projects/dndhero/lib/turn-contract/
├── state-machine.ts      - Phase transitions, turn contracts
├── input-gating.ts       - Input validation, classification
├── modes.ts              - Mode-specific logic
├── concurrency.ts        - Version management, race condition prevention
└── index.ts              - Barrel export file
```

---

## 1. Turn Phase Validation

### File: `state-machine.ts`

**Main Function: `canAcceptInput()`**
```typescript
export function canAcceptInput(turn: TurnContract): boolean {
  return turn.phase === 'awaiting_input'
}
```

**Use in ActionInput:**
```typescript
if (!canAcceptInput(turnContract)) {
  // Turn is NOT in awaiting_input phase
  // Don't allow input submission
  setStatus('Turn is not accepting input')
  return
}
```

**Valid Transitions:**
```typescript
const VALID_TRANSITIONS: Record<TurnPhase, TurnPhase[]> = {
  awaiting_input: ['awaiting_rolls', 'resolving', 'complete'],
  awaiting_rolls: ['resolving', 'awaiting_input'],
  resolving: ['complete', 'awaiting_input'],
  complete: [],  // Terminal state
}
```

---

## 2. Player Input Validation

### File: `input-gating.ts`

**Most Important Function: `canPlayerSubmitInput()`**

This is THE function ActionInput MUST call:

```typescript
export function canPlayerSubmitInput(
  mode: 'single_player' | 'vote' | 'first_response_wins' | 'freeform',
  phase: 'awaiting_input' | 'awaiting_rolls' | 'resolving' | 'complete',
  playerId: string,
  hostId: string,
  hasPlayerAlreadySubmitted: boolean
): { canSubmit: boolean; reason?: string } {
  // First check: Is phase correct?
  if (phase !== 'awaiting_input') {
    return {
      canSubmit: false,
      reason: `Turn is in ${phase} phase, not accepting new inputs`,
    }
  }

  // Second check: Mode-specific rules
  switch (mode) {
    case 'single_player':
      if (playerId !== hostId) {
        return { canSubmit: false, reason: 'Only the DM can submit in single player mode' }
      }
      if (hasPlayerAlreadySubmitted) {
        return { canSubmit: false, reason: 'You have already submitted your action' }
      }
      return { canSubmit: true }

    case 'first_response_wins':
      if (hasPlayerAlreadySubmitted) {
        return { canSubmit: false, reason: 'You have already submitted your action' }
      }
      return { canSubmit: true }

    case 'vote':
      if (hasPlayerAlreadySubmitted) {
        return { canSubmit: false, reason: 'You have already cast your vote' }
      }
      return { canSubmit: true }

    case 'freeform':
      return { canSubmit: true }

    default:
      return { canSubmit: false, reason: 'Unknown turn mode' }
  }
}
```

**Usage in ActionInput:**
```typescript
async function handleSubmit(content: string) {
  const { canSubmit, reason } = canPlayerSubmitInput(
    turnContract.mode,
    turnContract.phase,
    currentPlayerId,
    hostId,
    hasAlreadySubmitted
  )

  if (!canSubmit) {
    showError(reason)  // Show the reason why they can't submit
    return
  }

  // Proceed with submission...
}
```

---

## 3. Input Classification

### File: `input-gating.ts`

**Function: `classifyInput()`**

Determines if input is "authoritative" (turn-advancing) or "ambient" (context only):

```typescript
export function classifyInput(
  rules: InputGatingRules,
  inputPlayerId: string,
  hasExistingAuthoritativeInput: boolean
): InputClassification {
  const { mode, phase, hostId, currentPlayerId } = rules

  // During resolving or complete, all inputs are ambient
  if (phase === 'resolving' || phase === 'complete') {
    return 'ambient'
  }

  if (phase !== 'awaiting_input') {
    return 'ambient'
  }

  // Mode-specific classification
  switch (mode) {
    case 'single_player':
      // Only host's first input is authoritative
      if (inputPlayerId === hostId && !hasExistingAuthoritativeInput) {
        return 'authoritative'
      }
      return 'ambient'

    case 'first_response_wins':
      // First to submit is authoritative
      if (!hasExistingAuthoritativeInput) {
        return 'authoritative'
      }
      return 'ambient'

    case 'vote':
      // All vote inputs are authoritative
      return 'authoritative'

    case 'freeform':
      // All freeform inputs are authoritative
      return 'authoritative'

    default:
      return 'ambient'
  }
}
```

---

## 4. Input Status Messages

### File: `input-gating.ts`

**Function: `getInputStatus()`**

Returns user-friendly status messages:

```typescript
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
    return ''  // No status message during other phases
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
```

**Usage in ActionInput:**
```typescript
const status = getInputStatus(
  turnContract.mode,
  turnContract.phase,
  authoritativeInputCount,
  totalPlayers,
  currentPlayerId,
  hostId,
  hasPlayerSubmitted
)

return <div className="status">{status}</div>
```

---

## 5. Turn Advancement Logic

### File: `input-gating.ts`

**Function: `shouldAdvanceTurn()`**

Determines when the turn should automatically progress to the next phase:

```typescript
export function shouldAdvanceTurn(
  mode: 'single_player' | 'vote' | 'first_response_wins' | 'freeform',
  authoritativeInputCount: number,
  totalPlayerCount: number,
  votingThresholdPercent: number = 50
): boolean {
  switch (mode) {
    case 'single_player':
      // Advance after host submits one input
      return authoritativeInputCount >= 1

    case 'first_response_wins':
      // Advance after first person submits
      return authoritativeInputCount >= 1

    case 'vote':
      // Advance when voting threshold is met
      const requiredVotes = Math.ceil((totalPlayerCount * votingThresholdPercent) / 100)
      return authoritativeInputCount >= requiredVotes

    case 'freeform':
      // Don't auto-advance, DM manually triggers
      return false

    default:
      return false
  }
}
```

**Example: Vote mode with 4 players**
```typescript
const required = Math.ceil((4 * 50) / 100)  // 2 votes needed
shouldAdvanceTurn('vote', 2, 4)  // true - turn advances!
shouldAdvanceTurn('vote', 1, 4)  // false - waiting for second vote
```

---

## 6. Input Content Validation

### File: `input-gating.ts`

**Function: `validateInputContent()`**

Validates that input meets basic requirements:

```typescript
export function validateInputContent(content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Input cannot be empty' }
  }

  if (content.length > 5000) {
    return { valid: false, error: 'Input exceeds maximum length (5000 characters)' }
  }

  return { valid: true }
}
```

**Usage in ActionInput:**
```typescript
const { valid, error } = validateInputContent(inputText)
if (!valid) {
  showError(error)  // "Input cannot be empty" or length exceeded
  return
}
```

---

## 7. Mode Configuration

### File: `modes.ts`

**Constants for each mode:**

```typescript
export const SINGLE_PLAYER_MODE: ModeConfig = {
  mode: 'single_player',
  autoAdvance: true,
  allowMultipleInputs: false,
}

export const FIRST_RESPONSE_WINS_MODE: ModeConfig = {
  mode: 'first_response_wins',
  autoAdvance: true,
  allowMultipleInputs: false,
}

export const VOTE_MODE: ModeConfig = {
  mode: 'vote',
  votingThreshold: 50,
  autoAdvance: true,
  allowMultipleInputs: false,
}

export const FREEFORM_MODE: ModeConfig = {
  mode: 'freeform',
  autoAdvance: false,
  allowMultipleInputs: true,
}
```

**Getting mode info:**
```typescript
const config = getModeConfig(turnContract.mode)
// Can check: config.autoAdvance, config.allowMultipleInputs, etc.

const description = getModeDescription(turnContract.mode)
// "First Response Wins: The first player to submit an action takes control..."
```

---

## 8. Expected Actions by Phase

### File: `state-machine.ts`

**Function: `getExpectedAction()`**

Tells players what they should do next:

```typescript
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
```

**Display when not accepting input:**
```typescript
if (!canAcceptInput(turnContract)) {
  return (
    <div>
      <p>{getExpectedAction(turnContract)}</p>
      <Spinner />
    </div>
  )
}
```

---

## 9. Concurrency Control

### File: `concurrency.ts`

**Function: `validateVersion()`**

Checks if turn state has been modified by another process:

```typescript
export function validateVersion(
  entity: VersionedEntity,
  expectedVersion: number
): { valid: boolean; error?: ConcurrencyError } {
  if (entity.state_version !== expectedVersion) {
    return {
      valid: false,
      error: {
        type: 'version_mismatch',
        message: `Version mismatch: expected ${expectedVersion}, found ${entity.state_version}`,
        expectedVersion,
        actualVersion: entity.state_version,
      },
    }
  }

  return { valid: true }
}
```

**Usage when submitting:**
```typescript
const turnVersion = turnContract.state_version

// Later when submitting...
const validation = validateVersion(currentTurnContract, turnVersion)

if (!validation.valid) {
  showError('The turn state has changed. Please refresh.')
  refreshPage()
  return
}
```

**Error message helper:**
```typescript
const message = getConflictMessage(error)
// Returns: "The turn state has been updated by another process..."
```

---

## 10. Turn Creation

### File: `state-machine.ts`

**Function: `createTurnContract()`**

Creates a new turn contract:

```typescript
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
```

**Used in `/api/campaign/[id]/start/route.ts`:**
```typescript
const { data: turnContract } = await serviceSupabase
  .from('turn_contracts')
  .insert({
    scene_id: scene.id,
    mode: 'group',  // Choose from: single_player, vote, first_response_wins, freeform
    phase: 'awaiting_input',
    prompt: `Your adventure begins in ${scene.location}.`,
  })
  .select()
  .single()
```

---

## 11. Phase Transitions

### File: `state-machine.ts`

**Function: `transitionPhase()`**

Moves turn to next phase (increments version):

```typescript
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
    state_version: currentTurn.state_version + 1,  // ← Version incremented!
    narrative_context: updates?.narrative_context,
    ai_task: updates?.ai_task,
  }

  if (nextPhase === 'complete') {
    stateUpdate.completed_at = new Date()
  }

  return stateUpdate
}
```

**Example transition:**
```typescript
// From awaiting_input to resolving
const update = transitionPhase(
  turnContract,
  'resolving',
  {
    ai_task: 'Generate narrative for attacking the goblin',
    narrative_context: 'Combat has started'
  }
)
// update.state_version is now 6 (was 5)
```

---

## Complete Example: ActionInput Submit Flow

Here's how all pieces work together:

```typescript
async function handleSubmit(inputContent: string) {
  // Step 1: Validate input content
  const contentValidation = validateInputContent(inputContent)
  if (!contentValidation.valid) {
    setError(contentValidation.error)  // "Input cannot be empty"
    return
  }

  // Step 2: Check if player can submit
  const { canSubmit, reason } = canPlayerSubmitInput(
    turnContract.mode,
    turnContract.phase,
    currentPlayerId,
    hostId,
    hasPlayerAlreadySubmitted
  )

  if (!canSubmit) {
    setError(reason)  // "Only the DM can submit in single player mode"
    return
  }

  // Step 3: Classify the input
  const classification = classifyInput(
    {
      mode: turnContract.mode,
      phase: turnContract.phase,
      hostId,
      currentPlayerId,
    },
    currentPlayerId,
    hasExistingAuthoritativeInput
  )

  // Step 4: Validate version (concurrency check)
  const versionCheck = validateVersion(turnContract, expectedTurnVersion)
  if (!versionCheck.valid) {
    const errorMsg = getConflictMessage(versionCheck.error!)
    setError(errorMsg)
    refreshPage()
    return
  }

  // Step 5: Submit to API
  try {
    const response = await fetch('/api/turn/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        turn_contract_id: turnContract.id,
        player_id: currentPlayerId,
        character_id: characterId,
        content: inputContent,
        classification: classification,
        expected_state_version: expectedTurnVersion,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error)
    }

    // Step 6: Check if turn advanced
    const { new_turn_contract_id, phase_transitioned } = await response.json()

    if (phase_transitioned) {
      setStatus('Your action submitted! Turn advancing...')
      
      if (new_turn_contract_id) {
        // Start new turn
        loadTurn(new_turn_contract_id)
      }
    } else {
      setStatus('Your input received.')
    }

    // Clear form
    setInputContent('')

  } catch (error) {
    setError('Failed to submit action: ' + error.message)
  }
}
```

---

## Testing Decision Trees

Test with these scenarios:

### Scenario 1: Single Player Mode - DM
```typescript
Mode: 'single_player'
Phase: 'awaiting_input'
CurrentPlayer: DM (id = hostId)
AlreadySubmitted: false

Expected: canPlayerSubmitInput() → { canSubmit: true }
```

### Scenario 2: Single Player Mode - Non-DM
```typescript
Mode: 'single_player'
Phase: 'awaiting_input'
CurrentPlayer: Regular Player
AlreadySubmitted: false

Expected: canPlayerSubmitInput() → { 
  canSubmit: false, 
  reason: 'Only the DM can submit in single player mode' 
}
```

### Scenario 3: First Response Wins - Second Player
```typescript
Mode: 'first_response_wins'
Phase: 'awaiting_input'
AuthoritativeInputs: 1 (someone already submitted)
CurrentPlayer: Regular Player
AlreadySubmitted: false

Expected: Can still submit (returns { canSubmit: true })
But classification will be 'ambient' (not authoritative)
```

### Scenario 4: Vote Mode - Threshold Met
```typescript
Mode: 'vote'
TotalPlayers: 4
VotesReceived: 2

Expected: shouldAdvanceTurn(
  'vote', 
  2,  // authoritativeInputCount
  4   // totalPlayerCount
) → true
```

### Scenario 5: Wrong Phase
```typescript
Mode: any
Phase: 'resolving'
PlayerID: any
AlreadySubmitted: any

Expected: canPlayerSubmitInput() → {
  canSubmit: false,
  reason: 'Turn is in resolving phase, not accepting new inputs'
}
```

---

## Summary

The turn system enforces:

1. **Phase gating** - Check `phase === 'awaiting_input'` first
2. **Mode-specific rules** - Different modes allow different submissions
3. **Player tracking** - Prevent double submissions where applicable
4. **Input quality** - Non-empty, under 5000 chars
5. **Concurrency safety** - Version checking prevents race conditions
6. **User feedback** - Status messages explain what's happening

All validation is centralized in `/lib/turn-contract/` for consistency across the application.

