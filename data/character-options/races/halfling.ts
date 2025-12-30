import type { Race } from '@/types/character-options'

export const HALFLING: Race = {
  id: 'halfling',
  name: 'Halfling',
  description: 'The diminutive halflings survive in a world full of larger creatures by avoiding notice or, barring that, avoiding offense. They are a cheerful and practical people.',
  abilityBonuses: [
    { ability: 'dexterity', bonus: 2 },
  ],
  size: 'Small',
  speed: 25,
  languages: ['Common', 'Halfling'],
  traits: [
    {
      id: 'lucky',
      name: 'Lucky',
      description: 'When you roll a 1 on an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll.',
    },
    {
      id: 'brave',
      name: 'Brave',
      description: 'You have advantage on saving throws against being frightened.',
      advantageOn: ['frightened saves'],
    },
    {
      id: 'halfling-nimbleness',
      name: 'Halfling Nimbleness',
      description: 'You can move through the space of any creature that is of a size larger than yours.',
    },
  ],
  subraces: [
    {
      id: 'lightfoot',
      name: 'Lightfoot Halfling',
      description: 'Lightfoot halflings can easily hide from notice, even using other people as cover.',
      abilityBonuses: [{ ability: 'charisma', bonus: 1 }],
      traits: [
        {
          id: 'naturally-stealthy',
          name: 'Naturally Stealthy',
          description: 'You can attempt to hide even when you are obscured only by a creature that is at least one size larger than you.',
        },
      ],
    },
    {
      id: 'stout',
      name: 'Stout Halfling',
      description: 'Stout halflings are hardier than average and have some resistance to poison.',
      abilityBonuses: [{ ability: 'constitution', bonus: 1 }],
      traits: [
        {
          id: 'stout-resilience',
          name: 'Stout Resilience',
          description: 'You have advantage on saving throws against poison, and you have resistance against poison damage.',
          resistances: ['poison'],
          advantageOn: ['poison saves'],
        },
      ],
    },
  ],
  source: 'SRD',
}
