import type { Subclass } from './types'

export const SORCERER_SUBCLASSES: Subclass[] = [
  {
    id: 'draconic-bloodline',
    name: 'Draconic Bloodline',
    className: 'Sorcerer',
    description:
      'Your innate magic comes from draconic magic that was mingled with your blood or that of your ancestors. Most often, sorcerers with this origin trace their descent back to a mighty sorcerer of ancient times who made a bargain with a dragon or who might even have claimed a dragon parent.',
    features: [
      {
        level: 1,
        name: 'Dragon Ancestor',
        description:
          'You choose one type of dragon as your ancestor. The damage type associated with each dragon is used by features you gain later. You can speak, read, and write Draconic. Additionally, whenever you make a Charisma check when interacting with dragons, your proficiency bonus is doubled if it applies to the check.',
      },
      {
        level: 1,
        name: 'Draconic Resilience',
        description:
          'As magic flows through your body, it causes physical traits of your dragon ancestors to emerge. Your hit point maximum increases by 1 and increases by 1 again whenever you gain a level in this class. Additionally, when you aren\'t wearing armor, your AC equals 13 + your Dexterity modifier.',
      },
      {
        level: 6,
        name: 'Elemental Affinity',
        description:
          'When you cast a spell that deals damage of the type associated with your draconic ancestry, you can add your Charisma modifier to one damage roll of that spell. At the same time, you can spend 1 sorcery point to gain resistance to that damage type for 1 hour.',
      },
      {
        level: 14,
        name: 'Dragon Wings',
        description:
          'You gain the ability to sprout a pair of dragon wings from your back, gaining a flying speed equal to your current speed. You can create these wings as a bonus action on your turn. They last until you dismiss them as a bonus action on your turn. You can\'t manifest your wings while wearing armor unless the armor is made to accommodate them.',
      },
      {
        level: 18,
        name: 'Draconic Presence',
        description:
          'You can channel the dread presence of your dragon ancestor, causing those around you to become awestruck or frightened. As an action, you can spend 5 sorcery points to draw on this power and exude an aura of awe or fear (your choice) to a distance of 60 feet. Each hostile creature in that area must succeed on a Wisdom saving throw or be charmed (if you chose awe) or frightened (if you chose fear) for 1 minute.',
      },
    ],
    source: 'SRD',
  },
]
