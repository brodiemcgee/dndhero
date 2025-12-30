/**
 * Classes Overview Rules
 */

import type { RuleEntry } from '@/types/rules'

export const CLASSES_RULES: RuleEntry[] = [
  {
    id: 'classes-overview',
    name: 'Classes',
    slug: 'classes',
    category: 'character',
    subcategory: 'classes',
    summary:
      'Your class defines your character\'s abilities, fighting style, and role in the party. Choose from 12 classes, each with unique features.',
    description: `
## What is a Class?

Your class is like your profession or calling. It determines:
- Your **Hit Die** (d6 to d12)
- Your **saving throw proficiencies**
- Your **skill options**
- Your **special abilities** and how they grow
- Whether you can cast spells

## The 12 Classes

### Martial Classes (No/Limited Spells)
- **Barbarian** (d12): Rage-fueled melee powerhouse. Toughest class.
- **Fighter** (d10): Versatile weapon master. Most attacks, most ASIs.
- **Monk** (d8): Fast, unarmed martial artist. Uses Ki points.
- **Rogue** (d8): Sneaky, skill-focused. Sneak Attack damage.

### Half-Casters (Some Spells)
- **Paladin** (d10): Holy warrior. Smites + healing + auras.
- **Ranger** (d10): Nature warrior. Tracking + spells + fighting.

### Full Casters (Lots of Spells)
- **Bard** (d8): Musical magic. Jack of all trades, support + control.
- **Cleric** (d8): Divine spellcaster. Best healing, can wear armor.
- **Druid** (d8): Nature magic. Wild Shape into animals.
- **Sorcerer** (d6): Innate magic. Metamagic to modify spells.
- **Warlock** (d8): Pact magic. Few slots that recharge on short rest.
- **Wizard** (d6): Learned magic. Largest spell list, spellbook.

## Subclasses

At level 1, 2, or 3 (varies by class), you choose a **subclass** that specializes your abilities. This dramatically shapes your playstyle.
    `.trim(),
    examples: [
      {
        title: 'Choosing Based on Role',
        description: 'The party needs a healer.',
        result: 'Cleric is the most straightforward healer. Druid and Bard also work well.',
      },
      {
        title: 'Subclass Impact',
        description: 'Two fighters choose different subclasses at level 3.',
        result:
          'Champion gets improved criticals. Battle Master gets tactical maneuvers. Same class, very different feel.',
      },
    ],
    tables: [
      {
        caption: 'Class Quick Reference',
        headers: ['Class', 'Hit Die', 'Primary Ability', 'Spellcasting'],
        rows: [
          ['Barbarian', 'd12', 'Strength', 'None'],
          ['Bard', 'd8', 'Charisma', 'Full'],
          ['Cleric', 'd8', 'Wisdom', 'Full'],
          ['Druid', 'd8', 'Wisdom', 'Full'],
          ['Fighter', 'd10', 'Str or Dex', 'None*'],
          ['Monk', 'd8', 'Dex + Wis', 'None'],
          ['Paladin', 'd10', 'Str + Cha', 'Half'],
          ['Ranger', 'd10', 'Dex + Wis', 'Half'],
          ['Rogue', 'd8', 'Dexterity', 'None*'],
          ['Sorcerer', 'd6', 'Charisma', 'Full'],
          ['Warlock', 'd8', 'Charisma', 'Pact'],
          ['Wizard', 'd6', 'Intelligence', 'Full'],
        ],
        footnotes: ['*Some subclasses gain spellcasting'],
      },
    ],
    relatedRules: ['leveling-overview', 'ability-scores-overview'],
    tags: ['class', 'character creation', 'role', 'archetype'],
    keywords: ['barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'],
    source: 'SRD',
    pageReference: 'PHB p.45',
    tips: [
      'Pick a class that matches how you want to play, not just what\'s "strong".',
      'Every class can be effective - D&D is well-balanced.',
      "Read your subclass options before committing to a class.",
    ],
  },
]
