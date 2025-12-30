/**
 * Ability Check Rules
 */

import type { RuleEntry } from '@/types/rules'

export const ABILITY_CHECK_RULES: RuleEntry[] = [
  {
    id: 'ability-checks-overview',
    name: 'Ability Checks',
    slug: 'ability-checks',
    category: 'core-mechanics',
    subcategory: 'ability-checks',
    summary:
      'Roll 1d20 + ability modifier to attempt a task. The DM sets the DC. Meet or beat the DC to succeed.',
    description: `
## Ability Checks

An ability check tests a character's innate talent and training to overcome a challenge.

### Making an Ability Check
1. Roll **1d20**
2. Add the relevant **ability modifier**
3. Add **proficiency bonus** if a skill applies and you're proficient
4. Compare to the **Difficulty Class (DC)**

If your total **equals or exceeds** the DC, you succeed!

### The Six Abilities

| Ability | Used For |
|---------|----------|
| **Strength** | Athletics, lifting, breaking, climbing |
| **Dexterity** | Acrobatics, stealth, sleight of hand |
| **Constitution** | Endurance, resisting poison, holding breath |
| **Intelligence** | Investigation, recall, arcana, history |
| **Wisdom** | Perception, insight, medicine, survival |
| **Charisma** | Persuasion, deception, intimidation, performance |

### Skills
Most ability checks involve a skill. If you're **proficient** in that skill, add your proficiency bonus.

### Difficulty Class Examples
- **5**: Very Easy
- **10**: Easy
- **15**: Medium
- **20**: Hard
- **25**: Very Hard
- **30**: Nearly Impossible
    `.trim(),
    examples: [
      {
        title: 'Skill Check',
        description: 'A rogue with +3 DEX and proficiency (+2) in Stealth tries to sneak past guards.',
        diceNotation: '1d20 + 3 + 2 = 1d20 + 5',
        result: 'Roll 12 + 5 = 17. If the DC is 15, the rogue succeeds!',
      },
      {
        title: 'Straight Ability Check',
        description: 'A fighter tries to hold a door closed against monsters (pure Strength).',
        diceNotation: '1d20 + 4 (STR modifier)',
        result: "This is a Strength check without a skill, so no proficiency applies unless the DM rules otherwise.",
      },
    ],
    tables: [
      {
        caption: 'Typical Difficulty Classes',
        headers: ['Task Difficulty', 'DC'],
        rows: [
          ['Very Easy', '5'],
          ['Easy', '10'],
          ['Medium', '15'],
          ['Hard', '20'],
          ['Very Hard', '25'],
          ['Nearly Impossible', '30'],
        ],
      },
    ],
    relatedRules: ['skills-overview', 'proficiency', 'advantage-disadvantage'],
    tags: ['ability check', 'd20', 'skill', 'DC', 'difficulty'],
    keywords: ['ability check', 'skill check', 'roll', 'dc'],
    source: 'SRD',
    pageReference: 'PHB p.174',
    tips: [
      'Bards can add half proficiency to ability checks they\'re not proficient in (Jack of All Trades).',
      'Rogues with Reliable Talent can\'t roll below 10 on proficient skill checks.',
      'Help action gives advantage on the next ability check.',
    ],
  },
  {
    id: 'contested-checks',
    name: 'Contested Checks',
    slug: 'contested-checks',
    category: 'core-mechanics',
    subcategory: 'ability-checks',
    summary:
      'When two creatures compete, both roll ability checks. The higher total wins. Ties favor the defender or status quo.',
    description: `
## Contested Checks

When one creature's effort is directly opposed by another's, both make ability checks. The higher result wins.

### The Process
1. Both creatures roll the appropriate ability check
2. Apply modifiers (ability + proficiency if applicable)
3. Compare totals
4. **Higher total wins**
5. **Ties**: The situation doesn't change (defender/status quo wins)

### Common Contested Checks

| Situation | Attacker Rolls | Defender Rolls |
|-----------|----------------|----------------|
| Grapple | Athletics | Athletics or Acrobatics |
| Shove | Athletics | Athletics or Acrobatics |
| Hide vs Seek | Stealth | Perception |
| Lie vs Detect | Deception | Insight |
| Disguise | Deception | Investigation |

### Active vs Passive
Sometimes one side uses a **passive score** instead of rolling:
- Passive = 10 + modifiers
- Used when one side isn't actively trying (like noticing a hidden creature)
    `.trim(),
    examples: [
      {
        title: 'Grapple Attempt',
        description: 'A barbarian tries to grapple a thug.',
        diceNotation: 'Barbarian: d20+5 (Athletics) vs Thug: d20+2 (Athletics)',
        result: 'Barbarian rolls 18 total, Thug rolls 14. Barbarian wins - the thug is grappled!',
      },
      {
        title: 'Hiding from Search',
        description: 'A rogue hides (Stealth 22) while a guard actively searches.',
        diceNotation: 'Guard rolls Perception: d20+3 = 15',
        result: '22 > 15. The rogue remains hidden.',
      },
    ],
    relatedRules: ['ability-checks-overview', 'grappled', 'passive-checks'],
    tags: ['contested', 'opposed', 'vs', 'grapple', 'stealth'],
    keywords: ['contested check', 'opposed check', 'versus', 'vs'],
    source: 'SRD',
    pageReference: 'PHB p.174',
  },
  {
    id: 'passive-checks',
    name: 'Passive Checks',
    slug: 'passive-checks',
    category: 'core-mechanics',
    subcategory: 'ability-checks',
    summary:
      'Passive checks = 10 + modifiers. Used when not actively trying, like noticing hidden creatures or traps.',
    description: `
## Passive Checks

A passive check represents an average result for a task done repeatedly or when not actively trying.

### Calculating Passive Score
**Passive Score = 10 + all modifiers**

Example: A character with +4 Perception has Passive Perception 14.

### Modifiers
- Add **ability modifier**
- Add **proficiency bonus** if proficient
- Add/subtract **5** for advantage/disadvantage

### Common Uses
- **Passive Perception**: Noticing hidden creatures or traps without actively searching
- **Passive Insight**: Detecting lies during conversation
- **Passive Investigation**: Noticing hidden details in the environment

### When to Use Passive
- The DM doesn't want to give away that something is hidden
- A task is done over a long period
- The environment poses a continuous challenge
    `.trim(),
    examples: [
      {
        title: 'Passive Perception',
        description: 'A rogue with +5 Perception enters a room with a hidden assassin (Stealth 17).',
        result:
          "Passive Perception 15. The rogue doesn't notice the assassin (15 < 17). If actively searching, they'd roll instead.",
      },
    ],
    tables: [
      {
        caption: 'Passive Score Calculation',
        headers: ['Factor', 'Modifier'],
        rows: [
          ['Base', '10'],
          ['Ability modifier', '+/- mod'],
          ['Proficiency (if proficient)', '+ prof bonus'],
          ['Advantage', '+5'],
          ['Disadvantage', '-5'],
        ],
      },
    ],
    relatedRules: ['ability-checks-overview', 'advantage-disadvantage'],
    tags: ['passive', 'perception', 'insight', 'investigation'],
    keywords: ['passive perception', 'passive check', 'PP'],
    source: 'SRD',
    pageReference: 'PHB p.175',
    tips: [
      'Write down your Passive Perception - the DM uses it constantly.',
      'Observant feat gives +5 to Passive Perception and Investigation.',
      'Alert feat prevents surprise even if your Passive Perception fails.',
    ],
  },
]
