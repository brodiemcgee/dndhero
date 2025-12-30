import type { DndClass } from '@/types/character-options'

export const RANGER: DndClass = {
  id: 'ranger',
  name: 'Ranger',
  description: 'A warrior who combats threats on the edges of civilization. Rangers are skilled hunters and trackers who specialize in fighting particular types of enemies and navigating wild terrain.',
  hitDie: 'd10',
  primaryAbilities: ['dexterity', 'wisdom'],
  savingThrows: ['strength', 'dexterity'],
  armorProficiencies: ['light', 'medium', 'shields'],
  weaponProficiencies: ['simple', 'martial'],
  skillOptions: {
    count: 3,
    options: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'],
  },
  spellcasting: {
    ability: 'wisdom',
    type: 'half',
    ritualCasting: false,
    spellsKnown: { 2: 2, 3: 3, 5: 4, 7: 5, 9: 6, 11: 7, 13: 8, 15: 9, 17: 10, 19: 11 },
  },
  features: [
    {
      id: 'favored-enemy',
      name: 'Favored Enemy',
      description: 'You have significant experience studying, tracking, hunting, and even talking to a certain type of enemy. Choose a type of favored enemy: aberrations, beasts, celestials, constructs, dragons, elementals, fey, fiends, giants, monstrosities, oozes, plants, or undead. You have advantage on Wisdom (Survival) checks to track your favored enemies, as well as on Intelligence checks to recall information about them.',
      level: 1,
      choices: {
        count: 1,
        options: ['Aberrations', 'Beasts', 'Celestials', 'Constructs', 'Dragons', 'Elementals', 'Fey', 'Fiends', 'Giants', 'Monstrosities', 'Oozes', 'Plants', 'Undead'],
      },
    },
    {
      id: 'natural-explorer',
      name: 'Natural Explorer',
      description: 'You are particularly familiar with one type of natural environment and are adept at traveling and surviving in such regions. Choose one type of favored terrain. While traveling in your favored terrain, you gain several benefits related to tracking and foraging.',
      level: 1,
      choices: {
        count: 1,
        options: ['Arctic', 'Coast', 'Desert', 'Forest', 'Grassland', 'Mountain', 'Swamp', 'Underdark'],
      },
    },
    {
      id: 'fighting-style-ranger',
      name: 'Fighting Style',
      description: 'You adopt a particular style of fighting as your specialty.',
      level: 2,
      choices: {
        count: 1,
        options: ['Archery', 'Defense', 'Dueling', 'Two-Weapon Fighting'],
      },
    },
    {
      id: 'primeval-awareness',
      name: 'Primeval Awareness',
      description: 'You can use your action and expend one ranger spell slot to focus your awareness on the region around you. For 1 minute per level of the spell slot you expend, you can sense whether certain types of creatures are present within 1 mile of you.',
      level: 3,
    },
    {
      id: 'extra-attack-ranger',
      name: 'Extra Attack',
      description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.',
      level: 5,
    },
  ],
  subclassLevel: 3,
  subclassName: 'Ranger Archetype',
  source: 'SRD',
}
