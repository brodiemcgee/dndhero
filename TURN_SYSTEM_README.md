# D&D Hero - Turn System Documentation Index

## Quick Navigation

This directory contains comprehensive documentation on the game turn system. Start here to understand how gameplay works.

### For Different Needs:

**I want a quick answer** (5 min read)
- Start with: `TURN_SYSTEM_QUICK_REFERENCE.md`
- Contains: Decision trees, lookup tables, common patterns

**I need to implement ActionInput component** (30 min read)
- Start with: `TURN_SYSTEM_INVESTIGATION_SUMMARY.md`
- Then: `TURN_SYSTEM_CODE_REFERENCE.md`
- Contains: Component design, API integration, code examples

**I want to understand the full system** (60 min read)
- Start with: `TURN_SYSTEM_ANALYSIS.md`
- Contains: Architecture, design decisions, complete lifecycle examples

**I need code snippets and function reference** (20 min read)
- Start with: `TURN_SYSTEM_CODE_REFERENCE.md`
- Contains: Actual implementation, usage examples, test cases

---

## Document Overview

### 1. TURN_SYSTEM_QUICK_REFERENCE.md (4 KB)
**Best for:** Quick lookups, decision trees, copy-paste patterns

Contents:
- Decision tree: "When can a player submit?"
- 6 critical functions summary
- Mode comparison table
- Error/status message lookup tables
- Concurrency check pattern
- Test cases
- Common mistakes

### 2. TURN_SYSTEM_INVESTIGATION_SUMMARY.md (10 KB)
**Best for:** Getting oriented, implementation planning

Contents:
- Key findings overview
- Why players see "no active turn"
- ActionInput component requirements
- Current implementation status
- Implementation checklist
- Design decisions explained
- Testing recommendations

### 3. TURN_SYSTEM_ANALYSIS.md (19 KB)
**Best for:** Deep understanding, architectural decisions

Contents:
- Complete architecture overview
- Turn contract structure
- Detailed problem explanation
- Input classification system
- Turn advancement logic
- Complete decision tree
- Mode configurations
- Turn lifecycle examples
- API integration details
- Related file structure
- Status message examples

### 4. TURN_SYSTEM_CODE_REFERENCE.md (17 KB)
**Best for:** Implementation details, actual code

Contents:
- All file locations
- Function-by-function reference with code
- Usage examples for each function
- Complete submit flow example
- Testing decision trees
- Test scenarios (copy-paste ready)
- Summary of validation rules

---

## The Core Concept

Players see **"no active turn"** when:

1. **Turn phase is not `awaiting_input`**
   - Happens during resolving, complete phases
   - Message: "Turn is in {phase} phase, not accepting new inputs"

2. **Mode restrictions apply**
   - Single-player: Only DM can submit
   - First-response-wins: Only first player is authoritative
   - Vote: Can only vote once
   - Freeform: Can submit multiple times (but phase still matters)

3. **Input doesn't meet requirements**
   - Empty or whitespace
   - Over 5000 characters

---

## Key Functions You'll Use

All in `/lib/turn-contract/`:

```typescript
// Check if turn is accepting input
canAcceptInput(turn: TurnContract): boolean

// Check if specific player can submit
canPlayerSubmitInput(
  mode, phase, playerId, hostId, hasSubmitted
): { canSubmit: boolean; reason?: string }

// Validate input format
validateInputContent(content: string): { valid: boolean; error?: string }

// Classify as authoritative or ambient
classifyInput(rules, inputPlayerId, hasExistingAuthoritativeInput): 'authoritative' | 'ambient'

// Get user-friendly message
getInputStatus(mode, phase, counts, ...): string

// Should turn auto-advance?
shouldAdvanceTurn(mode, authoritativeInputCount, totalPlayerCount): boolean

// Check for concurrent modifications
validateVersion(entity, expectedVersion): { valid: boolean; error?: ConcurrencyError }

// Get message for current phase
getExpectedAction(turn: TurnContract): string
```

---

## Implementation Path

### Step 1: Understand the System
- Read `TURN_SYSTEM_QUICK_REFERENCE.md` (10 min)
- Read `TURN_SYSTEM_INVESTIGATION_SUMMARY.md` (20 min)

### Step 2: Design the Component
- Read `TURN_SYSTEM_ANALYSIS.md` - "ActionInput Component Design" section (15 min)
- Sketch out your component architecture

### Step 3: Implement ActionInput
- Reference `TURN_SYSTEM_CODE_REFERENCE.md` - "Complete Example: ActionInput Submit Flow" (10 min)
- Copy the validation sequence
- Import the functions
- Call them in the right order

### Step 4: Implement API Routes
- Create `/api/turn/submit` route
- Create `/api/turn/resolve` route
- Use `compareAndSwap()` for concurrency-safe updates

### Step 5: Test
- Run unit tests on each function
- Test integration scenarios from test cases
- E2E test with real players

---

## The Turn System Flow

