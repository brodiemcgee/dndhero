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
  {
    id: 'oath-of-the-ancients',
    name: 'Oath of the Ancients',
    className: 'Paladin',
    description:
      'The Oath of the Ancients is as old as the race of elves and the rituals of the druids. Sometimes called fey knights, green knights, or horned knights, paladins who swear this oath cast their lot with the side of the light in the cosmic struggle against darkness because they love the beautiful and life-giving things of the world.',
    features: [
      {
        level: 3,
        name: 'Oath Spells',
        description:
          'You gain oath spells at the paladin levels listed: 3rd (ensnaring strike, speak with animals), 5th (moonbeam, misty step), 9th (plant growth, protection from energy), 13th (ice storm, stoneskin), 17th (commune with nature, tree stride).',
      },
      {
        level: 3,
        name: "Channel Divinity: Nature's Wrath",
        description:
          'You can use your Channel Divinity to invoke primeval forces to ensnare a foe. As an action, you can cause spectral vines to spring up and reach for a creature within 10 feet of you that you can see. The creature must succeed on a Strength or Dexterity saving throw (its choice) or be restrained. While restrained by the vines, the creature repeats the saving throw at the end of each of its turns. On a success, it frees itself and the vines vanish.',
      },
      {
        level: 3,
        name: 'Channel Divinity: Turn the Faithless',
        description:
          'You can use your Channel Divinity to utter ancient words that are painful for fey and fiends to hear. As an action, you present your holy symbol, and each fey or fiend within 30 feet of you that can hear you must make a Wisdom saving throw. On a failed save, the creature is turned for 1 minute or until it takes damage.',
      },
      {
        level: 7,
        name: 'Aura of Warding',
        description:
          'Ancient magic lies so heavily upon you that it forms an eldritch ward. You and friendly creatures within 10 feet of you have resistance to damage from spells. At 18th level, the range of this aura increases to 30 feet.',
      },
      {
        level: 15,
        name: 'Undying Sentinel',
        description:
          "When you are reduced to 0 hit points and are not killed outright, you can choose to drop to 1 hit point instead. Once you use this ability, you can't use it again until you finish a long rest. Additionally, you suffer none of the drawbacks of old age, and you can't be aged magically.",
      },
      {
        level: 20,
        name: 'Elder Champion',
        description:
          "You can assume the form of an ancient force of nature, taking on an appearance you choose. For example, your skin might turn green or take on a bark-like texture, your hair might become leafy or moss-like, or you might sprout antlers or a lion-like mane. Using your action, you undergo a transformation. For 1 minute, you gain the following benefits: At the start of each of your turns, you regain 10 hit points. Whenever you cast a paladin spell that has a casting time of 1 action, you can cast it using a bonus action instead. Enemy creatures within 10 feet of you have disadvantage on saving throws against your paladin spells and Channel Divinity options. Once you use this feature, you can't use it again until you finish a long rest.",
      },
    ],
    source: 'PHB',
  },
  {
    id: 'oath-of-vengeance',
    name: 'Oath of Vengeance',
    className: 'Paladin',
    description:
      'The Oath of Vengeance is a solemn commitment to punish those who have committed a grievous sin. When evil forces slaughter helpless villagers, when an entire people turns against the will of the gods, when a thieves guild grows too violent and powerful, when a dragon rampages through the countryside—at times like these, paladins arise and swear an Oath of Vengeance to set right that which has gone wrong.',
    features: [
      {
        level: 3,
        name: 'Oath Spells',
        description:
          "You gain oath spells at the paladin levels listed: 3rd (bane, hunter's mark), 5th (hold person, misty step), 9th (haste, protection from energy), 13th (banishment, dimension door), 17th (hold monster, scrying).",
      },
      {
        level: 3,
        name: 'Channel Divinity: Abjure Enemy',
        description:
          'As an action, you present your holy symbol and speak a prayer of denunciation, using your Channel Divinity. Choose one creature within 60 feet of you that you can see. That creature must make a Wisdom saving throw, unless it is immune to being frightened. Fiends and undead have disadvantage on this saving throw. On a failed save, the creature is frightened for 1 minute or until it takes any damage. While frightened, the creature\'s speed is 0, and it can\'t benefit from any bonus to its speed. On a successful save, the creature\'s speed is halved for 1 minute or until the creature takes any damage.',
      },
      {
        level: 3,
        name: 'Channel Divinity: Vow of Enmity',
        description:
          'As a bonus action, you can utter a vow of enmity against a creature you can see within 10 feet of you, using your Channel Divinity. You gain advantage on attack rolls against the creature for 1 minute or until it drops to 0 hit points or falls unconscious.',
      },
      {
        level: 7,
        name: 'Relentless Avenger',
        description:
          'Your supernatural focus helps you close off a foe\'s retreat. When you hit a creature with an opportunity attack, you can move up to half your speed immediately after the attack and as part of the same reaction. This movement doesn\'t provoke opportunity attacks.',
      },
      {
        level: 15,
        name: 'Soul of Vengeance',
        description:
          'The authority with which you speak your Vow of Enmity gives you greater power over your foe. When a creature under the effect of your Vow of Enmity makes an attack, you can use your reaction to make a melee weapon attack against that creature if it is within range.',
      },
      {
        level: 20,
        name: 'Avenging Angel',
        description:
          "You can assume the form of an angelic avenger. Using your action, you undergo a transformation. For 1 hour, you gain the following benefits: Wings sprout from your back and grant you a flying speed of 60 feet. You emanate an aura of menace in a 30-foot radius. The first time any enemy creature enters the aura or starts its turn there during a battle, the creature must succeed on a Wisdom saving throw or become frightened of you for 1 minute or until it takes any damage. Attack rolls against the frightened creature have advantage. Once you use this feature, you can't use it again until you finish a long rest.",
      },
    ],
    source: 'PHB',
  },
]
