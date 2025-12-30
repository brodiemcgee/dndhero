/**
 * Ability Scores Rules
 */

import type { RuleEntry } from '@/types/rules'

export const ABILITY_SCORES_RULES: RuleEntry[] = [
  {
    id: 'ability-scores-overview',
    name: 'Ability Scores',
    slug: 'ability-scores',
    category: 'character',
    subcategory: 'ability-scores',
    summary:
      'The six ability scores (STR, DEX, CON, INT, WIS, CHA) define your character\'s basic capabilities. Modifiers derived from these scores affect nearly every roll you make.',
    description: `
## The Six Abilities

### Strength (STR)
- Melee attack and damage rolls
- Athletic checks (climbing, swimming, jumping)
- Carrying capacity
- Breaking things

### Dexterity (DEX)
- Ranged attack and damage rolls
- Armor Class (with light/medium armor)
- Initiative
- Acrobatics, Stealth, Sleight of Hand

### Constitution (CON)
- Hit points (added per level)
- Concentration saves
- Endurance (resisting poison, exhaustion, etc.)
- No skills tied to CON

### Intelligence (INT)
- Wizard spellcasting
- Investigation, Arcana, History, Nature, Religion
- Remembering information

### Wisdom (WIS)
- Cleric/Druid spellcasting
- Perception, Insight, Survival, Medicine, Animal Handling
- Willpower and awareness

### Charisma (CHA)
- Bard/Sorcerer/Warlock/Paladin spellcasting
- Persuasion, Deception, Intimidation, Performance
- Force of personality

## Ability Modifiers

Your **ability modifier** is derived from the score:

| Score | Modifier |
|-------|----------|
| 1 | -5 |
| 2-3 | -4 |
| 4-5 | -3 |
| 6-7 | -2 |
| 8-9 | -1 |
| 10-11 | +0 |
| 12-13 | +1 |
| 14-15 | +2 |
| 16-17 | +3 |
| 18-19 | +4 |
| 20+ | +5+ |

**Formula**: (Score - 10) / 2, rounded down

## Standard Array

If not rolling, use these scores: **15, 14, 13, 12, 10, 8**

Assign one to each ability, then add racial bonuses.
    `.trim(),
    examples: [
      {
        title: 'Modifier Calculation',
        description: 'A character has 16 Strength.',
        result: 'Modifier = (16-10)/2 = 3. They add +3 to STR checks, saves, and melee attacks.',
      },
      {
        title: 'Low Score Impact',
        description: 'A wizard has 8 Strength.',
        result: 'Modifier = (8-10)/2 = -1. They subtract 1 from STR checks and melee damage.',
      },
    ],
    tables: [
      {
        caption: 'Ability Score Summary',
        headers: ['Ability', 'Primary Use', 'Key Classes'],
        rows: [
          ['Strength', 'Melee attacks, carrying', 'Fighter, Paladin, Barbarian'],
          ['Dexterity', 'Ranged attacks, AC, initiative', 'Rogue, Ranger, Monk'],
          ['Constitution', 'Hit points, concentration', 'Everyone (always useful)'],
          ['Intelligence', 'Knowledge, wizard spells', 'Wizard, Artificer'],
          ['Wisdom', 'Perception, cleric/druid spells', 'Cleric, Druid, Monk'],
          ['Charisma', 'Social skills, bard/sorc spells', 'Bard, Sorcerer, Warlock, Paladin'],
        ],
      },
    ],
    relatedRules: ['ability-checks-overview', 'saving-throws-overview'],
    tags: ['ability scores', 'statistics', 'modifiers', 'character creation'],
    keywords: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma', 'stat', 'modifier'],
    source: 'SRD',
    pageReference: 'PHB p.12',
    tips: [
      "Constitution is valuable for every class - it's hit points!",
      "Don't dump all stats to max one - you'll struggle in many situations.",
      'Your primary stat should be 16+ after racial bonuses if possible.',
    ],
  },
]
