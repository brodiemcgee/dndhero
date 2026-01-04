import type { Subclass } from './types'

export const CLERIC_SUBCLASSES: Subclass[] = [
  {
    id: 'knowledge-domain',
    name: 'Knowledge Domain',
    className: 'Cleric',
    description:
      'The gods of knowledge value learning and understanding above all. Some teach that knowledge is to be gathered and shared in libraries and universities, while others promote the practical knowledge of craft and invention.',
    features: [
      {
        level: 1,
        name: 'Blessings of Knowledge',
        description:
          'At 1st level, you learn two languages of your choice. You also become proficient in your choice of two of the following skills: Arcana, History, Nature, or Religion. Your proficiency bonus is doubled for any ability check you make that uses either of those skills.',
      },
      {
        level: 2,
        name: 'Channel Divinity: Knowledge of the Ages',
        description:
          'Starting at 2nd level, you can use your Channel Divinity to tap into a divine well of knowledge. As an action, you choose one skill or tool. For 10 minutes, you have proficiency with the chosen skill or tool.',
      },
      {
        level: 6,
        name: 'Channel Divinity: Read Thoughts',
        description:
          'At 6th level, you can use your Channel Divinity to read a creature\'s thoughts. You can then use your access to the creature\'s mind to command it. As an action, choose one creature that you can see within 60 feet of you. That creature must make a Wisdom saving throw. If the creature succeeds on the saving throw, you can\'t use this feature on it again until you finish a long rest. If the creature fails its save, you can read its surface thoughts when it is within 60 feet of you. This effect lasts for 1 minute. During that time, you can use your action to end this effect and cast the suggestion spell on the creature without expending a spell slot. The target automatically fails its saving throw against the spell.',
      },
      {
        level: 8,
        name: 'Potent Spellcasting',
        description:
          'Starting at 8th level, you add your Wisdom modifier to the damage you deal with any cleric cantrip.',
      },
      {
        level: 17,
        name: 'Visions of the Past',
        description:
          'Starting at 17th level, you can call up visions of the past that relate to an object you hold or your immediate surroundings. You spend at least 1 minute in meditation and prayer, then receive dreamlike, shadowy glimpses of recent events. You can meditate for a number of minutes equal to your Wisdom score and must maintain concentration during that time. Object Reading: Holding an object as you meditate, you can see visions of the object\'s previous owner. Area Reading: As you meditate, you see visions of recent events in your immediate vicinity. Once you use this feature, you can\'t use it again until you finish a short or long rest.',
      },
    ],
    source: 'PHB',
  },
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
  {
    id: 'light-domain',
    name: 'Light Domain',
    className: 'Cleric',
    description:
      'Gods of light promote the ideals of rebirth and renewal, truth, vigilance, and beauty, often using the symbol of the sun. Some of these gods are portrayed as the sun itself or as a charioteer who guides the sun across the sky.',
    features: [
      {
        level: 1,
        name: 'Bonus Cantrip',
        description:
          'When you choose this domain at 1st level, you gain the light cantrip if you don\'t already know it. This cantrip doesn\'t count against the number of cleric cantrips you know.',
      },
      {
        level: 1,
        name: 'Warding Flare',
        description:
          'At 1st level, you can interpose divine light between yourself and an attacking enemy. When you are attacked by a creature within 30 feet of you that you can see, you can use your reaction to impose disadvantage on the attack roll, causing light to flare before the attacker before it hits or misses. An attacker that can\'t be blinded is immune to this feature. You can use this feature a number of times equal to your Wisdom modifier (a minimum of once). You regain all expended uses when you finish a long rest.',
      },
      {
        level: 2,
        name: 'Channel Divinity: Radiance of the Dawn',
        description:
          'Starting at 2nd level, you can use your Channel Divinity to harness sunlight, banishing darkness and dealing radiant damage to your foes. As an action, you present your holy symbol, and any magical darkness within 30 feet of you is dispelled. Additionally, each hostile creature within 30 feet of you must make a Constitution saving throw. A creature takes radiant damage equal to 2d10 + your cleric level on a failed saving throw, and half as much damage on a successful one. A creature that has total cover from you is not affected.',
      },
      {
        level: 6,
        name: 'Improved Flare',
        description:
          'Starting at 6th level, you can also use your Warding Flare feature when a creature that you can see within 30 feet of you attacks a creature other than you.',
      },
      {
        level: 8,
        name: 'Potent Spellcasting',
        description:
          'Starting at 8th level, you add your Wisdom modifier to the damage you deal with any cleric cantrip.',
      },
      {
        level: 17,
        name: 'Corona of Light',
        description:
          'Starting at 17th level, you can use your action to activate an aura of sunlight that lasts for 1 minute or until you dismiss it using another action. You emit bright light in a 60-foot radius and dim light 30 feet beyond that. Your enemies in the bright light have disadvantage on saving throws against any spell that deals fire or radiant damage.',
      },
    ],
    source: 'PHB',
  },
  {
    id: 'nature-domain',
    name: 'Nature Domain',
    className: 'Cleric',
    description:
      'Gods of nature are as varied as the natural world itself, from inscrutable gods of the deep forests to friendly deities associated with particular springs and groves. Druids revere nature as a whole but clerics of nature gods focus on the more active aspects of nature.',
    features: [
      {
        level: 1,
        name: 'Acolyte of Nature',
        description:
          'At 1st level, you learn one druid cantrip of your choice. This cantrip counts as a cleric cantrip for you, but it doesn\'t count against the number of cleric cantrips you know. You also gain proficiency in one of the following skills of your choice: Animal Handling, Nature, or Survival.',
      },
      {
        level: 1,
        name: 'Bonus Proficiency',
        description:
          'Also at 1st level, you gain proficiency with heavy armor.',
      },
      {
        level: 2,
        name: 'Channel Divinity: Charm Animals and Plants',
        description:
          'Starting at 2nd level, you can use your Channel Divinity to charm animals and plants. As an action, you present your holy symbol and invoke the name of your deity. Each beast or plant creature that can see you within 30 feet of you must make a Wisdom saving throw. If the creature fails its saving throw, it is charmed by you for 1 minute or until it takes damage. While it is charmed by you, it is friendly to you and other creatures you designate.',
      },
      {
        level: 6,
        name: 'Dampen Elements',
        description:
          'Starting at 6th level, when you or a creature within 30 feet of you takes acid, cold, fire, lightning, or thunder damage, you can use your reaction to grant resistance to the creature against that instance of the damage.',
      },
      {
        level: 8,
        name: 'Divine Strike',
        description:
          'At 8th level, you gain the ability to infuse your weapon strikes with divine energy. Once on each of your turns when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 cold, fire, or lightning damage (your choice) to the target. When you reach 14th level, the extra damage increases to 2d8.',
      },
      {
        level: 17,
        name: 'Master of Nature',
        description:
          'At 17th level, you gain the ability to command animals and plant creatures. While creatures are charmed by your Charm Animals and Plants feature, you can take a bonus action on your turn to verbally command what each of those creatures will do on its next turn.',
      },
    ],
    source: 'PHB',
  },
  {
    id: 'tempest-domain',
    name: 'Tempest Domain',
    className: 'Cleric',
    description:
      'Gods whose portfolios include the Tempest domain govern storms, sea, and sky. They include gods of lightning and thunder, gods of earthquakes, some fire gods, and certain gods of violence, physical strength, and courage.',
    features: [
      {
        level: 1,
        name: 'Bonus Proficiencies',
        description:
          'At 1st level, you gain proficiency with martial weapons and heavy armor.',
      },
      {
        level: 1,
        name: 'Wrath of the Storm',
        description:
          'Also at 1st level, you can thunderously rebuke attackers. When a creature within 5 feet of you that you can see hits you with an attack, you can use your reaction to cause the creature to make a Dexterity saving throw. The creature takes 2d8 lightning or thunder damage (your choice) on a failed saving throw, and half as much damage on a successful one. You can use this feature a number of times equal to your Wisdom modifier (a minimum of once). You regain all expended uses when you finish a long rest.',
      },
      {
        level: 2,
        name: 'Channel Divinity: Destructive Wrath',
        description:
          'Starting at 2nd level, you can use your Channel Divinity to wield the power of the storm with unchecked ferocity. When you roll lightning or thunder damage, you can use your Channel Divinity to deal maximum damage, instead of rolling.',
      },
      {
        level: 6,
        name: 'Thunderbolt Strike',
        description:
          'At 6th level, when you deal lightning damage to a Large or smaller creature, you can also push it up to 10 feet away from you.',
      },
      {
        level: 8,
        name: 'Divine Strike',
        description:
          'At 8th level, you gain the ability to infuse your weapon strikes with divine energy. Once on each of your turns when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 thunder damage to the target. When you reach 14th level, the extra damage increases to 2d8.',
      },
      {
        level: 17,
        name: 'Stormborn',
        description:
          'At 17th level, you have a flying speed equal to your current walking speed whenever you are not underground or indoors.',
      },
    ],
    source: 'PHB',
  },
  {
    id: 'trickery-domain',
    name: 'Trickery Domain',
    className: 'Cleric',
    description:
      'Gods of trickery are mischief-makers and instigators who stand as a constant challenge to the accepted order among both gods and mortals. They\'re patrons of thieves, scoundrels, gamblers, rebels, and liberators.',
    features: [
      {
        level: 1,
        name: 'Blessing of the Trickster',
        description:
          'Starting when you choose this domain at 1st level, you can use your action to touch a willing creature other than yourself to give it advantage on Dexterity (Stealth) checks. This blessing lasts for 1 hour or until you use this feature again.',
      },
      {
        level: 2,
        name: 'Channel Divinity: Invoke Duplicity',
        description:
          'Starting at 2nd level, you can use your Channel Divinity to create an illusory duplicate of yourself. As an action, you create a perfect illusion of yourself that lasts for 1 minute, or until you lose your concentration. The illusion appears in an unoccupied space that you can see within 30 feet of you. As a bonus action on your turn, you can move the illusion up to 30 feet to a space you can see, but it must remain within 120 feet of you. For the duration, you can cast spells as though you were in the illusion\'s space, but you must use your own senses. Additionally, when both you and your illusion are within 5 feet of a creature that can see the illusion, you have advantage on attack rolls against that creature.',
      },
      {
        level: 6,
        name: 'Channel Divinity: Cloak of Shadows',
        description:
          'Starting at 6th level, you can use your Channel Divinity to vanish. As an action, you become invisible until the end of your next turn. You become visible if you attack or cast a spell.',
      },
      {
        level: 8,
        name: 'Divine Strike',
        description:
          'At 8th level, you gain the ability to infuse your weapon strikes with poison. Once on each of your turns when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 poison damage to the target. When you reach 14th level, the extra damage increases to 2d8.',
      },
      {
        level: 17,
        name: 'Improved Duplicity',
        description:
          'At 17th level, you can create up to four duplicates of yourself, instead of one, when you use Invoke Duplicity. As a bonus action on your turn, you can move any number of them up to 30 feet, to a maximum range of 120 feet.',
      },
    ],
    source: 'PHB',
  },
  {
    id: 'war-domain',
    name: 'War Domain',
    className: 'Cleric',
    description:
      'War has many manifestations. It can make heroes of ordinary people. It can be desperate and horrific, with acts of cruelty and cowardice eclipsing instances of excellence and courage. Clerics of war gods excel in battle, inspiring others to fight the good fight or offering acts of violence as prayers.',
    features: [
      {
        level: 1,
        name: 'Bonus Proficiencies',
        description:
          'At 1st level, you gain proficiency with martial weapons and heavy armor.',
      },
      {
        level: 1,
        name: 'War Priest',
        description:
          'From 1st level, your god delivers bolts of inspiration to you while you are engaged in battle. When you use the Attack action, you can make one weapon attack as a bonus action. You can use this feature a number of times equal to your Wisdom modifier (a minimum of once). You regain all expended uses when you finish a long rest.',
      },
      {
        level: 2,
        name: 'Channel Divinity: Guided Strike',
        description:
          'Starting at 2nd level, you can use your Channel Divinity to strike with supernatural accuracy. When you make an attack roll, you can use your Channel Divinity to gain a +10 bonus to the roll. You make this choice after you see the roll, but before the DM says whether the attack hits or misses.',
      },
      {
        level: 6,
        name: 'Channel Divinity: War God\'s Blessing',
        description:
          'At 6th level, when a creature within 30 feet of you makes an attack roll, you can use your reaction to grant that creature a +10 bonus to the roll, using your Channel Divinity. You make this choice after you see the roll, but before the DM says whether the attack hits or misses.',
      },
      {
        level: 8,
        name: 'Divine Strike',
        description:
          'At 8th level, you gain the ability to infuse your weapon strikes with divine energy. Once on each of your turns when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 damage of the same type dealt by the weapon to the target. When you reach 14th level, the extra damage increases to 2d8.',
      },
      {
        level: 17,
        name: 'Avatar of Battle',
        description:
          'At 17th level, you gain resistance to bludgeoning, piercing, and slashing damage from nonmagical attacks.',
      },
    ],
    source: 'PHB',
  },
]