```
1. Campaign starts
   └─ /api/campaign/[id]/start creates first turn contract
      └─ phase: awaiting_input
      └─ mode: (selected by host)

2. Game page loads
   └─ Fetches current turn contract
   └─ ActionInput component receives it

3. Player submits action
   └─ ActionInput validates using 6 functions
   └─ Calls /api/turn/submit (to be implemented)

4. API processes submission
   └─ Checks canPlayerSubmitInput()
   └─ Stores player input
   └─ Checks shouldAdvanceTurn()
   └─ If yes: transitions to next phase

5. Turn phases advance
   awaiting_input → awaiting_rolls → resolving → complete

6. When turn completes
   └─ /api/turn/resolve generates narrative via AI
   └─ Creates new turn contract
   └─ Next turn begins

7. Cycle repeats
   └─ Loop back to step 2
```

---

## Mode Comparison Quick Reference

| Feature | Single | FRW | Vote | Freeform |
|---------|--------|-----|------|----------|
| Who can submit? | DM only | Anyone | Everyone | Everyone |
| Submit limit | 1 total | 1 per player | 1 per player | Unlimited |
| Authority given to | DM's input | First player | All votes | All inputs |
| Auto-advance trigger | After 1 input | After 1 response | At 50% votes | Manual (DM) |
| AI sees | Authoritative | Authoritative + ambient | All votes | All inputs |
| Best for | DM narration | Quick decisions | Democratic | Collaborative |

---

## Testing Quick Start

Run these before submission:

```bash
# Unit test each function
npm test -- canPlayerSubmitInput
npm test -- classifyInput
npm test -- validateInputContent
npm test -- shouldAdvanceTurn
npm test -- validateVersion

# Integration test the flow
npm test -- ActionInput

# E2E test with players
npm run e2e -- game-turn
```

---

## Common Patterns

### Pattern 1: Check if player can submit
```typescript
const { canSubmit, reason } = canPlayerSubmitInput(
  turn.mode, turn.phase, playerId, hostId, hasSubmitted
)
if (!canSubmit) {
  showError(reason)
  return
}
```

### Pattern 2: Get status message for UI
```typescript
const status = getInputStatus(
  turn.mode, turn.phase, votesReceived, totalPlayers,
  playerId, hostId, hasSubmitted
)
return <div>{status}</div>
```

### Pattern 3: Check version before submit
```typescript
const validation = validateVersion(turn, expectedVersion)
if (!validation.valid) {
  showError('Turn state changed, please refresh')
  location.reload()
  return
}
```

### Pattern 4: Classify the input
```typescript
const classification = classifyInput(
  { mode: turn.mode, phase: turn.phase, hostId, currentPlayerId },
  playerId,
  hasExistingAuthoritativeInput
)
```

---

## Troubleshooting

**Q: Why does my player see "not accepting new inputs"?**
A: The turn phase is not `awaiting_input`. Check `turn.phase` - it's probably `resolving` or `complete`.

**Q: Why does mode-specific check fail?**
A: You're passing the wrong parameters. Check against:
- Single-player: Is `playerId === hostId`?
- First-response: Has anyone submitted yet?
- Vote: Has player already voted?
- Freeform: No restrictions (just phase check)

**Q: How do I know when to advance the turn?**
A: Call `shouldAdvanceTurn()` with the counts. It handles all mode-specific thresholds.

**Q: What's a version mismatch?**
A: Another player modified the turn while you were looking at it. Refresh and try again.

---

## File Structure

```
dndhero/
├── lib/turn-contract/
│   ├── state-machine.ts      [200 lines]
│   ├── input-gating.ts       [250 lines]
│   ├── modes.ts              [400 lines]
│   ├── concurrency.ts        [350 lines]
│   └── index.ts              [50 lines]
│
├── app/api/
│   └── campaign/[id]/start/route.ts  [creates turn]
│
├── TURN_SYSTEM_README.md      [THIS FILE]
├── TURN_SYSTEM_QUICK_REFERENCE.md
├── TURN_SYSTEM_INVESTIGATION_SUMMARY.md
├── TURN_SYSTEM_ANALYSIS.md
└── TURN_SYSTEM_CODE_REFERENCE.md
```

---

## Key Insight

**All validation logic is already written.** The turn contract system is 100% complete at the library level.

You don't need to implement `canPlayerSubmitInput()` - it already exists. You just need to:
1. Call it from ActionInput
2. Handle the response
3. Show appropriate messages
4. Submit to API

The hard part is done. You're just building the UI wrapper.

---

## Getting Help

If you need to understand a specific function:
1. Search `TURN_SYSTEM_CODE_REFERENCE.md` for function name
2. It will show actual code with usage examples
3. Copy the pattern and adapt

If you need to understand a concept:
1. Search `TURN_SYSTEM_ANALYSIS.md` for concept name
2. It will explain with examples and diagrams
3. Reference back to the functions

If you need a quick lookup:
1. Use `TURN_SYSTEM_QUICK_REFERENCE.md`
2. Has lookup tables for every scenario
3. Copy-paste patterns ready

---

## Summary

You have 4 documents explaining the turn system from different angles. Pick the one that matches your need:

- **Quick lookup?** → Quick Reference
- **Need to implement?** → Investigation Summary + Code Reference
- **Want deep understanding?** → Analysis
- **All three?** → Read in this order: Quick Ref → Summary → Analysis

Then implement ActionInput by following the patterns and code examples.

The system is designed to be simple to use but handle complex scenarios. Trust the functions - they've thought through all the edge cases.

Happy coding!
