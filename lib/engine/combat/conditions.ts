/**
 * D&D 5e Conditions System
 * All 14 official conditions with their effects
 */

export type ConditionName =
  | 'blinded'
  | 'charmed'
  | 'deafened'
  | 'exhaustion'
  | 'frightened'
  | 'grappled'
  | 'incapacitated'
  | 'invisible'
  | 'paralyzed'
  | 'petrified'
  | 'poisoned'
  | 'prone'
  | 'restrained'
  | 'stunned'
  | 'unconscious'

export interface Condition {
  name: ConditionName
  description: string
  effects: ConditionEffect[]
  duration?: number // -1 for permanent, 0 for instant, > 0 for rounds
  source?: string
  saveDC?: number // For conditions that allow saves
  saveAbility?: string // Which ability to save against
}

export interface ConditionEffect {
  type: 'advantage' | 'disadvantage' | 'immunity' | 'restriction' | 'penalty' | 'automatic'
  target: string // What the effect applies to
  description: string
}

/**
 * D&D 5e condition definitions
 */
export const CONDITIONS: Record<ConditionName, Omit<Condition, 'duration' | 'source'>> = {
  blinded: {
    name: 'blinded',
    description: 'A blinded creature can't see and automatically fails any ability check that requires sight.',
    effects: [
      {
        type: 'disadvantage',
        target: 'attack_rolls',
        description: 'Attack rolls have disadvantage',
      },
      {
        type: 'advantage',
        target: 'attacks_against',
        description: 'Attack rolls against the creature have advantage',
      },
      {
        type: 'automatic',
        target: 'sight_checks',
        description: 'Automatically fails checks that require sight',
      },
    ],
  },

  charmed: {
    name: 'charmed',
    description: 'A charmed creature can't attack the charmer or target the charmer with harmful abilities or magical effects.',
    effects: [
      {
        type: 'restriction',
        target: 'attacks',
        description: 'Can't attack the charmer',
      },
      {
        type: 'restriction',
        target: 'harmful_abilities',
        description: 'Can't target charmer with harmful abilities or effects',
      },
      {
        type: 'advantage',
        target: 'social_checks',
        description: 'Charmer has advantage on social interaction checks',
      },
    ],
  },

  deafened: {
    name: 'deafened',
    description: 'A deafened creature can't hear and automatically fails any ability check that requires hearing.',
    effects: [
      {
        type: 'automatic',
        target: 'hearing_checks',
        description: 'Automatically fails checks that require hearing',
      },
    ],
  },

  exhaustion: {
    name: 'exhaustion',
    description: 'Exhaustion is measured in six levels. Each level provides cumulative penalties.',
    effects: [
      {
        type: 'penalty',
        target: 'ability_checks',
        description: 'Level 1: Disadvantage on ability checks',
      },
      {
        type: 'penalty',
        target: 'speed',
        description: 'Level 2: Speed halved',
      },
      {
        type: 'disadvantage',
        target: 'attack_rolls_saves',
        description: 'Level 3: Disadvantage on attack rolls and saving throws',
      },
      {
        type: 'penalty',
        target: 'hp_maximum',
        description: 'Level 4: Hit point maximum halved',
      },
      {
        type: 'penalty',
        target: 'speed',
        description: 'Level 5: Speed reduced to 0',
      },
      {
        type: 'automatic',
        target: 'death',
        description: 'Level 6: Death',
      },
    ],
  },

  frightened: {
    name: 'frightened',
    description: 'A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight.',
    effects: [
      {
        type: 'disadvantage',
        target: 'ability_checks',
        description: 'Disadvantage on ability checks while source is visible',
      },
      {
        type: 'disadvantage',
        target: 'attack_rolls',
        description: 'Disadvantage on attack rolls while source is visible',
      },
      {
        type: 'restriction',
        target: 'movement',
        description: 'Can't willingly move closer to source of fear',
      },
    ],
  },

  grappled: {
    name: 'grappled',
    description: 'A grappled creature's speed becomes 0, and it can't benefit from any bonus to its speed.',
    effects: [
      {
        type: 'penalty',
        target: 'speed',
        description: 'Speed becomes 0',
      },
      {
        type: 'restriction',
        target: 'movement',
        description: 'Can't benefit from bonuses to speed',
      },
    ],
  },

  incapacitated: {
    name: 'incapacitated',
    description: 'An incapacitated creature can't take actions or reactions.',
    effects: [
      {
        type: 'restriction',
        target: 'actions',
        description: 'Can't take actions',
      },
      {
        type: 'restriction',
        target: 'reactions',
        description: 'Can't take reactions',
      },
    ],
  },

  invisible: {
    name: 'invisible',
    description: 'An invisible creature is impossible to see without the aid of magic or a special sense.',
    effects: [
      {
        type: 'advantage',
        target: 'attack_rolls',
        description: 'Attack rolls have advantage',
      },
      {
        type: 'disadvantage',
        target: 'attacks_against',
        description: 'Attack rolls against the creature have disadvantage',
      },
      {
        type: 'automatic',
        target: 'stealth',
        description: 'Considered heavily obscured for hiding',
      },
    ],
  },

  paralyzed: {
    name: 'paralyzed',
    description: 'A paralyzed creature is incapacitated and can't move or speak.',
    effects: [
      {
        type: 'restriction',
        target: 'actions',
        description: 'Can't take actions or reactions (incapacitated)',
      },
      {
        type: 'restriction',
        target: 'movement',
        description: 'Can't move or speak',
      },
      {
        type: 'automatic',
        target: 'saves',
        description: 'Automatically fails Strength and Dexterity saving throws',
      },
      {
        type: 'advantage',
        target: 'attacks_against',
        description: 'Attack rolls against the creature have advantage',
      },
      {
        type: 'automatic',
        target: 'critical_hits',
        description: 'Attacks within 5 feet are automatic critical hits',
      },
    ],
  },

  petrified: {
    name: 'petrified',
    description: 'A petrified creature is transformed into a solid inanimate substance.',
    effects: [
      {
        type: 'restriction',
        target: 'all',
        description: 'Incapacitated, can't move or speak, unaware of surroundings',
      },
      {
        type: 'automatic',
        target: 'saves',
        description: 'Automatically fails Strength and Dexterity saving throws',
      },
      {
        type: 'advantage',
        target: 'attacks_against',
        description: 'Attack rolls against the creature have advantage',
      },
      {
        type: 'immunity',
        target: 'poison_disease',
        description: 'Immune to poison and disease',
      },
      {
        type: 'penalty',
        target: 'weight',
        description: 'Weight increases by a factor of ten',
      },
    ],
  },

  poisoned: {
    name: 'poisoned',
    description: 'A poisoned creature has disadvantage on attack rolls and ability checks.',
    effects: [
      {
        type: 'disadvantage',
        target: 'attack_rolls',
        description: 'Disadvantage on attack rolls',
      },
      {
        type: 'disadvantage',
        target: 'ability_checks',
        description: 'Disadvantage on ability checks',
      },
    ],
  },

  prone: {
    name: 'prone',
    description: 'A prone creature's only movement option is to crawl, unless it stands up.',
    effects: [
      {
        type: 'disadvantage',
        target: 'attack_rolls',
        description: 'Disadvantage on attack rolls',
      },
      {
        type: 'advantage',
        target: 'attacks_against_melee',
        description: 'Melee attacks against the creature have advantage',
      },
      {
        type: 'disadvantage',
        target: 'attacks_against_ranged',
        description: 'Ranged attacks against the creature have disadvantage',
      },
      {
        type: 'restriction',
        target: 'movement',
        description: 'Can only crawl or stand up (costs half movement)',
      },
    ],
  },

  restrained: {
    name: 'restrained',
    description: 'A restrained creature's speed becomes 0, and it can't benefit from any bonus to its speed.',
    effects: [
      {
        type: 'penalty',
        target: 'speed',
        description: 'Speed becomes 0',
      },
      {
        type: 'disadvantage',
        target: 'attack_rolls',
        description: 'Disadvantage on attack rolls',
      },
      {
        type: 'disadvantage',
        target: 'dex_saves',
        description: 'Disadvantage on Dexterity saving throws',
      },
      {
        type: 'advantage',
        target: 'attacks_against',
        description: 'Attack rolls against the creature have advantage',
      },
    ],
  },

  stunned: {
    name: 'stunned',
    description: 'A stunned creature is incapacitated, can't move, and can speak only falteringly.',
    effects: [
      {
        type: 'restriction',
        target: 'actions',
        description: 'Can't take actions or reactions (incapacitated)',
      },
      {
        type: 'restriction',
        target: 'movement',
        description: 'Can't move',
      },
      {
        type: 'restriction',
        target: 'speech',
        description: 'Can speak only falteringly',
      },
      {
        type: 'automatic',
        target: 'saves',
        description: 'Automatically fails Strength and Dexterity saving throws',
      },
      {
        type: 'advantage',
        target: 'attacks_against',
        description: 'Attack rolls against the creature have advantage',
      },
    ],
  },

  unconscious: {
    name: 'unconscious',
    description: 'An unconscious creature is incapacitated, can't move or speak, and is unaware of its surroundings.',
    effects: [
      {
        type: 'restriction',
        target: 'all',
        description: 'Incapacitated, can't move or speak, unaware of surroundings',
      },
      {
        type: 'automatic',
        target: 'items',
        description: 'Drops whatever it's holding and falls prone',
      },
      {
        type: 'automatic',
        target: 'saves',
        description: 'Automatically fails Strength and Dexterity saving throws',
      },
      {
        type: 'advantage',
        target: 'attacks_against',
        description: 'Attack rolls against the creature have advantage',
      },
      {
        type: 'automatic',
        target: 'critical_hits',
        description: 'Attacks within 5 feet are automatic critical hits',
      },
    ],
  },
}

