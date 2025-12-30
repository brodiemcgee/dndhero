/**
 * Ritual Casting Rules
 */

import type { RuleEntry } from '@/types/rules'

export const RITUAL_CASTING_RULES: RuleEntry[] = [
  {
    id: 'ritual-casting-overview',
    name: 'Ritual Casting',
    slug: 'ritual-casting',
    category: 'spellcasting',
    subcategory: 'ritual-casting',
    summary:
      'Ritual spells can be cast without expending a spell slot if you spend an extra 10 minutes casting them.',
    description: `
## What is Ritual Casting?

Some spells have the **ritual** tag. These spells can be cast in two ways:

1. **Normal casting**: Use an action and expend a spell slot
2. **Ritual casting**: Take 10 extra minutes, use no spell slot

## Requirements for Ritual Casting

- The spell must have the **ritual** tag
- You must have access to the spell (class feature determines how)
- You add 10 minutes to the normal casting time
- You follow all other rules (components, concentration if applicable)

## Class Differences

### Wizards
Can ritual cast any ritual spell **in their spellbook** - even if not prepared. This is extremely flexible!

### Clerics, Druids
Must have the ritual spell **prepared** to ritual cast it.

### Bards (with Ritual Caster feat or College of Lore)
Follow their specific feature rules.

### Classes Without Ritual Casting
Sorcerers, Warlocks (base class), Paladins, and Rangers cannot ritual cast without special feats.

## When to Use Rituals

Ritual casting is best when:
- You're not in a hurry
- You want to save spell slots
- You're casting utility spells before a dungeon

## Common Ritual Spells

Many utility spells are rituals: *Detect Magic*, *Identify*, *Speak with Animals*, *Comprehend Languages*, *Find Familiar*, *Leomund's Tiny Hut*.
    `.trim(),
    examples: [
      {
        title: 'Wizard Ritual',
        description:
          "A wizard wants to cast Detect Magic before entering a dungeon. It's a ritual spell in their spellbook.",
        result:
          'They spend 10+1 minutes (11 total) and cast it without using a 1st-level slot. Still lasts 10 minutes.',
      },
      {
        title: 'Cleric Ritual',
        description: 'A cleric wants to ritual cast Detect Poison and Disease but didn\'t prepare it.',
        result: 'Cannot ritual cast - clerics must have the spell prepared.',
      },
      {
        title: 'Time Pressure',
        description: 'The party is in combat and the wizard wants to ritual cast Identify on a found item.',
        result: 'Not practical - ritual casting takes 11 minutes. Cast normally or wait until after combat.',
      },
    ],
    tables: [
      {
        caption: 'Popular Ritual Spells',
        headers: ['Spell', 'Level', 'Effect'],
        rows: [
          ['Detect Magic', '1st', 'Sense magical auras within 30 ft'],
          ['Identify', '1st', 'Learn properties of a magic item'],
          ['Find Familiar', '1st', 'Summon a magical companion'],
          ['Comprehend Languages', '1st', 'Understand any spoken language'],
          ["Leomund's Tiny Hut", '3rd', 'Create a safe camp for rest'],
          ['Water Breathing', '3rd', 'Breathe underwater for 24 hours'],
        ],
      },
      {
        caption: 'Ritual Casting by Class',
        headers: ['Class', 'Can Ritual Cast?', 'Requirement'],
        rows: [
          ['Wizard', 'Yes', 'Spell in spellbook'],
          ['Cleric', 'Yes', 'Spell prepared'],
          ['Druid', 'Yes', 'Spell prepared'],
          ['Bard', 'No*', '*Can gain with Ritual Caster feat'],
          ['Sorcerer', 'No', 'Requires feat'],
          ['Warlock', 'No*', '*Pact of the Tome can add it'],
        ],
      },
    ],
    relatedRules: ['spell-slots-overview', 'casting-a-spell'],
    tags: ['ritual', 'spellcasting', 'spell slots', 'utility spells'],
    keywords: ['ritual casting', 'ritual spell', 'cast without slot', 'wizard ritual'],
    source: 'SRD',
    pageReference: 'PHB p.201',
    tips: [
      'Wizards: Copy every ritual spell you find into your spellbook!',
      'Cast Detect Magic as a ritual before entering new areas.',
      'Find Familiar is one of the best ritual spells in the game.',
      'Ritual Caster feat is great for non-ritual classes.',
    ],
  },
]
