/**
 * Spell Slots Rules
 */

import type { RuleEntry } from '@/types/rules'

export const SPELL_SLOTS_RULES: RuleEntry[] = [
  {
    id: 'spell-slots-overview',
    name: 'Spell Slots',
    slug: 'spell-slots',
    category: 'spellcasting',
    subcategory: 'spell-slots',
    summary:
      'Spell slots represent your magical energy. You expend a slot to cast a spell, and regain slots after resting.',
    description: `
## What Are Spell Slots?

Spell slots represent your capacity to cast spells. Regardless of how many spells you know or have prepared, you can only cast a limited number before you must rest.

## Using Spell Slots

When you cast a spell of 1st level or higher, you expend a slot of that spell's level or higher. The slot is "used up" until you finish a rest.

**Example**: To cast the 1st-level spell *Magic Missile*, you must spend a 1st-level spell slot (or higher).

## Spell Slot Levels

Spell slots have levels from 1st to 9th. When you cast a spell using a slot of a higher level than the spell, the spell is cast at the higher level. Some spells have enhanced effects when cast at higher levels.

## Cantrips Don't Use Slots

Cantrips (0-level spells) can be cast at will without using spell slots. They never run out.

## Regaining Spell Slots

You regain all expended spell slots when you finish a **long rest** (8 hours).

Some classes have special features:
- **Wizards**: Arcane Recovery lets you regain some slots on a short rest
- **Warlocks**: Regain ALL slots on a short rest (but have fewer slots)
- **Sorcerers**: Can create slots using sorcery points

## Number of Slots

Your class and level determine how many spell slots you have of each level. Check your class table for details.
    `.trim(),
    examples: [
      {
        title: 'Casting with Slots',
        description: 'A 3rd-level wizard has four 1st-level slots and two 2nd-level slots.',
        result:
          'They can cast up to 6 leveled spells before needing to rest: any combination of 1st and 2nd level spells.',
      },
      {
        title: 'Upcasting',
        description: 'A cleric casts Cure Wounds using a 2nd-level slot instead of 1st.',
        diceNotation: '2d8 + WIS modifier (instead of 1d8)',
        result: 'The spell heals more because it was cast at a higher level.',
      },
    ],
    tables: [
      {
        caption: 'Spell Slots by Level (Full Caster)',
        headers: ['Class Level', '1st', '2nd', '3rd', '4th', '5th'],
        rows: [
          ['1st', '2', '-', '-', '-', '-'],
          ['2nd', '3', '-', '-', '-', '-'],
          ['3rd', '4', '2', '-', '-', '-'],
          ['4th', '4', '3', '-', '-', '-'],
          ['5th', '4', '3', '2', '-', '-'],
        ],
      },
    ],
    relatedRules: ['casting-a-spell', 'long-rest', 'short-rest'],
    tags: ['spell slots', 'spellcasting', 'magic', 'resources'],
    keywords: ['spell slot', 'how many spells', 'out of spells', 'regain slots'],
    source: 'SRD',
    pageReference: 'PHB p.201',
    tips: [
      'Track your spell slots carefully - they are your most valuable resource.',
      "Save higher-level slots for emergencies or powerful spells.",
      'Cantrips are free - use them when you want to conserve slots.',
    ],
    commonMistakes: [
      'Forgetting that cantrips are free and don\'t use slots.',
      'Not realizing you can cast lower-level spells with higher slots for extra effect.',
      'Thinking you regain slots on a short rest (only warlocks and some special features do).',
    ],
  },
]
