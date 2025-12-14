# D&D Hero Turn System Investigation Summary

**Date:** December 14, 2024
**Scope:** Comprehensive analysis of game turn system and ActionInput component requirements
**Status:** Complete

---

## Key Findings

### 1. Turn System Architecture
The game uses a **state machine-based turn system** with four phases:
- `awaiting_input` - Players submit actions
- `awaiting_rolls` - Dice rolls complete
- `resolving` - AI DM processes turn
- `complete` - Turn done

### 2. Why Players See "No Active Turn"

A player sees this message when **one of these conditions is true:**

```typescript
// Condition 1: Phase is not awaiting_input
if (turnContract.phase !== 'awaiting_input') {
  // Player sees "Turn is in {phase} phase, not accepting new inputs"
}

// Condition 2: Mode restrictions (varies by mode)
// Single-player: Only DM can submit
// First-response-wins: Only first player can be authoritative
// Vote: Can only vote once
// Freeform: Can always submit, but phase must still be awaiting_input

// Condition 3: Input invalid
if (!content || content.length === 0 || content.length > 5000) {
  // Input validation error
}
```

### 3. Critical Functions for ActionInput

| Function | Purpose | Location |
|----------|---------|----------|
| `canAcceptInput()` | Is phase `awaiting_input`? | state-machine.ts |
| `canPlayerSubmitInput()` | Can THIS player submit? | input-gating.ts |
| `classifyInput()` | Is input authoritative or ambient? | input-gating.ts |
| `validateInputContent()` | Is input format valid? | input-gating.ts |
| `getInputStatus()` | What message to show player? | input-gating.ts |
| `shouldAdvanceTurn()` | Should turn advance now? | input-gating.ts |

### 4. Turn Modes & Their Rules

#### Single Player Mode
- Only the **DM/host** can submit authoritative input
- Other players' inputs are "ambient" (context only)
- Auto-advances after host submits

#### First Response Wins
- Any player can submit
- **First to submit** gets authoritative input
- Subsequent inputs are "ambient"
- Auto-advances after first response

#### Vote Mode
- All players vote once each
- All votes are "authoritative"
- Auto-advances when **50% threshold met** (e.g., 2 of 4 players)
- Example: 4 players need 2 votes to proceed

#### Freeform Mode
- All players can submit **multiple times**
- All inputs are "authoritative"
- **Manual advancement** by DM (no auto-advance)
- AI synthesizes all inputs into narrative

### 5. Input Classification

