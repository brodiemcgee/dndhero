/**
 * Actions in Combat Rules
 */

import type { RuleEntry } from '@/types/rules'

export const ACTIONS_RULES: RuleEntry[] = [
  {
    id: 'actions-overview',
    name: 'Actions in Combat',
    slug: 'actions',
    category: 'combat',
    subcategory: 'actions',
    summary:
      'On your turn, you can take one action. Common actions include Attack, Cast a Spell, Dash, Disengage, Dodge, Help, Hide, Ready, Search, and Use an Object.',
    description: `
## Actions

On your turn, you can take **one action**. The most common actions are listed below.

### Attack
Make one melee or ranged attack. Some features let you attack multiple times with this action.

### Cast a Spell
Cast a spell with a casting time of 1 action. See the spell's description for details.

### Dash
Gain extra movement equal to your speed for this turn. If your speed is 30 feet, you can move up to 60 feet on your turn if you Dash.

### Disengage
Your movement doesn't provoke opportunity attacks for the rest of the turn.

### Dodge
Until your next turn:
- Attack rolls against you have **disadvantage** (if you can see the attacker)
- You make Dexterity saving throws with **advantage**

You lose this benefit if you're incapacitated or your speed drops to 0.

### Help
Help an ally with a task. The next ability check they make has **advantage** (if made before your next turn). Or, help attack a creature within 5 feet - the next attack against it has advantage.

### Hide
Make a Dexterity (Stealth) check to hide. You must be out of sight. If you succeed, you gain the benefits of being unseen.

### Ready
Prepare to act later. Specify a trigger and an action. When the trigger occurs, you can use your **reaction** to perform the action. Readied spells require concentration.

### Search
Make a Wisdom (Perception) or Intelligence (Investigation) check to find something.

### Use an Object
Interact with a second object (first is free). Examples: drink a potion, pull a lever, open a door.
    `.trim(),
    examples: [
      {
        title: 'Dash Action',
        description: 'A rogue with 30 ft speed needs to reach a distant enemy.',
        result:
          'Move 30 ft, then use Dash action for another 30 ft. Total: 60 ft of movement.',
      },
      {
        title: 'Ready Action',
        description: "A wizard readies a spell: 'When the enemy comes through the door, I cast Fireball.'",
        result:
          'The wizard uses concentration to hold the spell. When triggered, uses reaction to cast it.',
      },
    ],
    tables: [
      {
        caption: 'Action Summary',
        headers: ['Action', 'Effect'],
        rows: [
          ['Attack', 'Make one weapon attack (or more with Extra Attack)'],
          ['Cast a Spell', 'Cast a spell with casting time of 1 action'],
          ['Dash', 'Double your movement for the turn'],
          ['Disengage', "Your movement doesn't provoke opportunity attacks"],
          ['Dodge', 'Attacks against you have disadvantage, DEX saves have advantage'],
          ['Help', 'Give an ally advantage on their next check or attack'],
          ['Hide', 'Make a Stealth check to become hidden'],
          ['Ready', 'Prepare an action to trigger later (uses reaction)'],
          ['Search', 'Make Perception or Investigation check'],
          ['Use an Object', 'Interact with a second object'],
        ],
      },
    ],
    relatedRules: ['attack-rolls', 'bonus-actions', 'reactions', 'movement'],
    tags: ['action', 'combat', 'attack', 'dash', 'disengage', 'dodge', 'help', 'hide', 'ready'],
    keywords: ['what can I do', 'combat actions', 'my turn'],
    source: 'SRD',
    pageReference: 'PHB p.192-193',
    tips: [
      'Rogues can Dash, Disengage, or Hide as a bonus action (Cunning Action).',
      'Monks can Dash, Disengage, or Dodge as a bonus action (Step of the Wind/Patient Defense).',
      'You can split your movement around your action (move, attack, move more).',
    ],
  },
  {
    id: 'bonus-actions',
    name: 'Bonus Actions',
    slug: 'bonus-actions',
    category: 'combat',
    subcategory: 'actions',
    summary:
      'A bonus action is a special action granted by class features, spells, or abilities. You can only take one bonus action per turn.',
    description: `
## Bonus Actions

A bonus action is only available when a special ability, spell, or feature says you can do something as a bonus action.

### Rules
- You can only take **one bonus action** per turn
- You choose **when** to take it during your turn (unless timing is specified)
- Anything that prevents you from taking actions also prevents bonus actions

### Common Bonus Actions

**Class Features:**
- **Rogue's Cunning Action**: Dash, Disengage, or Hide
- **Monk's Martial Arts**: Unarmed strike after attacking
- **Two-Weapon Fighting**: Attack with off-hand weapon

**Spells:**
- Healing Word
- Misty Step
- Spiritual Weapon (attack)
- Hex
- Hunter's Mark

### Important Notes
- If you cast a spell as a bonus action, you can only cast a **cantrip** with your action (not another leveled spell)
- Bonus actions can't be used in place of regular actions
    `.trim(),
    examples: [
      {
        title: 'Two-Weapon Fighting',
        description: 'A ranger holding two shortswords attacks with the Attack action.',
        result:
          'Attack with main hand, then use bonus action to attack with off-hand (no ability modifier to damage unless negative).',
      },
      {
        title: 'Bonus Action Spell Restriction',
        description: "A cleric wants to cast Healing Word (bonus action) and Cure Wounds (action) in the same turn.",
        result:
          "Can't do both. If you cast a bonus action spell, you can only cast a cantrip with your action.",
      },
    ],
    relatedRules: ['actions-overview', 'two-weapon-fighting'],
    relatedSpells: ['healing-word', 'misty-step', 'spiritual-weapon', 'hex', 'hunters-mark'],
    tags: ['bonus action', 'combat', 'off-hand', 'two-weapon'],
    keywords: ['bonus action', 'extra action', 'second action'],
    source: 'SRD',
    pageReference: 'PHB p.189',
  },
  {
    id: 'reactions',
    name: 'Reactions',
    slug: 'reactions',
    category: 'combat',
    subcategory: 'actions',
    summary:
      'A reaction is an instant response to a trigger. You get one reaction per round, which refreshes at the start of your turn.',
    description: `
## Reactions

A reaction is an instant response to a trigger of some kind, which can occur on your turn or someone else's.

### Rules
- You get **one reaction per round**
- Your reaction refreshes at the **start of your turn**
- A reaction must have a specific **trigger**

### Opportunity Attacks

The most common reaction. When a hostile creature you can see moves out of your reach:
1. You can use your reaction to make **one melee attack**
2. The attack occurs **before** the creature leaves your reach
3. The attack uses your normal attack bonus

**Avoiding Opportunity Attacks:**
- Take the **Disengage** action
- Teleport (doesn't provoke)
- Someone moves you without using your movement (shove, grapple pull)

### Other Common Reactions
- **Shield** spell: +5 AC until start of next turn
- **Counterspell**: Attempt to stop a spell being cast
- **Hellish Rebuke**: Damage a creature that just damaged you
- **Ready action**: Use your readied action when triggered
    `.trim(),
    examples: [
      {
        title: 'Opportunity Attack',
        description: 'A goblin tries to run past the fighter to reach the wizard.',
        result:
          'The fighter uses their reaction to make an opportunity attack against the goblin as it leaves their reach.',
      },
      {
        title: 'Shield Spell',
        description: "An arrow is about to hit the wizard (attack roll of 17, wizard's AC is 13).",
        result:
          'Wizard casts Shield as a reaction, raising AC to 18 until the start of their next turn. The arrow misses.',
      },
    ],
    tables: [
      {
        caption: 'Common Reactions',
        headers: ['Reaction', 'Trigger', 'Effect'],
        rows: [
          ['Opportunity Attack', 'Enemy leaves your reach', 'One melee attack'],
          ['Shield (spell)', 'You are hit by an attack', '+5 AC until next turn'],
          ['Counterspell', 'Creature casts a spell within 60 ft', 'Attempt to stop the spell'],
          ['Absorb Elements', 'You take elemental damage', 'Resistance + extra damage next hit'],
          ['Hellish Rebuke', 'You are damaged by a creature', 'Deal fire damage to them'],
        ],
      },
    ],
    relatedRules: ['actions-overview', 'opportunity-attacks'],
    relatedSpells: ['shield', 'counterspell', 'absorb-elements', 'hellish-rebuke'],
    tags: ['reaction', 'combat', 'opportunity attack', 'shield', 'counterspell'],
    keywords: ['reaction', 'opportunity attack', 'AoO'],
    source: 'SRD',
    pageReference: 'PHB p.190',
    tips: [
      'You can only take one reaction per round, so choose wisely.',
      'If you use your reaction before your turn, you recover it at the start of your next turn.',
      "Some monsters have special reactions like Parry or the dragon's Wing Attack.",
    ],
  },
]
