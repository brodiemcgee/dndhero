import type { Subclass } from './types'

export const MONK_SUBCLASSES: Subclass[] = [
  {
    id: 'way-of-the-open-hand',
    name: 'Way of the Open Hand',
    className: 'Monk',
    description:
      'Monks of the Way of the Open Hand are the ultimate masters of martial arts combat, whether armed or unarmed. They learn techniques to push and trip their opponents, manipulate ki to heal damage to their bodies, and practice advanced meditation.',
    features: [
      {
        level: 3,
        name: 'Open Hand Technique',
        description:
          'You can manipulate your enemy\'s ki when you harness your own. Whenever you hit a creature with one of the attacks granted by your Flurry of Blows, you can impose one of the following effects on that target: It must succeed on a Dexterity saving throw or be knocked prone. It must make a Strength saving throw. If it fails, you can push it up to 15 feet away from you. It can\'t take reactions until the end of your next turn.',
      },
      {
        level: 6,
        name: 'Wholeness of Body',
        description:
          'You gain the ability to heal yourself. As an action, you can regain hit points equal to three times your monk level. You must finish a long rest before you can use this feature again.',
      },
      {
        level: 11,
        name: 'Tranquility',
        description:
          'You can enter a special meditation that surrounds you with an aura of peace. At the end of a long rest, you gain the effect of a sanctuary spell that lasts until the start of your next long rest (the spell can end early as normal). The saving throw DC for the spell equals 8 + your Wisdom modifier + your proficiency bonus.',
      },
      {
        level: 17,
        name: 'Quivering Palm',
        description:
          'You gain the ability to set up lethal vibrations in someone\'s body. When you hit a creature with an unarmed strike, you can spend 3 ki points to start these imperceptible vibrations, which last for a number of days equal to your monk level. The vibrations are harmless unless you use your action to end them. To do so, you and the target must be on the same plane of existence. When you use this action, the creature must make a Constitution saving throw. If it fails, it is reduced to 0 hit points. If it succeeds, it takes 10d10 necrotic damage.',
      },
    ],
    source: 'SRD',
  },
  {
    id: 'way-of-shadow',
    name: 'Way of Shadow',
    className: 'Monk',
    description:
      'Monks of the Way of Shadow follow a tradition that values stealth and subterfuge. These monks might be called ninjas or shadowdancers, and they serve as spies and assassins. Sometimes the members of a ninja monastery are family members, forming a clan sworn to secrecy about their arts and missions.',
    features: [
      {
        level: 3,
        name: 'Shadow Arts',
        description:
          'You can use your ki to duplicate the effects of certain spells. As an action, you can spend 2 ki points to cast darkness, darkvision, pass without trace, or silence, without providing material components. Additionally, you gain the minor illusion cantrip if you don\'t already know it.',
      },
      {
        level: 6,
        name: 'Shadow Step',
        description:
          'You gain the ability to step from one shadow into another. When you are in dim light or darkness, as a bonus action you can teleport up to 60 feet to an unoccupied space you can see that is also in dim light or darkness. You then have advantage on the first melee attack you make before the end of the turn.',
      },
      {
        level: 11,
        name: 'Cloak of Shadows',
        description:
          'You have learned to become one with the shadows. When you are in an area of dim light or darkness, you can use your action to become invisible. You remain invisible until you make an attack, cast a spell, or are in an area of bright light.',
      },
      {
        level: 17,
        name: 'Opportunist',
        description:
          'You can exploit a creature\'s momentary distraction when it is hit by an attack. Whenever a creature within 5 feet of you is hit by an attack made by a creature other than you, you can use your reaction to make a melee attack against that creature.',
      },
    ],
    source: 'PHB',
  },
  {
    id: 'way-of-the-four-elements',
    name: 'Way of the Four Elements',
    className: 'Monk',
    description:
      'You follow a monastic tradition that teaches you to harness the elements. When you focus your ki, you can align yourself with the forces of creation and bend the four elements to your will, using them as an extension of your body.',
    features: [
      {
        level: 3,
        name: 'Disciple of the Elements',
        description:
          'You learn magical disciplines that harness the power of the four elements. You learn the Elemental Attunement discipline and one other elemental discipline of your choice. You learn one additional elemental discipline of your choice at 6th, 11th, and 17th level. Whenever you learn a new elemental discipline, you can also replace one elemental discipline that you already know with a different discipline. Casting Elemental Spells: Some elemental disciplines allow you to cast spells. To cast one of these spells, you use its casting time and other rules, but you don\'t need to provide material components for it. Once you reach 5th level in this class, you can spend additional ki points to increase the level of an elemental discipline spell that you cast, provided that the spell has an enhanced effect at a higher level.',
      },
      {
        level: 6,
        name: 'Extra Elemental Discipline',
        description:
          'You learn one additional elemental discipline of your choice. You can also replace one elemental discipline you know with a different discipline.',
      },
      {
        level: 11,
        name: 'Extra Elemental Discipline',
        description:
          'You learn one additional elemental discipline of your choice. You can also replace one elemental discipline you know with a different discipline.',
      },
      {
        level: 17,
        name: 'Extra Elemental Discipline',
        description:
          'You learn one additional elemental discipline of your choice. You can also replace one elemental discipline you know with a different discipline.',
      },
    ],
    source: 'PHB',
  },
]
