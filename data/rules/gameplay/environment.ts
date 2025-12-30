/**
 * Environment & Hazards Rules
 */

import type { RuleEntry } from '@/types/rules'

export const ENVIRONMENT_RULES: RuleEntry[] = [
  {
    id: 'environment-overview',
    name: 'Environment & Hazards',
    slug: 'environment-hazards',
    category: 'gameplay',
    subcategory: 'environment',
    summary:
      'The environment includes falling, suffocation, extreme temperatures, and other natural dangers that can challenge adventurers.',
    description: `
## Falling

When you fall, you take **1d6 bludgeoning damage per 10 feet fallen**, to a maximum of 20d6 (200 feet).

- You land **prone** unless you avoid all damage
- Fall instantly (no reaction possible unless you have a specific ability)
- Feather Fall can negate fall damage

## Suffocation

You can hold your breath for a number of minutes equal to **1 + CON modifier** (minimum 30 seconds).

When you run out of breath:
- You can survive for CON modifier rounds (minimum 1)
- Then you drop to 0 HP and are dying

## Extreme Temperatures

### Extreme Cold
If below 0°F (-18°C) without cold weather gear:
- Make a **DC 10 Constitution save** each hour
- Failure: Gain one level of **exhaustion**

### Extreme Heat
If above 100°F (38°C):
- Make a **Constitution save** each hour (DC 5, +1 per hour)
- Failure: Gain one level of **exhaustion**
- Disadvantage if wearing medium/heavy armor or heavy clothes

## Difficult Terrain

Movement through difficult terrain costs **double movement** (1 extra foot per foot moved).

Common difficult terrain:
- Rubble, dense vegetation
- Shallow water, mud
- Steep stairs

## Water and Swimming

- Swimming speed: Half your speed unless you have a swim speed
- Holding breath: 1 + CON modifier minutes
- Exhaustion from extended swimming in rough water
    `.trim(),
    examples: [
      {
        title: 'Falling from Height',
        description: 'A character falls 50 feet into a pit.',
        diceNotation: '5d6 bludgeoning damage',
        result: 'Average 17.5 damage. Character lands prone if they survive.',
      },
      {
        title: 'Drowning',
        description: 'A character with +2 CON is dragged underwater.',
        result: 'Can hold breath for 3 minutes. Then has 2 rounds before dropping to 0 HP.',
      },
      {
        title: 'Extreme Cold Travel',
        description: 'The party travels through a blizzard without proper gear.',
        result: 'DC 10 CON save each hour or gain exhaustion. Multiple failures stack!',
      },
    ],
    tables: [
      {
        caption: 'Fall Damage',
        headers: ['Distance', 'Damage'],
        rows: [
          ['10 feet', '1d6'],
          ['20 feet', '2d6'],
          ['50 feet', '5d6'],
          ['100 feet', '10d6'],
          ['200+ feet', '20d6 (maximum)'],
        ],
      },
      {
        caption: 'Exhaustion Effects',
        headers: ['Level', 'Effect'],
        rows: [
          ['1', 'Disadvantage on ability checks'],
          ['2', 'Speed halved'],
          ['3', 'Disadvantage on attacks and saves'],
          ['4', 'HP maximum halved'],
          ['5', 'Speed reduced to 0'],
          ['6', 'Death'],
        ],
      },
    ],
    relatedRules: ['resting-overview'],
    relatedConditions: ['prone', 'exhaustion'],
    tags: ['environment', 'hazards', 'falling', 'drowning', 'temperature', 'terrain'],
    keywords: ['fall damage', 'suffocation', 'drowning', 'cold', 'heat', 'difficult terrain', 'exhaustion'],
    source: 'SRD',
    pageReference: 'PHB p.183',
    tips: [
      'Feather Fall is one of the best life-saving spells in the game.',
      'Exhaustion stacks and is hard to remove - avoid multiple levels!',
      'Tiny Hut protects from environmental effects.',
    ],
  },
]
