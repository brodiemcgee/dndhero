import type { Subclass } from './types'

export const BARD_SUBCLASSES: Subclass[] = [
  {
    id: 'college-of-lore',
    name: 'College of Lore',
    className: 'Bard',
    description:
      'Bards of the College of Lore know something about most things, collecting bits of knowledge from sources as diverse as scholarly tomes and peasant tales.',
    features: [
      {
        level: 3,
        name: 'Bonus Proficiencies',
        description: 'You gain proficiency with three skills of your choice.',
      },
      {
        level: 3,
        name: 'Cutting Words',
        description:
          "You learn how to use your wit to distract, confuse, and otherwise sap the confidence and competence of others. When a creature that you can see within 60 feet of you makes an attack roll, an ability check, or a damage roll, you can use your reaction to expend one of your uses of Bardic Inspiration, rolling a Bardic Inspiration die and subtracting the number rolled from the creature's roll.",
      },
      {
        level: 6,
        name: 'Additional Magical Secrets',
        description:
          "You learn two spells of your choice from any class. A spell you choose must be of a level you can cast, as shown on the Bard table, or a cantrip. The chosen spells count as bard spells for you but don't count against the number of bard spells you know.",
      },
      {
        level: 14,
        name: 'Peerless Skill',
        description:
          'When you make an ability check, you can expend one use of Bardic Inspiration. Roll a Bardic Inspiration die and add the number rolled to your ability check. You can choose to do so after you roll the die for the ability check, but before the DM tells you whether you succeed or fail.',
      },
    ],
    source: 'SRD',
  },
]
