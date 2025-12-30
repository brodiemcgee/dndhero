/**
 * Spell Components Rules
 */

import type { RuleEntry } from '@/types/rules'

export const COMPONENTS_RULES: RuleEntry[] = [
  {
    id: 'spell-components',
    name: 'Spell Components',
    slug: 'spell-components',
    category: 'spellcasting',
    subcategory: 'components',
    summary:
      'Spells require verbal (V), somatic (S), and/or material (M) components. You must provide these components to cast the spell.',
    description: `
## The Three Component Types

### Verbal (V)
You must **speak mystic words** in a strong voice. You cannot cast verbal spells if:
- You are in an area of magical silence
- You are gagged or otherwise unable to speak

### Somatic (S)
You must make **specific hand gestures**. You need at least one free hand to perform these gestures.

If you're holding a shield or weapon:
- Shield + spellcasting focus in one hand works
- Two-handed weapon users must let go with one hand temporarily
- The War Caster feat lets you cast with weapons/shields in both hands

### Material (M)
You need **specific physical items** listed in the spell description. There are two ways to handle materials:

**Component Pouch**: A small belt pouch containing all common material components (no gold cost).

**Spellcasting Focus**: An object like a wand, staff, or holy symbol that replaces material components **without a gold cost**.

## Gold Cost Components

If a material component lists a **gold cost** (e.g., "diamond worth 300 gp"), you **must have that specific item**. A focus or pouch won't work.

If the component is **consumed** by the spell, you need a new one each time.

## One Hand for Multiple Components

The same hand that holds your focus can perform somatic components (if needed).
    `.trim(),
    examples: [
      {
        title: 'Common Focus Use',
        description: 'A wizard with a wand casts Fireball (V, S, M - a tiny ball of bat guano and sulfur).',
        result: 'The wand replaces the bat guano. The wizard speaks the incantation and gestures with the wand hand.',
      },
      {
        title: 'Costly Component',
        description: 'A cleric casts Revivify (V, S, M - diamonds worth 300 gp, consumed).',
        result: 'The cleric must have diamonds worth 300 gp. They are consumed when the spell is cast.',
      },
      {
        title: 'Silence Problem',
        description: 'A sorcerer in a Silence spell tries to cast Fireball (V, S, M).',
        result: 'Cannot cast - Fireball requires verbal components, impossible in magical silence.',
      },
    ],
    tables: [
      {
        caption: 'Spellcasting Focus by Class',
        headers: ['Class', 'Focus Options'],
        rows: [
          ['Bard', 'Musical instrument'],
          ['Cleric/Paladin', 'Holy symbol (worn or held)'],
          ['Druid', 'Druidic focus (staff, sprig of mistletoe, etc.)'],
          ['Sorcerer/Warlock/Wizard', 'Arcane focus (wand, staff, orb, crystal, rod)'],
        ],
      },
      {
        caption: 'Common Costly Components',
        headers: ['Spell', 'Component', 'Consumed?'],
        rows: [
          ['Identify', '100 gp pearl', 'No'],
          ['Revivify', '300 gp diamonds', 'Yes'],
          ['Raise Dead', '500 gp diamond', 'Yes'],
          ['Resurrection', '1,000 gp diamond', 'Yes'],
        ],
      },
    ],
    relatedRules: ['casting-a-spell'],
    tags: ['components', 'verbal', 'somatic', 'material', 'focus', 'spellcasting'],
    keywords: ['spell components', 'V S M', 'spellcasting focus', 'component pouch', 'free hand'],
    source: 'SRD',
    pageReference: 'PHB p.203',
    tips: [
      'Keep track of consumed components - they need replacing!',
      'A component pouch is cheaper than a focus and works for all classes.',
      'Ruby of the War Mage lets you use a weapon as a focus.',
    ],
    commonMistakes: [
      "Using a focus to replace components with a gold cost - you can't.",
      'Forgetting that you need a free hand for somatic components.',
      'Not realizing Silence blocks all verbal component spells.',
    ],
  },
]
