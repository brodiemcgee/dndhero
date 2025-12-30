/**
 * Concentration Rules
 */

import type { RuleEntry } from '@/types/rules'

export const CONCENTRATION_RULES: RuleEntry[] = [
  {
    id: 'concentration-overview',
    name: 'Concentration',
    slug: 'concentration',
    category: 'spellcasting',
    subcategory: 'concentration',
    summary:
      'Some spells require concentration to maintain. You can only concentrate on one spell at a time, and taking damage may break your concentration.',
    description: `
## What is Concentration?

Some spells require you to maintain concentration to keep their effects active. The spell description will say "Concentration, up to X minutes/hours."

## Rules of Concentration

1. **One at a time**: You can only concentrate on ONE spell at a time
2. **Casting another ends the first**: If you cast a new concentration spell, the old one ends immediately
3. **Lasts until duration ends**: Or until you lose concentration

## Losing Concentration

You lose concentration when:

### Taking Damage
When you take damage while concentrating, make a **Constitution saving throw**:
- **DC = 10 or half the damage taken**, whichever is higher
- If you fail, the spell ends
- You make a separate save for each source of damage

### Being Incapacitated
If you become incapacitated or die, concentration ends immediately.

### Other Effects
Some effects specifically break concentration (DM may rule environmental factors).

## Concentration is Free

Concentrating on a spell:
- Doesn't require your action
- Doesn't prevent other actions
- You can attack, cast cantrips, move, etc.

## Ending Concentration Voluntarily

You can drop concentration at any time (no action required).
    `.trim(),
    examples: [
      {
        title: 'Concentration Save',
        description: 'A wizard concentrating on Fly takes 22 damage from an arrow.',
        diceNotation: 'DC = max(10, 22/2) = DC 11 Constitution save',
        result: 'The wizard must roll 11+ on d20 + CON save bonus or Fly ends.',
      },
      {
        title: 'Multiple Damage Sources',
        description: 'A druid with Moonbeam takes 8 damage from one goblin and 12 from another.',
        result: 'Two separate saves: DC 10 for the 8 damage, DC 10 for the 12 damage. Fail either and Moonbeam ends.',
      },
      {
        title: 'Replacing Concentration',
        description: 'A bard concentrating on Hold Person wants to cast Hypnotic Pattern.',
        result: 'Both require concentration. Casting Hypnotic Pattern automatically ends Hold Person.',
      },
    ],
    tables: [
      {
        caption: 'Common Concentration Spells',
        headers: ['Spell', 'Level', 'Duration'],
        rows: [
          ['Bless', '1st', '1 minute'],
          ['Hold Person', '2nd', '1 minute'],
          ['Fly', '3rd', '10 minutes'],
          ['Greater Invisibility', '4th', '1 minute'],
          ['Wall of Force', '5th', '10 minutes'],
        ],
      },
    ],
    relatedRules: ['casting-a-spell', 'constitution-saves'],
    relatedConditions: ['incapacitated', 'unconscious'],
    tags: ['concentration', 'spellcasting', 'constitution', 'saving throw'],
    keywords: ['concentration check', 'maintain spell', 'lose concentration', 'break concentration'],
    source: 'SRD',
    pageReference: 'PHB p.203',
    tips: [
      'War Caster feat gives advantage on concentration saves.',
      "Resilient (Constitution) improves your concentration saves over time.",
      'Position yourself to avoid damage while concentrating.',
      "The Bladesinger's Song of Defense can help maintain concentration.",
    ],
    commonMistakes: [
      'Trying to concentrate on two spells at once.',
      'Forgetting to make concentration saves when taking damage.',
      'Using DC 10 for all saves instead of half damage when higher.',
    ],
  },
]
