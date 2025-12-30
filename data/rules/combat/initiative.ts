/**
 * Initiative Rules
 */

import type { RuleEntry } from '@/types/rules'

export const INITIATIVE_RULES: RuleEntry[] = [
  {
    id: 'initiative-overview',
    name: 'Initiative',
    slug: 'initiative',
    category: 'combat',
    subcategory: 'initiative',
    summary:
      'Initiative determines the order of turns during combat. Roll a d20 and add your Dexterity modifier.',
    description: `
## What is Initiative?

Initiative determines the order in which creatures act during combat. When combat begins, every participant makes a **Dexterity check** to determine their place in the initiative order.

## Rolling Initiative

At the start of combat:
1. Roll **1d20**
2. Add your **Dexterity modifier**
3. The DM records everyone's totals

Higher totals act first. The order remains the same for the entire combat unless something changes it.

## Ties

If two or more creatures tie:
- **PCs vs Monsters**: The DM decides which goes first, or has the tied creatures roll again
- **Between PCs**: Players can decide among themselves or roll off

## Surprise

If you are surprised, you can't move or take actions on your first turn of combat, and you can't take reactions until that turn ends.

## Your Turn

On your turn, you can:
- **Move** up to your speed
- Take one **action**
- Optionally take one **bonus action** (if you have an ability that uses one)
- Optionally take one **reaction** during the round (yours or another's turn)
    `.trim(),
    examples: [
      {
        title: 'Rolling Initiative',
        description: 'A fighter with +2 Dexterity modifier rolls initiative.',
        diceNotation: '1d20 + 2 = [14] + 2 = 16',
        result: 'The fighter acts on initiative count 16.',
      },
      {
        title: 'Surprise Round',
        description: 'Goblins ambush the party. The wizard fails to notice them.',
        result:
          "The wizard is surprised and can't act on turn 1. After turn 1 ends, the wizard can use reactions normally.",
      },
    ],
    tables: [
      {
        caption: 'Initiative Modifiers by Class',
        headers: ['Class', 'Typical DEX Mod', 'Special Features'],
        rows: [
          ['Rogue', '+3 to +5', 'Often high DEX, Reliable Talent at 11'],
          ['Monk', '+2 to +4', 'High DEX for AC'],
          ['Fighter', '+1 to +3', 'Varies by build'],
          ['Wizard', '+1 to +2', 'Often lower DEX'],
          ['Barbarian', '+1 to +2', 'Feral Instinct gives advantage at 7'],
        ],
      },
    ],
    relatedRules: ['combat-overview', 'actions-in-combat', 'surprise'],
    relatedConditions: ['surprised'],
    tags: ['initiative', 'combat', 'dexterity', 'turn order', 'surprise'],
    keywords: ['roll initiative', 'turn order', 'who goes first', 'combat start'],
    source: 'SRD',
    pageReference: 'PHB p.189',
    tips: [
      'Alert feat gives +5 to initiative and prevents surprise.',
      'Barbarians with Feral Instinct (level 7) roll initiative with advantage.',
      "Bards can use Jack of All Trades to add half proficiency to initiative (it's an ability check).",
    ],
  },
]
