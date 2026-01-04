import type { Subclass } from './types'

export const PALADIN_SUBCLASSES: Subclass[] = [
  {
    id: 'oath-of-devotion',
    name: 'Oath of Devotion',
    className: 'Paladin',
    description:
      'The Oath of Devotion binds a paladin to the loftiest ideals of justice, virtue, and order. Sometimes called cavaliers, white knights, or holy warriors, these paladins meet the ideal of the knight in shining armor.',
    features: [
      {
        level: 3,
        name: 'Oath Spells',
        description:
          'You gain oath spells at the paladin levels listed: 3rd (protection from evil and good, sanctuary), 5th (lesser restoration, zone of truth), 9th (beacon of hope, dispel magic), 13th (freedom of movement, guardian of faith), 17th (commune, flame strike).',
      },
      {
        level: 3,
        name: 'Channel Divinity: Sacred Weapon',
        description:
          'As an action, you can imbue one weapon that you are holding with positive energy. For 1 minute, you add your Charisma modifier to attack rolls made with that weapon (with a minimum bonus of +1). The weapon also emits bright light in a 20-foot radius and dim light 20 feet beyond that. If the weapon is not already magical, it becomes magical for the duration.',
      },
      {
        level: 3,
        name: 'Channel Divinity: Turn the Unholy',
        description:
          'As an action, you present your holy symbol and speak a prayer censuring fiends and undead. Each fiend or undead that can see or hear you within 30 feet of you must make a Wisdom saving throw. If the creature fails its saving throw, it is turned for 1 minute or until it takes damage.',
      },
      {
        level: 7,
        name: 'Aura of Devotion',
        description:
          'You and friendly creatures within 10 feet of you can\'t be charmed while you are conscious. At 18th level, the range of this aura increases to 30 feet.',
      },
      {
        level: 15,
        name: 'Purity of Spirit',
        description:
          'You are always under the effects of a protection from evil and good spell.',
      },
      {
        level: 20,
        name: 'Holy Nimbus',
        description:
          'As an action, you can emanate an aura of sunlight. For 1 minute, bright light shines from you in a 30-foot radius, and dim light shines 30 feet beyond that. Whenever an enemy creature starts its turn in the bright light, the creature takes 10 radiant damage. In addition, for the duration, you have advantage on saving throws against spells cast by fiends or undead.',
      },
    ],
    source: 'SRD',
  },
]
