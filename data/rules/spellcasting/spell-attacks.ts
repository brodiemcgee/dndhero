/**
 * Spell Attacks & Saves Rules
 */

import type { RuleEntry } from '@/types/rules'

export const SPELL_ATTACKS_RULES: RuleEntry[] = [
  {
    id: 'spell-attacks-overview',
    name: 'Spell Attacks & Saves',
    slug: 'spell-attacks-saves',
    category: 'spellcasting',
    subcategory: 'spell-attacks',
    summary:
      'Some spells require attack rolls to hit, while others force targets to make saving throws. Your spellcasting ability determines the numbers.',
    description: `
## Two Types of Spell Resolution

### Spell Attack Rolls
You roll to hit the target, just like a weapon attack.

**Spell Attack Modifier** = Proficiency Bonus + Spellcasting Ability Modifier

Roll **d20 + spell attack modifier** vs. target's **AC**.

Used by spells like: *Fire Bolt*, *Guiding Bolt*, *Scorching Ray*, *Eldritch Blast*

### Spell Saving Throws
The target rolls to resist your spell.

**Spell Save DC** = 8 + Proficiency Bonus + Spellcasting Ability Modifier

The target rolls their save vs. your DC. If they meet or beat it, they resist (partially or fully).

Used by spells like: *Fireball*, *Hold Person*, *Charm Person*, *Polymorph*

## Spellcasting Ability by Class

| Class | Ability |
|-------|---------|
| Bard, Sorcerer, Warlock | Charisma |
| Cleric, Druid, Ranger | Wisdom |
| Wizard, Artificer | Intelligence |
| Paladin | Charisma |

## Ranged Spell Attacks

Follow the same rules as ranged weapon attacks:
- **Disadvantage** if target is within 5 feet of you
- **Disadvantage** if target has cover (half or three-quarters)
- Cannot target beyond the spell's range

## Melee Spell Attacks

Used for touch spells like *Shocking Grasp* or *Inflict Wounds*:
- No disadvantage for adjacent enemies
- Reach is determined by your own reach (usually 5 feet)
    `.trim(),
    examples: [
      {
        title: 'Spell Attack Roll',
        description: 'A 5th-level wizard (INT +4, proficiency +3) casts Fire Bolt at a goblin (AC 15).',
        diceNotation: 'd20 + 7 (3 prof + 4 INT)',
        result: 'Needs to roll 8+ to hit (8+7=15). On a hit, deals 2d10 fire damage.',
      },
      {
        title: 'Spell Save DC',
        description: 'Same wizard casts Fireball. Enemies must make DEX saves.',
        result: 'Spell Save DC = 8 + 3 + 4 = 15. Targets roll DEX save vs DC 15. Fail = full damage, success = half.',
      },
      {
        title: 'Disadvantage on Ranged',
        description: 'A sorcerer with a goblin in melee range tries to cast Fire Bolt at a distant enemy.',
        result: 'Rolls with disadvantage because a hostile creature (goblin) is within 5 feet.',
      },
    ],
    tables: [
      {
        caption: 'Spell Attack/Save Progression',
        headers: ['Level', 'Prof Bonus', '+3 Ability', '+4 Ability', '+5 Ability'],
        rows: [
          ['1-4', '+2', '+5 / DC 13', '+6 / DC 14', '+7 / DC 15'],
          ['5-8', '+3', '+6 / DC 14', '+7 / DC 15', '+8 / DC 16'],
          ['9-12', '+4', '+7 / DC 15', '+8 / DC 16', '+9 / DC 17'],
          ['13-16', '+5', '+8 / DC 16', '+9 / DC 17', '+10 / DC 18'],
          ['17-20', '+6', '+9 / DC 17', '+10 / DC 18', '+11 / DC 19'],
        ],
      },
    ],
    relatedRules: ['casting-a-spell', 'attack-rolls-overview', 'saving-throws-overview'],
    tags: ['spell attack', 'spell save', 'DC', 'spellcasting', 'attack roll'],
    keywords: ['spell attack bonus', 'spell save DC', 'how to hit with spells', 'spell modifier'],
    source: 'SRD',
    pageReference: 'PHB p.205',
    tips: [
      "Boost your spellcasting ability first - it affects both attack and DC.",
      'Some spells have both attack and save components (like Ice Knife).',
      'Critical hits on spell attacks double damage dice too!',
    ],
    commonMistakes: [
      'Adding spellcasting modifier to damage when the spell doesn\'t say to.',
      "Forgetting disadvantage when enemies are in melee range for ranged spell attacks.",
      "Using the wrong ability modifier for your class's spells.",
    ],
  },
]
