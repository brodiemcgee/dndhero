/**
 * Currency & Trading Rules
 */

import type { RuleEntry } from '@/types/rules'

export const CURRENCY_RULES: RuleEntry[] = [
  {
    id: 'currency-overview',
    name: 'Currency & Trading',
    slug: 'currency-trading',
    category: 'equipment',
    subcategory: 'currency',
    summary:
      'D&D uses a coin-based economy with copper, silver, electrum, gold, and platinum. Gold pieces (gp) are the standard unit for most transactions.',
    description: `
## Coin Types

From least to most valuable:

| Coin | Abbreviation | Value in GP |
|------|--------------|-------------|
| Copper piece | cp | 1/100 gp |
| Silver piece | sp | 1/10 gp |
| Electrum piece | ep | 1/2 gp |
| Gold piece | gp | 1 gp |
| Platinum piece | pp | 10 gp |

## Conversion

- 10 cp = 1 sp
- 10 sp = 1 gp
- 2 ep = 1 gp
- 10 gp = 1 pp

## Standard Costs

### Lifestyle Expenses (per day)
- **Wretched**: Free (live on streets)
- **Squalid**: 1 sp
- **Poor**: 2 sp
- **Modest**: 1 gp
- **Comfortable**: 2 gp
- **Wealthy**: 4 gp
- **Aristocratic**: 10+ gp

### Common Goods
- Ale (mug): 4 cp
- Bread (loaf): 2 cp
- Meal (common): 3 sp
- Room at inn (common): 5 sp/night
- Horse (riding): 75 gp
- Chainmail: 75 gp
- Longsword: 15 gp

## Selling Items

You can sell items for **half their listed price** in most cases. Magic items are harder to sell and may require finding the right buyer.

## Encumbrance (Optional)

50 coins weigh 1 pound. If using encumbrance rules:
- **Carry Capacity** = STR × 15 lbs
- Exceeding capacity reduces speed
    `.trim(),
    examples: [
      {
        title: 'Buying Equipment',
        description: 'A new adventurer has 100 gp to spend on starting gear.',
        result: 'Longsword (15 gp) + Chain shirt (50 gp) + Shield (10 gp) + Adventuring pack (12 gp) = 87 gp spent, 13 gp remaining.',
      },
      {
        title: 'Selling Loot',
        description: 'The party finds 3 longswords worth 15 gp each.',
        result: 'They can sell them for 7.5 gp each (half price) = 22.5 gp total.',
      },
    ],
    tables: [
      {
        caption: 'Currency Exchange',
        headers: ['Coin', 'cp', 'sp', 'ep', 'gp', 'pp'],
        rows: [
          ['Copper (cp)', '1', '1/10', '1/50', '1/100', '1/1000'],
          ['Silver (sp)', '10', '1', '1/5', '1/10', '1/100'],
          ['Electrum (ep)', '50', '5', '1', '1/2', '1/20'],
          ['Gold (gp)', '100', '10', '2', '1', '1/10'],
          ['Platinum (pp)', '1000', '100', '20', '10', '1'],
        ],
      },
      {
        caption: 'Starting Wealth by Class',
        headers: ['Class', 'Starting Gold'],
        rows: [
          ['Barbarian', '2d4 × 10 gp'],
          ['Bard', '5d4 × 10 gp'],
          ['Cleric', '5d4 × 10 gp'],
          ['Fighter', '5d4 × 10 gp'],
          ['Rogue', '4d4 × 10 gp'],
          ['Wizard', '4d4 × 10 gp'],
        ],
      },
    ],
    relatedRules: ['adventuring-gear-overview', 'weapons-overview', 'armor-overview'],
    tags: ['currency', 'gold', 'money', 'economy', 'trading'],
    keywords: ['gold pieces', 'gp', 'silver', 'copper', 'platinum', 'coins', 'money', 'buy', 'sell'],
    source: 'SRD',
    pageReference: 'PHB p.143',
    tips: [
      'Most players just track gold - convert everything to gp for simplicity.',
      'Magic items are rarely sold at shops - they\'re quest rewards.',
      'A comfortable lifestyle (2 gp/day) covers most living expenses.',
    ],
  },
]
