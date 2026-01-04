import type { Subclass } from './types'

export const ROGUE_SUBCLASSES: Subclass[] = [
  {
    id: 'thief',
    name: 'Thief',
    className: 'Rogue',
    description:
      'You hone your skills in the larcenous arts. Burglars, bandits, cutpurses, and other criminals typically follow this archetype, but so do rogues who prefer to think of themselves as professional treasure seekers or dungeon delvers.',
    features: [
      {
        level: 3,
        name: 'Fast Hands',
        description:
          'You can use the bonus action granted by your Cunning Action to make a Dexterity (Sleight of Hand) check, use your thieves\' tools to disarm a trap or open a lock, or take the Use an Object action.',
      },
      {
        level: 3,
        name: 'Second-Story Work',
        description:
          'You gain the ability to climb faster than normal; climbing no longer costs you extra movement. In addition, when you make a running jump, the distance you cover increases by a number of feet equal to your Dexterity modifier.',
      },
      {
        level: 9,
        name: 'Supreme Sneak',
        description:
          'You have advantage on a Dexterity (Stealth) check if you move no more than half your speed on the same turn.',
      },
      {
        level: 13,
        name: 'Use Magic Device',
        description:
          'You have learned enough about the workings of magic that you can improvise the use of items even when they are not intended for you. You ignore all class, race, and level requirements on the use of magic items.',
      },
      {
        level: 17,
        name: "Thief's Reflexes",
        description:
          'You have become adept at laying ambushes and quickly escaping danger. You can take two turns during the first round of any combat. You take your first turn at your normal initiative and your second turn at your initiative minus 10. You can\'t use this feature when you are surprised.',
      },
    ],
    source: 'SRD',
  },
]
