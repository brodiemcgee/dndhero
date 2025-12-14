# Turn System - Quick Reference Card

## The Core Question: When Can a Player Submit?

```
START
  |
  v
Is turnContract.phase === 'awaiting_input'?
  |
  ├─ NO  → Display: "Turn is in {phase} phase, not accepting new inputs"
  |        REJECT
  |
  └─ YES → Continue...
           |
           v
Is this mode single_player?
  |
  ├─ YES → Is currentPlayerId === hostId?
  |        ├─ NO  → Display: "Only the DM can submit in single player mode"
  |        |        REJECT
  |        └─ YES → Has player already submitted?
  |               ├─ YES → Display: "You have already submitted your action"
  |               |        REJECT
  |               └─ NO  → ALLOW
  |
  ├─ Is this mode first_response_wins?
  |  ├─ YES → Has anyone submitted yet?
  |  |        ├─ YES → Can this player submit?
  |  |        |        ├─ YES → ALLOW (will be ambient, not authoritative)
  |  |        |        └─ NO  → Display: "You have already submitted"
  |  |        |                 REJECT
  |  |        └─ NO  → ALLOW (will be authoritative!)
  |  |
  |  ├─ Is this mode vote?
  |  |  └─ Has player already voted?
  |  |     ├─ YES → Display: "You have already cast your vote"
  |  |     |        REJECT
  |  |     └─ NO  → ALLOW
  |  |
  |  └─ Is this mode freeform?
  |     └─ ALLOW (can submit multiple times)
  |
  └─ Validate input content
     ├─ Is content empty or whitespace?
     |  └─ YES → Display: "Input cannot be empty"
     |           REJECT
     └─ Is content > 5000 chars?
        └─ YES → Display: "Input exceeds maximum length (5000 characters)"
                 REJECT
           
           └─ ALLOW SUBMISSION!
              └─ Check version, classify, submit
```

---

## The 6 Critical Functions

### 1. canAcceptInput(turn)
```
Returns: boolean
Simple: turn.phase === 'awaiting_input'
```

### 2. canPlayerSubmitInput(mode, phase, playerId, hostId, hasSubmitted)
```
Returns: { canSubmit: boolean; reason?: string }
Complex: Phase check first, then mode-specific rules
```

### 3. validateInputContent(content)
```
Returns: { valid: boolean; error?: string }
Checks: Not empty, not > 5000 chars
```

### 4. classifyInput(rules, inputPlayerId, hasExistingAuthoritativeInput)
```
Returns: 'authoritative' | 'ambient'
Depends: mode, phase, who submitted, order
```

### 5. getInputStatus(mode, phase, counts, currentPlayerId, hostId, hasSubmitted)
```
Returns: string (user-facing message)
Shows: Progress, waiting state, current turn
```

### 6. shouldAdvanceTurn(mode, authoritativeInputCount, totalPlayerCount)
```
Returns: boolean
When: Enough inputs received for this mode
```

---

## Mode Decision Table

| Mode | Submission | Authoritative | Auto-Advance | Multi-Input |
|------|-----------|--------------|--------------|-------------|
| **single_player** | DM only | DM's first | After 1 | No |
| **first_response_wins** | Anyone | First player | After first | No |
| **vote** | Everyone once | All votes | At 50% | No |
| **freeform** | Everyone multiple | All inputs | Manual (DM) | Yes |

---

## Phase Meanings

```
awaiting_input
  ^-- Players can submit actions here
  ^-- This is the ONLY phase where input is accepted
  
awaiting_rolls
  ^-- Players completing dice rolls
  ^-- No new action input accepted here
  
resolving
  ^-- AI DM is thinking and generating narrative
  ^-- Turn cannot accept input during this phase
  
complete
  ^-- Turn is finished
  ^-- New turn contract will be created
```

---

## Vote Mode Calculation

```typescript
const totalPlayers = 4
const votingThreshold = 50  // percent

// How many votes needed?
const required = Math.ceil((totalPlayers * votingThreshold) / 100)
// = Math.ceil((4 * 50) / 100)
// = Math.ceil(2)
// = 2 votes needed

// So with 4 players: need 2 votes (50%)
// With 6 players: need 3 votes (50%)
// With 3 players: need 2 votes (67%, rounds up)
```

---

## Error Message Lookup

| Condition | Message |
|-----------|---------|
| Wrong phase | "Turn is in {phase} phase, not accepting new inputs" |
| DM-only mode (wrong player) | "Only the DM can submit in single player mode" |
| Already submitted | "You have already submitted your action" OR "You have already cast your vote" |
| Empty input | "Input cannot be empty" |
| Too long (>5000) | "Input exceeds maximum length (5000 characters)" |
| Version mismatch | "The turn state has been updated. Please refresh." |
| Unknown mode | "Unknown turn mode" |

---

## Status Message Lookup

| Situation | Message |
|-----------|---------|
| Single-player DM's turn | "Your turn - submit your action" |
| Single-player waiting | "Waiting for DM..." |
| FRW before anyone submits | "First to respond controls the turn!" |
| FRW after someone submits | "Another player has taken the turn" |
| Vote collecting | "Cast your vote (2/4 votes received)" |
| Vote after you vote | "Your vote submitted (3/4 votes)" |
| Vote complete | "Votes collected, resolving turn..." |
| Freeform before submit | "Share your actions or ideas" |
| Freeform after submit | "Your input has been added to the turn" |

---

## Concurrency Check Pattern

