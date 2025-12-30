import type { DndClass } from '@/types/character-options'

export const WARLOCK: DndClass = {
  id: 'warlock',
  name: 'Warlock',
  description: 'A wielder of magic that is derived from a bargain with an extraplanar entity. Warlocks are seekers of knowledge that lies hidden in the fabric of the multiverse, making pacts with mysterious beings of supernatural power.',
  hitDie: 'd8',
  primaryAbilities: ['charisma'],
  savingThrows: ['wisdom', 'charisma'],
  armorProficiencies: ['light'],
  weaponProficiencies: ['simple'],
  skillOptions: {
    count: 2,
    options: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'],
  },
  spellcasting: {
    ability: 'charisma',
    type: 'pact',
    ritualCasting: false,
    cantripsKnown: { 1: 2, 4: 3, 10: 4 },
    spellsKnown: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 11: 11, 13: 12, 15: 13, 17: 14, 19: 15 },
  },
  features: [
    {
      id: 'otherworldly-patron',
      name: 'Otherworldly Patron',
      description: 'You have struck a bargain with an otherworldly being of your choice. Your choice grants you features at 1st level and again at 6th, 10th, and 14th level.',
      level: 1,
      choices: {
        count: 1,
        options: ['The Archfey', 'The Fiend', 'The Great Old One'],
      },
    },
    {
      id: 'pact-magic',
      name: 'Pact Magic',
      description: 'Your arcane research and the magic bestowed on you by your patron have given you facility with spells. You regain all expended spell slots when you finish a short or long rest. All spell slots are the same level (increases as you level).',
      level: 1,
    },
    {
      id: 'eldritch-invocations',
      name: 'Eldritch Invocations',
      description: 'In your study of occult lore, you have unearthed eldritch invocations, fragments of forbidden knowledge that imbue you with an abiding magical ability. You gain two eldritch invocations of your choice.',
      level: 2,
      choices: {
        count: 2,
        options: ['Agonizing Blast', 'Armor of Shadows', 'Beast Speech', 'Beguiling Influence', 'Devil\'s Sight', 'Eldritch Sight', 'Eyes of the Rune Keeper', 'Fiendish Vigor', 'Gaze of Two Minds', 'Mask of Many Faces', 'Misty Visions', 'Thief of Five Fates'],
      },
    },
    {
      id: 'pact-boon',
      name: 'Pact Boon',
      description: 'Your otherworldly patron bestows a gift upon you for your loyal service. You gain one of the following features of your choice.',
      level: 3,
      choices: {
        count: 1,
        options: ['Pact of the Chain', 'Pact of the Blade', 'Pact of the Tome'],
      },
    },
    {
      id: 'mystic-arcanum',
      name: 'Mystic Arcanum',
      description: 'Your patron bestows upon you a magical secret called an arcanum. Choose one 6th-level spell from the warlock spell list as this arcanum. You can cast your arcanum spell once without expending a spell slot.',
      level: 11,
    },
  ],
  subclassLevel: 1,
  subclassName: 'Otherworldly Patron',
  source: 'SRD',
}
