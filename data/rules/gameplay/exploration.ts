/**
 * Exploration Rules
 */

import type { RuleEntry } from '@/types/rules'

export const EXPLORATION_RULES: RuleEntry[] = [
  {
    id: 'exploration-overview',
    name: 'Exploration',
    slug: 'exploration',
    category: 'gameplay',
    subcategory: 'exploration',
    summary:
      'Exploration covers travel, searching for traps, navigating dungeons, and discovering secrets. Perception and Investigation are key skills.',
    description: `
## Travel Pace

During overland travel, the party chooses a pace:

| Pace | Speed | Effect |
|------|-------|--------|
| Fast | 400 ft/min, 4 miles/hour | -5 to passive Perception |
| Normal | 300 ft/min, 3 miles/hour | No penalty |
| Slow | 200 ft/min, 2 miles/hour | Can use Stealth |

### Daily Travel
- 8 hours of travel per day is typical
- **Fast**: 30 miles/day
- **Normal**: 24 miles/day
- **Slow**: 18 miles/day

Traveling more than 8 hours requires Constitution saves to avoid exhaustion.

## Vision and Light

### Light Levels
- **Bright Light**: Normal vision
- **Dim Light**: Lightly obscured (disadvantage on Perception checks relying on sight)
- **Darkness**: Heavily obscured (effectively blind without darkvision or light)

### Darkvision
Many races have darkvision:
- See in dim light as if bright light
- See in darkness as if dim light (but only in shades of gray)
- Does NOT let you see in magical darkness

## Searching and Detection

### Passive Perception
10 + Wisdom (Perception) modifier. Used when not actively searching. The DM compares this to hidden things' Stealth or DC.

### Active Searching
Make a Perception check (to notice) or Investigation check (to deduce) against the DC of hidden objects, traps, or secret doors.

## Common Exploration Activities
- **Searching for traps**: Perception or Investigation
- **Finding secret doors**: Investigation (usually)
- **Tracking creatures**: Survival
- **Navigating wilderness**: Survival
- **Foraging for food**: Survival (DC varies by terrain)
    `.trim(),
    examples: [
      {
        title: 'Finding a Trap',
        description: 'A rogue searches a suspicious hallway for traps (trap DC 15).',
        diceNotation: 'd20 + Perception or Investigation modifier',
        result: 'If they roll 15+, they find the pressure plate. Otherwise, they might trigger it.',
      },
      {
        title: 'Travel Time',
        description: 'The party needs to travel 50 miles to the next city.',
        result: 'At normal pace: 50 ÷ 24 = just over 2 days of travel.',
      },
    ],
    tables: [
      {
        caption: 'Travel Pace Summary',
        headers: ['Pace', 'Per Minute', 'Per Hour', 'Per Day', 'Effect'],
        rows: [
          ['Fast', '400 ft', '4 miles', '30 miles', '-5 passive Perception'],
          ['Normal', '300 ft', '3 miles', '24 miles', 'None'],
          ['Slow', '200 ft', '2 miles', '18 miles', 'Can Stealth'],
        ],
      },
      {
        caption: 'Foraging DCs',
        headers: ['Terrain', 'DC'],
        rows: [
          ['Forest/Coast', 'DC 10'],
          ['Grassland/Swamp', 'DC 15'],
          ['Desert/Arctic', 'DC 20'],
        ],
      },
    ],
    relatedRules: ['skills-overview'],
    relatedConditions: ['blinded', 'exhaustion'],
    tags: ['exploration', 'travel', 'vision', 'perception', 'searching'],
    keywords: ['travel pace', 'darkvision', 'passive perception', 'search', 'traps', 'secret doors'],
    source: 'SRD',
    pageReference: 'PHB p.181',
    tips: [
      'Always ask about light levels in dungeons.',
      'Slow pace is essential when you suspect ambushes.',
      'Passive Perception is always "on" - remind your DM to use it.',
    ],
  },
]
