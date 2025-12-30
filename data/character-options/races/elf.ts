import type { Race } from '@/types/character-options'

export const ELF: Race = {
  id: 'elf',
  name: 'Elf',
  description: 'Elves are a magical people of otherworldly grace, living in places of ethereal beauty. They love nature and magic, art and artistry, music and poetry.',
  abilityBonuses: [
    { ability: 'dexterity', bonus: 2 },
  ],
  size: 'Medium',
  speed: 30,
  languages: ['Common', 'Elvish'],
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
      id: 'trance',
      name: 'Trance',
      description: 'Elves do not sleep. Instead they meditate deeply for 4 hours a day, gaining the same benefit a human does from 8 hours of sleep.',
    },
    {
      id: 'keen-senses',
      name: 'Keen Senses',
      description: 'You have proficiency in the Perception skill.',
      proficiencies: { skills: ['Perception'] },
    },
  ],
  subraces: [
    {
      id: 'high-elf',
      name: 'High Elf',
      description: 'High elves have a keen mind and a mastery of at least the basics of magic.',
      abilityBonuses: [{ ability: 'intelligence', bonus: 1 }],
      traits: [
        {
          id: 'elf-weapon-training',
          name: 'Elf Weapon Training',
          description: 'You have proficiency with the longsword, shortsword, shortbow, and longbow.',
          proficiencies: { weapons: ['longsword', 'shortsword', 'shortbow', 'longbow'] },
        },
        {
          id: 'cantrip',
          name: 'Cantrip',
          description: 'You know one cantrip of your choice from the wizard spell list. Intelligence is your spellcasting ability for it.',
        },
        {
          id: 'extra-language',
          name: 'Extra Language',
          description: 'You can speak, read, and write one additional language of your choice.',
          proficiencies: { languages: ['Choice'] },
        },
      ],
    },
    {
      id: 'wood-elf',
      name: 'Wood Elf',
      description: 'Wood elves have keen senses and intuition, and move swiftly through their native forests.',
      abilityBonuses: [{ ability: 'wisdom', bonus: 1 }],
      traits: [
        {
          id: 'elf-weapon-training',
          name: 'Elf Weapon Training',
          description: 'You have proficiency with the longsword, shortsword, shortbow, and longbow.',
          proficiencies: { weapons: ['longsword', 'shortsword', 'shortbow', 'longbow'] },
        },
        {
          id: 'fleet-of-foot',
          name: 'Fleet of Foot',
          description: 'Your base walking speed increases to 35 feet.',
          speedBonus: 5,
        },
        {
          id: 'mask-of-the-wild',
          name: 'Mask of the Wild',
          description: 'You can attempt to hide even when you are only lightly obscured by foliage, heavy rain, falling snow, mist, and other natural phenomena.',
        },
      ],
    },
    {
      id: 'dark-elf',
      name: 'Dark Elf (Drow)',
      description: 'Descended from an earlier subrace of elves, the drow were banished to the Underdark for following the goddess Lolth.',
      abilityBonuses: [{ ability: 'charisma', bonus: 1 }],
      traits: [
        {
          id: 'superior-darkvision',
          name: 'Superior Darkvision',
          description: 'Your darkvision has a radius of 120 feet.',
          darkvision: 120,
        },
        {
          id: 'sunlight-sensitivity',
          name: 'Sunlight Sensitivity',
          description: 'You have disadvantage on attack rolls and Perception checks that rely on sight when you or your target is in direct sunlight.',
        },
        {
          id: 'drow-magic',
          name: 'Drow Magic',
          description: 'You know the dancing lights cantrip. At 3rd level, you can cast faerie fire once per day. At 5th level, you can cast darkness once per day.',
        },
        {
          id: 'drow-weapon-training',
          name: 'Drow Weapon Training',
          description: 'You have proficiency with rapiers, shortswords, and hand crossbows.',
          proficiencies: { weapons: ['rapier', 'shortsword', 'hand crossbow'] },
        },
      ],
    },
  ],
  source: 'SRD',
}
