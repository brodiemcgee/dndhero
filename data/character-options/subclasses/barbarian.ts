import type { Subclass } from './types'

export const BARBARIAN_SUBCLASSES: Subclass[] = [
  {
    id: 'path-of-the-berserker',
    name: 'Path of the Berserker',
    className: 'Barbarian',
    description:
      'For some barbarians, rage is a means to an end—that end being violence. The Path of the Berserker is a path of untrammeled fury, slick with blood.',
    features: [
      {
        level: 3,
        name: 'Frenzy',
        description:
          'You can go into a frenzy when you rage. If you do so, for the duration of your rage you can make a single melee weapon attack as a bonus action on each of your turns after this one. When your rage ends, you suffer one level of exhaustion.',
      },
      {
        level: 6,
        name: 'Mindless Rage',
        description:
          "You can't be charmed or frightened while raging. If you are charmed or frightened when you enter your rage, the effect is suspended for the duration of the rage.",
      },
      {
        level: 10,
        name: 'Intimidating Presence',
        description:
          'You can use your action to frighten someone with your menacing presence. When you do so, choose one creature that you can see within 30 feet of you. If the creature can see or hear you, it must succeed on a Wisdom saving throw (DC equal to 8 + your proficiency bonus + your Charisma modifier) or be frightened of you until the end of your next turn.',
      },
      {
        level: 14,
        name: 'Retaliation',
        description:
          'When you take damage from a creature that is within 5 feet of you, you can use your reaction to make a melee weapon attack against that creature.',
      },
    ],
    source: 'SRD',
  },
]
