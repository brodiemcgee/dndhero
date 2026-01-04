import type { Subclass } from './types'

export const FIGHTER_SUBCLASSES: Subclass[] = [
  {
    id: 'champion',
    name: 'Champion',
    className: 'Fighter',
    description:
      'The archetypal Champion focuses on the development of raw physical power honed to deadly perfection. Champions combine rigorous training with physical excellence to deal devastating blows.',
    features: [
      {
        level: 3,
        name: 'Improved Critical',
        description:
          'Your weapon attacks score a critical hit on a roll of 19 or 20.',
      },
      {
        level: 7,
        name: 'Remarkable Athlete',
        description:
          'You can add half your proficiency bonus (round up) to any Strength, Dexterity, or Constitution check you make that doesn\'t already use your proficiency bonus. In addition, when you make a running long jump, the distance you can cover increases by a number of feet equal to your Strength modifier.',
      },
      {
        level: 10,
        name: 'Additional Fighting Style',
        description:
          'You can choose a second option from the Fighting Style class feature.',
      },
      {
        level: 15,
        name: 'Superior Critical',
        description:
          'Your weapon attacks score a critical hit on a roll of 18-20.',
      },
      {
        level: 18,
        name: 'Survivor',
        description:
          'You attain the pinnacle of resilience in battle. At the start of each of your turns, you regain hit points equal to 5 + your Constitution modifier if you have no more than half of your hit points left. You don\'t gain this benefit if you have 0 hit points.',
      },
    ],
    source: 'SRD',
  },
  {
    id: 'battle-master',
    name: 'Battle Master',
    className: 'Fighter',
    description:
      'Those who emulate the archetypal Battle Master employ martial techniques passed down through generations. To a Battle Master, combat is an academic field, sometimes including subjects beyond battle such as weaponsmithing and calligraphy. Not every fighter absorbs the lessons of history, theory, and artistry that are reflected in the Battle Master archetype, but those who do are well-rounded fighters of great skill and knowledge.',
    features: [
      {
        level: 3,
        name: 'Combat Superiority',
        description:
          'You learn three maneuvers of your choice from the Battle Master maneuvers list. You can use only one maneuver per attack. You learn two additional maneuvers at 7th, 10th, and 15th level. You have four superiority dice, which are d8s. A superiority die is expended when you use it. You regain all expended superiority dice when you finish a short or long rest. You gain another superiority die at 7th level and one more at 15th level.',
      },
      {
        level: 3,
        name: 'Student of War',
        description:
          'You gain proficiency with one type of artisan\'s tools of your choice.',
      },
      {
        level: 7,
        name: 'Know Your Enemy',
        description:
          'If you spend at least 1 minute observing or interacting with another creature outside combat, you can learn certain information about its capabilities compared to your own. The DM tells you if the creature is your equal, superior, or inferior in regard to two of the following characteristics of your choice: Strength score, Dexterity score, Constitution score, Armor Class, current hit points, total class levels (if any), or fighter class levels (if any).',
      },
      {
        level: 10,
        name: 'Improved Combat Superiority',
        description:
          'Your superiority dice turn into d10s. You also learn two additional maneuvers of your choice.',
      },
      {
        level: 15,
        name: 'Relentless',
        description:
          'When you roll initiative and have no superiority dice remaining, you regain one superiority die.',
      },
      {
        level: 18,
        name: 'Improved Combat Superiority',
        description:
          'Your superiority dice turn into d12s.',
      },
    ],
    source: 'PHB',
  },
  {
    id: 'eldritch-knight',
    name: 'Eldritch Knight',
    className: 'Fighter',
    description:
      'The archetypal Eldritch Knight combines the martial mastery common to all fighters with a careful study of magic. Eldritch Knights use magical techniques similar to those practiced by wizards. They focus their study on two of the eight schools of magic: abjuration and evocation. Abjuration spells grant an Eldritch Knight additional protection in battle, and evocation spells deal damage to many foes at once, extending the fighter\'s reach in combat.',
    features: [
      {
        level: 3,
        name: 'Spellcasting',
        description:
          'You learn to cast wizard spells. You learn two cantrips of your choice from the wizard spell list. You learn three 1st-level wizard spells of your choice, two of which must be from the abjuration and evocation schools. Intelligence is your spellcasting ability for your wizard spells. You learn additional wizard spells as you level up, and can replace one spell you know with another wizard spell when you gain a level in this class.',
      },
      {
        level: 3,
        name: 'Weapon Bond',
        description:
          'You learn a ritual that creates a magical bond between yourself and one weapon. You perform the ritual over the course of 1 hour, which can be done during a short rest. The weapon must be within your reach throughout the ritual. Once you have bonded a weapon to yourself, you can\'t be disarmed of that weapon unless you are incapacitated. If it is on the same plane of existence, you can summon that weapon as a bonus action on your turn, causing it to teleport instantly to your hand. You can have up to two bonded weapons.',
      },
      {
        level: 7,
        name: 'War Magic',
        description:
          'When you use your action to cast a cantrip, you can make one weapon attack as a bonus action.',
      },
      {
        level: 10,
        name: 'Eldritch Strike',
        description:
          'When you hit a creature with a weapon attack, that creature has disadvantage on the next saving throw it makes against a spell you cast before the end of your next turn.',
      },
      {
        level: 15,
        name: 'Arcane Charge',
        description:
          'When you use your Action Surge, you can teleport up to 30 feet to an unoccupied space you can see. You can teleport before or after the additional action.',
      },
      {
        level: 18,
        name: 'Improved War Magic',
        description:
          'When you use your action to cast a spell of 1st or 2nd level, you can make one weapon attack as a bonus action.',
      },
    ],
    source: 'PHB',
  },
]
