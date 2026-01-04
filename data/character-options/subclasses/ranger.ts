import type { Subclass } from './types'

export const RANGER_SUBCLASSES: Subclass[] = [
  {
    id: 'hunter',
    name: 'Hunter',
    className: 'Ranger',
    description:
      'Emulating the Hunter archetype means accepting your place as a bulwark between civilization and the terrors of the wilderness. As you walk the Hunter\'s path, you learn specialized techniques for fighting the threats you face.',
    features: [
      {
        level: 3,
        name: "Hunter's Prey",
        description:
          'You gain one of the following features of your choice: Colossus Slayer (once per turn, deal extra 1d8 damage to a creature below its hit point maximum), Giant Killer (reaction attack when Large or larger creature within 5 feet attacks you), or Horde Breaker (make an additional attack against a different creature within 5 feet of your original target).',
      },
      {
        level: 7,
        name: 'Defensive Tactics',
        description:
          'You gain one of the following features of your choice: Escape the Horde (opportunity attacks against you are made with disadvantage), Multiattack Defense (gain +4 AC against subsequent attacks from a creature that hits you), or Steel Will (advantage on saving throws against being frightened).',
      },
      {
        level: 11,
        name: 'Multiattack',
        description:
          'You gain one of the following features of your choice: Volley (use your action to make a ranged attack against any number of creatures within 10 feet of a point you can see within your weapon\'s range, using ammunition for each target), or Whirlwind Attack (use your action to make a melee attack against any number of creatures within 5 feet of you, with a separate attack roll for each target).',
      },
      {
        level: 15,
        name: 'Superior Hunter\'s Defense',
        description:
          'You gain one of the following features of your choice: Evasion (Dexterity saves for half damage become no damage on success, half on fail), Stand Against the Tide (when a creature misses you with a melee attack, you can force it to repeat the attack against another creature), or Uncanny Dodge (use reaction to halve the damage from an attack that hits you).',
      },
    ],
    source: 'SRD',
  },
  {
    id: 'beast-master',
    name: 'Beast Master',
    className: 'Ranger',
    description:
      'The Beast Master archetype embodies a friendship between the civilized races and the beasts of the world. United in focus, beast and ranger work as one to fight the monstrous foes that threaten civilization and the wilderness alike.',
    features: [
      {
        level: 3,
        name: "Ranger's Companion",
        description:
          'You gain a beast companion that accompanies you on your adventures and is trained to fight alongside you. Choose a beast that is no larger than Medium and that has a challenge rating of 1/4 or lower. The beast obeys your commands as best as it can. It takes its turn on your initiative. On your turn, you can verbally command the beast where to move (no action required). You can use your action to verbally command it to take the Attack, Dash, Disengage, Dodge, or Help action.',
      },
      {
        level: 7,
        name: 'Exceptional Training',
        description:
          "On any of your turns when your beast companion doesn't attack, you can use a bonus action to command the beast to take the Dash, Disengage, or Help action on its turn. In addition, the beast's attacks now count as magical for the purpose of overcoming resistance and immunity to nonmagical attacks and damage.",
      },
      {
        level: 11,
        name: 'Bestial Fury',
        description:
          'Your beast companion can make two attacks when you command it to use the Attack action.',
      },
      {
        level: 15,
        name: 'Share Spells',
        description:
          'Beginning at 15th level, when you cast a spell targeting yourself, you can also affect your beast companion with the spell if the beast is within 30 feet of you.',
      },
    ],
    source: 'PHB',
  },
]
