/**
 * Saving Throw Rules
 */

import type { RuleEntry } from '@/types/rules'

export const SAVING_THROW_RULES: RuleEntry[] = [
  {
    id: 'saving-throws-overview',
    name: 'Saving Throws',
    slug: 'saving-throws',
    category: 'core-mechanics',
    subcategory: 'saving-throws',
    summary:
      'Roll 1d20 + ability modifier (+ proficiency if proficient) to resist a spell, trap, or effect. Meet or exceed the DC to avoid or reduce the effect.',
    description: `
## Saving Throws

A saving throw represents an attempt to resist a spell, trap, poison, disease, or similar threat.

### Making a Saving Throw
1. Roll **1d20**
2. Add the relevant **ability modifier**
3. Add **proficiency bonus** if proficient in that save
4. Compare to the **Difficulty Class (DC)**

If your total **equals or exceeds** the DC, you succeed!

### The Six Saves
Each saving throw uses one of the six abilities:

| Save | Resists |
|------|---------|
| **Strength** | Being pushed, restrained, or moved against your will |
| **Dexterity** | Area effects, traps, dodging |
| **Constitution** | Poison, disease, endurance effects |
| **Intelligence** | Mind-affecting illusions, psychic attacks |
| **Wisdom** | Charm, fear, mind control |
| **Charisma** | Possession, banishment, soul effects |

### Save Proficiencies
Each class grants proficiency in two saving throws:
- **Strong saves**: DEX, CON, WIS (more common threats)
- **Weak saves**: STR, INT, CHA (less common threats)

### Common DCs
- Monster abilities: 8 + proficiency + ability modifier
- Spells: 8 + proficiency + spellcasting ability modifier
- Traps: Varies by trap severity
    `.trim(),
    examples: [
      {
        title: 'Dexterity Save vs Fireball',
        description: 'A rogue with +4 DEX and proficiency in DEX saves (+3) tries to dodge a Fireball (DC 15).',
        diceNotation: '1d20 + 4 + 3 = 1d20 + 7',
        result: 'Roll 10 + 7 = 17. Succeeds! Takes half damage instead of full.',
      },
      {
        title: 'Wisdom Save vs Charm',
        description: 'A fighter with +1 WIS (no proficiency) resists Charm Person (DC 14).',
        diceNotation: '1d20 + 1',
        result: 'Roll 8 + 1 = 9. Fails! The fighter is charmed.',
      },
    ],
    tables: [
      {
        caption: 'Class Saving Throw Proficiencies',
        headers: ['Class', 'Proficient Saves'],
        rows: [
          ['Barbarian', 'Strength, Constitution'],
          ['Bard', 'Dexterity, Charisma'],
          ['Cleric', 'Wisdom, Charisma'],
          ['Druid', 'Intelligence, Wisdom'],
          ['Fighter', 'Strength, Constitution'],
          ['Monk', 'Strength, Dexterity'],
          ['Paladin', 'Wisdom, Charisma'],
          ['Ranger', 'Strength, Dexterity'],
          ['Rogue', 'Dexterity, Intelligence'],
          ['Sorcerer', 'Constitution, Charisma'],
          ['Warlock', 'Wisdom, Charisma'],
          ['Wizard', 'Intelligence, Wisdom'],
        ],
      },
    ],
    relatedRules: ['ability-checks-overview', 'advantage-disadvantage', 'spell-save-dc'],
    tags: ['saving throw', 'save', 'DC', 'resist', 'dodge'],
    keywords: ['saving throw', 'save', 'DC', 'resist'],
    source: 'SRD',
    pageReference: 'PHB p.179',
    tips: [
      'Paladins\' Aura of Protection adds CHA modifier to all saves for nearby allies.',
      'Monks gain proficiency in all saves at level 14 (Diamond Soul).',
      'Resilient feat grants proficiency in one saving throw.',
    ],
  },
  {
    id: 'common-saves',
    name: 'Common Saving Throws',
    slug: 'common-saves',
    category: 'core-mechanics',
    subcategory: 'saving-throws',
    summary: 'Dexterity, Constitution, and Wisdom saves are the most common. Intelligence, Strength, and Charisma saves are rarer.',
    description: `
## Common Saving Throws by Type

### Dexterity Saves (Very Common)
**Dodge area effects and traps**
- Fireball, Lightning Bolt, Breath Weapons
- Most traps
- Many monster abilities

**On success**: Usually take half damage or no damage

### Constitution Saves (Common)
**Resist bodily harm and maintain focus**
- Poison and disease
- Exhaustion effects
- Concentration on spells when damaged
- Some necromancy spells

**On success**: Varies - often no effect or half damage

### Wisdom Saves (Common)
**Resist mental effects and illusions**
- Charm Person, Hold Person
- Fear effects
- Many enchantment and illusion spells

**On success**: Usually no effect

### Intelligence Saves (Rare)
**Resist psychic and mind attacks**
- Phantasmal Force
- Mind Flayer abilities
- Some illusions

**On success**: Usually no effect or see through illusion

### Strength Saves (Rare)
**Resist being moved or restrained**
- Thunderwave (pushed)
- Web (restrained)
- Some grapple-like effects

**On success**: Usually not moved or not restrained

### Charisma Saves (Rare)
**Resist soul and planar effects**
- Banishment
- Zone of Truth
- Some possession effects

**On success**: Usually no effect
    `.trim(),
    relatedRules: ['saving-throws-overview', 'concentration'],
    relatedSpells: ['fireball', 'hold-person', 'banishment'],
    tags: ['saving throw', 'dexterity', 'constitution', 'wisdom'],
    keywords: ['dex save', 'con save', 'wis save', 'common saves'],
    source: 'SRD',
    tips: [
      'DEX, CON, and WIS are the "big three" saves - invest in these.',
      'Absorb Elements can reduce elemental damage even on a failed DEX save.',
      'Shield of Faith can help allies with low DEX saves.',
    ],
  },
]
