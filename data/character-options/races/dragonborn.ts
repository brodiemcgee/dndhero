import type { Race } from '@/types/character-options'

export const DRAGONBORN: Race = {
  id: 'dragonborn',
  name: 'Dragonborn',
  description: 'Born of dragons, dragonborn walk proudly through a world that greets them with fearful incomprehension. Shaped by draconic gods or dragons themselves, they are hatched from dragon eggs as a unique race.',
  abilityBonuses: [
    { ability: 'strength', bonus: 2 },
    { ability: 'charisma', bonus: 1 },
  ],
  size: 'Medium',
  speed: 30,
  languages: ['Common', 'Draconic'],
  traits: [
    {
      id: 'draconic-ancestry',
      name: 'Draconic Ancestry',
      description: 'You have draconic ancestry. Choose one type of dragon from the table. Your breath weapon and damage resistance are determined by the dragon type.',
    },
    {
      id: 'breath-weapon',
      name: 'Breath Weapon',
      description: 'You can use your action to exhale destructive energy. Your draconic ancestry determines the size, shape, and damage type. Each creature in the area must make a saving throw. The DC equals 8 + your Constitution modifier + your proficiency bonus. On a failed save, a creature takes 2d6 damage, increasing to 3d6 at 6th level, 4d6 at 11th level, and 5d6 at 16th level. On a successful save, a creature takes half damage. You can use this once per short or long rest.',
    },
    {
      id: 'damage-resistance',
      name: 'Damage Resistance',
      description: 'You have resistance to the damage type associated with your draconic ancestry.',
    },
  ],
  source: 'SRD',
}
