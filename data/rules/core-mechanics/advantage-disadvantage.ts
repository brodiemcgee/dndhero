/**
 * Advantage and Disadvantage Rules
 */

import type { RuleEntry } from '@/types/rules'

export const ADVANTAGE_RULES: RuleEntry[] = [
  {
    id: 'advantage-disadvantage-overview',
    name: 'Advantage and Disadvantage',
    slug: 'advantage-disadvantage',
    category: 'core-mechanics',
    subcategory: 'advantage-disadvantage',
    summary:
      'Advantage: roll 2d20, take the higher. Disadvantage: roll 2d20, take the lower. They cancel each other out.',
    description: `
## Advantage and Disadvantage

The most common ways circumstances affect a d20 roll in D&D 5e.

### Advantage
When you have advantage:
1. Roll **two d20s**
2. Use the **higher** result
3. Then add your modifiers

### Disadvantage
When you have disadvantage:
1. Roll **two d20s**
2. Use the **lower** result
3. Then add your modifiers

### Key Rules

**Multiple Sources Don't Stack**
- 2 sources of advantage = still just advantage (2 dice, take higher)
- 3 sources of disadvantage = still just disadvantage (2 dice, take lower)

**Advantage and Disadvantage Cancel**
- If you have BOTH advantage AND disadvantage, they **cancel out**
- Roll **1d20 normally** regardless of how many sources of each
- 5 sources of advantage + 1 source of disadvantage = normal roll

**Rerolls and Replacements**
If something lets you reroll or replace a die:
- Only apply it to **one** of the two dice
- Then compare both dice and take higher/lower as appropriate
    `.trim(),
    examples: [
      {
        title: 'Attack with Advantage',
        description: 'A rogue attacks a surprised target (advantage). Modifier is +6.',
        diceNotation: 'Roll 2d20: [7, 16] = take 16, then add +6 = 22',
        result: 'Attack roll of 22',
      },
      {
        title: 'Cancellation',
        description: 'A poisoned (disadvantage) archer shoots a prone target (advantage).',
        result: 'Advantage + Disadvantage = they cancel. Roll 1d20 normally.',
      },
      {
        title: 'Multiple Disadvantages',
        description: 'A blinded, poisoned character with exhaustion level 3 attacks.',
        result: 'All three give disadvantage, but it\'s still just 2d20 take lower.',
      },
    ],
    tables: [
      {
        caption: 'Common Sources of Advantage',
        headers: ['Source', 'Applies To'],
        rows: [
          ['Attacking unseen target', 'Attack rolls'],
          ['Target is prone (melee)', 'Melee attack rolls'],
          ['Target is restrained/stunned/paralyzed', 'Attack rolls'],
          ['Flanking (optional rule)', 'Melee attack rolls'],
          ['Help action', 'Next ability check or attack'],
          ['Reckless Attack (Barbarian)', 'STR melee attacks this turn'],
          ['Pack Tactics (some creatures)', 'Attack if ally is adjacent to target'],
          ['True Strike cantrip', 'First attack next turn'],
        ],
      },
      {
        caption: 'Common Sources of Disadvantage',
        headers: ['Source', 'Applies To'],
        rows: [
          ['Attacking unseen attacker', 'Attack rolls'],
          ['Target is prone (ranged)', 'Ranged attack rolls'],
          ['Long range', 'Ranged attack rolls'],
          ['Enemy within 5 feet (ranged)', 'Ranged attacks'],
          ['Poisoned condition', 'Attack rolls'],
          ['Frightened (source visible)', 'Attack rolls and ability checks'],
          ['Restrained condition', 'DEX saves and attack rolls'],
          ['Exhaustion level 3+', 'Attack rolls and saving throws'],
        ],
      },
    ],
    relatedRules: ['attack-rolls-overview', 'ability-checks-overview'],
    relatedConditions: ['blinded', 'invisible', 'prone', 'restrained', 'poisoned', 'frightened'],
    tags: ['advantage', 'disadvantage', 'd20', 'roll twice'],
    keywords: ['advantage', 'disadvantage', 'adv', 'dis', 'cancel'],
    source: 'SRD',
    pageReference: 'PHB p.173',
    tips: [
      'Advantage is roughly equivalent to a +5 bonus on average.',
      'Lucky feat lets you roll a third d20 and choose which to use.',
      'Elven Accuracy lets you reroll one d20 when you have advantage (DEX/INT/WIS/CHA attacks).',
    ],
    commonMistakes: [
      'Stacking multiple advantages for extra dice (doesn\'t work)',
      "Thinking 3 advantages beat 1 disadvantage (they just cancel)",
      'Applying advantage to damage rolls (it only applies to the attack roll)',
    ],
  },
]
