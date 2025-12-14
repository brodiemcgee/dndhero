# D&D Hero - Game Turn System Analysis

## Overview

This document provides a comprehensive analysis of the game turn system in D&D Hero, explaining how the turn mechanics work, what determines if a player sees "no active turn", and how the ActionInput component validates turn state before allowing actions.

---

## Architecture Overview

The turn system is built on a **Turn Contract State Machine** with input gating and mode-specific logic. It's designed to handle multiple gameplay styles (single-player, voting, first-response-wins, freeform) while maintaining data consistency through optimistic concurrency control.

### Key Files
- `/lib/turn-contract/state-machine.ts` - Turn phase management
- `/lib/turn-contract/input-gating.ts` - Input validation and classification
- `/lib/turn-contract/modes.ts` - Mode-specific logic
- `/lib/turn-contract/concurrency.ts` - Optimistic concurrency control
- `/app/api/campaign/[id]/start/route.ts` - Initializes first turn contract

---

## Turn Contract Structure

### TurnContract Interface

```typescript
export interface TurnContract {
  id: string
  scene_id: string
  turn_number: number
  phase: TurnPhase                          // awaiting_input | awaiting_rolls | resolving | complete
  mode: TurnMode                            // single_player | vote | first_response_wins | freeform
  state_version: number                     // For optimistic concurrency control
  narrative_context: string | null
  ai_task: string | null
  pending_since: Date                       // When turn started
  completed_at: Date | null                 // When turn completed (null if ongoing)
  created_at: Date
}
```

### Turn Phases

The turn flows through these phases:

```
awaiting_input ──→ awaiting_rolls ──→ resolving ──→ complete
     ↑                   ↓               ↓
     └───────────────────┴───────────────┘ (Error recovery path)
```

**Phase Meanings:**
- `awaiting_input`: Waiting for players to submit actions
- `awaiting_rolls`: Players have submitted, waiting for dice rolls to complete
- `resolving`: AI DM is processing the turn
- `complete`: Turn is done, ready for next turn

---

## The "No Active Turn" Problem

### When a Player Sees "No Active Turn"

A player would see "no active turn" when:

1. **Turn phase is NOT `awaiting_input`**
   ```typescript
   // From input-gating.ts - canPlayerSubmitInput()
   if (phase !== 'awaiting_input') {
     return {
       canSubmit: false,
       reason: `Turn is in ${phase} phase, not accepting new inputs`
     }
   }
   ```

2. **Turn is in `resolving` or `complete` phase**
   - No new inputs can be submitted during resolution
   - Turn must advance to next turn before more input accepted

3. **Specific mode restrictions apply**
   - Single-player mode: Only the host (DM) can submit
   - First-response-wins: Once someone submits, others can't submit (they already did)
   - Vote mode: Can only vote once per turn
   - Freeform: Can submit multiple times, but turn still must be in awaiting_input

### Key Functions That Check for Active Turn

#### 1. `canAcceptInput(turn: TurnContract): boolean`
```typescript
export function canAcceptInput(turn: TurnContract): boolean {
  return turn.phase === 'awaiting_input'
}
```
**Returns:** true only if phase is exactly 'awaiting_input'

#### 2. `canPlayerSubmitInput()` - Most Important
```typescript
export function canPlayerSubmitInput(
  mode: 'single_player' | 'vote' | 'first_response_wins' | 'freeform',
  phase: 'awaiting_input' | 'awaiting_rolls' | 'resolving' | 'complete',
  playerId: string,
  hostId: string,
  hasPlayerAlreadySubmitted: boolean
): { canSubmit: boolean; reason?: string }
```

**Check Order:**
1. First checks if `phase !== 'awaiting_input'` → returns { canSubmit: false }
2. Then applies mode-specific logic:
   - **single_player**: Only host can submit, and only once
   - **first_response_wins**: Only first player succeeds, others get rejected
   - **vote**: All players can vote once
   - **freeform**: All players can submit multiple times

#### 3. `getInputStatus()` - Status Messages
Returns user-facing status messages based on mode and phase:
```typescript
// Examples:
case 'single_player':
  if (currentPlayerId === hostId) {
    return hasPlayerSubmitted ? 'Your input has been submitted' : 'Your turn - submit your action'
  }
  return 'Waiting for DM...'

case 'first_response_wins':
  if (authoritativeInputCount > 0) {
    return 'Another player has taken the turn'
  }
  return 'First to respond controls the turn!'

case 'vote':
  return `Cast your vote (${authoritativeInputCount}/${votesNeeded} votes received)`
```

---

## ActionInput Component Design (Expected)

While the current game page doesn't exist yet, based on the turn system architecture, here's how ActionInput SHOULD work:

### Props ActionInput Should Receive

