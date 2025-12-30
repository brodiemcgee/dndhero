import type { DndClass } from '@/types/character-options'

export const PALADIN: DndClass = {
  id: 'paladin',
  name: 'Paladin',
  description: 'A holy warrior bound to a sacred oath. Paladins combine martial prowess with divine magic, channeling the power of their oath to smite enemies and protect allies.',
  hitDie: 'd10',
  primaryAbilities: ['strength', 'charisma'],
  savingThrows: ['wisdom', 'charisma'],
  armorProficiencies: ['light', 'medium', 'heavy', 'shields'],
  weaponProficiencies: ['simple', 'martial'],
  skillOptions: {
    count: 2,
    options: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'],
  },
  spellcasting: {
    ability: 'charisma',
    type: 'half',
    ritualCasting: false,
  },
  features: [
    {
      id: 'divine-sense',
      name: 'Divine Sense',
      description: 'As an action, you can detect the presence of any celestial, fiend, or undead within 60 feet. You also detect the presence of any place or object that has been consecrated or desecrated. You can use this feature a number of times equal to 1 + your Charisma modifier.',
      level: 1,
    },
    {
      id: 'lay-on-hands',
      name: 'Lay on Hands',
      description: 'You have a pool of healing power that replenishes when you take a long rest. With that pool, you can restore a total number of hit points equal to your paladin level × 5. You can also expend 5 hit points from your pool to cure the target of one disease or neutralize one poison.',
      level: 1,
    },
    {
      id: 'fighting-style-paladin',
      name: 'Fighting Style',
      description: 'You adopt a particular style of fighting as your specialty.',
      level: 2,
      choices: {
        count: 1,
        options: ['Defense', 'Dueling', 'Great Weapon Fighting', 'Protection'],
      },
    },
    {
      id: 'divine-smite',
      name: 'Divine Smite',
      description: 'When you hit a creature with a melee weapon attack, you can expend one spell slot to deal radiant damage to the target, in addition to the weapon\'s damage. The extra damage is 2d8 for a 1st-level slot, plus 1d8 for each spell level higher than 1st, to a maximum of 5d8. The damage increases by 1d8 if the target is an undead or a fiend.',
      level: 2,
    },
    {
      id: 'divine-health',
      name: 'Divine Health',
      description: 'The divine magic flowing through you makes you immune to disease.',
      level: 3,
    },
    {
      id: 'extra-attack-paladin',
      name: 'Extra Attack',
      description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.',
      level: 5,
    },
    {
      id: 'aura-of-protection',
      name: 'Aura of Protection',
      description: 'Whenever you or a friendly creature within 10 feet of you must make a saving throw, the creature gains a bonus to the saving throw equal to your Charisma modifier (minimum of +1). You must be conscious to grant this bonus.',
      level: 6,
    },
  ],
  subclassLevel: 3,
  subclassName: 'Sacred Oath',
  source: 'SRD',
}