The system classifies player inputs as:
- **Authoritative**: Turn-advancing input (counts toward advancement)
- **Ambient**: Context-only input (doesn't advance turn)

Classification depends on **mode, phase, and submission order.**

### 6. Concurrency Control

The system prevents race conditions using:
```typescript
turnContract.state_version: number  // Incremented with each phase transition
```

If another process modifies the turn, submission fails with version mismatch error. Player is prompted to refresh.

---

## ActionInput Component Requirements

### Props to Receive
```typescript
interface ActionInputProps {
  turnContract: TurnContract
  currentPlayerId: string
  hostId: string
  campaignId: string
  sceneId: string
  characterId?: string
  onSubmit: (content: string) => Promise<void>
  onError?: (error: string) => void
}
```

### Validation Sequence
1. Check if `turnContract.phase === 'awaiting_input'`
   - If not: show `getExpectedAction(turnContract)` message
2. Call `canPlayerSubmitInput()` - check mode/player restrictions
   - If can't submit: show `reason` from returned object
3. Call `validateInputContent()` - check format
   - If invalid: show `error` from returned object
4. Call `classifyInput()` - determine if authoritative/ambient
5. Check `validateVersion()` - concurrency safety
   - If version mismatch: refresh page
6. Submit to API with classification
7. Check if turn advanced - load new turn if needed

### Expected Error Messages
```
// Phase not correct
"Turn is in resolving phase, not accepting new inputs"

// Player restriction (single-player mode)
"Only the DM can submit in single player mode"

// Already submitted (first-response-wins, vote)
"You have already submitted your action"
"You have already cast your vote"

// Input validation
"Input cannot be empty"
"Input exceeds maximum length (5000 characters)"

// Concurrency error
"The turn state has been updated by another process. Please refresh and try again."
```

### Expected Status Messages
```
// Single-player mode
DM: "Your turn - submit your action"
Others: "Waiting for DM..."

// First-response-wins
Before submit: "First to respond controls the turn!"
After submit: "Another player has taken the turn"

// Vote mode
"Cast your vote (2/4 votes received)"
"Your vote submitted (3/4 votes)"

// Freeform
"Share your actions or ideas"
"Your input has been added to the turn"
```

---

## Current Implementation Status

### Completed (100% Ready)
- Turn Contract State Machine (`lib/turn-contract/state-machine.ts`)
- Input Gating System (`lib/turn-contract/input-gating.ts`)
- Turn Mode Logic (`lib/turn-contract/modes.ts`)
- Concurrency Control (`lib/turn-contract/concurrency.ts`)
- Campaign Start API (creates initial turn contract)

### Not Yet Implemented
- Game Page (`/campaign/[id]/game/page.tsx`)
- ActionInput Component
- NarrativeDisplay Component
- Turn Submit API Route (`/api/turn/submit`)
- Turn Resolution API Route (`/api/turn/resolve`)

---

## Files Analyzed

### Turn System Core
1. `/lib/turn-contract/state-machine.ts` - 200+ lines
2. `/lib/turn-contract/input-gating.ts` - 250+ lines
3. `/lib/turn-contract/modes.ts` - 400+ lines
4. `/lib/turn-contract/concurrency.ts` - 350+ lines
5. `/lib/turn-contract/index.ts` - Exports

### API Routes
- `/app/api/campaign/[id]/start/route.ts` - Initializes turn system

### Database
- `/types/database.ts` - Type definitions (placeholder)

---

## Implementation Checklist

When building the game page and ActionInput:

- [ ] Import from `@/lib/turn-contract`
- [ ] Fetch current turn contract from database/props
- [ ] Check `canAcceptInput(turnContract)`
- [ ] Call `canPlayerSubmitInput()` with all required params
- [ ] Get user-friendly message from `getInputStatus()`
- [ ] Validate content with `validateInputContent()`
- [ ] Classify input with `classifyInput()`
- [ ] Check version with `validateVersion()` before submit
- [ ] Handle version conflicts with page refresh
- [ ] Submit to `/api/turn/submit` (endpoint needed)
- [ ] Check if phase transitioned
- [ ] Load new turn if turn was completed

---

## Key Design Decisions

### 1. Input Classification
Separating "authoritative" from "ambient" inputs allows:
- Different rules per mode
- Tracking who can advance the turn
- Preserving ambient context for AI DM

### 2. Optimistic Concurrency Control
Using `state_version` prevents:
- Race conditions when multiple players submit simultaneously
- Conflicting phase transitions
- Double-counting authoritative inputs

### 3. Mode-Based Flexibility
Four modes support different gameplay styles:
- DM-controlled narrative (single-player)
- Competitive action priority (first-response-wins)
- Democratic decision-making (vote)
- Collaborative storytelling (freeform)

### 4. Centralized Gating Logic
All validation in `input-gating.ts`:
- Consistent rules across application
- Easy to test
- Single place to update submission logic

---

## Testing Recommendations

### Unit Tests
- `canPlayerSubmitInput()` with each mode and phase
- `classifyInput()` for each mode
- `shouldAdvanceTurn()` for voting thresholds
- `validateInputContent()` edge cases
- `validateVersion()` concurrent updates

### Integration Tests
- Full submission flow in each mode
- Version conflict recovery
- Phase transitions
- Turn advancement

### E2E Tests
- Player submits action, sees appropriate feedback
- Second player in first-response-wins sees "taken"
- Voting threshold triggers advancement
- Freeform allows multiple submissions

---

## Helpful Links in Code

### Get Mode Description
```typescript
import { getModeDescription } from '@/lib/turn-contract'
const msg = getModeDescription('vote')
// "Vote: Players vote on actions, majority wins"
```

### Get Mode Recommendations
```typescript
import { getRecommendedPlayerCount } from '@/lib/turn-contract'
const counts = getRecommendedPlayerCount('freeform')
// { min: 2, max: 20 }
```

### Get Turn Status
```typescript
import { getTurnStatus } from '@/lib/turn-contract'
const status = getTurnStatus(turnContract)
// "Waiting for player input"
```

### Get Conflict Message
```typescript
import { getConflictMessage } from '@/lib/turn-contract'
const msg = getConflictMessage(error)
// "The turn state has been updated by another process..."
```

---

## Summary

The turn system is **fully designed and implemented** at the library level. It provides:

1. **Complete validation rules** for every scenario
2. **Clear error messages** for all failure cases
3. **Status messages** for every phase and mode
4. **Race condition prevention** via version checking
5. **Flexible mode system** supporting 4 playstyles

The only missing pieces are:
- UI components (ActionInput, NarrativeDisplay)
- API routes (turn/submit, turn/resolve)
- Game page (layout and orchestration)

All turn logic is available and ready to use. No changes needed to the turn contract system itself.

---

## Two Documentation Files Included

This investigation includes two companion documents:

1. **TURN_SYSTEM_ANALYSIS.md** (10,000+ words)
   - Complete architectural overview
   - Decision trees for validation
   - Turn lifecycle examples
   - Component design expectations
   - Mode configuration details

2. **TURN_SYSTEM_CODE_REFERENCE.md** (5,000+ words)
   - Actual code snippets from implementation
   - Function-by-function reference
   - Usage examples
   - Testing scenarios
   - Complete submit flow example

Both documents saved to project root for easy reference.

