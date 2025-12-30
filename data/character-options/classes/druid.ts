import type { DndClass } from '@/types/character-options'

export const DRUID: DndClass = {
  id: 'druid',
  name: 'Druid',
  description: 'A priest of the Old Faith, wielding the powers of nature and adopting animal forms. Druids revere nature above all, gaining their spells and magical powers from the force of nature itself or from a nature deity.',
  hitDie: 'd8',
  primaryAbilities: ['wisdom'],
  savingThrows: ['intelligence', 'wisdom'],
  armorProficiencies: ['light', 'medium', 'shields (druids will not wear armor or use shields made of metal)'],
  weaponProficiencies: ['club', 'dagger', 'dart', 'javelin', 'mace', 'quarterstaff', 'scimitar', 'sickle', 'sling', 'spear'],
  toolProficiencies: ['Herbalism kit'],
  skillOptions: {
    count: 2,
    options: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'],
  },
  spellcasting: {
    ability: 'wisdom',
    type: 'full',
    ritualCasting: true,
    cantripsKnown: { 1: 2, 4: 3, 10: 4 },
  },
  features: [
    {
      id: 'druidic',
      name: 'Druidic',
      description: 'You know Druidic, the secret language of druids. You can speak the language and use it to leave hidden messages that only druids can understand.',
      level: 1,
    },
    {
      id: 'wild-shape',
      name: 'Wild Shape',
      description: 'You can use your action to magically assume the shape of a beast that you have seen before. You can use this feature twice, regaining expended uses when you finish a short or long rest. Your druid level determines the beasts you can transform into.',
      level: 2,
    },
    {
      id: 'wild-shape-improvement',
      name: 'Wild Shape Improvement',
      description: 'You can transform into beasts with a challenge rating as high as 1 (no flying speed). At 8th level, you can transform into beasts with a flying speed.',
      level: 4,
    },
  ],
  subclassLevel: 2,
  subclassName: 'Druid Circle',
  source: 'SRD',
}
