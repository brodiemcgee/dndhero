import type { Race } from '@/types/character-options'

export const HALF_ELF: Race = {
  id: 'half-elf',
  name: 'Half-Elf',
  description: 'Walking in two worlds but truly belonging to neither, half-elves combine what some say are the best qualities of their elf and human parents: human curiosity and ambition tempered by the refined senses and love of nature of the elves.',
  abilityBonuses: [
    { ability: 'charisma', bonus: 2 },
    // Note: Half-elves also get +1 to two other abilities of their choice
    // This is handled in character creation UI
  ],
  size: 'Medium',
  speed: 30,
  languages: ['Common', 'Elvish', 'One extra language of your choice'],
  traits: [
    {
      id: 'darkvision',
      name: 'Darkvision',
      description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.',
      darkvision: 60,
    },
    {
      id: 'fey-ancestry',
      name: 'Fey Ancestry',
      description: 'You have advantage on saving throws against being charmed, and magic cannot put you to sleep.',
      advantageOn: ['charm saves'],
      immunities: ['magical sleep'],
    },
    {
      id: 'skill-versatility',
      name: 'Skill Versatility',
      description: 'You gain proficiency in two skills of your choice.',
      proficiencies: { skills: ['Choice', 'Choice'] },
    },
    {
      id: 'ability-score-increase',
      name: 'Ability Score Increase',
      description: 'In addition to +2 Charisma, you can increase two other ability scores of your choice by 1.',
    },
  ],
  source: 'SRD',
}
