import type { DndClass } from '@/types/character-options'

export const MONK: DndClass = {
  id: 'monk',
  name: 'Monk',
  description: 'A master of martial arts, harnessing the power of the body in pursuit of physical and spiritual perfection. Monks channel ki, a magical energy that flows through living bodies, to perform supernatural feats.',
  hitDie: 'd8',
  primaryAbilities: ['dexterity', 'wisdom'],
  savingThrows: ['strength', 'dexterity'],
  armorProficiencies: [],
  weaponProficiencies: ['simple', 'shortsword'],
  toolProficiencies: ['One artisan\'s tools or musical instrument of your choice'],
  skillOptions: {
    count: 2,
    options: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'],
  },
  features: [
    {
      id: 'unarmored-defense-monk',
      name: 'Unarmored Defense',
      description: 'While you are wearing no armor and not wielding a shield, your AC equals 10 + your Dexterity modifier + your Wisdom modifier.',
      level: 1,
    },
    {
      id: 'martial-arts',
      name: 'Martial Arts',
      description: 'Your practice of martial arts gives you mastery of combat styles that use unarmed strikes and monk weapons. You can use Dexterity instead of Strength for attack and damage rolls, you can roll a d4 in place of the normal damage, and when you take the Attack action you can make one unarmed strike as a bonus action.',
      level: 1,
    },
    {
      id: 'ki',
      name: 'Ki',
      description: 'Your training allows you to harness the mystic energy of ki. You have a number of ki points equal to your monk level. You can spend these points to fuel various ki features: Flurry of Blows, Patient Defense, and Step of the Wind.',
      level: 2,
    },
    {
      id: 'unarmored-movement',
      name: 'Unarmored Movement',
      description: 'Your speed increases by 10 feet while you are not wearing armor or wielding a shield. This bonus increases as you gain monk levels.',
      level: 2,
    },
    {
      id: 'deflect-missiles',
      name: 'Deflect Missiles',
      description: 'You can use your reaction to deflect or catch the missile when you are hit by a ranged weapon attack. The damage you take is reduced by 1d10 + your Dexterity modifier + your monk level.',
      level: 3,
    },
    {
      id: 'slow-fall',
      name: 'Slow Fall',
      description: 'You can use your reaction to reduce any falling damage you take by an amount equal to five times your monk level.',
      level: 4,
    },
    {
      id: 'extra-attack-monk',
      name: 'Extra Attack',
      description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.',
      level: 5,
    },
    {
      id: 'stunning-strike',
      name: 'Stunning Strike',
      description: 'You can interfere with the flow of ki in an opponent\'s body. When you hit another creature with a melee weapon attack, you can spend 1 ki point to attempt a stunning strike. The target must succeed on a Constitution saving throw or be stunned until the end of your next turn.',
      level: 5,
    },
  ],
  subclassLevel: 3,
  subclassName: 'Monastic Tradition',
  source: 'SRD',
}
