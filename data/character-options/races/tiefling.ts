import type { Race } from '@/types/character-options'

export const TIEFLING: Race = {
  id: 'tiefling',
  name: 'Tiefling',
  description: 'To be greeted with stares and whispers, to suffer violence and insult on the street, to see mistrust and fear in every eye: this is the lot of the tiefling. Their infernal heritage has left a clear imprint on their appearance, with horns, unusual skin colors, and other fiendish features.',
  abilityBonuses: [
    { ability: 'charisma', bonus: 2 },
    { ability: 'intelligence', bonus: 1 },
  ],
  size: 'Medium',
  speed: 30,
  languages: ['Common', 'Infernal'],
  traits: [
    {
      id: 'darkvision',
      name: 'Darkvision',
      description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.',
      darkvision: 60,
    },
    {
      id: 'hellish-resistance',
      name: 'Hellish Resistance',
      description: 'You have resistance to fire damage.',
      resistances: ['fire'],
    },
    {
      id: 'infernal-legacy',
      name: 'Infernal Legacy',
      description: 'You know the thaumaturgy cantrip. When you reach 3rd level, you can cast the hellish rebuke spell as a 2nd-level spell once per long rest. When you reach 5th level, you can cast the darkness spell once per long rest. Charisma is your spellcasting ability for these spells.',
      cantrip: 'thaumaturgy',
    },
  ],
  source: 'SRD',
}
