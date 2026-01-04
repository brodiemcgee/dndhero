import type { Subclass } from './types'

export const WARLOCK_SUBCLASSES: Subclass[] = [
  {
    id: 'the-fiend',
    name: 'The Fiend',
    className: 'Warlock',
    description:
      'You have made a pact with a fiend from the lower planes of existence, a being whose aims are evil, even if you strive against those aims. Such beings desire the corruption or destruction of all things, ultimately including you.',
    features: [
      {
        level: 1,
        name: "Dark One's Blessing",
        description:
          'When you reduce a hostile creature to 0 hit points, you gain temporary hit points equal to your Charisma modifier + your warlock level (minimum of 1).',
      },
      {
        level: 6,
        name: "Dark One's Own Luck",
        description:
          'You can call on your patron to alter fate in your favor. When you make an ability check or a saving throw, you can use this feature to add a d10 to your roll. You can do so after seeing the initial roll but before any of the roll\'s effects occur. Once you use this feature, you can\'t use it again until you finish a short or long rest.',
      },
      {
        level: 10,
        name: 'Fiendish Resilience',
        description:
          'You can choose one damage type when you finish a short or long rest. You gain resistance to that damage type until you choose a different one with this feature. Damage from magical weapons or silver weapons ignores this resistance.',
      },
      {
        level: 14,
        name: 'Hurl Through Hell',
        description:
          'When you hit a creature with an attack, you can use this feature to instantly transport the target through the lower planes. The creature disappears and hurtles through a nightmare landscape. At the end of your next turn, the target returns to the space it previously occupied, or the nearest unoccupied space. If the target is not a fiend, it takes 10d10 psychic damage as it reels from its horrific experience. Once you use this feature, you can\'t use it again until you finish a long rest.',
      },
    ],
    source: 'SRD',
  },
]
