/**
 * Proficiency Bonus Rules
 */

import type { RuleEntry } from '@/types/rules'

export const PROFICIENCY_RULES: RuleEntry[] = [
  {
    id: 'proficiency-overview',
    name: 'Proficiency Bonus',
    slug: 'proficiency',
    category: 'core-mechanics',
    subcategory: 'proficiency',
    summary:
      'Your proficiency bonus increases as you level (starts at +2). Add it to attack rolls, saves, and skills you\'re proficient in.',
    description: `
## Proficiency Bonus

Your proficiency bonus represents your growing expertise as you gain levels.

### Proficiency by Level

| Level | Proficiency Bonus |
|-------|-------------------|
| 1-4   | +2 |
| 5-8   | +3 |
| 9-12  | +4 |
| 13-16 | +5 |
| 17-20 | +6 |

### When You Add Proficiency
You add your proficiency bonus to:

**Attack Rolls**
- Weapons you're proficient with
- Spell attacks (always proficient)

**Saving Throws**
- Saves your class grants proficiency in

**Ability Checks**
- Skills you're proficient in
- Tool checks with tools you're proficient in

**Spell Save DC**
- 8 + proficiency + spellcasting modifier

### Key Rules
- You can **only add proficiency once** per roll
- Proficiency bonus is the same for all characters of the same level
- Some features (Expertise) let you **double** your proficiency bonus
    `.trim(),
    examples: [
      {
        title: 'Level 1 Attack',
        description: 'A level 1 fighter with +3 STR attacks with a longsword (proficient).',
        diceNotation: '1d20 + 3 (STR) + 2 (proficiency) = 1d20 + 5',
        result: 'Attack bonus of +5',
      },
      {
        title: 'Expertise',
        description: 'A level 5 rogue with +4 DEX has Expertise in Stealth.',
        diceNotation: '1d20 + 4 (DEX) + 6 (double proficiency) = 1d20 + 10',
        result: 'Stealth bonus of +10 (proficiency is +3 at level 5, doubled to +6)',
      },
    ],
    tables: [
      {
        caption: 'Proficiency Bonus by Level',
        headers: ['Character Level', 'Proficiency Bonus'],
        rows: [
          ['1-4', '+2'],
          ['5-8', '+3'],
          ['9-12', '+4'],
          ['13-16', '+5'],
          ['17-20', '+6'],
        ],
      },
    ],
    relatedRules: ['ability-checks-overview', 'attack-rolls-overview', 'saving-throws-overview'],
    tags: ['proficiency', 'bonus', 'level', 'expertise'],
    keywords: ['proficiency bonus', 'prof bonus', 'expertise'],
    source: 'SRD',
    pageReference: 'PHB p.173',
    tips: [
      'Rogues and Bards get Expertise, which doubles proficiency for specific skills.',
      "Jack of All Trades (Bard) adds half proficiency to checks you're not proficient in.",
      'Reliable Talent (Rogue) means you treat rolls of 9 or lower as 10 on proficient checks.',
    ],
  },
]
