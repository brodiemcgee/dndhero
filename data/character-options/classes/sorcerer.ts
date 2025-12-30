import type { DndClass } from '@/types/character-options'

export const SORCERER: DndClass = {
  id: 'sorcerer',
  name: 'Sorcerer',
  description: 'A spellcaster who draws on inherent magic from a gift or bloodline. Sorcerers carry a magical birthright conferred upon them by an exotic bloodline, some otherworldly influence, or exposure to unknown cosmic forces.',
  hitDie: 'd6',
  primaryAbilities: ['charisma'],
  savingThrows: ['constitution', 'charisma'],
  armorProficiencies: [],
  weaponProficiencies: ['dagger', 'dart', 'sling', 'quarterstaff', 'light crossbow'],
  skillOptions: {
    count: 2,
    options: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'],
  },
  spellcasting: {
    ability: 'charisma',
    type: 'full',
    ritualCasting: false,
    cantripsKnown: { 1: 4, 4: 5, 10: 6 },
    spellsKnown: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11, 11: 12, 13: 13, 15: 14, 17: 15 },
  },
  features: [
    {
      id: 'sorcerous-origin',
      name: 'Sorcerous Origin',
      description: 'Choose a sorcerous origin, which describes the source of your innate magical power. Your choice grants you features at 1st level and again at 6th, 14th, and 18th level.',
      level: 1,
      choices: {
        count: 1,
        options: ['Draconic Bloodline', 'Wild Magic'],
      },
    },
    {
      id: 'font-of-magic',
      name: 'Font of Magic',
      description: 'You tap into a deep wellspring of magic within yourself. This wellspring is represented by sorcery points, which allow you to create a variety of magical effects. You have a number of sorcery points equal to your sorcerer level.',
      level: 2,
    },
    {
      id: 'metamagic',
      name: 'Metamagic',
      description: 'You gain the ability to twist your spells to suit your needs. You gain two Metamagic options of your choice. You can use only one Metamagic option on a spell when you cast it, unless otherwise noted.',
      level: 3,
      choices: {
        count: 2,
        options: ['Careful Spell', 'Distant Spell', 'Empowered Spell', 'Extended Spell', 'Heightened Spell', 'Quickened Spell', 'Subtle Spell', 'Twinned Spell'],
      },
    },
    {
      id: 'sorcerous-restoration',
      name: 'Sorcerous Restoration',
      description: 'You regain 4 expended sorcery points whenever you finish a short rest.',
      level: 20,
    },
  ],
  subclassLevel: 1,
  subclassName: 'Sorcerous Origin',
  source: 'SRD',
}
