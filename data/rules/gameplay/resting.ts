/**
 * Resting Rules
 */

import type { RuleEntry } from '@/types/rules'

export const RESTING_RULES: RuleEntry[] = [
  {
    id: 'resting-overview',
    name: 'Resting',
    slug: 'resting',
    category: 'gameplay',
    subcategory: 'resting',
    summary:
      'Short rests (1+ hours) let you spend Hit Dice to heal. Long rests (8 hours) fully restore HP, spell slots, and most abilities.',
    description: `
## Short Rest

A short rest is a period of at least **1 hour** during which you do nothing more strenuous than eating, drinking, reading, or tending wounds.

### Benefits of a Short Rest
- **Spend Hit Dice**: Roll any number of your Hit Dice. For each die, roll it + CON modifier and regain that many HP.
- **Certain abilities recharge**: Check your class features for "recharges on a short rest."

### Common Short Rest Abilities
- Fighter's **Second Wind** and **Action Surge**
- Warlock's **Pact Magic** spell slots
- Monk's **Ki** points
- Bard's **Bardic Inspiration** (at level 5+)
- Druid's **Wild Shape** uses

## Long Rest

A long rest is a period of at least **8 hours** of extended rest. You must sleep for at least 6 hours and perform no more than 2 hours of light activity.

### Benefits of a Long Rest
- **Regain all HP**: Your hit points are fully restored.
- **Regain all spell slots**: Spellcasters get all their slots back.
- **Most abilities recharge**: Unless stated otherwise.
- **Regain Hit Dice**: You regain spent Hit Dice equal to half your total (minimum 1).

### Long Rest Limitations
- You can only benefit from **one long rest per 24 hours**.
- If the rest is interrupted by at least 1 hour of strenuous activity, you must restart.
- You must have at least 1 HP to benefit from a long rest.

## Hit Dice

You have a number of Hit Dice equal to your level. The die type matches your class:
- d6: Sorcerer, Wizard
- d8: Bard, Cleric, Druid, Monk, Rogue, Warlock
- d10: Fighter, Paladin, Ranger
- d12: Barbarian

You regain half your maximum Hit Dice (rounded down, minimum 1) after a long rest.
    `.trim(),
    examples: [
      {
        title: 'Short Rest Healing',
        description: 'A level 5 fighter (d10 HD, +2 CON) with 15/45 HP takes a short rest with 3 Hit Dice available.',
        diceNotation: 'Spends 2 HD: (d10+2) + (d10+2) = [6+2] + [8+2] = 18 HP',
        result: 'HP goes from 15 to 33. They have 1 Hit Die remaining.',
      },
      {
        title: 'Long Rest Recovery',
        description: 'A level 6 wizard finishes a long rest after a tough day.',
        result: 'Regains all HP, all spell slots, and 3 Hit Dice (half of 6, rounded down).',
      },
      {
        title: 'Interrupted Rest',
        description: 'The party is attacked 4 hours into a long rest. Combat lasts 10 minutes.',
        result: 'Short combat (under 1 hour) doesn\'t interrupt. They can continue the rest.',
      },
    ],
    tables: [
      {
        caption: 'Rest Comparison',
        headers: ['Feature', 'Short Rest', 'Long Rest'],
        rows: [
          ['Duration', '1+ hours', '8 hours (6 sleep)'],
          ['HP Recovery', 'Spend Hit Dice', 'Full HP restored'],
          ['Spell Slots', 'Only Warlock', 'All slots restored'],
          ['Hit Dice', 'Can spend', 'Regain half total'],
          ['Frequency', 'Unlimited', 'Once per 24 hours'],
        ],
      },
      {
        caption: 'Hit Die by Class',
        headers: ['Hit Die', 'Classes', 'Average Roll'],
        rows: [
          ['d6', 'Sorcerer, Wizard', '3.5 + CON'],
          ['d8', 'Bard, Cleric, Druid, Monk, Rogue, Warlock', '4.5 + CON'],
          ['d10', 'Fighter, Paladin, Ranger', '5.5 + CON'],
          ['d12', 'Barbarian', '6.5 + CON'],
        ],
      },
    ],
    relatedRules: ['hit-points-overview'],
    relatedConditions: ['exhaustion'],
    tags: ['rest', 'short rest', 'long rest', 'healing', 'hit dice', 'recovery'],
    keywords: ['short rest', 'long rest', 'hit dice', 'recover HP', 'regain spells', 'sleep'],
    source: 'SRD',
    pageReference: 'PHB p.186',
    tips: [
      'Encourage short rests - they help sustain the party between long rests.',
      'Warlocks and Monks especially benefit from short rests.',
      'Sleeping in armor heavier than light armor may cause exhaustion (variant rule).',
      "Tiny Hut ritual is excellent for safe long rests in dangerous areas.",
    ],
    commonMistakes: [
      'Thinking all classes regain abilities on short rest (many require long rest).',
      'Forgetting you only regain HALF your Hit Dice on a long rest, not all.',
      'Not tracking Hit Dice expenditure between long rests.',
    ],
  },
]
