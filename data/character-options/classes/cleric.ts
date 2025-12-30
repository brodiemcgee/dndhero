import type { DndClass } from '@/types/character-options'

export const CLERIC: DndClass = {
  id: 'cleric',
  name: 'Cleric',
  description: 'A priestly champion who wields divine magic in service of a higher power. Clerics are intermediaries between the mortal world and the distant planes of the gods, combining magic with martial prowess.',
  hitDie: 'd8',
  primaryAbilities: ['wisdom'],
  savingThrows: ['wisdom', 'charisma'],
  armorProficiencies: ['light', 'medium', 'shields'],
  weaponProficiencies: ['simple'],
  skillOptions: {
    count: 2,
    options: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'],
  },
  spellcasting: {
    ability: 'wisdom',
    type: 'full',
    ritualCasting: true,
    cantripsKnown: { 1: 3, 4: 4, 10: 5 },
  },
  features: [
    {
      id: 'divine-domain',
      name: 'Divine Domain',
      description: 'Choose one domain related to your deity. Your choice grants you domain spells and other features at 1st level. It also grants you additional ways to use Channel Divinity when you gain that feature at 2nd level.',
      level: 1,
      choices: { count: 1, options: ['Knowledge', 'Life', 'Light', 'Nature', 'Tempest', 'Trickery', 'War'] },
    },
    {
      id: 'channel-divinity',
      name: 'Channel Divinity',
      description: 'You gain the ability to channel divine energy directly from your deity, using that energy to fuel magical effects. You start with two such effects: Turn Undead and an effect determined by your domain.',
      level: 2,
    },
    {
      id: 'turn-undead',
      name: 'Channel Divinity: Turn Undead',
      description: 'As an action, you present your holy symbol and speak a prayer censuring the undead. Each undead within 30 feet that can see or hear you must make a Wisdom saving throw. If the creature fails, it is turned for 1 minute or until it takes damage.',
      level: 2,
    },
    {
      id: 'destroy-undead',
      name: 'Destroy Undead',
      description: 'When an undead fails its saving throw against your Turn Undead feature, the creature is instantly destroyed if its challenge rating is at or below a certain threshold based on your cleric level.',
      level: 5,
    },
  ],
  subclassLevel: 1,
  subclassName: 'Divine Domain',
  source: 'SRD',
}
