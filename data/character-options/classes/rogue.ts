import type { DndClass } from '@/types/character-options'

export const ROGUE: DndClass = {
  id: 'rogue',
  name: 'Rogue',
  description: 'A scoundrel who uses stealth and trickery to overcome obstacles and enemies. Rogues rely on skill, stealth, and their foes\' vulnerabilities to get the upper hand in any situation.',
  hitDie: 'd8',
  primaryAbilities: ['dexterity'],
  savingThrows: ['dexterity', 'intelligence'],
  armorProficiencies: ['light'],
  weaponProficiencies: ['simple', 'hand crossbow', 'longsword', 'rapier', 'shortsword'],
  toolProficiencies: ['Thieves\' tools'],
  skillOptions: {
    count: 4,
    options: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'],
  },
  features: [
    {
      id: 'expertise-rogue',
      name: 'Expertise',
      description: 'Choose two of your skill proficiencies, or one of your skill proficiencies and your proficiency with thieves\' tools. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.',
      level: 1,
      choices: { count: 2, options: ['Any proficient skill or thieves\' tools'] },
    },
    {
      id: 'sneak-attack',
      name: 'Sneak Attack',
      description: 'You know how to strike subtly and exploit a foe\'s distraction. Once per turn, you can deal an extra 1d6 damage to one creature you hit with an attack if you have advantage on the attack roll. The attack must use a finesse or a ranged weapon. You don\'t need advantage if another enemy of the target is within 5 feet of it. The extra damage increases as you gain levels.',
      level: 1,
    },
    {
      id: 'thieves-cant',
      name: 'Thieves\' Cant',
      description: 'During your rogue training you learned thieves\' cant, a secret mix of dialect, jargon, and code that allows you to hide messages in seemingly normal conversation.',
      level: 1,
    },
    {
      id: 'cunning-action',
      name: 'Cunning Action',
      description: 'Your quick thinking and agility allow you to move and act quickly. You can take a bonus action on each of your turns in combat. This action can be used only to take the Dash, Disengage, or Hide action.',
      level: 2,
    },
    {
      id: 'uncanny-dodge',
      name: 'Uncanny Dodge',
      description: 'When an attacker that you can see hits you with an attack, you can use your reaction to halve the attack\'s damage against you.',
      level: 5,
    },
    {
      id: 'evasion',
      name: 'Evasion',
      description: 'When you are subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw, and only half damage if you fail.',
      level: 7,
    },
  ],
  subclassLevel: 3,
  subclassName: 'Roguish Archetype',
  source: 'SRD',
}
