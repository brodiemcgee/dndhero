/**
 * Social Interaction Rules
 */

import type { RuleEntry } from '@/types/rules'

export const SOCIAL_RULES: RuleEntry[] = [
  {
    id: 'social-overview',
    name: 'Social Interaction',
    slug: 'social-interaction',
    category: 'gameplay',
    subcategory: 'social',
    summary:
      'Social interaction involves talking to NPCs, negotiating, gathering information, and influencing others through roleplay and Charisma-based skills.',
    description: `
## The Social Pillar

Social interaction is one of D&D's three pillars (along with combat and exploration). You'll encounter NPCs who can help, hinder, or simply add depth to the world.

## NPC Attitudes

NPCs typically have one of three attitudes toward the party:

| Attitude | Description | Typical Behavior |
|----------|-------------|------------------|
| **Friendly** | Likes the party | Will help, share info, offer fair deals |
| **Indifferent** | No strong feelings | May help if there's benefit to them |
| **Hostile** | Dislikes the party | Refuses to help, may work against you |

Social checks can shift attitudes:
- Persuasion might make someone more friendly
- Intimidation might make them cooperate (but become hostile)
- Deception might temporarily change their behavior

## Social Skills

### Persuasion (Charisma)
Convince through logic, charm, or goodwill. Best for honest negotiation.

### Deception (Charisma)
Lie, mislead, or hide the truth. Contested by target's Insight.

### Intimidation (Charisma or Strength)
Threaten or coerce. May get results but damages relationships.

### Insight (Wisdom)
Detect lies, read emotions, or sense hidden motives.

### Performance (Charisma)
Entertain, distract, or inspire through artistic expression.

## Roleplay vs. Rollplay

D&D encourages **both** acting out conversations and rolling dice:
- Good roleplay might give **advantage** on social checks
- Poor arguments might give **disadvantage**
- The DM sets DCs based on how reasonable your request is
- Some things can't be achieved with any roll (convince the king to give you his crown)
    `.trim(),
    examples: [
      {
        title: 'Persuasion Check',
        description: 'The party tries to convince a guard to let them into the castle after hours.',
        diceNotation: 'Persuasion check vs DM-set DC (maybe DC 15 for "unusual but possible")',
        result: 'Success might mean the guard looks the other way. Failure might mean they need another approach.',
      },
      {
        title: 'Deception vs Insight',
        description: 'A rogue lies about being a messenger. The merchant is suspicious.',
        diceNotation: 'Deception check vs Merchant\'s Insight check',
        result: 'If Deception wins, the merchant is fooled. If Insight wins, the merchant senses something is off.',
      },
      {
        title: 'Gathering Information',
        description: 'The bard spends an evening at the tavern asking about local rumors.',
        result: 'DM might call for Persuasion, Performance, or just roleplay. Buying drinks might give advantage!',
      },
    ],
    tables: [
      {
        caption: 'Typical Social DCs',
        headers: ['Request', 'DC'],
        rows: [
          ['Simple favor from friendly NPC', 'DC 10'],
          ['Reasonable request from indifferent NPC', 'DC 15'],
          ['Difficult request or suspicious NPC', 'DC 20'],
          ['Very unusual request or hostile NPC', 'DC 25+'],
        ],
      },
    ],
    relatedRules: ['skills-overview'],
    relatedConditions: ['charmed', 'frightened'],
    tags: ['social', 'roleplay', 'persuasion', 'deception', 'intimidation', 'NPC'],
    keywords: ['persuasion', 'deception', 'intimidation', 'insight', 'social skills', 'NPC', 'roleplay'],
    source: 'SRD',
    pageReference: 'PHB p.185',
    tips: [
      'Roleplay your approach before rolling - it can affect the DC or give advantage.',
      'Intimidation gets results but makes enemies.',
      'Not every social situation needs a roll - sometimes the DM will just respond.',
    ],
  },
]