```typescript
// When user loads page
const turnVersion = turnContract.state_version  // e.g., 5

// User waits 30 seconds...

// When user clicks submit
const currentTurn = await fetchLatestTurn(turnId)
const validation = validateVersion(currentTurn, turnVersion)

if (!validation.valid) {
  // Another process changed the turn!
  // Version went from 5 to 6
  showError("The turn state has changed. Please refresh.")
  location.reload()
  return
}

// Safe to submit
submitAction(...)
```

---

## Implementation Checklist (Copy/Paste)

```typescript
// 1. Import
import {
  canAcceptInput,
  canPlayerSubmitInput,
  validateInputContent,
  classifyInput,
  getInputStatus,
  shouldAdvanceTurn,
  validateVersion,
  getExpectedAction,
} from '@/lib/turn-contract'

// 2. Fetch turn data
const turn = await fetchTurn(turnId)

// 3. Check if accepting input
if (!canAcceptInput(turn)) {
  return <div>{getExpectedAction(turn)}</div>
}

// 4. On submit click
const { canSubmit, reason } = canPlayerSubmitInput(
  turn.mode,
  turn.phase,
  userId,
  hostId,
  hasSubmitted
)
if (!canSubmit) {
  showError(reason)
  return
}

// 5. Validate content
const { valid, error } = validateInputContent(content)
if (!valid) {
  showError(error)
  return
}

// 6. Classify input
const classification = classifyInput(
  {
    mode: turn.mode,
    phase: turn.phase,
    hostId,
    currentPlayerId: userId,
  },
  userId,
  hasExistingAuthoritativeInput
)

// 7. Check version
const versionCheck = validateVersion(turn, expectedVersion)
if (!versionCheck.valid) {
  showError('The turn state has changed. Please refresh.')
  location.reload()
  return
}

// 8. Submit
const response = await submitAction({
  turn_contract_id: turn.id,
  player_id: userId,
  content,
  classification,
  expected_state_version: expectedVersion,
})

// 9. Show status
const status = getInputStatus(
  turn.mode,
  turn.phase,
  authoritativeCount,
  playerCount,
  userId,
  hostId,
  true  // hasSubmitted
)
showStatus(status)

// 10. Check if advanced
if (response.phase_transitioned && response.new_turn_contract_id) {
  loadTurn(response.new_turn_contract_id)
}
```

---

## Test Cases (Minimal Set)

### Test 1: Single-Player DM Submit
```
mode: 'single_player'
phase: 'awaiting_input'
currentPlayerId === hostId: true
hasSubmitted: false
content: "I open the door"

Expected: canSubmit = true
Result: Submit succeeds
```

### Test 2: Single-Player Non-DM Submit
```
mode: 'single_player'
phase: 'awaiting_input'
currentPlayerId === hostId: false

Expected: canSubmit = false
Reason: "Only the DM can submit in single player mode"
```

### Test 3: Vote Threshold
```
mode: 'vote'
totalPlayers: 4
authoritativeInputs: 2

Expected: shouldAdvanceTurn() = true
(2 >= ceil((4 * 50) / 100) = 2)
```

### Test 4: Phase Block
```
phase: 'resolving'
(any mode, any player)

Expected: canSubmit = false
Reason: "Turn is in resolving phase, not accepting new inputs"
```

### Test 5: Version Mismatch
```
expectedVersion: 5
actualVersion: 6

Expected: validateVersion() = false
Error: version_mismatch
Action: Refresh page
```

---

## Common Mistakes to Avoid

1. **Not checking phase first**
   - Always check `phase === 'awaiting_input'` before mode rules
   
2. **Forgetting version check**
   - Call `validateVersion()` before every submission
   
3. **Not tracking submission state**
   - Keep track of `hasPlayerAlreadySubmitted` for UI feedback
   
4. **Ignoring input classification**
   - All inputs need to be classified as authoritative/ambient
   
5. **Not handling advancement**
   - Check if turn advanced and load new turn if needed
   
6. **Showing generic error messages**
   - Use `canPlayerSubmitInput().reason` not generic "Can't submit"
   
7. **Not clearing form after submit**
   - Reset input field when submission succeeds
   
8. **Forgetting about freeform mode**
   - Freeform allows multiple inputs and no auto-advance

---

## File Locations

```
Core Logic:
/lib/turn-contract/
  ├─ state-machine.ts     (canAcceptInput, getExpectedAction)
  ├─ input-gating.ts      (canPlayerSubmitInput, classifyInput, etc)
  ├─ modes.ts             (getModeDescription, voting logic)
  ├─ concurrency.ts       (validateVersion, getConflictMessage)
  └─ index.ts             (all exports)

API:
/app/api/campaign/[id]/start/route.ts  (creates initial turn)
/app/api/turn/submit/route.ts          (NEEDS TO BE CREATED)
/app/api/turn/resolve/route.ts         (NEEDS TO BE CREATED)

Components:
/components/game/
  ├─ ActionInput.tsx      (NEEDS TO BE CREATED)
  ├─ NarrativeDisplay.tsx (NEEDS TO BE CREATED)
  └─ ...

Pages:
/app/campaign/[id]/game/page.tsx  (NEEDS TO BE CREATED)
```

---

## Key Insight

**The entire turn validation logic is already written.** You don't need to implement `canPlayerSubmitInput()` or any gating logic - it's all in `input-gating.ts`. 

You just need to:
1. Call the right functions
2. Handle the returned values
3. Show the right messages
4. Submit to the API

The hard part is done. The UI part is straightforward.

