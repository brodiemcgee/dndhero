/**
 * Casting a Spell Rules
 */

import type { RuleEntry } from '@/types/rules'

export const CASTING_RULES: RuleEntry[] = [
  {
    id: 'casting-a-spell',
    name: 'Casting a Spell',
    slug: 'casting-a-spell',
    category: 'spellcasting',
    subcategory: 'casting',
    summary:
      'To cast a spell, you must have it prepared (or known), expend a spell slot, and meet the casting time, range, and component requirements.',
    description: `
## Steps to Cast a Spell

1. **Choose the spell** from your known/prepared spells
2. **Check requirements**: Do you have the slot? Components? Is the target in range?
3. **Expend a spell slot** of the spell's level or higher (unless it's a cantrip)
4. **Follow the casting time**: Most spells are 1 action
5. **Declare targets** and make any required rolls

## Casting Time

- **1 Action**: Most combat spells
- **1 Bonus Action**: Quick spells like *Misty Step* or *Healing Word*
- **1 Reaction**: Triggered spells like *Shield* or *Counterspell*
- **1 Minute or longer**: Ritual spells, utility spells cast out of combat

**Important**: If you cast a spell as a bonus action, you can only cast cantrips with your action that turn.

## Range

- **Self**: Affects only you
- **Touch**: Must touch the target
- **Ranged**: Measured in feet (30 ft, 60 ft, etc.)
- **Sight**: Anywhere you can see

## Targets

Read the spell description carefully:
- Some spells target creatures
- Some target objects
- Some target a point in space (area effects)
- Some spells require you to see the target

## Areas of Effect

Common area shapes:
- **Cone**: Spreads from you in a direction
- **Cube**: Measured from a point of origin
- **Cylinder**: Circular area with height
- **Line**: Straight line from you
- **Sphere**: Radius from a point
    `.trim(),
    examples: [
      {
        title: 'Action Spell',
        description: 'A wizard casts Fireball (1 action, 150 ft range, 20 ft radius sphere).',
        result:
          'Uses action, expends 3rd-level slot, picks a point within 150 ft. All creatures in 20 ft radius make DEX save.',
      },
      {
        title: 'Bonus Action Restriction',
        description: 'A cleric casts Healing Word (bonus action), then wants to cast Guiding Bolt.',
        result:
          'Not allowed! After casting a bonus action spell, you can only cast cantrips with your action.',
      },
    ],
    relatedRules: ['spell-slots-overview', 'concentration-overview', 'spell-components'],
    tags: ['casting', 'spellcasting', 'action', 'bonus action', 'range'],
    keywords: ['cast spell', 'how to cast', 'casting time', 'spell range'],
    source: 'SRD',
    pageReference: 'PHB p.202',
    tips: [
      'Always read the full spell description before casting.',
      "Count your range carefully - you can't target beyond the spell's range.",
      'The bonus action spell rule catches many new players off guard.',
    ],
  },
]
