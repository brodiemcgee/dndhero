import type { Subclass } from './types'

export const CLERIC_SUBCLASSES: Subclass[] = [
  {
    id: 'life-domain',
    name: 'Life Domain',
    className: 'Cleric',
    description:
      'The Life domain focuses on the vibrant positive energy that sustains all life. Gods of life promote vitality and health through healing the sick and wounded, caring for those in need, and driving away the forces of death and undeath.',
    features: [
      {
        level: 1,
        name: 'Bonus Proficiency',
        description:
          'When you choose this domain at 1st level, you gain proficiency with heavy armor.',
      },
      {
        level: 1,
        name: 'Disciple of Life',
        description:
          'Your healing spells are more effective. Whenever you use a spell of 1st level or higher to restore hit points to a creature, the creature regains additional hit points equal to 2 + the spell\'s level.',
      },
      {
        level: 2,
        name: 'Channel Divinity: Preserve Life',
        description:
          'You can use your Channel Divinity to heal the badly injured. As an action, you present your holy symbol and evoke healing energy that can restore a number of hit points equal to five times your cleric level. Choose any creatures within 30 feet of you, and divide those hit points among them. This feature can restore a creature to no more than half of its hit point maximum.',
      },
      {
        level: 6,
        name: 'Blessed Healer',
        description:
          'The healing spells you cast on others heal you as well. When you cast a spell of 1st level or higher that restores hit points to a creature other than you, you regain hit points equal to 2 + the spell\'s level.',
      },
      {
        level: 8,
        name: 'Divine Strike',
        description:
          'You gain the ability to infuse your weapon strikes with divine energy. Once on each of your turns when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 radiant damage to the target. When you reach 14th level, the extra damage increases to 2d8.',
      },
      {
        level: 17,
        name: 'Supreme Healing',
        description:
          'When you would normally roll one or more dice to restore hit points with a spell, you instead use the highest number possible for each die. For example, instead of restoring 2d6 hit points to a creature, you restore 12.',
      },
    ],
    source: 'SRD',
  },
]
