/**
 * Adventuring Gear Rules
 */

import type { RuleEntry } from '@/types/rules'

export const ADVENTURING_GEAR_RULES: RuleEntry[] = [
  {
    id: 'adventuring-gear-overview',
    name: 'Adventuring Gear',
    slug: 'adventuring-gear',
    category: 'equipment',
    subcategory: 'adventuring-gear',
    summary:
      'Adventuring gear includes tools, supplies, and equipment that help you survive and explore. Many items have specific uses in and out of combat.',
    description: `
## Essential Adventuring Gear

### Light Sources
- **Torch**: 20 ft bright light, 20 ft dim. Burns 1 hour.
- **Lantern**: 30 ft bright, 30 ft dim. Uses oil (6 hours).
- **Candle**: 5 ft dim light. Burns 1 hour.

### Rope & Climbing
- **Rope (50 ft)**: Hempen or silk. 2 HP, can be burst with DC 17 STR.
- **Grappling Hook**: Can be attached to rope for climbing.
- **Pitons**: Metal spikes for climbing aids.
- **Climbing Kit**: Advantage on climbing checks.

### Healing & Recovery
- **Healer's Kit**: 10 uses. Stabilize dying creature without Medicine check.
- **Potion of Healing**: 2d4+2 HP. Action to drink.
- **Antitoxin**: Advantage on saves vs poison for 1 hour.

### Exploration Tools
- **Thieves' Tools**: Required to pick locks and disarm traps.
- **Crowbar**: Advantage on STR checks to force something open.
- **10-foot Pole**: Safely trigger traps from distance.

### Containers
- **Backpack**: Holds 30 lbs or 1 cubic foot.
- **Bag of Holding**: Holds 500 lbs, weighs 15 lbs (magic item).
- **Waterskin**: Holds 4 pints of liquid.

## Tool Proficiencies

Being proficient with a tool lets you add proficiency bonus when using it. Common tools:
- **Thieves' Tools**: Pick locks, disarm traps
- **Herbalism Kit**: Create antitoxin and potions of healing
- **Smith's Tools**: Repair metal items
- **Disguise Kit**: Create disguises
    `.trim(),
    examples: [
      {
        title: 'Using Thieves\' Tools',
        description: 'A rogue proficient in thieves\' tools picks a lock (DC 15).',
        diceNotation: 'd20 + DEX + Proficiency',
        result: 'If DEX is +4 and proficiency is +3, roll d20+7 vs DC 15.',
      },
      {
        title: 'Dungeon Exploration Kit',
        description: 'Essential items for dungeon delving.',
        result: 'Torches, rope, 10-foot pole, crowbar, rations, waterskin, healer\'s kit.',
      },
    ],
    tables: [
      {
        caption: 'Essential Gear Costs',
        headers: ['Item', 'Cost', 'Weight'],
        rows: [
          ['Backpack', '2 gp', '5 lb'],
          ['Rope, hempen (50 ft)', '1 gp', '10 lb'],
          ['Torch (10)', '1 cp each', '1 lb each'],
          ["Thieves' tools", '25 gp', '1 lb'],
          ["Healer's kit", '5 gp', '3 lb'],
          ['Rations (1 day)', '5 sp', '2 lb'],
          ['Waterskin', '2 sp', '5 lb (full)'],
          ['Potion of Healing', '50 gp', '0.5 lb'],
        ],
      },
    ],
    relatedRules: ['skills-overview'],
    tags: ['equipment', 'gear', 'tools', 'exploration', 'adventuring'],
    keywords: ['torch', 'rope', 'thieves tools', 'healer kit', 'potion', 'adventuring gear'],
    source: 'SRD',
    pageReference: 'PHB p.148',
    tips: [
      'Always carry at least one light source unless you have darkvision.',
      'A 10-foot pole is a classic dungeon-delving must-have.',
      'Healer\'s kit stabilizes without a Medicine check - very reliable!',
    ],
  },
]