```typescript
interface ActionInputProps {
  // Turn contract state
  turnContract: TurnContract
  currentPlayerId: string
  hostId: string
  
  // Campaign context
  campaignId: string
  sceneId: string
  characterId?: string
  
  // Callbacks
  onSubmit: (content: string) => Promise<void>
  onError?: (error: string) => void
  
  // Display
  disabled?: boolean
  placeholder?: string
}
```

### Conditions ActionInput Must Check

```typescript
// 1. Check if turn exists and is in correct phase
const canSubmit = canAcceptInput(turnContract) // false if not awaiting_input

// 2. Check mode-specific rules
const { canSubmit: allowed, reason } = canPlayerSubmitInput(
  turnContract.mode,
  turnContract.phase,
  currentPlayerId,
  hostId,
  hasPlayerAlreadySubmitted
)

// 3. Check input content validity
const { valid, error } = validateInputContent(inputContent)

// 4. Display appropriate message
if (!allowed) {
  showMessage(reason) // "Waiting for DM..." or "Turn is in resolving phase..."
  return // Don't submit
}
```

### Expected Submit Handler

```typescript
async function handleSubmit(content: string) {
  // Validate input
  const validation = validateInputContent(content)
  if (!validation.valid) {
    showError(validation.error)
    return
  }

  // Check if can submit
  const { canSubmit, reason } = canPlayerSubmitInput(
    turnContract.mode,
    turnContract.phase,
    currentPlayerId,
    hostId,
    hasAlreadySubmitted
  )
  if (!canSubmit) {
    showError(reason)
    return
  }

  // Classify input based on mode
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

  // Submit to API
  try {
    await fetch(`/api/turn/submit`, {
      method: 'POST',
      body: JSON.stringify({
        turn_contract_id: turnContract.id,
        player_id: currentPlayerId,
        character_id: characterId,
        content: content,
        classification: classification,
      })
    })
  } catch (error) {
    showError('Failed to submit action')
  }
}
```

---

## Input Classification System

The system distinguishes between two types of inputs:

### Authoritative vs Ambient Classification

```typescript
export function classifyInput(
  rules: InputGatingRules,
  inputPlayerId: string,
  hasExistingAuthoritativeInput: boolean
): InputClassification // 'authoritative' | 'ambient'
```

**Classification Rules** (during awaiting_input phase):

| Mode | Rule |
|------|------|
| **single_player** | Only host's first input is authoritative; others are ambient |
| **first_response_wins** | First player's input is authoritative; subsequent inputs are ambient |
| **vote** | All inputs are authoritative (used for voting) |
| **freeform** | All inputs are authoritative (AI synthesizes all) |

**Non-awaiting_input Phases:** All inputs are classified as `ambient` during resolving or complete phases.

---

## Turn Advancement Logic

### When Does a Turn Auto-Advance?

```typescript
export function shouldAdvanceTurn(
  mode: TurnMode,
  authoritativeInputCount: number,
  totalPlayerCount: number,
  votingThresholdPercent: number = 50
): boolean
```

**Advancement Rules:**

| Mode | Advancement Trigger |
|------|-------------------|
| **single_player** | After host submits 1 authoritative input |
| **first_response_wins** | After first player submits (gets authoritative) |
| **vote** | After 50%+ of players vote (threshold met) |
| **freeform** | Manual by DM (never auto-advances) |

### Voting Threshold Example

```typescript
// In vote mode with 4 players:
const requiredVotes = Math.ceil((4 * 50) / 100) = 2
// Turn advances when 2+ votes received
```

---

## Input Gating: The Decision Tree

Here's the complete decision tree ActionInput should implement:

```
Start Submission Request
│
├─ PHASE CHECK
│  └─ Is phase === 'awaiting_input'?
│     ├─ NO  → Display "Turn is in {phase} phase, not accepting new inputs"
│     │        └─ REJECT
│     └─ YES → Continue
│
├─ MODE-SPECIFIC CHECKS
│  ├─ single_player?
│  │  ├─ Is currentPlayerId === hostId?
│  │  │  ├─ NO  → "Only the DM can submit in single player mode"
│  │  │  │        └─ REJECT
│  │  │  └─ YES → Check if already submitted
│  │  │           ├─ YES → "You have already submitted"
│  │  │           │        └─ REJECT
│  │  │           └─ NO  → ALLOW
│  │  │
│  ├─ first_response_wins?
│  │  ├─ Has anyone submitted yet?
│  │  │  ├─ YES → "Another player has taken the turn"
│  │  │  │        └─ REJECT
│  │  │  └─ NO  → Check if player already submitted
│  │  │           ├─ YES → "You have already submitted"
│  │  │           │        └─ REJECT
│  │  │           └─ NO  → ALLOW (will be first)
│  │  │
│  ├─ vote?
│  │  └─ Has player already voted?
│  │     ├─ YES → "You have already cast your vote"
│  │     │        └─ REJECT
│  │     └─ NO  → ALLOW
│  │
│  └─ freeform?
│     └─ ALLOW (can submit multiple times)
│
├─ CONTENT VALIDATION
│  ├─ Is content non-empty and trimmed?
│  │  └─ NO  → "Input cannot be empty"
│  │           └─ REJECT
│  └─ Is content ≤ 5000 characters?
│     └─ NO  → "Input exceeds maximum length (5000 characters)"
│              └─ REJECT
│
└─ ALLOW SUBMISSION
   └─ Classify input and submit
```

