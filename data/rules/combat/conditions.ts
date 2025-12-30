/**
 * Conditions Rules
 * Links to existing condition definitions in lib/engine/combat/conditions.ts
 */

import type { RuleEntry } from '@/types/rules'

export const CONDITIONS_RULES: RuleEntry[] = [
  {
    id: 'conditions-overview',
    name: 'Conditions',
    slug: 'conditions',
    category: 'combat',
    subcategory: 'conditions',
    summary:
      'Conditions alter your capabilities and can be caused by spells, attacks, or other effects. They last until countered or their duration expires.',
    description: `
## Conditions Overview

Conditions alter a creature's capabilities in various ways. They arise from spells, class features, monster attacks, or other effects.

Most conditions are impairments, but some (like invisible) can be advantageous.

### How Conditions Work
- Multiple instances of the same condition **don't stack**
- A condition lasts until countered or its duration expires
- If multiple effects impose the same condition, each has its own duration

### Ending Conditions
Common ways to end conditions:
- **Time**: The duration expires
- **Saving throw**: Some conditions allow saves at the end of each turn
- **Spells**: Lesser Restoration removes many conditions
- **Special abilities**: Lay on Hands, medicine checks, etc.
    `.trim(),
    tables: [
      {
        caption: 'All D&D 5e Conditions',
        headers: ['Condition', 'Key Effect'],
        rows: [
          ['Blinded', "Can't see, auto-fail sight checks, disadvantage on attacks"],
          ['Charmed', "Can't attack charmer, charmer has advantage on social checks"],
          ['Deafened', "Can't hear, auto-fail hearing checks"],
          ['Exhaustion', '6 levels of increasing penalties (level 6 = death)'],
          ['Frightened', 'Disadvantage while source visible, can\'t approach source'],
          ['Grappled', 'Speed becomes 0'],
          ['Incapacitated', "Can't take actions or reactions"],
          ['Invisible', 'Advantage on attacks, attacks against have disadvantage'],
          ['Paralyzed', "Can't move/act, auto-fail STR/DEX saves, attacks are crits"],
          ['Petrified', 'Turned to stone, immune to poison/disease'],
          ['Poisoned', 'Disadvantage on attacks and ability checks'],
          ['Prone', 'Melee attacks against have advantage, ranged have disadvantage'],
          ['Restrained', 'Speed 0, disadvantage on attacks and DEX saves'],
          ['Stunned', "Can't move/act, auto-fail STR/DEX saves"],
          ['Unconscious', 'Drop items, fall prone, attacks are crits'],
        ],
      },
    ],
    relatedRules: ['exhaustion', 'death-saves'],
    tags: ['conditions', 'status', 'debuff', 'effect'],
    keywords: ['condition', 'status effect', 'debuff'],
    source: 'SRD',
    pageReference: 'PHB p.290-292',
  },
  {
    id: 'blinded',
    name: 'Blinded',
    slug: 'blinded',
    category: 'combat',
    subcategory: 'conditions',
    summary:
      "A blinded creature can't see and automatically fails ability checks that require sight.",
    description: `
## Blinded

A blinded creature can't see.

### Effects
- **Auto-fail** any ability check that requires sight
- **Disadvantage** on attack rolls
- Attack rolls **against** the creature have **advantage**

### Common Causes
- Blindness/Deafness spell
- Color Spray spell
- Darkness spell (if you can't see through magical darkness)
- Being in heavy fog, smoke, or complete darkness
- Blinding Smite
- Some monster abilities

### Counters
- Greater Restoration
- Heal spell
- Lesser Restoration removes the Blinded condition from Blindness/Deafness
- Light sources (for mundane darkness)
- Dispel Magic (for magical blindness)
    `.trim(),
    relatedSpells: ['blindness-deafness', 'color-spray', 'darkness', 'lesser-restoration'],
    relatedConditions: ['invisible'],
    tags: ['blinded', 'condition', 'vision', 'disadvantage'],
    keywords: ['blind', 'cannot see', "can't see"],
    source: 'SRD',
    pageReference: 'PHB p.290',
  },
  {
    id: 'charmed',
    name: 'Charmed',
    slug: 'charmed',
    category: 'combat',
    subcategory: 'conditions',
    summary:
      "A charmed creature can't attack or target the charmer with harmful abilities. The charmer has advantage on social checks.",
    description: `
## Charmed

A charmed creature is magically influenced by another creature.

### Effects
- **Can't attack** the charmer
- **Can't target** the charmer with harmful abilities or magical effects
- The charmer has **advantage** on ability checks to interact socially with the creature

### Important Notes
- Charmed does NOT make the creature your ally
- The creature can still attack your allies
- It doesn't force the creature to follow commands
- The creature might realize it was charmed when the effect ends

### Common Causes
- Charm Person spell
- Hypnotic Pattern spell
- Suggestion spell (sometimes)
- Vampire charm
- Succubus/Incubus charm

### Counters
- The effect often ends if the charmer damages the creature
- Calm Emotions can suppress charmed
- Greater Restoration
- Some creatures are immune to charmed
    `.trim(),
    relatedSpells: ['charm-person', 'hypnotic-pattern', 'suggestion', 'calm-emotions'],
    relatedConditions: ['frightened'],
    tags: ['charmed', 'condition', 'social', 'mind control'],
    keywords: ['charm', 'charmed', 'mind control', "can't attack"],
    source: 'SRD',
    pageReference: 'PHB p.290',
    commonMistakes: [
      "Charmed doesn't mean the target obeys you - they just won't attack you",
      "The target's allies can still attack you freely",
      "Charm Person specifies it ends if you or allies harm the target",
    ],
  },
  {
    id: 'frightened',
    name: 'Frightened',
    slug: 'frightened',
    category: 'combat',
    subcategory: 'conditions',
    summary:
      'A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight.',
    description: `
## Frightened

A frightened creature is terrified of something.

### Effects
- **Disadvantage** on ability checks while the source of fear is within line of sight
- **Disadvantage** on attack rolls while the source of fear is within line of sight
- **Can't willingly move closer** to the source of fear

### Key Point
The penalties only apply while you can **see** the source. If you look away or the source moves out of sight, you can act normally (but still can't willingly approach).

### Common Causes
- Cause Fear spell
- Fear spell
- Frightful Presence (dragons, some monsters)
- Wraith's Life Drain (on failed save)
- Conquest Paladin's Aura

### Counters
- Calm Emotions can suppress the condition
- Heroes' Feast grants immunity
- Greater Restoration
- Breaking line of sight helps temporarily
    `.trim(),
    relatedSpells: ['cause-fear', 'fear', 'calm-emotions', 'heroes-feast'],
    relatedConditions: ['charmed'],
    tags: ['frightened', 'condition', 'fear', 'disadvantage'],
    keywords: ['frightened', 'scared', 'fear', "can't approach"],
    source: 'SRD',
    pageReference: 'PHB p.290',
    tips: [
      "Turn away from the source to remove disadvantage, but you still can't approach.",
      "Berserker barbarians are immune to frightened while raging.",
      "Devotion paladins' aura grants immunity to frightened at level 10.",
    ],
  },
  {
    id: 'grappled',
    name: 'Grappled',
    slug: 'grappled',
    category: 'combat',
    subcategory: 'conditions',
    summary: "A grappled creature's speed becomes 0, and it can't benefit from any bonus to speed.",
    description: `
## Grappled

A grappled creature is held by another creature.

### Effects
- **Speed becomes 0**
- **Can't benefit from any bonus to speed**

### Ending the Grapple
- The grappler releases you (no action required)
- You use your action to escape (Athletics or Acrobatics vs grappler's Athletics)
- An effect moves you out of the grappler's reach (Thunderwave, etc.)
- The grappler becomes incapacitated
- You teleport

### Grappling Rules
To initiate a grapple:
1. Use the Attack action to make a grapple attempt (replaces one attack)
2. Target must be no more than one size larger than you
3. You must have a free hand
4. Contest: Your Athletics vs target's Athletics or Acrobatics (their choice)
5. If you win, target is grappled

### Moving a Grappled Creature
When you move, you can drag the grappled creature with you at half speed.
    `.trim(),
    relatedRules: ['actions-overview', 'movement'],
    relatedConditions: ['restrained'],
    tags: ['grappled', 'condition', 'movement', 'speed'],
    keywords: ['grapple', 'grabbed', 'held', "can't move"],
    source: 'SRD',
    pageReference: 'PHB p.290',
    tips: [
      'Grappling is great for keeping enemies in place for your allies to hit.',
      'Shoving a grappled creature prone is a classic combo - they have speed 0 and can\'t stand up.',
      'Grappling doesn\'t give disadvantage on attacks - you can still fight normally while grappled.',
    ],
  },
  {
    id: 'incapacitated',
    name: 'Incapacitated',
    slug: 'incapacitated',
    category: 'combat',
    subcategory: 'conditions',
    summary: "An incapacitated creature can't take actions or reactions.",
    description: `
## Incapacitated

An incapacitated creature cannot act.

### Effects
- **Can't take actions**
- **Can't take reactions**

### Important Notes
- You **can still move** unless another effect prevents it
- You can still concentrate on spells (unless unconscious)
- This is a "base" condition that other conditions build upon

### Conditions That Include Incapacitated
- Paralyzed
- Petrified
- Stunned
- Unconscious

These conditions have "incapacitated" as part of their effects, plus additional penalties.

### Common Causes
- Tasha's Hideous Laughter (while laughing)
- Hypnotic Pattern
- Banishment (while on another plane)
- Being reduced to 0 hit points
    `.trim(),
    relatedConditions: ['paralyzed', 'petrified', 'stunned', 'unconscious'],
    tags: ['incapacitated', 'condition', 'actions', 'reactions'],
    keywords: ['incapacitated', "can't act", 'no actions'],
    source: 'SRD',
    pageReference: 'PHB p.290',
  },
  {
    id: 'paralyzed',
    name: 'Paralyzed',
    slug: 'paralyzed',
    category: 'combat',
    subcategory: 'conditions',
    summary: "A paralyzed creature is incapacitated, can't move or speak, and attacks within 5 feet are automatic critical hits.",
    description: `
## Paralyzed

A paralyzed creature is completely immobilized.

### Effects
- **Incapacitated** (can't take actions or reactions)
- **Can't move or speak**
- **Automatically fails** Strength and Dexterity saving throws
- Attack rolls against have **advantage**
- Attacks from within **5 feet** are **automatic critical hits**

### Common Causes
- Hold Person spell
- Hold Monster spell
- Ghoul's Claws
- Lich's Paralyzing Touch
- Some poisons

### Counters
- Greater Restoration
- The creature often gets a saving throw at the end of each turn
- Lesser Restoration for some paralysis effects
    `.trim(),
    relatedSpells: ['hold-person', 'hold-monster', 'greater-restoration'],
    relatedConditions: ['incapacitated', 'stunned'],
    tags: ['paralyzed', 'condition', 'critical hit', 'auto-fail'],
    keywords: ['paralyzed', "can't move", 'held', 'frozen'],
    source: 'SRD',
    pageReference: 'PHB p.291',
    tips: [
      'Hold Person on a target surrounded by melee attackers is devastating - all hits are crits!',
      'Since you auto-fail DEX saves, area spells like Fireball deal full damage.',
      "Elves have advantage on saves against paralysis from Hold Person (it's a charm effect).",
    ],
  },
  {
    id: 'poisoned',
    name: 'Poisoned',
    slug: 'poisoned',
    category: 'combat',
    subcategory: 'conditions',
    summary: 'A poisoned creature has disadvantage on attack rolls and ability checks.',
    description: `
## Poisoned

A poisoned creature is suffering from toxins.

### Effects
- **Disadvantage** on attack rolls
- **Disadvantage** on ability checks

### Common Causes
- Poison damage from monsters
- Poisoned weapons
- Poison spray cantrip
- Ray of Sickness spell
- Ingested poisons
- Stinking Cloud spell

### Counters
- Protection from Poison spell (immunity for 1 hour)
- Lesser Restoration
- Lay on Hands (5 points to cure poison)
- Time (many poisons wear off)
- Dwarves have advantage on saves against poison

### Immunity
Many creature types are immune to the poisoned condition:
- Constructs
- Undead
- Elementals
- Many fiends
    `.trim(),
    relatedSpells: ['poison-spray', 'ray-of-sickness', 'protection-from-poison', 'lesser-restoration'],
    tags: ['poisoned', 'condition', 'disadvantage', 'toxin'],
    keywords: ['poisoned', 'poison', 'toxin', 'venom'],
    source: 'SRD',
    pageReference: 'PHB p.292',
    tips: [
      'Dwarves and stout halflings have advantage on saving throws against poison.',
      "Many low-CR creatures rely on poison - Monks' Purity of Body (level 10) makes them immune.",
      'Yuan-ti are immune to poison, making them excellent against poison-heavy enemies.',
    ],
  },
  {
    id: 'prone',
    name: 'Prone',
    slug: 'prone',
    category: 'combat',
    subcategory: 'conditions',
    summary: "A prone creature's only movement option is to crawl. Melee attacks against it have advantage, ranged attacks have disadvantage.",
    description: `
## Prone

A prone creature is lying on the ground.

### Effects
- Only movement option is to **crawl** (every foot costs an extra foot)
- **Disadvantage** on attack rolls
- Melee attacks against the creature have **advantage**
- Ranged attacks against the creature have **disadvantage**

### Standing Up
Standing up costs movement equal to **half your speed**.
- If your speed is 30 feet, standing costs 15 feet of movement
- If you have 0 speed, you can't stand up

### Becoming Prone
- Voluntarily drop prone (no action/movement cost)
- Knocked prone by an effect (shove, Thunderwave, etc.)
- Reduced to 0 hit points by a non-lethal attack
- Falling unconscious

### Common Uses
- Drop prone for cover against ranged attacks
- Shove enemies prone for melee advantage
- Prone + Grappled combo (can't stand up with 0 speed)
    `.trim(),
    relatedRules: ['movement', 'grappled'],
    tags: ['prone', 'condition', 'movement', 'advantage', 'disadvantage'],
    keywords: ['prone', 'knocked down', 'lying down', 'on the ground'],
    source: 'SRD',
    pageReference: 'PHB p.292',
    tips: [
      'Shoving an enemy prone then grappling them is brutal - they can\'t stand up.',
      'Drop prone to give ranged attackers disadvantage against you.',
      "A creature with a climb or fly speed can't stand up if they're hovering or climbing.",
    ],
  },
  {
    id: 'stunned',
    name: 'Stunned',
    slug: 'stunned',
    category: 'combat',
    subcategory: 'conditions',
    summary: "A stunned creature is incapacitated, can't move, and can speak only falteringly. Attacks against it have advantage.",
    description: `
## Stunned

A stunned creature is dazed and can barely respond.

### Effects
- **Incapacitated** (can't take actions or reactions)
- **Can't move**
- Can speak only **falteringly**
- **Automatically fails** Strength and Dexterity saving throws
- Attack rolls against have **advantage**

### Difference from Paralyzed
Stunned is similar to paralyzed but:
- You can speak (falteringly)
- Attacks are NOT automatic crits (just have advantage)

### Common Causes
- Stunning Strike (Monk feature)
- Power Word Stun
- Contagion (Slimy Doom)
- Some monster abilities

### Counters
- Usually ends at the end of the target's turn or after a save
- Greater Restoration
- Power Word Stun ends when the target regains HP
    `.trim(),
    relatedConditions: ['incapacitated', 'paralyzed'],
    tags: ['stunned', 'condition', 'monk', 'advantage'],
    keywords: ['stunned', 'dazed', 'stunning strike'],
    source: 'SRD',
    pageReference: 'PHB p.292',
    tips: [
      'Monks with Stunning Strike can lock down key enemies.',
      'Constitution save for Stunning Strike - targets with high CON resist well.',
      "Unlike paralyzed, attacks aren't auto-crits, but you still get advantage.",
    ],
  },
  {
    id: 'unconscious',
    name: 'Unconscious',
    slug: 'unconscious',
    category: 'combat',
    subcategory: 'conditions',
    summary: "An unconscious creature is incapacitated, can't move or speak, is unaware of surroundings, and attacks within 5 feet are automatic critical hits.",
    description: `
## Unconscious

An unconscious creature is completely unaware and helpless.

### Effects
- **Incapacitated** (can't take actions or reactions)
- **Can't move or speak**
- **Unaware** of surroundings
- **Drops whatever it's holding** and **falls prone**
- **Automatically fails** Strength and Dexterity saving throws
- Attack rolls against have **advantage**
- Attacks from within **5 feet** are **automatic critical hits**

### Common Causes
- Reduced to 0 hit points (you fall unconscious)
- Sleep spell
- Eyebite (asleep option)
- Symbol (sleep option)
- Poisons and drugs

### Special Rules at 0 HP
When you're unconscious at 0 HP:
- You must make death saving throws at the start of each turn
- Taking damage causes a death save failure (2 failures if critical hit)
- Healing brings you back to consciousness with that many HP
    `.trim(),
    relatedRules: ['death-saves'],
    relatedSpells: ['sleep', 'eyebite'],
    relatedConditions: ['incapacitated', 'prone'],
    tags: ['unconscious', 'condition', 'death', '0 hp', 'critical hit'],
    keywords: ['unconscious', 'knocked out', 'asleep', '0 hp'],
    source: 'SRD',
    pageReference: 'PHB p.292',
    tips: [
      "Healing Word can bring back an unconscious ally from across the battlefield.",
      "Stabilizing an unconscious creature stops death saves but doesn't wake them up.",
      "The Sleep spell doesn't require a save - it just works based on HP.",
    ],
  },
  {
    id: 'exhaustion',
    name: 'Exhaustion',
    slug: 'exhaustion',
    category: 'combat',
    subcategory: 'conditions',
    summary: 'Exhaustion has 6 levels. Effects are cumulative. Level 6 causes death.',
    description: `
## Exhaustion

Exhaustion is a special condition measured in six levels. Effects are cumulative.

### Exhaustion Levels

| Level | Effect |
|-------|--------|
| 1 | Disadvantage on ability checks |
| 2 | Speed halved |
| 3 | Disadvantage on attack rolls and saving throws |
| 4 | Hit point maximum halved |
| 5 | Speed reduced to 0 |
| 6 | **Death** |

### Gaining Exhaustion
- Going without long rest (1 level per day after first)
- Starvation or dehydration
- Extreme heat or cold
- Berserker barbarian's Frenzy (1 level after raging)
- Some spells and effects (Sickening Radiance, etc.)

### Removing Exhaustion
- **Long rest**: Remove 1 level (requires food and drink)
- **Greater Restoration**: Remove 1 level
- **Potion of Vitality**: Remove all exhaustion

### Important
Unlike other conditions, exhaustion levels **stack**. Each source adds to your total.
    `.trim(),
    tables: [
      {
        caption: 'Exhaustion Levels',
        headers: ['Level', 'Effect'],
        rows: [
          ['1', 'Disadvantage on ability checks'],
          ['2', 'Speed halved'],
          ['3', 'Disadvantage on attack rolls and saving throws'],
          ['4', 'Hit point maximum halved'],
          ['5', 'Speed reduced to 0'],
          ['6', 'Death'],
        ],
        footnotes: ['Effects are cumulative. At level 3, you have all effects from levels 1-3.'],
      },
    ],
    relatedSpells: ['greater-restoration'],
    tags: ['exhaustion', 'condition', 'death', 'levels', 'stacking'],
    keywords: ['exhaustion', 'exhausted', 'tired', 'fatigue'],
    source: 'SRD',
    pageReference: 'PHB p.291',
    tips: [
      "Berserker barbarians get exhaustion after frenzying - have a plan to rest!",
      'Exhaustion is one of the hardest conditions to remove quickly.',
      'Greater Restoration only removes ONE level per casting.',
    ],
    commonMistakes: [
      'Forgetting that effects are cumulative (level 3 includes level 1 and 2 effects)',
      'Thinking a long rest removes all exhaustion (it only removes 1 level)',
    ],
  },
]
