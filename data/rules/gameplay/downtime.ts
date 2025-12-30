/**
 * Downtime Activities Rules
 */

import type { RuleEntry } from '@/types/rules'

export const DOWNTIME_RULES: RuleEntry[] = [
  {
    id: 'downtime-overview',
    name: 'Downtime Activities',
    slug: 'downtime-activities',
    category: 'gameplay',
    subcategory: 'downtime',
    summary:
      'Between adventures, characters can pursue downtime activities like crafting, training, working, or researching.',
    description: `
## What is Downtime?

Downtime represents days, weeks, or months between adventures. It's a chance to:
- Recover from injuries
- Earn gold
- Learn new skills
- Craft items
- Build relationships

## Common Downtime Activities

### Crafting
With the right tools and proficiency, you can craft items.
- **Time**: Divide item cost (in gp) by 5 = days needed
- **Cost**: Half the item's market price in materials
- Requires proficiency in appropriate tools

### Working
Earn money through honest labor.
- **Income**: 1 gp per day (modest lifestyle)
- May use skills for better income (Performance, Persuasion)

### Training
Learn a new language or tool proficiency.
- **Time**: 250 days
- **Cost**: 1 gp per day
- Requires a trainer

### Recuperating
Spend time recovering from injuries or conditions.
- Can end lingering injuries
- Can remove diseases or poisons

### Researching
Study in libraries, talk to sages, or investigate.
- Requires a library or knowledgeable sources
- DM determines what information is available

### Other Activities
- **Building a Stronghold**: Costs gold and takes months
- **Running a Business**: Requires initial investment
- **Carousing**: Make contacts or get into trouble
- **Crime**: High risk, potential reward
    `.trim(),
    examples: [
      {
        title: 'Crafting a Potion',
        description: 'A character with an herbalism kit proficiency crafts a Potion of Healing (50 gp).',
        result: 'Time: 50 ÷ 5 = 10 days. Cost: 25 gp in materials.',
      },
      {
        title: 'Learning a Language',
        description: 'A wizard wants to learn Elvish during the winter.',
        result: '250 days of training at 1 gp/day = 250 gp total. Typically done over multiple downtime periods.',
      },
      {
        title: 'Working as Entertainment',
        description: 'A bard performs at a tavern during a week of downtime.',
        result: 'Can make Performance checks for better pay. Good performance might earn 2+ gp/day.',
      },
    ],
    tables: [
      {
        caption: 'Downtime Activity Summary',
        headers: ['Activity', 'Duration', 'Cost', 'Result'],
        rows: [
          ['Crafting', 'Item cost ÷ 5 days', 'Half item cost', 'Create an item'],
          ['Working', 'Any duration', 'None', '1 gp/day income'],
          ['Training', '250 days', '250 gp', 'New language or tool'],
          ['Recuperating', 'Varies', 'Lifestyle', 'End conditions'],
          ['Researching', 'Varies', 'Varies', 'Learn information'],
        ],
      },
    ],
    relatedRules: ['adventuring-gear-overview', 'skills-overview'],
    tags: ['downtime', 'crafting', 'training', 'work', 'between adventures'],
    keywords: ['downtime', 'crafting', 'training', 'working', 'recuperating', 'research'],
    source: 'SRD',
    pageReference: 'PHB p.187',
    tips: [
      'Downtime is great for character development between adventures.',
      'Crafting magic items typically requires special ingredients and recipes.',
      'Ask your DM about expanding downtime options for longer campaigns.',
    ],
  },
]
