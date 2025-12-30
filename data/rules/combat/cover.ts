/**
 * Cover Rules
 */

import type { RuleEntry } from '@/types/rules'

export const COVER_RULES: RuleEntry[] = [
  {
    id: 'cover-overview',
    name: 'Cover',
    slug: 'cover',
    category: 'combat',
    subcategory: 'cover',
    summary:
      'Cover provides protection from attacks and some effects. Walls, creatures, and other obstacles can provide half cover, three-quarters cover, or total cover.',
    description: `
## Types of Cover

Cover is determined by how much of you is blocked by an obstacle between you and the attacker.

### Half Cover (+2 AC, +2 DEX saves)
- About half your body is covered
- Examples: low wall, large furniture, thin tree, another creature

### Three-Quarters Cover (+5 AC, +5 DEX saves)
- About three-quarters of your body is covered
- Examples: portcullis, arrow slit, thick tree trunk

### Total Cover (Can't be targeted directly)
- Completely concealed by an obstacle
- Can't be targeted by attacks or most spells
- Examples: solid wall, closed door, around a corner

## Using Creatures as Cover

Other creatures (friendly or hostile) can provide **half cover** against attacks.

This means:
- Shooting through a melee between your ally and an enemy
- A smaller creature hiding behind a larger one

## Cover and Spells

Many spells require you to see or have a clear path to the target:
- **Total cover** blocks most targeted spells
- **Area spells** (Fireball) can still affect you if you're in the area
- Some spells explicitly ignore cover

## Determining Cover

Draw an imaginary line from the attacker to the target:
- If the line is blocked by an obstacle, there's cover
- DM determines the degree based on how much is blocked
    `.trim(),
    examples: [
      {
        title: 'Half Cover in Combat',
        description: 'An archer shoots at a goblin crouching behind a low wall (AC 13).',
        result: 'Goblin has half cover: +2 AC = AC 15 to hit.',
      },
      {
        title: 'Three-Quarters Cover',
        description: 'A mage casts Fire Bolt at an enemy behind arrow slits.',
        result: 'Enemy has +5 AC. A normally easy target becomes much harder to hit.',
      },
      {
        title: 'Total Cover',
        description: 'A rogue ducks fully behind a pillar.',
        result: "Can't be targeted by attacks or spells. But area effects (Fireball) might still reach.",
      },
    ],
    tables: [
      {
        caption: 'Cover Summary',
        headers: ['Cover Type', 'Body Blocked', 'AC Bonus', 'DEX Save Bonus'],
        rows: [
          ['Half', '~50%', '+2', '+2'],
          ['Three-Quarters', '~75%', '+5', '+5'],
          ['Total', '100%', "Can't target", "Can't target"],
        ],
      },
      {
        caption: 'Common Cover Examples',
        headers: ['Half Cover', 'Three-Quarters Cover', 'Total Cover'],
        rows: [
          ['Low wall', 'Arrow slit', 'Solid wall'],
          ['Furniture', 'Portcullis', 'Closed door'],
          ['Another creature', 'Dense vegetation', 'Behind corner'],
          ['Thin tree', 'Overturned table', 'Inside barrel'],
        ],
      },
    ],
    relatedRules: ['attack-rolls-overview', 'movement-overview'],
    tags: ['cover', 'AC', 'defense', 'positioning', 'combat tactics'],
    keywords: ['half cover', 'three-quarters cover', 'total cover', 'AC bonus', 'hiding behind'],
    source: 'SRD',
    pageReference: 'PHB p.196',
    tips: [
      'Always look for cover when fighting ranged enemies.',
      'Moving between cover points can keep you alive.',
      'Shield spell stacks with cover bonuses!',
      'Sharpshooter feat ignores half and three-quarters cover.',
    ],
    commonMistakes: [
      'Forgetting that other creatures provide half cover.',
      'Thinking total cover protects from area effects (it doesn\'t always).',
      'Not claiming cover bonuses when clearly behind obstacles.',
    ],
  },
]
