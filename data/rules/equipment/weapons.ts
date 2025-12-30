/**
 * Weapons Rules
 */

import type { RuleEntry } from '@/types/rules'

export const WEAPONS_RULES: RuleEntry[] = [
  {
    id: 'weapons-overview',
    name: 'Weapons',
    slug: 'weapons',
    category: 'equipment',
    subcategory: 'weapons',
    summary:
      'Weapons are categorized as simple or martial, and melee or ranged. Your proficiency and ability scores determine attack and damage bonuses.',
    description: `
## Weapon Categories

### Simple Weapons
Easier to use. Most classes are proficient.
- **Melee**: Club, Dagger, Handaxe, Javelin, Mace, Quarterstaff, Sickle, Spear
- **Ranged**: Light Crossbow, Dart, Shortbow, Sling

### Martial Weapons
Require training. Fighters, Paladins, Rangers are proficient.
- **Melee**: Battleaxe, Longsword, Greatsword, Rapier, Warhammer, etc.
- **Ranged**: Longbow, Heavy Crossbow, Hand Crossbow

## Weapon Properties

- **Finesse**: Use DEX or STR for attacks (daggers, rapiers)
- **Light**: Can dual-wield with another light weapon
- **Heavy**: Small creatures have disadvantage
- **Two-Handed**: Requires both hands to attack
- **Versatile**: Can use one or two hands (different damage)
- **Thrown**: Can throw for ranged attack
- **Reach**: Melee reach of 10 ft instead of 5 ft
- **Loading**: Only one attack per action regardless of Extra Attack
- **Ammunition**: Requires arrows/bolts (recover half after combat)

## Attack Rolls

**Attack Roll** = d20 + Ability Modifier + Proficiency (if proficient)

- **Melee**: Usually STR (or DEX with Finesse)
- **Ranged**: Usually DEX
- **Thrown**: Your choice of STR or DEX

## Damage Rolls

**Damage** = Weapon Die + Ability Modifier

You add the same modifier used for the attack (STR or DEX).
    `.trim(),
    examples: [
      {
        title: 'Longsword Attack',
        description: 'A fighter with +3 STR and proficiency (+2) attacks with a longsword.',
        diceNotation: 'Attack: d20 + 5 | Damage: 1d8 + 3 slashing',
        result: 'Or 1d10+3 if using two hands (versatile property).',
      },
      {
        title: 'Rapier with Finesse',
        description: 'A rogue with +4 DEX attacks with a rapier.',
        diceNotation: 'Attack: d20 + 6 (DEX + Prof) | Damage: 1d8 + 4 piercing',
        result: 'Finesse lets them use DEX instead of STR.',
      },
      {
        title: 'Dual Wielding',
        description: 'A ranger with two shortswords (both light).',
        result: 'Attack with main hand normally. Bonus action attack with off-hand does NOT add ability mod to damage.',
      },
    ],
    tables: [
      {
        caption: 'Common Weapons',
        headers: ['Weapon', 'Damage', 'Properties'],
        rows: [
          ['Dagger', '1d4 piercing', 'Finesse, light, thrown (20/60)'],
          ['Shortsword', '1d6 piercing', 'Finesse, light'],
          ['Longsword', '1d8 slashing', 'Versatile (1d10)'],
          ['Greatsword', '2d6 slashing', 'Heavy, two-handed'],
          ['Rapier', '1d8 piercing', 'Finesse'],
          ['Shortbow', '1d6 piercing', 'Ammunition (80/320), two-handed'],
          ['Longbow', '1d8 piercing', 'Ammunition (150/600), heavy, two-handed'],
          ['Hand Crossbow', '1d6 piercing', 'Ammunition (30/120), light, loading'],
        ],
      },
    ],
    relatedRules: ['attack-rolls-overview', 'damage-overview'],
    tags: ['weapons', 'equipment', 'melee', 'ranged', 'damage'],
    keywords: ['sword', 'bow', 'dagger', 'weapon damage', 'weapon attack', 'finesse', 'two-handed'],
    source: 'SRD',
    pageReference: 'PHB p.146',
    tips: [
      'Finesse weapons let DEX-based characters do melee effectively.',
      'Versatile weapons offer flexibility between damage and shield use.',
      'Loading property limits crossbows - Extra Attack doesn\'t help unless you have Crossbow Expert.',
    ],
  },
]
