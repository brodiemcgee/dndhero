/**
 * Skills Rules
 */

import type { RuleEntry } from '@/types/rules'

export const SKILLS_RULES: RuleEntry[] = [
  {
    id: 'skills-overview',
    name: 'Skills',
    slug: 'skills',
    category: 'character',
    subcategory: 'skills',
    summary:
      'Skills represent training in specific tasks. When proficient in a skill, you add your proficiency bonus to ability checks using that skill.',
    description: `
## How Skills Work

A skill check = **d20 + Ability Modifier + Proficiency Bonus (if proficient)**

If you're not proficient, you just use the ability modifier.

## The 18 Skills

### Strength Skills
- **Athletics**: Climbing, swimming, jumping, grappling

### Dexterity Skills
- **Acrobatics**: Balance, tumbling, flips
- **Sleight of Hand**: Pickpocketing, hiding objects, fine manipulation
- **Stealth**: Moving silently, hiding

### Intelligence Skills
- **Arcana**: Magic lore, magical creatures, planes
- **History**: Historical events, legends, past civilizations
- **Investigation**: Searching for clues, deductive reasoning
- **Nature**: Plants, animals, weather, natural cycles
- **Religion**: Deities, rites, prayers, religious symbols

### Wisdom Skills
- **Animal Handling**: Calming, controlling, or riding animals
- **Insight**: Reading intentions, detecting lies
- **Medicine**: Stabilizing the dying, diagnosing illness
- **Perception**: Noticing things, spotting hidden creatures
- **Survival**: Tracking, foraging, navigating wilderness

### Charisma Skills
- **Deception**: Lying, disguise, misleading
- **Intimidation**: Threatening, coercing
- **Performance**: Acting, music, storytelling
- **Persuasion**: Influencing through tact, charm, good will

## Gaining Proficiency

You gain skill proficiencies from:
- Your class (pick from a list)
- Your background (usually 2 skills)
- Your race (sometimes)
- Feats (like Skilled)
    `.trim(),
    examples: [
      {
        title: 'Proficient Check',
        description: 'A 5th-level rogue (DEX +4, proficiency +3) who is proficient in Stealth tries to hide.',
        diceNotation: 'd20 + 4 (DEX) + 3 (Prof) = d20 + 7',
        result: 'They roll d20+7 against the observers\' passive Perception.',
      },
      {
        title: 'Non-Proficient Check',
        description: 'The same rogue (INT +1, not proficient in Arcana) tries to identify a magical rune.',
        diceNotation: 'd20 + 1 (INT only)',
        result: 'Without proficiency, they only add their Intelligence modifier.',
      },
    ],
    tables: [
      {
        caption: 'Skills by Ability',
        headers: ['Ability', 'Skills'],
        rows: [
          ['Strength', 'Athletics'],
          ['Dexterity', 'Acrobatics, Sleight of Hand, Stealth'],
          ['Constitution', '(None)'],
          ['Intelligence', 'Arcana, History, Investigation, Nature, Religion'],
          ['Wisdom', 'Animal Handling, Insight, Medicine, Perception, Survival'],
          ['Charisma', 'Deception, Intimidation, Performance, Persuasion'],
        ],
      },
    ],
    relatedRules: ['ability-checks-overview', 'proficiency-overview'],
    tags: ['skills', 'proficiency', 'ability checks', 'training'],
    keywords: ['skill check', 'proficient', 'trained', 'skill list'],
    source: 'SRD',
    pageReference: 'PHB p.174',
    tips: [
      'Perception is arguably the most commonly rolled skill.',
      'Stealth is crucial for ambushes and avoiding encounters.',
      'Consider skills that complement your party - spread out!',
    ],
  },
]
