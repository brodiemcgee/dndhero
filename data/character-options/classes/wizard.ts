import type { DndClass } from '@/types/character-options'

export const WIZARD: DndClass = {
  id: 'wizard',
  name: 'Wizard',
  description: 'A scholarly magic-user capable of manipulating the structures of reality. Wizards are supreme magic-users, defined by their spells. They learn magic through constant study and practice.',
  hitDie: 'd6',
  primaryAbilities: ['intelligence'],
  savingThrows: ['intelligence', 'wisdom'],
  armorProficiencies: [],
  weaponProficiencies: ['dagger', 'dart', 'sling', 'quarterstaff', 'light crossbow'],
  skillOptions: {
    count: 2,
    options: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'],
  },
  spellcasting: {
    ability: 'intelligence',
    type: 'full',
    ritualCasting: true,
    cantripsKnown: { 1: 3, 4: 4, 10: 5 },
  },
  features: [
    {
      id: 'spellcasting-wizard',
      name: 'Spellcasting',
      description: 'As a student of arcane magic, you have a spellbook containing spells that show the first glimmerings of your true power. You start with a spellbook containing six 1st-level wizard spells of your choice.',
      level: 1,
    },
    {
      id: 'arcane-recovery',
      name: 'Arcane Recovery',
      description: 'You have learned to regain some of your magical energy by studying your spellbook. Once per day when you finish a short rest, you can choose expended spell slots to recover. The spell slots can have a combined level equal to or less than half your wizard level (rounded up).',
      level: 1,
    },
    {
      id: 'arcane-tradition',
      name: 'Arcane Tradition',
      description: 'When you reach 2nd level, you choose an arcane tradition, shaping your practice of magic through one of eight schools.',
      level: 2,
      choices: {
        count: 1,
        options: ['School of Abjuration', 'School of Conjuration', 'School of Divination', 'School of Enchantment', 'School of Evocation', 'School of Illusion', 'School of Necromancy', 'School of Transmutation'],
      },
    },
    {
      id: 'spell-mastery',
      name: 'Spell Mastery',
      description: 'You have achieved such mastery over certain spells that you can cast them at will. Choose a 1st-level wizard spell and a 2nd-level wizard spell in your spellbook. You can cast those spells at their lowest level without expending a spell slot when you have them prepared.',
      level: 18,
    },
    {
      id: 'signature-spells',
      name: 'Signature Spells',
      description: 'You gain mastery over two powerful spells and can cast them with little effort. Choose two 3rd-level wizard spells in your spellbook as your signature spells. You always have these spells prepared, they do not count against your prepared spells, and you can cast each once at 3rd level without expending a spell slot.',
      level: 20,
    },
  ],
  subclassLevel: 2,
  subclassName: 'Arcane Tradition',
  source: 'SRD',
}
