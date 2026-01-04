import type { Subclass } from './types'

export const FIGHTER_SUBCLASSES: Subclass[] = [
  {
    id: 'champion',
    name: 'Champion',
    className: 'Fighter',
    description:
      'The archetypal Champion focuses on the development of raw physical power honed to deadly perfection. Champions combine rigorous training with physical excellence to deal devastating blows.',
    features: [
      {
        level: 3,
        name: 'Improved Critical',
        description:
          'Your weapon attacks score a critical hit on a roll of 19 or 20.',
      },
      {
        level: 7,
        name: 'Remarkable Athlete',
        description:
          'You can add half your proficiency bonus (round up) to any Strength, Dexterity, or Constitution check you make that doesn\'t already use your proficiency bonus. In addition, when you make a running long jump, the distance you can cover increases by a number of feet equal to your Strength modifier.',
      },
      {
        level: 10,
        name: 'Additional Fighting Style',
        description:
          'You can choose a second option from the Fighting Style class feature.',
      },
      {
        level: 15,
        name: 'Superior Critical',
        description:
          'Your weapon attacks score a critical hit on a roll of 18-20.',
      },
      {
        level: 18,
        name: 'Survivor',
        description:
          'You attain the pinnacle of resilience in battle. At the start of each of your turns, you regain hit points equal to 5 + your Constitution modifier if you have no more than half of your hit points left. You don\'t gain this benefit if you have 0 hit points.',
      },
    ],
    source: 'SRD',
  },
]
