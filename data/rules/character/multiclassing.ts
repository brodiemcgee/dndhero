/**
 * Multiclassing Rules
 */

import type { RuleEntry } from '@/types/rules'

export const MULTICLASSING_RULES: RuleEntry[] = [
  {
    id: 'multiclassing-overview',
    name: 'Multiclassing',
    slug: 'multiclassing',
    category: 'character',
    subcategory: 'multiclassing',
    summary:
      'Multiclassing lets you gain levels in multiple classes, combining their features. It requires meeting ability score prerequisites.',
    description: `
## What is Multiclassing?

Instead of taking a level in your current class, you can gain a level in a new class. You combine features from both classes but may delay or miss high-level abilities.

## Prerequisites

To multiclass, you must meet **minimum ability scores** for BOTH:
- Your current class
- The new class you're entering

| Class | Minimum Ability |
|-------|-----------------|
| Barbarian | STR 13 |
| Bard | CHA 13 |
| Cleric | WIS 13 |
| Druid | WIS 13 |
| Fighter | STR 13 or DEX 13 |
| Monk | DEX 13 and WIS 13 |
| Paladin | STR 13 and CHA 13 |
| Ranger | DEX 13 and WIS 13 |
| Rogue | DEX 13 |
| Sorcerer | CHA 13 |
| Warlock | CHA 13 |
| Wizard | INT 13 |

## What You Get (and Don't Get)

### You Get:
- Hit Dice of the new class
- Some proficiencies (limited list)
- 1st-level features of the new class

### You DON'T Get:
- All starting proficiencies
- Starting equipment
- Full saving throw proficiencies

## Spellcasting and Multiclassing

Multiclass spellcasters combine spell slots according to special rules:
- Spells known/prepared are calculated separately per class
- Spell slots are calculated using combined caster levels
- Warlocks use Pact Magic separately from other casting
    `.trim(),
    examples: [
      {
        title: 'Fighter/Wizard',
        description: 'A fighter 5 takes a level in wizard.',
        result:
          'Needs 13 STR (or DEX) and 13 INT. Gains wizard features, spellbook, and cantrips. Uses multiclass slot table.',
      },
      {
        title: 'Rogue/Warlock',
        description: 'A rogue 3 wants to add warlock levels.',
        result:
          "Needs 13 DEX (rogue) and 13 CHA (warlock). Warlock's Pact Magic slots are separate from other casting.",
      },
    ],
    tables: [
      {
        caption: 'Proficiencies Gained from Multiclassing',
        headers: ['Class', 'Proficiencies Gained'],
        rows: [
          ['Barbarian', 'Shields, simple weapons, martial weapons'],
          ['Bard', 'Light armor, one skill, one musical instrument'],
          ['Cleric', 'Light armor, medium armor, shields'],
          ['Fighter', 'Light armor, medium armor, shields, simple weapons, martial weapons'],
          ['Paladin', 'Light armor, medium armor, shields, simple weapons, martial weapons'],
          ['Ranger', 'Light armor, medium armor, shields, simple weapons, martial weapons, one skill'],
          ['Rogue', 'Light armor, one skill, thieves\' tools'],
          ['Warlock', 'Light armor, simple weapons'],
        ],
      },
    ],
    relatedRules: ['leveling-overview', 'classes-overview'],
    tags: ['multiclassing', 'class', 'prerequisites', 'spellcasting'],
    keywords: ['multiclass', 'dual class', 'two classes', 'level dip'],
    source: 'SRD',
    pageReference: 'PHB p.163',
    tips: [
      "Think carefully - multiclassing delays your main class's powerful features.",
      '1-2 level "dips" are common for specific abilities.',
      'Hexblade warlock dip is popular for CHA-based melee characters.',
    ],
    commonMistakes: [
      'Forgetting to check prerequisites for both classes.',
      "Expecting all proficiencies when you don't get them.",
      "Not understanding how multiclass spellcasting slots work.",
    ],
  },
]