---

## Mode Configurations

### Single Player Mode
```typescript
mode: 'single_player'
autoAdvance: true                    // Auto-advances after DM input
allowMultipleInputs: false           // Only one input total
recommendedPlayerCount: { min: 1, max: 1 }
description: 'Only the host (DM) can submit authoritative input'
```

### First Response Wins
```typescript
mode: 'first_response_wins'
autoAdvance: true                    // Auto-advances after first response
allowMultipleInputs: false           // Players submit once
recommendedPlayerCount: { min: 2, max: 8 }
description: 'First player to submit takes control'
```

### Vote Mode
```typescript
mode: 'vote'
votingThreshold: 50                  // 50% of players must vote
autoAdvance: true                    // Auto-advances when threshold met
allowMultipleInputs: false           // Players vote once
recommendedPlayerCount: { min: 3, max: 12 }
description: 'Players vote on actions, majority wins'
```

### Freeform Mode
```typescript
mode: 'freeform'
autoAdvance: false                   // DM manually advances
allowMultipleInputs: true            // Players can contribute multiple times
recommendedPlayerCount: { min: 2, max: 20 }
description: 'All players contribute ideas, AI synthesizes'
```

---

## Concurrency Control

To prevent race conditions, the system uses **optimistic concurrency control**:

```typescript
turnContract {
  state_version: 5  // Incremented with each transition
}
```

### Version Checking

When ActionInput submits input, the turn must be checked:

```typescript
// Before submitting
const validation = validateVersion(turnContract, expectedVersion)

if (!validation.valid) {
  // Another process modified the turn
  showError('The turn state has been updated. Please refresh and try again.')
  refresh() // Reload current turn state
  return
}
```

### Version Increment

Every phase transition increments the version:

```typescript
export function transitionPhase(
  currentTurn: TurnContract,
  nextPhase: TurnPhase
): TurnStateUpdate {
  return {
    phase: nextPhase,
    state_version: currentTurn.state_version + 1  // ← Incremented
    // ...
  }
}
```

---

## Turn Status Messages

The system provides user-facing messages via `getInputStatus()`:

### Single Player Mode Messages
```
DM's turn:     "Your turn - submit your action"
DM after:      "Your input has been submitted"
Other players: "Waiting for DM..."
```

### First Response Wins Messages
```
Before submit: "First to respond controls the turn!"
After submit:  "Your input is being processed"
Other players: "Another player has taken the turn"
```

### Vote Mode Messages
```
Before voting:     "Cast your vote (2/4 votes received)"
After voting:      "Your vote submitted (3/4 votes)"
When complete:     "Votes collected, resolving turn..."
```

### Freeform Mode Messages
```
Before submit: "Share your actions or ideas"
After submit:  "Your input has been added to the turn"
```

---

## NarrativeDisplay Component Design (Expected)

The NarrativeDisplay component should show:

1. **Turn Status**
   ```
   Phase: Awaiting Input
   Mode: First Response Wins
   Participants: 3/4 players
   ```

2. **Narrative Context**
   - What the players see (scene description)
   - What happened last turn

3. **Input Status**
   - Vote progress (if vote mode)
   - Who has responded (if freeform)
   - Waiting for DM indicator

4. **Expected Action**
   ```typescript
   export function getExpectedAction(turn: TurnContract): string {
     case 'awaiting_input':
       return 'Players should provide their actions or decisions'
     case 'awaiting_rolls':
       return 'Players should complete any pending dice rolls'
     case 'resolving':
       return 'AI DM is processing the turn. Please wait...'
     case 'complete':
       return 'Turn is complete. New turn will begin shortly.'
   }
   ```

---

## Turn Lifecycle Example

### Single Player Mode Flow

