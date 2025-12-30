import type { DndClass } from '@/types/character-options'

export const FIGHTER: DndClass = {
  id: 'fighter',
  name: 'Fighter',
  description: 'A master of martial combat, skilled with a variety of weapons and armor. Fighters learn the basics of all combat styles and are the most versatile warriors, capable of specializing in any weapon or fighting technique.',
  hitDie: 'd10',
  primaryAbilities: ['strength', 'dexterity'],
  savingThrows: ['strength', 'constitution'],
  armorProficiencies: ['light', 'medium', 'heavy', 'shields'],
  weaponProficiencies: ['simple', 'martial'],
  skillOptions: {
    count: 2,
    options: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'],
  },
  features: [
    {
      id: 'fighting-style-fighter',
      name: 'Fighting Style',
      description: 'You adopt a particular style of fighting as your specialty. Choose one fighting style. You cannot take a Fighting Style option more than once.',
      level: 1,
      choices: {
        count: 1,
        options: ['Archery', 'Defense', 'Dueling', 'Great Weapon Fighting', 'Protection', 'Two-Weapon Fighting'],
      },
    },
    {
      id: 'second-wind',
      name: 'Second Wind',
      description: 'You have a limited well of stamina that you can draw on to protect yourself from harm. On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level. Once you use this feature, you must finish a short or long rest before you can use it again.',
      level: 1,
    },
    {
      id: 'action-surge',
      name: 'Action Surge',
      description: 'You can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action. Once you use this feature, you must finish a short or long rest before you can use it again. You can use it twice at 17th level.',
      level: 2,
    },
    {
      id: 'extra-attack-fighter',
      name: 'Extra Attack',
      description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn. The number of attacks increases to three at 11th level and to four at 20th level.',
      level: 5,
    },
    {
      id: 'indomitable',
      name: 'Indomitable',
      description: 'You can reroll a saving throw that you fail. If you do so, you must use the new roll. You can use this feature once, twice at 13th level, and three times at 17th level.',
      level: 9,
    },
  ],
  subclassLevel: 3,
  subclassName: 'Martial Archetype',
  source: 'SRD',
}