/**
 * Apply condition to entity
 */
export function applyCondition(
  entityId: string,
  conditionName: ConditionName,
  duration: number = -1, // -1 = permanent
  source?: string,
  saveDC?: number,
  saveAbility?: string
): Condition {
  const baseCondition = CONDITIONS[conditionName]

  return {
    ...baseCondition,
    duration,
    source,
    saveDC,
    saveAbility,
  }
}

/**
 * Check if entity has condition
 */
export function hasCondition(conditions: Condition[], conditionName: ConditionName): boolean {
  return conditions.some((c) => c.name === conditionName)
}

/**
 * Remove condition from entity
 */
export function removeCondition(conditions: Condition[], conditionName: ConditionName): Condition[] {
  return conditions.filter((c) => c.name !== conditionName)
}

/**
 * Decrement condition durations at end of turn
 */
export function decrementConditionDurations(conditions: Condition[]): Condition[] {
  return conditions
    .map((condition) => {
      if (condition.duration && condition.duration > 0) {
        return {
          ...condition,
          duration: condition.duration - 1,
        }
      }
      return condition
    })
    .filter((condition) => {
      // Remove conditions that have expired (duration reached 0)
      return condition.duration === undefined || condition.duration !== 0
    })
}

/**
 * Check if entity can take actions (not incapacitated, paralyzed, stunned, or unconscious)
 */
