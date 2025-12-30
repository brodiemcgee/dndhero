/**
 * Movement & Position Rules
 */

import type { RuleEntry } from '@/types/rules'

export const MOVEMENT_RULES: RuleEntry[] = [
  {
    id: 'movement-overview',
    name: 'Movement & Position',
    slug: 'movement-position',
    category: 'combat',
    subcategory: 'movement',
    summary:
      'On your turn, you can move up to your speed. Movement can be split before and after actions. Various terrain and conditions affect how far you can move.',
    description: `
## Your Speed

Your **speed** determines how many feet you can move on your turn. Most characters have 30 feet.

- Can split movement around actions (move, attack, move more)
- Some races are faster (Wood Elves: 35 ft) or slower (Dwarves: 25 ft)
- Heavy armor can reduce speed if you don't meet STR requirement

## Difficult Terrain

Moving through **difficult terrain** costs extra movement:
- Every 1 foot costs **2 feet** of movement
- Examples: rubble, ice, undergrowth, stairs, shallow water

## Special Movement

### Climbing, Swimming, Crawling
- Costs **1 extra foot per foot** (like difficult terrain)
- Unless you have a climbing or swimming speed

### Jumping
- **Long Jump**: Feet equal to STR score (with 10 ft running start), half without
- **High Jump**: 3 + STR modifier feet (running start), half without

### Dropping Prone
- Free (no movement cost)
- Standing from prone costs **half your speed**

## Opportunity Attacks

When a creature you can see **leaves your reach**, you can use your **reaction** to make one melee attack against them.

To avoid opportunity attacks:
- Use the **Disengage** action
- Teleport (Misty Step)
- Be moved involuntarily (pushed, pulled)

## Moving Through Creatures

- Can move through **friendly** creatures freely
- Can move through **hostile** creatures only if they're 2 sizes different
- Can't willingly end your turn in another creature's space
    `.trim(),
    examples: [
      {
        title: 'Split Movement',
        description: 'A fighter with 30 ft speed moves 15 ft, attacks, then moves 15 ft more.',
        result: 'Valid! You can split movement however you like around your action.',
      },
      {
        title: 'Difficult Terrain',
        description: 'A rogue with 30 ft speed wants to move through 10 ft of rubble.',
        result: 'Costs 20 ft of movement (double cost). They have 10 ft remaining.',
      },
      {
        title: 'Opportunity Attack',
        description: 'A goblin next to a fighter tries to run away.',
        result: 'The fighter can use their reaction to make one melee attack as the goblin leaves reach.',
      },
    ],
    tables: [
      {
        caption: 'Movement Costs',
        headers: ['Movement Type', 'Cost per Foot'],
        rows: [
          ['Normal movement', '1 foot'],
          ['Difficult terrain', '2 feet'],
          ['Climbing (no climb speed)', '2 feet'],
          ['Swimming (no swim speed)', '2 feet'],
          ['Crawling', '2 feet'],
          ['Standing from prone', 'Half speed'],
        ],
      },
      {
        caption: 'Speed by Race',
        headers: ['Race', 'Base Speed'],
        rows: [
          ['Human, Dragonborn, Half-Elf, Half-Orc, Tiefling', '30 ft'],
          ['Dwarf, Gnome, Halfling', '25 ft'],
          ['Elf (Wood)', '35 ft'],
          ['Elf (other)', '30 ft'],
        ],
      },
    ],
    relatedRules: ['actions-overview', 'conditions-overview'],
    relatedConditions: ['prone', 'grappled', 'restrained'],
    tags: ['movement', 'speed', 'position', 'opportunity attack', 'terrain'],
    keywords: ['movement speed', 'difficult terrain', 'opportunity attack', 'disengage', 'prone', 'jumping'],
    source: 'SRD',
    pageReference: 'PHB p.190',
    tips: [
      'Disengage is underrated - it prevents all opportunity attacks on your turn.',
      'Mobile feat lets you avoid opportunity attacks from creatures you attack.',
      'Monks and Rogues get bonus movement features - use them!',
    ],
    commonMistakes: [
      'Thinking you can only move once (you can split it up).',
      'Forgetting standing from prone costs half your speed.',
      'Taking opportunity attacks on teleporting creatures.',
    ],
  },
]
