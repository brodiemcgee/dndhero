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
  {
    id: 'assassin',
    name: 'Assassin',
    className: 'Rogue',
    description:
      'You focus your training on the grim art of death. Those who adhere to this archetype are diverse: hired killers, spies, bounty hunters, and even specially anointed priests trained to exterminate the enemies of their deity. Stealth, poison, and disguise help you eliminate your foes with deadly efficiency.',
    features: [
      {
        level: 3,
        name: 'Bonus Proficiencies',
        description:
          'You gain proficiency with the disguise kit and the poisoner\'s kit.',
      },
      {
        level: 3,
        name: 'Assassinate',
        description:
          'You are at your deadliest when you get the drop on your enemies. You have advantage on attack rolls against any creature that hasn\'t taken a turn in the combat yet. In addition, any hit you score against a creature that is surprised is a critical hit.',
      },
      {
        level: 9,
        name: 'Infiltration Expertise',
        description:
          'You can unfailingly create false identities for yourself. You must spend seven days and 25 gp to establish the history, profession, and affiliations for an identity. You can\'t establish an identity that belongs to someone else. Thereafter, if you adopt the new identity as a disguise, other creatures believe you to be that person until given an obvious reason not to.',
      },
      {
        level: 13,
        name: 'Impostor',
        description:
          'You gain the ability to unerringly mimic another person\'s speech, writing, and behavior. You must spend at least three hours studying these three components of the person\'s behavior, listening to speech, examining handwriting, and observing mannerisms. Your ruse is indiscernible to the casual observer. If a wary creature suspects something is amiss, you have advantage on any Charisma (Deception) check you make to avoid detection.',
      },
      {
        level: 17,
        name: 'Death Strike',
        description:
          'You become a master of instant death. When you attack and hit a creature that is surprised, it must make a Constitution saving throw (DC 8 + your Dexterity modifier + your proficiency bonus). On a failed save, double the damage of your attack against the creature.',
      },
    ],
    source: 'PHB',
  },
  {
    id: 'arcane-trickster',
    name: 'Arcane Trickster',
    className: 'Rogue',
    description:
      'Some rogues enhance their fine-honed skills of stealth and agility with magic, learning tricks of enchantment and illusion. These rogues include pickpockets and burglars, but also pranksters, mischief-makers, and a significant number of adventurers.',
    features: [
      {
        level: 3,
        name: 'Spellcasting',
        description:
          'You gain the ability to cast spells. You learn three cantrips: mage hand and two other cantrips of your choice from the wizard spell list. You learn three 1st-level wizard spells, two of which must be from the enchantment or illusion schools. Intelligence is your spellcasting ability for these spells. You learn additional spells as you gain levels in this class, and most must be enchantment or illusion spells.',
      },
      {
        level: 3,
        name: 'Mage Hand Legerdemain',
        description:
          'When you cast mage hand, you can make the spectral hand invisible, and you can perform the following additional tasks with it: stow or retrieve an object in a container worn or carried by another creature; use thieves\' tools to pick locks and disarm traps at range. You can perform one of these tasks without being noticed by a creature if you succeed on a Dexterity (Sleight of Hand) check contested by the creature\'s Wisdom (Perception) check. You can use the bonus action granted by Cunning Action to control the hand.',
      },
      {
        level: 9,
        name: 'Magical Ambush',
        description:
          'If you are hidden from a creature when you cast a spell on it, the creature has disadvantage on any saving throw it makes against the spell this turn.',
      },
      {
        level: 13,
        name: 'Versatile Trickster',
        description:
          'You gain the ability to distract targets with your mage hand. As a bonus action on your turn, you can designate a creature within 5 feet of the spectral hand created by the spell. Doing so gives you advantage on attack rolls against that creature until the end of the turn.',
      },
      {
        level: 17,
        name: 'Spell Thief',
        description:
          'You gain the ability to magically steal the knowledge of how to cast a spell from another spellcaster. Immediately after a creature casts a spell that targets you or includes you in its area of effect, you can use your reaction to force the creature to make a saving throw with its spellcasting ability modifier. The DC equals your spell save DC. On a failed save, you negate the spell\'s effect against you, and you steal the knowledge of the spell if it is at least 1st level and of a level you can cast. For the next 8 hours, you know the spell and can cast it using your spell slots. The creature can\'t cast that spell until the 8 hours have passed. Once you use this feature, you can\'t use it again until you finish a long rest.',
      },
    ],
    source: 'PHB',
  },
]