export function canTakeActions(conditions: Condition[]): boolean {
  const restrictiveConditions: ConditionName[] = ['incapacitated', 'paralyzed', 'stunned', 'unconscious', 'petrified']
  return !conditions.some((c) => restrictiveConditions.includes(c.name))
}

/**
 * Check if entity can move
 */
export function canMove(conditions: Condition[]): boolean {
  const restrictiveConditions: ConditionName[] = ['grappled', 'paralyzed', 'petrified', 'restrained', 'stunned', 'unconscious']
  return !conditions.some((c) => restrictiveConditions.includes(c.name))
}

/**
 * Calculate effective speed with conditions
 */
export function getEffectiveSpeed(baseSpeed: number, conditions: Condition[], exhaustionLevel: number = 0): number {
  let speed = baseSpeed

  // Grappled, restrained: speed becomes 0
  if (hasCondition(conditions, 'grappled') || hasCondition(conditions, 'restrained')) {
    return 0
  }

  // Paralyzed, petrified, stunned, unconscious: can't move
  if (
    hasCondition(conditions, 'paralyzed') ||
    hasCondition(conditions, 'petrified') ||
    hasCondition(conditions, 'stunned') ||
    hasCondition(conditions, 'unconscious')
  ) {
    return 0
  }

  // Exhaustion level 2: speed halved
  if (exhaustionLevel >= 2) {
    speed = Math.floor(speed / 2)
  }

  // Exhaustion level 5: speed becomes 0
  if (exhaustionLevel >= 5) {
    return 0
  }

  // Prone: movement costs double (handled in movement system)

  return speed
}

/**
 * Check for automatic save failures
 */
export function hasAutoFailSaves(conditions: Condition[], saveAbility: string): boolean {
  // Paralyzed, petrified, stunned, unconscious: auto-fail STR and DEX saves
  const autoFailConditions: ConditionName[] = ['paralyzed', 'petrified', 'stunned', 'unconscious']

  if (conditions.some((c) => autoFailConditions.includes(c.name))) {
    return saveAbility === 'strength' || saveAbility === 'dexterity'
  }

  return false
}

/**
 * Get all active condition effects for display
 */
export function getActiveConditionEffects(conditions: Condition[]): string[] {
  const effects: string[] = []

  for (const condition of conditions) {
    effects.push(`${condition.name.toUpperCase()}: ${condition.description}`)

    for (const effect of condition.effects) {
      effects.push(`  • ${effect.description}`)
    }
  }

  return effects
}
