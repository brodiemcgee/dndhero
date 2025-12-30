/**
 * Armor & Shields Rules
 */

import type { RuleEntry } from '@/types/rules'

export const ARMOR_RULES: RuleEntry[] = [
  {
    id: 'armor-overview',
    name: 'Armor & Shields',
    slug: 'armor-shields',
    category: 'equipment',
    subcategory: 'armor',
    summary:
      'Armor determines your Armor Class (AC). Different types have different requirements, and wearing armor without proficiency causes severe penalties.',
    description: `
## Armor Class (AC)

Your AC determines how hard you are to hit. When an attack roll meets or beats your AC, it hits.

**No Armor**: AC = 10 + DEX modifier

## Armor Types

### Light Armor
- Adds full DEX modifier to AC
- No Strength requirement
- **Padded**: AC 11 + DEX (disadvantage on Stealth)
- **Leather**: AC 11 + DEX
- **Studded Leather**: AC 12 + DEX

### Medium Armor
- Adds DEX modifier (max +2) to AC
- Some have Stealth disadvantage
- **Hide**: AC 12 + DEX (max 2)
- **Chain Shirt**: AC 13 + DEX (max 2)
- **Scale Mail**: AC 14 + DEX (max 2), Stealth disadvantage
- **Breastplate**: AC 14 + DEX (max 2)
- **Half Plate**: AC 15 + DEX (max 2), Stealth disadvantage

### Heavy Armor
- Fixed AC, no DEX bonus
- Requires Strength to avoid speed penalty
- **Ring Mail**: AC 14, Stealth disadvantage
- **Chain Mail**: AC 16, Stealth disadvantage, STR 13
- **Splint**: AC 17, Stealth disadvantage, STR 15
- **Plate**: AC 18, Stealth disadvantage, STR 15

## Shields
- +2 AC when wielded in one hand
- Takes an action to don or doff
- Stacks with armor AC

## Proficiency

Wearing armor without proficiency:
- Disadvantage on STR and DEX ability checks, saves, and attacks
- Cannot cast spells
    `.trim(),
    examples: [
      {
        title: 'Light Armor',
        description: 'A rogue with +4 DEX wears studded leather.',
        result: 'AC = 12 + 4 = 16. Full DEX bonus applies.',
      },
      {
        title: 'Medium Armor',
        description: 'A cleric with +3 DEX wears a breastplate.',
        result: 'AC = 14 + 2 = 16. DEX capped at +2 even though they have +3.',
      },
      {
        title: 'Heavy Armor + Shield',
        description: 'A paladin in plate armor with a shield.',
        result: 'AC = 18 + 2 = 20. No DEX bonus, but very high base AC.',
      },
    ],
    tables: [
      {
        caption: 'Armor Summary',
        headers: ['Armor', 'AC', 'Type', 'Stealth'],
        rows: [
          ['Leather', '11 + DEX', 'Light', 'Normal'],
          ['Studded Leather', '12 + DEX', 'Light', 'Normal'],
          ['Chain Shirt', '13 + DEX (max 2)', 'Medium', 'Normal'],
          ['Breastplate', '14 + DEX (max 2)', 'Medium', 'Normal'],
          ['Half Plate', '15 + DEX (max 2)', 'Medium', 'Disadvantage'],
          ['Chain Mail', '16', 'Heavy', 'Disadvantage'],
          ['Plate', '18', 'Heavy', 'Disadvantage'],
        ],
      },
      {
        caption: 'Best Armor by DEX',
        headers: ['DEX Mod', 'Best Light', 'Best Medium', 'Best Heavy'],
        rows: [
          ['+0 to +1', 'Studded (12-13)', 'Half Plate (15-16)', 'Plate (18)'],
          ['+2', 'Studded (14)', 'Half Plate (17)', 'Plate (18)'],
          ['+3', 'Studded (15)', 'Breastplate (16)*', 'Plate (18)'],
          ['+4 to +5', 'Studded (16-17)', 'Breastplate (16)*', 'N/A'],
        ],
        footnotes: ['*Breastplate has no stealth disadvantage'],
      },
    ],
    relatedRules: ['ability-scores-overview'],
    tags: ['armor', 'AC', 'defense', 'equipment', 'shields'],
    keywords: ['armor class', 'AC', 'plate', 'leather', 'shield', 'heavy armor', 'light armor'],
    source: 'SRD',
    pageReference: 'PHB p.144',
    tips: [
      'If you have high DEX (+4 or +5), light armor often beats medium.',
      'Breastplate is great for medium armor users who need Stealth.',
      'Plate requires 15 STR - check before choosing!',
    ],
  },
]
