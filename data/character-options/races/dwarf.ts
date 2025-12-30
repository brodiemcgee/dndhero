import type { Race } from '@/types/character-options'

export const DWARF: Race = {
  id: 'dwarf',
  name: 'Dwarf',
  description: 'Bold and hardy, dwarves are known as skilled warriors, miners, and workers of stone and metal. They are fierce fighters and loyal friends.',
  abilityBonuses: [
    { ability: 'constitution', bonus: 2 },
  ],
  size: 'Medium',
  speed: 25,
  languages: ['Common', 'Dwarvish'],
  traits: [
    {
      id: 'darkvision',
      name: 'Darkvision',
      description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.',
      darkvision: 60,
    },
    {
      id: 'dwarven-resilience',
      name: 'Dwarven Resilience',
      description: 'You have advantage on saving throws against poison, and you have resistance against poison damage.',
      resistances: ['poison'],
      advantageOn: ['poison saves'],
    },
    {
      id: 'dwarven-combat-training',
      name: 'Dwarven Combat Training',
      description: 'You have proficiency with the battleaxe, handaxe, light hammer, and warhammer.',
      proficiencies: { weapons: ['battleaxe', 'handaxe', 'light hammer', 'warhammer'] },
    },
    {
      id: 'tool-proficiency',
      name: 'Tool Proficiency',
      description: "You gain proficiency with one artisan's tools of your choice: smith's tools, brewer's supplies, or mason's tools.",
      proficiencies: { tools: ['Choice: smith\'s tools, brewer\'s supplies, or mason\'s tools'] },
    },
    {
      id: 'stonecunning',
      name: 'Stonecunning',
      description: 'Whenever you make an Intelligence (History) check related to the origin of stonework, you are considered proficient and add double your proficiency bonus.',
    },
  ],
  subraces: [
    {
      id: 'hill-dwarf',
      name: 'Hill Dwarf',
      description: 'Hill dwarves have keen senses, deep intuition, and remarkable resilience.',
      abilityBonuses: [{ ability: 'wisdom', bonus: 1 }],
      traits: [
        {
          id: 'dwarven-toughness',
          name: 'Dwarven Toughness',
          description: 'Your hit point maximum increases by 1, and it increases by 1 every time you gain a level.',
        },
      ],
    },
    {
      id: 'mountain-dwarf',
      name: 'Mountain Dwarf',
      description: 'Mountain dwarves are strong and hardy, accustomed to a difficult life in rugged terrain.',
      abilityBonuses: [{ ability: 'strength', bonus: 2 }],
      traits: [
        {
          id: 'dwarven-armor-training',
          name: 'Dwarven Armor Training',
          description: 'You have proficiency with light and medium armor.',
          proficiencies: { armor: ['light', 'medium'] },
        },
      ],
    },
  ],
  source: 'SRD',
}
