import type { Subclass } from './types'

export const DRUID_SUBCLASSES: Subclass[] = [
  {
    id: 'circle-of-the-land',
    name: 'Circle of the Land',
    className: 'Druid',
    description:
      'The Circle of the Land is made up of mystics and sages who safeguard ancient knowledge and rites through a vast oral tradition. These druids meet within sacred circles of trees or standing stones to whisper primal secrets in Druidic.',
    features: [
      {
        level: 2,
        name: 'Bonus Cantrip',
        description:
          'You learn one additional druid cantrip of your choice.',
      },
      {
        level: 2,
        name: 'Natural Recovery',
        description:
          'You can regain some of your magical energy by sitting in meditation and communing with nature. During a short rest, you choose expended spell slots to recover. The spell slots can have a combined level that is equal to or less than half your druid level (rounded up), and none of the slots can be 6th level or higher. You can\'t use this feature again until you finish a long rest.',
      },
      {
        level: 3,
        name: 'Circle Spells',
        description:
          'Your mystical connection to the land infuses you with the ability to cast certain spells. You gain access to circle spells connected to the type of land you became a druid in (arctic, coast, desert, forest, grassland, mountain, swamp, or Underdark). Once you gain access to a circle spell, you always have it prepared, and it doesn\'t count against the number of spells you can prepare each day.',
      },
      {
        level: 6,
        name: "Land's Stride",
        description:
          'Moving through nonmagical difficult terrain costs you no extra movement. You can also pass through nonmagical plants without being slowed by them and without taking damage from them if they have thorns, spines, or a similar hazard. In addition, you have advantage on saving throws against plants that are magically created or manipulated to impede movement.',
      },
      {
        level: 10,
        name: "Nature's Ward",
        description:
          'You can\'t be charmed or frightened by elementals or fey, and you are immune to poison and disease.',
      },
      {
        level: 14,
        name: "Nature's Sanctuary",
        description:
          'Creatures of the natural world sense your connection to nature and become hesitant to attack you. When a beast or plant creature attacks you, that creature must make a Wisdom saving throw against your druid spell save DC. On a failed save, the creature must choose a different target, or the attack automatically misses. On a successful save, the creature is immune to this effect for 24 hours.',
      },
    ],
    source: 'SRD',
  },
  {
    id: 'circle-of-the-moon',
    name: 'Circle of the Moon',
    className: 'Druid',
    description:
      'Druids of the Circle of the Moon are fierce guardians of the wilds. Their order gathers under the full moon to share news and trade warnings. They haunt the deepest parts of the wilderness, where they might go for weeks on end before crossing paths with another humanoid creature, let alone another druid.',
    features: [
      {
        level: 2,
        name: 'Combat Wild Shape',
        description:
          'You gain the ability to use Wild Shape on your turn as a bonus action, rather than as an action. Additionally, while you are transformed by Wild Shape, you can use a bonus action to expend one spell slot to regain 1d8 hit points per level of the spell slot expended.',
      },
      {
        level: 2,
        name: 'Circle Forms',
        description:
          'The rites of your circle grant you the ability to transform into more dangerous animal forms. Starting at 2nd level, you can use your Wild Shape to transform into a beast with a challenge rating as high as 1 (you ignore the Max. CR column of the Beast Shapes table, but must abide by the other limitations there). Starting at 6th level, you can transform into a beast with a challenge rating as high as your druid level divided by 3, rounded down.',
      },
      {
        level: 6,
        name: 'Primal Strike',
        description:
          'Your attacks in beast form count as magical for the purpose of overcoming resistance and immunity to nonmagical attacks and damage.',
      },
      {
        level: 10,
        name: 'Elemental Wild Shape',
        description:
          'You can expend two uses of Wild Shape at the same time to transform into an air elemental, an earth elemental, a fire elemental, or a water elemental.',
      },
      {
        level: 14,
        name: 'Thousand Forms',
        description:
          'You have learned to use magic to alter your physical form in more subtle ways. You can cast the alter self spell at will.',
      },
    ],
    source: 'PHB',
  },
]
