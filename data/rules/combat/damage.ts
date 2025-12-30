/**
 * Damage & Healing Rules
 */

import type { RuleEntry } from '@/types/rules'

export const DAMAGE_RULES: RuleEntry[] = [
  {
    id: 'damage-overview',
    name: 'Damage & Healing',
    slug: 'damage-healing',
    category: 'combat',
    subcategory: 'damage',
    summary:
      'When you hit with an attack or a spell deals damage, you roll damage dice, add modifiers, and subtract from the target\'s hit points. Healing restores lost HP.',
    description: `
## Dealing Damage

When you hit with an attack:
1. Roll the **damage dice** specified by the weapon or spell
2. Add relevant **modifiers** (usually ability modifier for weapons)
3. Apply any **bonuses** (class features, spells, magic items)
4. Total is subtracted from target's **hit points**

## Damage Types

Different attacks deal different damage types. Creatures may have:
- **Resistance**: Take half damage from that type
- **Immunity**: Take no damage from that type
- **Vulnerability**: Take double damage from that type

### Common Damage Types
- **Physical**: Bludgeoning, Piercing, Slashing
- **Elemental**: Fire, Cold, Lightning, Thunder, Acid, Poison
- **Magical**: Radiant, Necrotic, Force, Psychic

## Critical Hits

When you roll a **natural 20** on an attack roll:
- The attack automatically hits
- Roll all damage dice **twice**
- Add modifiers once (not doubled)

## Healing

Healing restores lost hit points:
- Cannot exceed your **HP maximum**
- A creature at 0 HP regains consciousness when healed
- Healing spells: *Cure Wounds*, *Healing Word*, *Heal*

## Dropping to 0 Hit Points

When you reach 0 HP:
- If damage equals remaining HP: Fall **unconscious**, start making **death saves**
- If excess damage equals HP maximum: **Instant death**
- Monsters/NPCs typically die outright at 0 HP (DM's choice)
    `.trim(),
    examples: [
      {
        title: 'Weapon Damage',
        description: 'A fighter with +4 STR hits with a longsword.',
        diceNotation: '1d8 + 4 slashing damage',
        result: 'Rolls 6 on the d8: 6 + 4 = 10 slashing damage.',
      },
      {
        title: 'Critical Hit',
        description: 'A rogue rolls a natural 20 with a dagger (+4 DEX, 3d6 Sneak Attack).',
        diceNotation: '(2d4 + 6d6) + 4',
        result: 'Double all dice (1d4 → 2d4, 3d6 → 6d6), add DEX modifier once.',
      },
      {
        title: 'Resistance',
        description: 'A tiefling (fire resistance) is hit by Fireball for 28 damage.',
        result: 'Takes half: 28 ÷ 2 = 14 fire damage.',
      },
    ],
    tables: [
      {
        caption: 'Damage Types',
        headers: ['Type', 'Common Sources'],
        rows: [
          ['Bludgeoning', 'Hammers, falling, constriction'],
          ['Piercing', 'Arrows, rapiers, spears, bites'],
          ['Slashing', 'Swords, axes, claws'],
          ['Fire', 'Burning, Fireball, dragon breath'],
          ['Cold', 'Freezing, Cone of Cold, ice'],
          ['Lightning', 'Lightning Bolt, storms'],
          ['Radiant', 'Holy magic, sunlight'],
          ['Necrotic', 'Life-draining, undead attacks'],
          ['Force', 'Magic Missile, Eldritch Blast'],
        ],
      },
      {
        caption: 'Common Resistances by Creature',
        headers: ['Creature Type', 'Common Resistance'],
        rows: [
          ['Tiefling', 'Fire'],
          ['Dwarf (some)', 'Poison'],
          ['Elemental', 'Their element'],
          ['Fiend', 'Fire, sometimes cold/lightning'],
          ['Undead', 'Necrotic, sometimes poison'],
        ],
      },
    ],
    relatedRules: ['attack-rolls-overview', 'death-saves-overview'],
    tags: ['damage', 'healing', 'hit points', 'critical hit', 'resistance', 'immunity'],
    keywords: ['damage roll', 'damage type', 'critical hit', 'crit', 'healing', 'resistance', 'immunity', 'vulnerability'],
    source: 'SRD',
    pageReference: 'PHB p.196',
    tips: [
      "Half-orcs and barbarians have features that boost critical hit damage.",
      'Force damage is almost never resisted - Magic Missile is reliable.',
      'Healing in combat is often less efficient than preventing damage.',
    ],
    commonMistakes: [
      'Doubling modifiers on critical hits (only dice are doubled).',
      'Forgetting resistance halves damage (round down).',
      'Not tracking temporary HP separately from regular HP.',
    ],
  },
]
