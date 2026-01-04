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
  {
    id: 'wild-magic',
    name: 'Wild Magic',
    className: 'Sorcerer',
    description:
      'Your innate magic comes from the wild forces of chaos that underlie the order of creation. You might have endured exposure to some form of raw magic, perhaps through a planar portal leading to Limbo, the Elemental Planes, or the mysterious Far Realm. Perhaps you were blessed by a powerful fey creature or marked by a demon. Or your magic could be a fluke of your birth, with no apparent cause or reason. However it came to be, this chaotic magic churns within you, waiting for any outlet.',
    features: [
      {
        level: 1,
        name: 'Wild Magic Surge',
        description:
          'Your spellcasting can unleash surges of untamed magic. Once per turn, the DM can have you roll a d20 immediately after you cast a sorcerer spell of 1st level or higher. If you roll a 1, roll on the Wild Magic Surge table to create a magical effect.',
      },
      {
        level: 1,
        name: 'Tides of Chaos',
        description:
          'You can manipulate the forces of chance and chaos to gain advantage on one attack roll, ability check, or saving throw. Once you do so, you must finish a long rest before you can use this feature again. Any time before you regain the use of this feature, the DM can have you roll on the Wild Magic Surge table immediately after you cast a sorcerer spell of 1st level or higher. You then regain the use of this feature.',
      },
      {
        level: 6,
        name: 'Bend Luck',
        description:
          'You have the ability to twist fate using your wild magic. When another creature you can see makes an attack roll, an ability check, or a saving throw, you can use your reaction and spend 2 sorcery points to roll 1d4 and apply the number rolled as a bonus or penalty (your choice) to the creature\'s roll. You can do so after the creature rolls but before any effects of the roll occur.',
      },
      {
        level: 14,
        name: 'Controlled Chaos',
        description:
          'You gain a modicum of control over the surges of your wild magic. Whenever you roll on the Wild Magic Surge table, you can roll twice and use either number.',
      },
      {
        level: 18,
        name: 'Spell Bombardment',
        description:
          'The harmful energy of your spells intensifies. When you roll damage for a spell and roll the highest number possible on any of the dice, choose one of those dice, roll it again and add that roll to the damage. You can use the feature only once per turn.',
      },
    ],
    source: 'PHB',
  },
]
