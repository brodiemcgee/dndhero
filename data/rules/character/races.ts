/**
 * Races Overview Rules
 */

import type { RuleEntry } from '@/types/rules'

export const RACES_RULES: RuleEntry[] = [
  {
    id: 'races-overview',
    name: 'Races',
    slug: 'races',
    category: 'character',
    subcategory: 'races',
    summary:
      'Your race determines your species or ancestry, granting ability score bonuses, special traits, and sometimes unique abilities.',
    description: `
## What Race Provides

- **Ability Score Increases**: Bonuses to certain abilities
- **Size**: Small, Medium, or Large
- **Speed**: Base walking speed (usually 25-35 feet)
- **Languages**: Common + racial language(s)
- **Racial Traits**: Unique abilities like darkvision, resistances, or skills

## Core Races

### Dwarf
- +2 CON, +1 to another (by subrace)
- 25 ft speed (not reduced by heavy armor)
- Darkvision 60 ft
- Poison resistance
- Tool proficiency

### Elf
- +2 DEX, +1 to another (by subrace)
- 30 ft speed
- Darkvision 60 ft
- Fey Ancestry (advantage vs charm, can't be magically slept)
- Trance (4 hours = long rest)

### Halfling
- +2 DEX, +1 to another (by subrace)
- 25 ft speed
- Lucky (reroll natural 1s on attacks, saves, checks)
- Brave (advantage vs frightened)
- Nimble (move through larger creatures)

### Human
- +1 to ALL abilities, OR +2/+1 and a feat (variant)
- 30 ft speed
- Extra language
- Most versatile race

### Other Common Races
- **Dragonborn**: Breath weapon, damage resistance
- **Gnome**: +2 INT, advantage on INT/WIS/CHA saves vs magic
- **Half-Elf**: +2 CHA, +1 to two others, 2 extra skills
- **Half-Orc**: +2 STR, +1 CON, Relentless Endurance
- **Tiefling**: +2 CHA, +1 INT, fire resistance, innate spells
    `.trim(),
    examples: [
      {
        title: 'Race + Class Synergy',
        description: 'Building an optimized wizard.',
        result:
          'High Elf gives +2 DEX, +1 INT, plus a free cantrip. Great synergy! But any race works.',
      },
      {
        title: 'Flavor Over Optimization',
        description: 'Playing a halfling barbarian.',
        result:
          'Not optimal (STR boost would be better), but Lucky and Brave are still useful. Play what you enjoy!',
      },
    ],
    tables: [
      {
        caption: 'Race Quick Reference',
        headers: ['Race', 'Main Bonuses', 'Key Trait'],
        rows: [
          ['Dwarf', '+2 CON', 'Poison resistance, darkvision'],
          ['Elf', '+2 DEX', 'Fey Ancestry, trance, darkvision'],
          ['Halfling', '+2 DEX', 'Lucky (reroll 1s)'],
          ['Human', '+1 to all', 'Versatility (or feat if variant)'],
          ['Dragonborn', '+2 STR, +1 CHA', 'Breath weapon'],
          ['Gnome', '+2 INT', 'Advantage on mental saves vs magic'],
          ['Half-Elf', '+2 CHA, +1/+1', 'Extra skills, darkvision'],
          ['Half-Orc', '+2 STR, +1 CON', 'Relentless Endurance'],
          ['Tiefling', '+2 CHA, +1 INT', 'Fire resistance, innate spells'],
        ],
      },
    ],
    relatedRules: ['ability-scores-overview', 'classes-overview'],
    tags: ['race', 'ancestry', 'character creation', 'species'],
    keywords: ['dwarf', 'elf', 'halfling', 'human', 'dragonborn', 'gnome', 'half-elf', 'half-orc', 'tiefling'],
    source: 'SRD',
    pageReference: 'PHB p.17',
    tips: [
      'Newer rules let you assign ability bonuses freely - ask your DM.',
      "Darkvision is incredibly useful in dungeons.",
      'Variant Human\'s free feat at level 1 is very powerful.',
    ],
  },
]
