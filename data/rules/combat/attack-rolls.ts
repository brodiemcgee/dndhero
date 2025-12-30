/**
 * Attack Roll Rules
 */

import type { RuleEntry } from '@/types/rules'

export const ATTACK_ROLL_RULES: RuleEntry[] = [
  {
    id: 'attack-rolls-overview',
    name: 'Attack Rolls',
    slug: 'attack-rolls',
    category: 'combat',
    subcategory: 'attack-rolls',
    summary:
      'Roll 1d20, add your attack modifier. If the total equals or exceeds the target\'s AC, you hit.',
    description: `
## Making an Attack

When you make an attack, follow these steps:

### 1. Roll the d20
Roll 1d20 and add the appropriate modifiers.

### 2. Apply Modifiers

**Melee weapons:**
- Add **Strength modifier** (or DEX for finesse weapons)
- Add **proficiency bonus** if proficient with the weapon

**Ranged weapons:**
- Add **Dexterity modifier**
- Add **proficiency bonus** if proficient

**Spell attacks:**
- Add **spellcasting ability modifier** (INT, WIS, or CHA depending on class)
- Add **proficiency bonus**

### 3. Compare to AC
If your total **equals or exceeds** the target's Armor Class (AC), you hit!

## Critical Hits
If you roll a **natural 20** on the d20:
- The attack **automatically hits** (regardless of AC)
- You roll **all damage dice twice** and add modifiers once

## Critical Miss
If you roll a **natural 1** on the d20:
- The attack **automatically misses** (regardless of modifiers)
    `.trim(),
    examples: [
      {
        title: 'Melee Attack',
        description: 'A fighter with +4 STR, proficiency bonus +2, attacks with a longsword.',
        diceNotation: '1d20 + 4 + 2 = 1d20 + 6',
        result: "Roll 13 + 6 = 19. If enemy AC is 19 or less, it's a hit!",
      },
      {
        title: 'Critical Hit Damage',
        description: 'A rogue crits with a shortsword (1d6) while sneak attacking (2d6).',
        diceNotation: '(1d6 + 2d6) x 2 = 2d6 + 4d6',
        result: 'Roll 6d6 total, then add DEX modifier once. Massive damage!',
      },
    ],
    tables: [
      {
        caption: 'Attack Modifier Quick Reference',
        headers: ['Attack Type', 'Ability', 'Formula'],
        rows: [
          ['Melee (normal)', 'Strength', 'd20 + STR mod + proficiency'],
          ['Melee (finesse)', 'STR or DEX', 'd20 + STR or DEX mod + proficiency'],
          ['Ranged', 'Dexterity', 'd20 + DEX mod + proficiency'],
          ['Spell attack', 'Casting ability', 'd20 + casting mod + proficiency'],
        ],
      },
    ],
    relatedRules: ['damage', 'advantage-disadvantage', 'cover'],
    tags: ['attack', 'combat', 'd20', 'hit', 'miss', 'critical'],
    keywords: ['attack roll', 'to hit', 'hit or miss', 'crit', 'natural 20'],
    source: 'SRD',
    pageReference: 'PHB p.194',
    tips: [
      'Advantage gives you two d20s, take the higher - about +5 on average.',
      'Flanking (optional rule) gives advantage when you and an ally are on opposite sides of an enemy.',
      'The Champion fighter crits on 19-20 (and 18-20 at higher levels).',
    ],
  },
  {
    id: 'melee-attacks',
    name: 'Melee Attacks',
    slug: 'melee-attacks',
    category: 'combat',
    subcategory: 'attack-rolls',
    summary: 'Attack a target within your reach (usually 5 feet). Use Strength unless the weapon has the finesse property.',
    description: `
## Melee Attacks

A melee attack targets a creature within your **reach** (typically 5 feet).

### Reach
- Most melee weapons have **5-foot reach**
- Weapons with the **reach** property (glaive, halberd, pike, whip) have **10-foot reach**
- Your reach determines where you can make opportunity attacks

### Ability Score
- **Strength** for most melee weapons
- **Strength OR Dexterity** for finesse weapons (your choice)

### Unarmed Strikes
You can punch, kick, or headbutt:
- **1 + Strength modifier** bludgeoning damage
- You are always proficient with unarmed strikes
- Monks deal more damage with Martial Arts

### Two-Weapon Fighting
If you're holding a light melee weapon in each hand:
1. Attack with your main hand (action)
2. Attack with off-hand (bonus action)
3. Don't add ability modifier to off-hand damage (unless negative)
4. With the Two-Weapon Fighting style, add modifier to off-hand damage
    `.trim(),
    examples: [
      {
        title: 'Finesse Weapon',
        description: 'A rogue with +4 DEX and +1 STR uses a rapier.',
        result: 'Can use DEX (+4) instead of STR (+1) for both attack and damage rolls.',
      },
    ],
    relatedRules: ['attack-rolls-overview', 'damage', 'opportunity-attacks'],
    tags: ['melee', 'attack', 'strength', 'finesse', 'reach', 'unarmed'],
    keywords: ['melee attack', 'sword attack', 'punch', 'unarmed strike'],
    source: 'SRD',
    pageReference: 'PHB p.195',
  },
  {
    id: 'ranged-attacks',
    name: 'Ranged Attacks',
    slug: 'ranged-attacks',
    category: 'combat',
    subcategory: 'attack-rolls',
    summary: 'Attack a target at range. Use Dexterity. Disadvantage if enemy is within 5 feet or at long range.',
    description: `
## Ranged Attacks

Ranged attacks target creatures at a distance.

### Range
Weapons list two ranges: **normal/long**
- **Normal range**: No penalty
- **Long range**: Attack with **disadvantage**
- **Beyond long range**: Can't attack

Example: A shortbow has range 80/320. Normal attacks up to 80 feet, disadvantage from 81-320 feet.

### Ability Score
- **Dexterity** for ranged weapons
- **Strength** for thrown weapons (unless they have finesse)
- Some weapons like darts have both **thrown** and **finesse**

### Ranged Attacks in Close Combat
If a hostile creature you can see is **within 5 feet** and isn't incapacitated:
- You have **disadvantage** on the ranged attack
- This applies to ranged spell attacks too!

### Ammunition
- Draw ammunition as part of the attack
- Recover half your expended ammunition after combat
    `.trim(),
    examples: [
      {
        title: 'Close-Range Penalty',
        description: 'An archer is cornered by a goblin 5 feet away and shoots at it.',
        result: 'The archer has disadvantage on the attack roll because a hostile creature is within 5 feet.',
      },
      {
        title: 'Long Range Shot',
        description: 'Shooting a longbow (150/600 range) at a target 400 feet away.',
        result: 'Attack with disadvantage (beyond normal range but within long range).',
      },
    ],
    tables: [
      {
        caption: 'Common Ranged Weapon Ranges',
        headers: ['Weapon', 'Normal Range', 'Long Range'],
        rows: [
          ['Shortbow', '80 ft', '320 ft'],
          ['Longbow', '150 ft', '600 ft'],
          ['Light Crossbow', '80 ft', '320 ft'],
          ['Hand Crossbow', '30 ft', '120 ft'],
          ['Dagger (thrown)', '20 ft', '60 ft'],
          ['Javelin', '30 ft', '120 ft'],
        ],
      },
    ],
    relatedRules: ['attack-rolls-overview', 'advantage-disadvantage', 'cover'],
    tags: ['ranged', 'attack', 'dexterity', 'bow', 'crossbow', 'thrown'],
    keywords: ['ranged attack', 'bow', 'shoot', 'range'],
    source: 'SRD',
    pageReference: 'PHB p.195',
    tips: [
      'Crossbow Expert feat removes disadvantage for ranged attacks in melee.',
      'Sharpshooter feat ignores half and three-quarters cover, and ignores disadvantage at long range.',
      'You can throw any weapon, even if not designed for it (improvised weapon rules apply).',
    ],
  },
]
