/**
 * Death Saving Throws Rules
 */

import type { RuleEntry } from '@/types/rules'

export const DEATH_SAVES_RULES: RuleEntry[] = [
  {
    id: 'death-saves-overview',
    name: 'Death Saving Throws',
    slug: 'death-saves',
    category: 'combat',
    subcategory: 'death-saves',
    summary:
      'When at 0 HP, roll a d20 at the start of each turn. 10+ is a success, 9 or lower is a failure. 3 successes = stable. 3 failures = death.',
    description: `
## Death Saving Throws

When you drop to 0 hit points, you fall unconscious and must begin making death saving throws.

### Making the Save
At the **start of each of your turns** while at 0 HP:
1. Roll **1d20** (no modifiers apply normally)
2. **10 or higher** = Success
3. **9 or lower** = Failure

### Tracking Results
- **3 Successes**: You become **stable** (unconscious but no longer dying)
- **3 Failures**: You **die**

Successes and failures don't need to be consecutive.

### Special Rolls
- **Natural 1**: Counts as **2 failures**
- **Natural 20**: You regain **1 hit point** and become conscious!

### Taking Damage at 0 HP
If you take damage while at 0 HP:
- Causes **1 death save failure**
- A **critical hit** causes **2 failures**
- If the damage equals or exceeds your **HP maximum**, you die instantly

### Stabilizing
A stable creature:
- Doesn't make death saves
- Remains unconscious
- After 1d4 hours, regains 1 HP and wakes up

### Medicine Check
A creature can use an action to make a DC 10 Wisdom (Medicine) check to stabilize you.
    `.trim(),
    examples: [
      {
        title: 'Successful Death Saves',
        description: 'A fighter at 0 HP makes death saves over several turns.',
        diceNotation: 'Turn 1: 14 (success) | Turn 2: 6 (failure) | Turn 3: 12 (success) | Turn 4: 18 (success)',
        result: '3 successes = stabilized! Unconscious but no longer dying.',
      },
      {
        title: 'Critical Hit While Dying',
        description: "A goblin hits the unconscious wizard with a melee attack (auto-crit from within 5 ft).",
        result: 'The wizard takes 2 death save failures (crit = 2 failures).',
      },
      {
        title: 'Rolling a Natural 20',
        description: 'A cleric at 0 HP with 2 failures rolls their death save.',
        diceNotation: 'Natural 20!',
        result: 'The cleric regains 1 HP and wakes up immediately! Successes and failures reset.',
      },
    ],
    tables: [
      {
        caption: 'Death Save Results',
        headers: ['Roll', 'Result'],
        rows: [
          ['Natural 1', '2 failures'],
          ['2-9', '1 failure'],
          ['10-19', '1 success'],
          ['Natural 20', 'Regain 1 HP, wake up!'],
        ],
      },
      {
        caption: 'Damage While at 0 HP',
        headers: ['Situation', 'Effect'],
        rows: [
          ['Take any damage', '1 death save failure'],
          ['Take a critical hit', '2 death save failures'],
          ['Damage >= HP maximum', 'Instant death'],
        ],
      },
    ],
    relatedRules: ['unconscious', 'healing', 'stabilizing'],
    relatedSpells: ['spare-the-dying', 'healing-word', 'cure-wounds', 'revivify'],
    relatedConditions: ['unconscious'],
    tags: ['death', 'dying', 'saving throw', '0 hp', 'stabilize'],
    keywords: ['death save', 'dying', 'unconscious', '0 hp', 'stabilize'],
    source: 'SRD',
    pageReference: 'PHB p.197',
    tips: [
      'Healing Word is amazing for saving dying allies from range.',
      'Spare the Dying (cantrip) automatically stabilizes - no roll needed.',
      "A healer's kit can stabilize without a Medicine check.",
      'Attacks against unconscious creatures from within 5 feet are auto-crits!',
    ],
    commonMistakes: [
      'Adding modifiers to death saves (you normally don\'t)',
      'Forgetting that crits cause 2 failures',
      'Thinking stabilized creatures wake up immediately (they don\'t)',
    ],
  },
  {
    id: 'instant-death',
    name: 'Instant Death',
    slug: 'instant-death',
    category: 'combat',
    subcategory: 'death-saves',
    summary:
      'Massive damage can kill you instantly. If damage reduces you to 0 HP and the remaining damage equals or exceeds your HP maximum, you die.',
    description: `
## Instant Death

Massive damage can kill you outright without death saving throws.

### The Rule
When damage reduces you to 0 HP and there is **remaining damage**, compare that remaining damage to your **hit point maximum**:

- If remaining damage **≥ HP maximum**: You die instantly
- If remaining damage **< HP maximum**: You fall unconscious and make death saves normally

### Example
A wizard with 20 max HP and 12 current HP takes 35 damage.
- 12 damage brings them to 0 HP
- 23 damage remains (35 - 12 = 23)
- 23 ≥ 20 (HP max), so the wizard dies instantly

### This Applies To
- Single attacks or effects
- Not cumulative damage from multiple sources
- Each damage instance is evaluated separately

### Common Sources of Massive Damage
- Critical hits from powerful creatures
- Falling from great heights
- Disintegrate spell (if it reduces you to 0 HP)
- Power Word Kill (automatic death if ≤100 HP)
    `.trim(),
    examples: [
      {
        title: 'Surviving Massive Damage',
        description: 'A barbarian with 50 max HP and 30 current HP takes 60 damage.',
        result:
          'Reduced to 0 HP with 30 remaining damage. 30 < 50 (HP max), so the barbarian falls unconscious but survives.',
      },
      {
        title: 'Instant Death',
        description: 'A rogue with 35 max HP and 10 current HP takes 50 damage.',
        result: 'Reduced to 0 HP with 40 remaining damage. 40 ≥ 35 (HP max) = instant death.',
      },
    ],
    relatedRules: ['death-saves-overview'],
    relatedSpells: ['disintegrate', 'power-word-kill'],
    tags: ['death', 'instant death', 'massive damage', 'hp maximum'],
    keywords: ['instant death', 'massive damage', 'overkill', 'die instantly'],
    source: 'SRD',
    pageReference: 'PHB p.197',
  },
]
