import type { Race } from '@/types/character-options'

export const HALF_ORC: Race = {
  id: 'half-orc',
  name: 'Half-Orc',
  description: 'Half-orcs exhibit a blend of orcish and human characteristics, and their appearance varies widely. Some half-orcs have tusks, gray or greenish skin, sloping foreheads, and coarse body hair. They are proud warriors who combine human tenacity with orcish ferocity.',
  abilityBonuses: [
    { ability: 'strength', bonus: 2 },
    { ability: 'constitution', bonus: 1 },
  ],
  size: 'Medium',
  speed: 30,
  languages: ['Common', 'Orc'],
  traits: [
    {
      id: 'darkvision',
      name: 'Darkvision',
      description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.',
      darkvision: 60,
    },
    {
      id: 'menacing',
      name: 'Menacing',
      description: 'You gain proficiency in the Intimidation skill.',
      proficiencies: { skills: ['Intimidation'] },
    },
    {
      id: 'relentless-endurance',
      name: 'Relentless Endurance',
      description: 'When you are reduced to 0 hit points but not killed outright, you can drop to 1 hit point instead. You must finish a long rest before you can use this feature again.',
    },
    {
      id: 'savage-attacks',
      name: 'Savage Attacks',
      description: 'When you score a critical hit with a melee weapon attack, you can roll one of the weapon\'s damage dice one additional time and add it to the extra damage of the critical hit.',
    },
  ],
  source: 'SRD',
}
