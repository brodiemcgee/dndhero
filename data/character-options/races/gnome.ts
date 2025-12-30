import type { Race } from '@/types/character-options'

export const GNOME: Race = {
  id: 'gnome',
  name: 'Gnome',
  description: "A gnome's energy and enthusiasm for living shines through every inch of their tiny body. Gnomes average slightly over 3 feet tall and are known for their curiosity and inventiveness.",
  abilityBonuses: [
    { ability: 'intelligence', bonus: 2 },
  ],
  size: 'Small',
  speed: 25,
  languages: ['Common', 'Gnomish'],
  traits: [
    {
      id: 'darkvision',
      name: 'Darkvision',
      description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.',
      darkvision: 60,
    },
    {
      id: 'gnome-cunning',
      name: 'Gnome Cunning',
      description: 'You have advantage on all Intelligence, Wisdom, and Charisma saving throws against magic.',
      advantageOn: ['Intelligence saves vs magic', 'Wisdom saves vs magic', 'Charisma saves vs magic'],
    },
  ],
  subraces: [
    {
      id: 'forest-gnome',
      name: 'Forest Gnome',
      description: 'Forest gnomes have a natural knack for illusion and an innate ability to communicate with small beasts.',
      abilityBonuses: [{ ability: 'dexterity', bonus: 1 }],
      traits: [
        {
          id: 'natural-illusionist',
          name: 'Natural Illusionist',
          description: 'You know the minor illusion cantrip. Intelligence is your spellcasting ability for it.',
          cantrip: 'minor-illusion',
        },
        {
          id: 'speak-with-small-beasts',
          name: 'Speak with Small Beasts',
          description: 'Through sounds and gestures, you can communicate simple ideas with Small or smaller beasts.',
        },
      ],
    },
    {
      id: 'rock-gnome',
      name: 'Rock Gnome',
      description: 'Rock gnomes have a natural inventiveness and hardiness beyond that of other gnomes.',
      abilityBonuses: [{ ability: 'constitution', bonus: 1 }],
      traits: [
        {
          id: 'artificers-lore',
          name: "Artificer's Lore",
          description: 'Whenever you make an Intelligence (History) check related to magic items, alchemical objects, or technological devices, you can add twice your proficiency bonus.',
        },
        {
          id: 'tinker',
          name: 'Tinker',
          description: "You have proficiency with artisan's tools (tinker's tools). Using those tools, you can spend 1 hour and 10 gp worth of materials to construct a Tiny clockwork device.",
          proficiencies: { tools: ["tinker's tools"] },
        },
      ],
    },
  ],
  source: 'SRD',
}
