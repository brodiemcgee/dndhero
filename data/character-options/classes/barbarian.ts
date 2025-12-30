import type { DndClass } from '@/types/character-options'

export const BARBARIAN: DndClass = {
  id: 'barbarian',
  name: 'Barbarian',
  description: 'A fierce warrior who can enter a battle rage. Barbarians are primal warriors driven by fury and instinct, capable of shrugging off damage that would fell lesser fighters.',
  hitDie: 'd12',
  primaryAbilities: ['strength'],
  savingThrows: ['strength', 'constitution'],
  armorProficiencies: ['light', 'medium', 'shields'],
  weaponProficiencies: ['simple', 'martial'],
  skillOptions: {
    count: 2,
    options: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'],
  },
  features: [
    {
      id: 'rage',
      name: 'Rage',
      description: 'In battle, you fight with primal ferocity. On your turn, you can enter a rage as a bonus action. While raging, you gain advantage on Strength checks and saving throws, bonus rage damage on melee attacks, and resistance to bludgeoning, piercing, and slashing damage.',
      level: 1,
    },
    {
      id: 'unarmored-defense-barbarian',
      name: 'Unarmored Defense',
      description: 'While you are not wearing any armor, your AC equals 10 + your Dexterity modifier + your Constitution modifier. You can use a shield and still gain this benefit.',
      level: 1,
    },
    {
      id: 'reckless-attack',
      name: 'Reckless Attack',
      description: 'You can throw aside all concern for defense to attack with fierce desperation. When you make your first attack on your turn, you can decide to attack recklessly, giving you advantage on melee weapon attack rolls using Strength during this turn, but attack rolls against you have advantage until your next turn.',
      level: 2,
    },
    {
      id: 'danger-sense',
      name: 'Danger Sense',
      description: 'You have advantage on Dexterity saving throws against effects that you can see, such as traps and spells. To gain this benefit, you cannot be blinded, deafened, or incapacitated.',
      level: 2,
    },
    {
      id: 'extra-attack-barbarian',
      name: 'Extra Attack',
      description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.',
      level: 5,
    },
  ],
  subclassLevel: 3,
  subclassName: 'Primal Path',
  source: 'SRD',
}
