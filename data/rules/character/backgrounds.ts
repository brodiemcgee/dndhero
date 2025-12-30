/**
 * Backgrounds Rules
 */

import type { RuleEntry } from '@/types/rules'

export const BACKGROUNDS_RULES: RuleEntry[] = [
  {
    id: 'backgrounds-overview',
    name: 'Backgrounds',
    slug: 'backgrounds',
    category: 'character',
    subcategory: 'backgrounds',
    summary:
      'Your background describes what your character did before becoming an adventurer. It grants skills, tools, languages, and a special feature.',
    description: `
## What Backgrounds Provide

- **Skill Proficiencies**: Usually 2 skills
- **Tool/Language Proficiencies**: Varies by background
- **Equipment**: Starting gear and gold
- **Background Feature**: A special non-combat ability
- **Personality Traits**: Suggested characteristics

## Common Backgrounds

### Acolyte
- Skills: Insight, Religion
- Languages: 2 of your choice
- Feature: Shelter of the Faithful (temples provide support)

### Criminal
- Skills: Deception, Stealth
- Tools: Gaming set, thieves' tools
- Feature: Criminal Contact (underworld connections)

### Folk Hero
- Skills: Animal Handling, Survival
- Tools: Artisan's tools, vehicles (land)
- Feature: Rustic Hospitality (common folk help you)

### Noble
- Skills: History, Persuasion
- Tools: Gaming set
- Languages: 1 of your choice
- Feature: Position of Privilege (nobles respect you)

### Sage
- Skills: Arcana, History
- Languages: 2 of your choice
- Feature: Researcher (know where to find information)

### Soldier
- Skills: Athletics, Intimidation
- Tools: Gaming set, vehicles (land)
- Feature: Military Rank (soldiers recognize your authority)

## Customizing Backgrounds

With DM approval, you can:
- Swap skill proficiencies
- Change languages or tools
- Create a custom background feature
    `.trim(),
    examples: [
      {
        title: 'Background Feature Use',
        description: 'An acolyte needs a place to stay in a new city.',
        result:
          'Shelter of the Faithful: Local temples provide free room, board, and healing (within reason).',
      },
      {
        title: 'Customizing',
        description: 'A player wants a "Reformed Pirate" background.',
        result:
          'DM might say: Use Sailor mechanics but swap one skill for Deception, and adjust the feature.',
      },
    ],
    tables: [
      {
        caption: 'Background Quick Reference',
        headers: ['Background', 'Skills', 'Key Benefit'],
        rows: [
          ['Acolyte', 'Insight, Religion', 'Temple support'],
          ['Charlatan', 'Deception, Sleight of Hand', 'False identity'],
          ['Criminal', 'Deception, Stealth', 'Underworld contacts'],
          ['Entertainer', 'Acrobatics, Performance', 'Free lodging when you perform'],
          ['Folk Hero', 'Animal Handling, Survival', 'Common folk shelter you'],
          ['Noble', 'History, Persuasion', 'Social privilege'],
          ['Outlander', 'Athletics, Survival', 'Excellent navigator'],
          ['Sage', 'Arcana, History', 'Research assistance'],
          ['Soldier', 'Athletics, Intimidation', 'Military authority'],
        ],
      },
    ],
    relatedRules: ['skills-overview', 'ability-scores-overview'],
    tags: ['background', 'character creation', 'skills', 'roleplay'],
    keywords: ['acolyte', 'criminal', 'noble', 'soldier', 'sage', 'folk hero', 'outlander'],
    source: 'SRD',
    pageReference: 'PHB p.125',
    tips: [
      "Choose a background that fills skill gaps in your party.",
      "Background features rarely have mechanical benefits - they're for roleplay.",
      'Your background is great for developing character history.',
    ],
  },
]
