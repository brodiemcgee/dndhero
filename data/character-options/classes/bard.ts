import type { DndClass } from '@/types/character-options'

export const BARD: DndClass = {
  id: 'bard',
  name: 'Bard',
  description: 'An inspiring magician whose power echoes the music of creation. Bards use their artistic talents to weave magic, inspire allies, demoralize enemies, and manipulate minds.',
  hitDie: 'd8',
  primaryAbilities: ['charisma'],
  savingThrows: ['dexterity', 'charisma'],
  armorProficiencies: ['light'],
  weaponProficiencies: ['simple', 'hand crossbow', 'longsword', 'rapier', 'shortsword'],
  toolProficiencies: ['Three musical instruments of your choice'],
  skillOptions: {
    count: 3,
    options: ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'],
  },
  spellcasting: {
    ability: 'charisma',
    type: 'full',
    ritualCasting: true,
    cantripsKnown: { 1: 2, 4: 3, 10: 4 },
    spellsKnown: { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 9: 12, 10: 14, 11: 15, 13: 16, 14: 18, 15: 19, 17: 20, 18: 22 },
  },
  features: [
    {
      id: 'bardic-inspiration',
      name: 'Bardic Inspiration',
      description: 'You can inspire others through stirring words or music. As a bonus action, choose one creature within 60 feet who can hear you. That creature gains one Bardic Inspiration die (d6). Once within the next 10 minutes, the creature can roll the die and add it to one ability check, attack roll, or saving throw. You can use this feature a number of times equal to your Charisma modifier.',
      level: 1,
    },
    {
      id: 'jack-of-all-trades',
      name: 'Jack of All Trades',
      description: 'You can add half your proficiency bonus, rounded down, to any ability check you make that does not already include your proficiency bonus.',
      level: 2,
    },
    {
      id: 'song-of-rest',
      name: 'Song of Rest',
      description: 'You can use soothing music or oration to help revitalize your wounded allies during a short rest. If you or any friendly creatures who can hear your performance regain hit points at the end of the short rest by spending one or more Hit Dice, each of those creatures regains an extra 1d6 hit points.',
      level: 2,
    },
    {
      id: 'expertise-bard',
      name: 'Expertise',
      description: 'Choose two of your skill proficiencies. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.',
      level: 3,
      choices: { count: 2, options: ['Any proficient skill'] },
    },
    {
      id: 'font-of-inspiration',
      name: 'Font of Inspiration',
      description: 'You regain all of your expended uses of Bardic Inspiration when you finish a short or long rest.',
      level: 5,
    },
  ],
  subclassLevel: 3,
  subclassName: 'Bard College',
  source: 'SRD',
}
