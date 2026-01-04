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
  {
    id: 'path-of-the-totem-warrior',
    name: 'Path of the Totem Warrior',
    className: 'Barbarian',
    description:
      'The Path of the Totem Warrior is a spiritual journey, as the barbarian accepts a spirit animal as guide, protector, and inspiration. In battle, your totem spirit fills you with supernatural might, adding magical fuel to your barbarian rage.',
    features: [
      {
        level: 3,
        name: 'Spirit Seeker',
        description:
          'Yours is a path that seeks attunement with the natural world, giving you a kinship with beasts. You gain the ability to cast the Beast Sense and Speak with Animals spells, but only as rituals.',
      },
      {
        level: 3,
        name: 'Totem Spirit',
        description:
          'You choose a totem spirit and gain its feature. You must make or acquire a physical totem object that incorporates fur or feathers, claws, teeth, or bones of the totem animal.\n\nBear: While raging, you have resistance to all damage except psychic damage. The spirit of the bear makes you tough enough to stand up to any punishment.\n\nEagle: While raging and not wearing heavy armor, other creatures have disadvantage on opportunity attack rolls against you, and you can use the Dash action as a bonus action on your turn. The spirit of the eagle makes you into a predator who can weave through the fray with ease.\n\nWolf: While raging, your friends have advantage on melee attack rolls against any creature within 5 feet of you that is hostile to you. The spirit of the wolf makes you a leader of hunters.',
      },
      {
        level: 6,
        name: 'Aspect of the Beast',
        description:
          'You gain a magical benefit based on the totem animal of your choice. You can choose the same animal you selected at 3rd level or a different one.\n\nBear: You gain the might of a bear. Your carrying capacity (including maximum load and maximum lift) is doubled, and you have advantage on Strength checks made to push, pull, lift, or break objects.\n\nEagle: You gain the eyesight of an eagle. You can see up to 1 mile away with no difficulty, able to discern even fine details as though looking at something no more than 100 feet away from you. Additionally, dim light doesn\'t impose disadvantage on your Wisdom (Perception) checks.\n\nWolf: You gain the hunting sensibilities of a wolf. You can track other creatures while traveling at a fast pace, and you can move stealthily while traveling at a normal pace.',
      },
      {
        level: 10,
        name: 'Spirit Walker',
        description:
          'You can cast the Commune with Nature spell, but only as a ritual. When you do so, a spiritual version of one of the animals you chose for Totem Spirit or Aspect of the Beast appears to you to convey the information you seek.',
      },
      {
        level: 14,
        name: 'Totemic Attunement',
        description:
          'You gain a magical benefit based on a totem animal of your choice. You can choose the same animal you selected previously or a different one.\n\nBear: While raging, any creature within 5 feet of you that is hostile to you has disadvantage on attack rolls against targets other than you or another character with this feature. An enemy is immune to this effect if it can\'t see or hear you or if it can\'t be frightened.\n\nEagle: While raging, you have a flying speed equal to your current walking speed. This benefit works only in short bursts; you fall if you end your turn in the air and nothing else is holding you aloft.\n\nWolf: While raging, you can use a bonus action on your turn to knock a Large or smaller creature prone when you hit it with a melee weapon attack.',
      },
    ],
    source: 'PHB',
  },
]
