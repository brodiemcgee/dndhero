import type { Subclass } from './types'

export const WIZARD_SUBCLASSES: Subclass[] = [
  {
    id: 'school-of-evocation',
    name: 'School of Evocation',
    className: 'Wizard',
    description:
      'You focus your study on magic that creates powerful elemental effects such as bitter cold, searing flame, rolling thunder, crackling lightning, and burning acid. Evokers are often employed by military forces, using their power to blast enemy armies from afar.',
    features: [
      {
        level: 2,
        name: 'Evocation Savant',
        description:
          'The gold and time you must spend to copy an evocation spell into your spellbook is halved.',
      },
      {
        level: 2,
        name: 'Sculpt Spells',
        description:
          'You can create pockets of relative safety within the effects of your evocation spells. When you cast an evocation spell that affects other creatures that you can see, you can choose a number of them equal to 1 + the spell\'s level. The chosen creatures automatically succeed on their saving throws against the spell, and they take no damage if they would normally take half damage on a successful save.',
      },
      {
        level: 6,
        name: 'Potent Cantrip',
        description:
          'Your damaging cantrips affect even creatures that avoid the brunt of the effect. When a creature succeeds on a saving throw against your cantrip, the creature takes half the cantrip\'s damage (if any) but suffers no additional effect from the cantrip.',
      },
      {
        level: 10,
        name: 'Empowered Evocation',
        description:
          'You can add your Intelligence modifier to one damage roll of any wizard evocation spell you cast.',
      },
      {
        level: 14,
        name: 'Overchannel',
        description:
          'You can increase the power of your simpler spells. When you cast a wizard spell of 1st through 5th level that deals damage, you can deal maximum damage with that spell. The first time you do so, you suffer no adverse effect. If you use this feature again before you finish a long rest, you take 2d12 necrotic damage for each level of the spell, immediately after you cast it. Each time you use this feature again before finishing a long rest, the necrotic damage per spell level increases by 1d12.',
      },
    ],
    source: 'SRD',
  },
]