```
1. Turn Created (first_response_wins mode)
   ├─ phase: awaiting_input
   ├─ turn_number: 1
   └─ pending_since: 2024-12-14T10:00:00Z

2. DM Submits Action
   ├─ ActionInput checks: canPlayerSubmitInput() → true
   ├─ Input classified: 'authoritative' (DM is host)
   ├─ shouldAdvanceTurn() → true (has 1 authoritative input)
   └─ Transition initiated

3. Transition to awaiting_rolls
   ├─ phase: awaiting_rolls
   ├─ state_version: 2
   └─ AI task queued

4. No rolls needed for narrative
   ├─ shouldAdvanceTurn() → true
   └─ Immediate transition

5. Transition to resolving
   ├─ phase: resolving
   ├─ state_version: 3
   └─ AI DM begins processing

6. AI generates narrative
   └─ completeTurn() called

7. Turn Completed
   ├─ phase: complete
   ├─ state_version: 4
   ├─ completed_at: 2024-12-14T10:02:30Z
   └─ New turn_contract created for next turn

8. New Turn Begins
   ├─ phase: awaiting_input
   ├─ turn_number: 2
   └─ Cycle repeats
```

---

## API Integration

### Turn Submit Endpoint (Expected)

```typescript
POST /api/turn/submit
{
  turn_contract_id: "uuid",
  player_id: "uuid",
  character_id: "uuid",
  content: "I attack the goblin",
  classification: "authoritative"  // Determined by input-gating
}

Response:
{
  success: true,
  turn_updated: true,
  phase_transitioned: boolean,
  next_phase?: string,
  new_turn_contract_id?: string  // If turn completed
}
```

### Error Cases

1. **Phase Mismatch**
   ```
   Status: 400
   {
     error: "Turn is in resolving phase, not accepting new inputs"
   }
   ```

2. **Mode Violation**
   ```
   Status: 403
   {
     error: "Only the DM can submit in single player mode"
   }
   ```

3. **Version Conflict**
   ```
   Status: 409
   {
     error: "Version mismatch: expected 5, found 6"
   }
   ```

---

## Summary: Key Decision Points

When building ActionInput, check these in order:

```typescript
// 1. Does turn exist?
if (!turnContract) {
  return "No active turn"
}

// 2. Is turn accepting input?
if (!canAcceptInput(turnContract)) {
  return getExpectedAction(turnContract)  
  // e.g., "AI DM is processing the turn. Please wait..."
}

// 3. Can this player submit?
const { canSubmit, reason } = canPlayerSubmitInput(
  turnContract.mode,
  turnContract.phase,
  currentPlayerId,
  hostId,
  hasPlayerAlreadySubmitted
)
if (!canSubmit) {
  return reason  // e.g., "Only the DM can submit in single player mode"
}

// 4. Is the input valid?
const { valid, error } = validateInputContent(inputContent)
if (!valid) {
  return error  // e.g., "Input cannot be empty"
}

// 5. Ready to submit!
await submitAction(...)
```

---

## Related Files Structure

```
lib/turn-contract/
├── state-machine.ts          ← Phase transitions & turn contract
├── input-gating.ts           ← Classification & submission validation
├── modes.ts                  ← Mode-specific logic
├── concurrency.ts            ← Version management
└── index.ts                  ← Exports all

app/api/
├── campaign/[id]/start/route.ts  ← Creates initial turn contract
├── turn/submit/route.ts          ← Submits player input (expected)
└── turn/resolve/route.ts         ← AI DM resolution (expected)

components/ (to be created)
├── game/ActionInput.tsx          ← Input validation & submission
├── game/NarrativeDisplay.tsx     ← Turn status & narrative
├── game/CombatTracker.tsx        ← Initiative & turn order
└── game/DiceRoller.tsx           ← Dice roll handling

app/campaign/[id]/game/page.tsx   ← Game page (to be created)
```

---

## Current Implementation Status

As of December 14, 2024:

✅ **Completed & Available**
- Turn Contract State Machine (complete)
- Input Gating System (complete)
- Turn Mode Logic (complete)
- Concurrency Control (complete)
- Campaign Start API (creates first turn contract)

⏳ **Not Yet Implemented**
- Game Page (`/campaign/[id]/game/page.tsx`)
- ActionInput Component
- NarrativeDisplay Component
- Turn Submit API Route (`/api/turn/submit`)
- Turn Resolution API Route (`/api/turn/resolve`)

---

## Implementation Checklist for Game Page

When creating the game page and ActionInput component:

- [ ] Fetch current turn contract with `turnContractId` from URL params
- [ ] Check if `turnContract.phase === 'awaiting_input'`
- [ ] Call `canPlayerSubmitInput()` to check mode/player restrictions
- [ ] Display `getInputStatus()` message based on mode and phase
- [ ] Show `getExpectedAction()` when not awaiting_input
- [ ] Validate input with `validateInputContent()`
- [ ] Classify input with `classifyInput()`
- [ ] Submit with version check for concurrency safety
- [ ] Handle version mismatch errors with refresh
- [ ] Show turn advancement messages when `shouldAdvanceTurn()` returns true
- [ ] Update UI when phase transitions occur

