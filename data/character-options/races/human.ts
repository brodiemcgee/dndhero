import type { Race } from '@/types/character-options'

export const HUMAN: Race = {
  id: 'human',
  name: 'Human',
  description: 'Humans are the most adaptable and ambitious people among the common races. Whatever drives them, humans are the innovators, the achievers, and the pioneers of the worlds.',
  abilityBonuses: [
    { ability: 'strength', bonus: 1 },
    { ability: 'dexterity', bonus: 1 },
    { ability: 'constitution', bonus: 1 },
    { ability: 'intelligence', bonus: 1 },
    { ability: 'wisdom', bonus: 1 },
    { ability: 'charisma', bonus: 1 },
  ],
  size: 'Medium',
  speed: 30,
  languages: ['Common', 'One extra language of your choice'],
  traits: [
    {
      id: 'versatile',
      name: 'Versatile',
      description: 'Humans gain +1 to all ability scores, reflecting their adaptable nature.',
    },
    {
      id: 'extra-language',
      name: 'Extra Language',
      description: 'You can speak, read, and write one extra language of your choice.',
      proficiencies: { languages: ['Choice'] },
    },
  ],
  source: 'SRD',
}
