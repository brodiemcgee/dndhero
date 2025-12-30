/**
 * Leveling Up Rules
 */

import type { RuleEntry } from '@/types/rules'

export const LEVELING_RULES: RuleEntry[] = [
  {
    id: 'leveling-overview',
    name: 'Leveling Up',
    slug: 'leveling-up',
    category: 'character',
    subcategory: 'leveling',
    summary:
      'As you gain experience points (XP), you level up, gaining increased hit points, new abilities, and higher proficiency bonus.',
    description: `
## How Leveling Works

1. **Gain XP** from combat, exploration, and story milestones
2. **Reach threshold** for next level
3. **Level up** and gain new abilities

## What You Gain Each Level

### Every Level
- **Hit Points**: Roll your Hit Die + CON modifier (or take average)
- **Class Features**: Check your class table

### At Certain Levels
- **Proficiency Bonus Increase**: At levels 5, 9, 13, 17
- **Ability Score Improvement (ASI)**: Usually at 4, 8, 12, 16, 19
- **New Spell Levels**: For spellcasters, check class table
- **Cantrips**: Some classes gain more cantrips

## Hit Point Calculation

When you level up:
- Roll your class's **Hit Die** (d6, d8, d10, or d12)
- Add your **Constitution modifier**
- Add the result to your maximum HP

**Alternative**: Take the average (die average + 0.5, rounded up) + CON mod.

| Hit Die | Average |
|---------|---------|
| d6 | 4 |
| d8 | 5 |
| d10 | 6 |
| d12 | 7 |

## Ability Score Improvements

At ASI levels, you can either:
1. Increase one ability score by 2 (max 20)
2. Increase two ability scores by 1 each
3. Take a **Feat** instead (if your DM allows feats)
    `.trim(),
    examples: [
      {
        title: 'Hit Point Increase',
        description: 'A fighter (d10 Hit Die) with +2 CON levels from 3rd to 4th.',
        diceNotation: 'd10 + 2 = [6] + 2 = 8 HP gained',
        result: 'Or take average: 6 + 2 = 8 HP (same in this case).',
      },
      {
        title: 'ASI Choice',
        description: 'A 4th-level rogue with 17 DEX must choose ASI or feat.',
        result: '+2 DEX (to 19) is strong. Or take a feat like Alert or Lucky.',
      },
    ],
    tables: [
      {
        caption: 'Experience Points by Level',
        headers: ['Level', 'XP Required', 'Prof Bonus'],
        rows: [
          ['1', '0', '+2'],
          ['2', '300', '+2'],
          ['3', '900', '+2'],
          ['4', '2,700', '+2'],
          ['5', '6,500', '+3'],
          ['6', '14,000', '+3'],
          ['7', '23,000', '+3'],
          ['8', '34,000', '+3'],
          ['9', '48,000', '+4'],
          ['10', '64,000', '+4'],
        ],
      },
      {
        caption: 'Hit Die by Class',
        headers: ['Hit Die', 'Classes'],
        rows: [
          ['d6', 'Sorcerer, Wizard'],
          ['d8', 'Bard, Cleric, Druid, Monk, Rogue, Warlock'],
          ['d10', 'Fighter, Paladin, Ranger'],
          ['d12', 'Barbarian'],
        ],
      },
    ],
    relatedRules: ['ability-scores-overview', 'proficiency-overview'],
    tags: ['leveling', 'experience', 'hit points', 'ASI', 'progression'],
    keywords: ['level up', 'XP', 'experience points', 'gain level', 'ability score improvement'],
    source: 'SRD',
    pageReference: 'PHB p.15',
    tips: [
      'Taking average HP is consistent and often recommended.',
      "At level 4, maxing your main stat is usually better than a feat.",
      'Level 5 is a major power spike for most classes.',
    ],
  },
]
