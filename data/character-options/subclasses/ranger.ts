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
]
