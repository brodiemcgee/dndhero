import type { Subclass } from './types'

export const WIZARD_SUBCLASSES: Subclass[] = [
  {
    id: 'school-of-evocation',
    name: 'School of Evocation',
    className: 'Wizard',
    description:
      'You focus your study on magic that creates powerful elemental effects such as bitter cold, searing flame, rolling thunder, crackling lightning, and burning acid. Evokers are often employed by military forces, using their power to blast enemy armies from afar.',
    features: [
      {
        level: 2,
        name: 'Evocation Savant',
        description:
          'The gold and time you must spend to copy an evocation spell into your spellbook is halved.',
      },
      {
        level: 2,
        name: 'Sculpt Spells',
        description:
          'You can create pockets of relative safety within the effects of your evocation spells. When you cast an evocation spell that affects other creatures that you can see, you can choose a number of them equal to 1 + the spell\'s level. The chosen creatures automatically succeed on their saving throws against the spell, and they take no damage if they would normally take half damage on a successful save.',
      },
      {
        level: 6,
        name: 'Potent Cantrip',
        description:
          'Your damaging cantrips affect even creatures that avoid the brunt of the effect. When a creature succeeds on a saving throw against your cantrip, the creature takes half the cantrip\'s damage (if any) but suffers no additional effect from the cantrip.',
      },
      {
        level: 10,
        name: 'Empowered Evocation',
        description:
          'You can add your Intelligence modifier to one damage roll of any wizard evocation spell you cast.',
      },
      {
        level: 14,
        name: 'Overchannel',
        description:
          'You can increase the power of your simpler spells. When you cast a wizard spell of 1st through 5th level that deals damage, you can deal maximum damage with that spell. The first time you do so, you suffer no adverse effect. If you use this feature again before you finish a long rest, you take 2d12 necrotic damage for each level of the spell, immediately after you cast it. Each time you use this feature again before finishing a long rest, the necrotic damage per spell level increases by 1d12.',
      },
    ],
    source: 'SRD',
  },
  {
    id: 'school-of-abjuration',
    name: 'School of Abjuration',
    className: 'Wizard',
    description:
      'The School of Abjuration emphasizes magic that blocks, banishes, or protects. Detractors of this school say that its tradition is about denial, negation rather than positive assertion. You understand, however, that ending harmful effects, protecting the weak, and banishing evil influences is anything but a philosophical void.',
    features: [
      {
        level: 2,
        name: 'Abjuration Savant',
        description:
          'The gold and time you must spend to copy an abjuration spell into your spellbook is halved.',
      },
      {
        level: 2,
        name: 'Arcane Ward',
        description:
          'You can weave magic around yourself for protection. When you cast an abjuration spell of 1st level or higher, you can simultaneously use a strand of the spell\'s magic to create a magical ward on yourself that lasts until you finish a long rest. The ward has hit points equal to twice your wizard level + your Intelligence modifier. Whenever you take damage, the ward takes the damage instead. If this damage reduces the ward to 0 hit points, you take any remaining damage. While the ward has 0 hit points, it can\'t absorb damage, but its magic remains. Whenever you cast an abjuration spell of 1st level or higher, the ward regains a number of hit points equal to twice the level of the spell.',
      },
      {
        level: 6,
        name: 'Projected Ward',
        description:
          'When a creature that you can see within 30 feet of you takes damage, you can use your reaction to cause your Arcane Ward to absorb that damage. If this damage reduces the ward to 0 hit points, the warded creature takes any remaining damage.',
      },
      {
        level: 10,
        name: 'Improved Abjuration',
        description:
          'When you cast an abjuration spell that requires you to make an ability check as a part of casting that spell (as in counterspell and dispel magic), you add your proficiency bonus to that ability check.',
      },
      {
        level: 14,
        name: 'Spell Resistance',
        description:
          'You have advantage on saving throws against spells. Furthermore, you have resistance against the damage of spells.',
      },
    ],
    source: 'PHB',
  },
  {
    id: 'school-of-conjuration',
    name: 'School of Conjuration',
    className: 'Wizard',
    description:
      'As a conjurer, you favor spells that produce objects and creatures out of thin air. You can conjure billowing clouds of killing fog or summon creatures from elsewhere to fight on your behalf. As your mastery grows, you learn spells of transportation and can teleport yourself across vast distances.',
    features: [
      {
        level: 2,
        name: 'Conjuration Savant',
        description:
          'The gold and time you must spend to copy a conjuration spell into your spellbook is halved.',
      },
      {
        level: 2,
        name: 'Minor Conjuration',
        description:
          'You can use your action to conjure up an inanimate object in your hand or on the ground in an unoccupied space that you can see within 10 feet of you. This object can be no larger than 3 feet on a side and weigh no more than 10 pounds, and its form must be that of a nonmagical object that you have seen. The object is visibly magical, radiating dim light out to 5 feet. The object disappears after 1 hour, when you use this feature again, or if it takes any damage.',
      },
      {
        level: 6,
        name: 'Benign Transposition',
        description:
          'You can use your action to teleport up to 30 feet to an unoccupied space that you can see. Alternatively, you can choose a space within range that is occupied by a Small or Medium creature. If that creature is willing, you both teleport, swapping places. Once you use this feature, you can\'t use it again until you finish a long rest or you cast a conjuration spell of 1st level or higher.',
      },
      {
        level: 10,
        name: 'Focused Conjuration',
        description:
          'While you are concentrating on a conjuration spell, your concentration can\'t be broken as a result of taking damage.',
      },
      {
        level: 14,
        name: 'Durable Summons',
        description:
          'Any creature that you summon or create with a conjuration spell has 30 temporary hit points.',
      },
    ],
    source: 'PHB',
  },
  {
    id: 'school-of-divination',
    name: 'School of Divination',
    className: 'Wizard',
    description:
      'The counsel of a diviner is sought by royalty and commoners alike, for all seek a clearer understanding of the past, present, and future. As a diviner, you strive to part the veils of space, time, and consciousness so that you can see clearly.',
    features: [
      {
        level: 2,
        name: 'Divination Savant',
        description:
          'The gold and time you must spend to copy a divination spell into your spellbook is halved.',
      },
      {
        level: 2,
        name: 'Portent',
        description:
          'Glimpses of the future begin to press in on your awareness. When you finish a long rest, roll two d20s and record the numbers rolled. You can replace any attack roll, saving throw, or ability check made by you or a creature that you can see with one of these foretelling rolls. You must choose to do so before the roll, and you can replace a roll in this way only once per turn. Each foretelling roll can be used only once. When you finish a long rest, you lose any unused foretelling rolls.',
      },
      {
        level: 6,
        name: 'Expert Divination',
        description:
          'Casting divination spells comes so easily to you that it expends only a fraction of your spellcasting efforts. When you cast a divination spell of 2nd level or higher using a spell slot, you regain one expended spell slot. The slot you regain must be of a level lower than the spell you cast and can\'t be higher than 5th level.',
      },
      {
        level: 10,
        name: 'The Third Eye',
        description:
          'You can use your action to increase your powers of perception. When you do so, choose one of the following benefits, which lasts until you are incapacitated or you take a short or long rest. You can\'t use the feature again until you finish a rest. Darkvision: You gain darkvision out to 60 feet. Ethereal Sight: You can see into the Ethereal Plane within 60 feet. Greater Comprehension: You can read any language. See Invisibility: You can see invisible creatures and objects within 10 feet that are within line of sight.',
      },
      {
        level: 14,
        name: 'Greater Portent',
        description:
          'The visions in your dreams intensify and paint a more accurate picture in your mind of what is to come. You roll three d20s for your Portent feature, rather than two.',
      },
    ],
    source: 'PHB',
  },
  {
    id: 'school-of-enchantment',
    name: 'School of Enchantment',
    className: 'Wizard',
    description:
      'As a member of the School of Enchantment, you have honed your ability to magically entrance and beguile other people and monsters. Some enchanters are peacemakers who bewitch the violent to lay down their arms and charm the cruel into showing mercy. Others are tyrants who magically bind the unwilling into their service.',
    features: [
      {
        level: 2,
        name: 'Enchantment Savant',
        description:
          'The gold and time you must spend to copy an enchantment spell into your spellbook is halved.',
      },
      {
        level: 2,
        name: 'Hypnotic Gaze',
        description:
          'Your soft words and enchanting gaze can magically enthrall another creature. As an action, choose one creature that you can see within 5 feet of you. If the target can see or hear you, it must succeed on a Wisdom saving throw against your wizard spell save DC or be charmed by you until the end of your next turn. The charmed creature\'s speed drops to 0, and the creature is incapacitated and visibly dazed. On subsequent turns, you can use your action to maintain this effect, extending its duration until the end of your next turn. However, the effect ends if you move more than 5 feet away from the creature, if the creature can neither see nor hear you, or if the creature takes damage.',
      },
      {
        level: 6,
        name: 'Instinctive Charm',
        description:
          'When a creature you can see within 30 feet of you makes an attack roll against you, you can use your reaction to divert the attack, provided that another creature is within the attack\'s range. The attacker must make a Wisdom saving throw against your wizard spell save DC. On a failed save, the attacker must target the creature that is closest to it, not including you or itself. If multiple creatures are closest, the attacker chooses which one to target. On a successful save, you can\'t use this feature on the attacker again until you finish a long rest.',
      },
      {
        level: 10,
        name: 'Split Enchantment',
        description:
          'When you cast an enchantment spell of 1st level or higher that targets only one creature, you can have it target a second creature.',
      },
      {
        level: 14,
        name: 'Alter Memories',
        description:
          'You gain the ability to make a creature unaware of your magical influence on it. When you cast an enchantment spell to charm one or more creatures, you can alter one creature\'s understanding so that it remains unaware of being charmed. Additionally, once before the spell expires, you can use your action to try to make the chosen creature forget some of the time it spent charmed. The creature must succeed on an Intelligence saving throw against your wizard spell save DC or lose a number of hours of its memories equal to 1 + your Charisma modifier (minimum 1). You can make the creature forget less time, and the amount of time can\'t exceed the duration of your enchantment spell.',
      },
    ],
    source: 'PHB',
  },
  {
    id: 'school-of-illusion',
    name: 'School of Illusion',
    className: 'Wizard',
    description:
      'You focus your studies on magic that dazzles the senses, befuddles the mind, and tricks even the wisest folk. Your magic is subtle, but the illusions crafted by your keen mind make the impossible seem real.',
    features: [
      {
        level: 2,
        name: 'Illusion Savant',
        description:
          'The gold and time you must spend to copy an illusion spell into your spellbook is halved.',
      },
      {
        level: 2,
        name: 'Improved Minor Illusion',
        description:
          'You learn the minor illusion cantrip. If you already know this cantrip, you learn a different wizard cantrip of your choice. The cantrip doesn\'t count against your number of cantrips known. When you cast minor illusion, you can create both a sound and an image with a single casting of the spell.',
      },
      {
        level: 6,
        name: 'Malleable Illusions',
        description:
          'When you cast an illusion spell that has a duration of 1 minute or longer, you can use your action to change the nature of that illusion (using the spell\'s normal parameters for the illusion), provided that you can see the illusion.',
      },
      {
        level: 10,
        name: 'Illusory Self',
        description:
          'You can create an illusory duplicate of yourself as an instant, almost instinctual reaction to danger. When a creature makes an attack roll against you, you can use your reaction to interpose the illusory duplicate between the attacker and yourself. The attack automatically misses you, then the illusion dissipates. Once you use this feature, you can\'t use it again until you finish a short or long rest.',
      },
      {
        level: 14,
        name: 'Illusory Reality',
        description:
          'You have learned the secret of weaving shadow magic into your illusions to give them a semi-reality. When you cast an illusion spell of 1st level or higher, you can choose one inanimate, nonmagical object that is part of the illusion and make that object real. You can do this on your turn as a bonus action while the spell is ongoing. The object remains real for 1 minute. For example, you can create an illusion of a bridge over a chasm and then make it real long enough for your allies to cross. The object can\'t deal damage or otherwise directly harm anyone.',
      },
    ],
    source: 'PHB',
  },
  {
    id: 'school-of-necromancy',
    name: 'School of Necromancy',
    className: 'Wizard',
    description:
      'The School of Necromancy explores the cosmic forces of life, death, and undeath. As you focus your studies in this tradition, you learn to manipulate the energy that animates all living things. As you progress, you learn to sap the life force from a creature as your magic destroys its body, transforming that vital energy into magical power you can manipulate.',
    features: [
      {
        level: 2,
        name: 'Necromancy Savant',
        description:
          'The gold and time you must spend to copy a necromancy spell into your spellbook is halved.',
      },
      {
        level: 2,
        name: 'Grim Harvest',
        description:
          'You gain the ability to reap life energy from creatures you kill with your spells. Once per turn when you kill one or more creatures with a spell of 1st level or higher, you regain hit points equal to twice the spell\'s level, or three times its level if the spell belongs to the School of Necromancy. You don\'t gain this benefit for killing constructs or undead.',
      },
      {
        level: 6,
        name: 'Undead Thralls',
        description:
          'You add the animate dead spell to your spellbook if it is not there already. When you cast animate dead, you can target one additional corpse or pile of bones, creating another zombie or skeleton, as appropriate. Whenever you create an undead using a necromancy spell, it has additional benefits: The creature\'s hit point maximum is increased by an amount equal to your wizard level. The creature adds your proficiency bonus to its weapon damage rolls.',
      },
      {
        level: 10,
        name: 'Inured to Undeath',
        description:
          'You have resistance to necrotic damage, and your hit point maximum can\'t be reduced. You have spent so much time dealing with undead and the forces that animate them that you have become inured to some of their worst effects.',
      },
      {
        level: 14,
        name: 'Command Undead',
        description:
          'You can use magic to bring undead under your control, even those created by other wizards. As an action, you can choose one undead that you can see within 60 feet of you. That creature must make a Charisma saving throw against your wizard spell save DC. If it succeeds, you can\'t use this feature on it again. If it fails, it becomes friendly to you and obeys your commands until you use this feature again. Intelligent undead are harder to control in this way. If the target has an Intelligence of 8 or higher, it has advantage on the saving throw. If it fails the saving throw and has an Intelligence of 12 or higher, it can repeat the saving throw at the end of every hour until it succeeds and breaks free.',
      },
    ],
    source: 'PHB',
  },
  {
    id: 'school-of-transmutation',
    name: 'School of Transmutation',
    className: 'Wizard',
    description:
      'You are a student of spells that modify energy and matter. To you, the world is not a fixed thing, but eminently mutable, and you delight in being an agent of change. You wield the raw stuff of creation and learn to alter both physical forms and mental qualities.',
    features: [
      {
        level: 2,
        name: 'Transmutation Savant',
        description:
          'The gold and time you must spend to copy a transmutation spell into your spellbook is halved.',
      },
      {
        level: 2,
        name: 'Minor Alchemy',
        description:
          'You can temporarily alter the physical properties of one nonmagical object, changing it from one substance into another. You perform a special alchemical procedure on one object composed entirely of wood, stone (but not a gemstone), iron, copper, or silver, transforming it into a different one of those materials. For each 10 minutes you spend performing the procedure, you can transform up to 1 cubic foot of material. After 1 hour, or until you lose your concentration (as if you were concentrating on a spell), the material reverts to its original substance.',
      },
      {
        level: 6,
        name: 'Transmuter\'s Stone',
        description:
          'You can spend 8 hours creating a transmuter\'s stone that stores transmutation magic. You can benefit from the stone yourself or give it to another creature. A creature gains a benefit of your choice as long as the stone is in the creature\'s possession. When you create the stone, choose the benefit from the following options: Darkvision out to a range of 60 feet. An increase to speed of 10 feet while the creature is unencumbered. Proficiency in Constitution saving throws. Resistance to acid, cold, fire, lightning, or thunder damage (your choice whenever you choose this benefit). Each time you cast a transmutation spell of 1st level or higher, you can change the effect of your stone if the stone is on your person.',
      },
      {
        level: 10,
        name: 'Shapechanger',
        description:
          'You add the polymorph spell to your spellbook, if it is not there already. You can cast polymorph without expending a spell slot. When you do so, you can target only yourself and transform into a beast whose challenge rating is 1 or lower. Once you cast polymorph in this way, you can\'t do so again until you finish a short or long rest, though you can still cast it normally using an available spell slot.',
      },
      {
        level: 14,
        name: 'Master Transmuter',
        description:
          'You can use your action to consume the reserve of transmutation magic stored within your transmuter\'s stone in a single burst. When you do so, choose one of the following effects. Your transmuter\'s stone is destroyed and can\'t be remade until you finish a long rest. Major Transformation: You can transmute one nonmagical object—no larger than a 5-foot cube—into another nonmagical object of similar size and mass and of equal or lesser value. You must spend 10 minutes handling the object to transform it. Panacea: You remove all curses, diseases, and poisons affecting a creature that you touch with the transmuter\'s stone. The creature also regains all its hit points. Restore Life: You cast the raise dead spell on a creature you touch with the transmuter\'s stone, without expending a spell slot or needing to have the spell in your spellbook. Restore Youth: You touch the transmuter\'s stone to a willing creature, and that creature\'s apparent age is reduced by 3d10 years, to a minimum of 13 years. This effect doesn\'t extend the creature\'s lifespan.',
      },
    ],
    source: 'PHB',
  },
]
