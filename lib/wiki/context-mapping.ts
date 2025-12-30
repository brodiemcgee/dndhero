/**
 * Context-to-Topic Mapping for Rules Wiki Auto-Navigation
 * Maps game state to relevant wiki topics
 */

import type { SuggestedWikiTopic } from '@/types/rules'

/**
 * Maps dice roll types to wiki topics
 */
const ROLL_TYPE_TOPICS: Record<string, SuggestedWikiTopic> = {
  initiative: {
    path: 'combat/initiative',
    title: 'Initiative',
    priority: 10,
    reason: 'Roll for turn order',
  },
  attack_roll: {
    path: 'combat/attack-rolls',
    title: 'Attack Rolls',
    priority: 10,
    reason: 'Making an attack',
  },
  saving_throw: {
    path: 'core-mechanics/saving-throws',
    title: 'Saving Throws',
    priority: 9,
    reason: 'Resisting an effect',
  },
  ability_check: {
    path: 'core-mechanics/ability-checks',
    title: 'Ability Checks',
    priority: 8,
    reason: 'Testing an ability',
  },
  skill_check: {
    path: 'core-mechanics/ability-checks',
    title: 'Skill Checks',
    priority: 9,
    reason: 'Using a skill',
  },
  death_save: {
    path: 'combat/death-saves',
    title: 'Death Saving Throws',
    priority: 10,
    reason: 'Fighting for survival',
  },
  damage_roll: {
    path: 'combat/attack-rolls',
    title: 'Damage',
    priority: 7,
    reason: 'Rolling damage',
  },
}

/**
 * Maps skill names to specific wiki anchors
 */
const SKILL_TOPICS: Record<string, SuggestedWikiTopic> = {
  acrobatics: { path: 'character/skills#acrobatics', title: 'Acrobatics', priority: 11, reason: 'Skill check' },
  animal_handling: { path: 'character/skills#animal-handling', title: 'Animal Handling', priority: 11, reason: 'Skill check' },
  arcana: { path: 'character/skills#arcana', title: 'Arcana', priority: 11, reason: 'Skill check' },
  athletics: { path: 'character/skills#athletics', title: 'Athletics', priority: 11, reason: 'Skill check' },
  deception: { path: 'character/skills#deception', title: 'Deception', priority: 11, reason: 'Skill check' },
  history: { path: 'character/skills#history', title: 'History', priority: 11, reason: 'Skill check' },
  insight: { path: 'character/skills#insight', title: 'Insight', priority: 11, reason: 'Skill check' },
  intimidation: { path: 'character/skills#intimidation', title: 'Intimidation', priority: 11, reason: 'Skill check' },
  investigation: { path: 'character/skills#investigation', title: 'Investigation', priority: 11, reason: 'Skill check' },
  medicine: { path: 'character/skills#medicine', title: 'Medicine', priority: 11, reason: 'Skill check' },
  nature: { path: 'character/skills#nature', title: 'Nature', priority: 11, reason: 'Skill check' },
  perception: { path: 'character/skills#perception', title: 'Perception', priority: 11, reason: 'Skill check' },
  performance: { path: 'character/skills#performance', title: 'Performance', priority: 11, reason: 'Skill check' },
  persuasion: { path: 'character/skills#persuasion', title: 'Persuasion', priority: 11, reason: 'Skill check' },
  religion: { path: 'character/skills#religion', title: 'Religion', priority: 11, reason: 'Skill check' },
  sleight_of_hand: { path: 'character/skills#sleight-of-hand', title: 'Sleight of Hand', priority: 11, reason: 'Skill check' },
  stealth: { path: 'character/skills#stealth', title: 'Stealth', priority: 11, reason: 'Skill check' },
  survival: { path: 'character/skills#survival', title: 'Survival', priority: 11, reason: 'Skill check' },
}

/**
 * Maps condition names to wiki topics
 */
const CONDITION_TOPICS: Record<string, SuggestedWikiTopic> = {
  blinded: { path: 'combat/conditions#blinded', title: 'Blinded', priority: 12, reason: 'Active condition' },
  charmed: { path: 'combat/conditions#charmed', title: 'Charmed', priority: 12, reason: 'Active condition' },
  deafened: { path: 'combat/conditions#deafened', title: 'Deafened', priority: 12, reason: 'Active condition' },
  exhaustion: { path: 'combat/conditions#exhaustion', title: 'Exhaustion', priority: 12, reason: 'Active condition' },
  frightened: { path: 'combat/conditions#frightened', title: 'Frightened', priority: 12, reason: 'Active condition' },
  grappled: { path: 'combat/conditions#grappled', title: 'Grappled', priority: 12, reason: 'Active condition' },
  incapacitated: { path: 'combat/conditions#incapacitated', title: 'Incapacitated', priority: 12, reason: 'Active condition' },
  invisible: { path: 'combat/conditions#invisible', title: 'Invisible', priority: 12, reason: 'Active condition' },
  paralyzed: { path: 'combat/conditions#paralyzed', title: 'Paralyzed', priority: 12, reason: 'Active condition' },
  petrified: { path: 'combat/conditions#petrified', title: 'Petrified', priority: 12, reason: 'Active condition' },
  poisoned: { path: 'combat/conditions#poisoned', title: 'Poisoned', priority: 12, reason: 'Active condition' },
  prone: { path: 'combat/conditions#prone', title: 'Prone', priority: 12, reason: 'Active condition' },
  restrained: { path: 'combat/conditions#restrained', title: 'Restrained', priority: 12, reason: 'Active condition' },
  stunned: { path: 'combat/conditions#stunned', title: 'Stunned', priority: 12, reason: 'Active condition' },
  unconscious: { path: 'combat/conditions#unconscious', title: 'Unconscious', priority: 12, reason: 'Active condition' },
}

/**
 * Maps event types to wiki topics
 */
const EVENT_TYPE_TOPICS: Record<string, SuggestedWikiTopic> = {
  combat: { path: 'combat/actions', title: 'Combat', priority: 5, reason: 'In combat' },
  spell_cast: { path: 'spellcasting/casting', title: 'Spellcasting', priority: 6, reason: 'Casting spell' },
  rest: { path: 'gameplay/resting', title: 'Resting', priority: 6, reason: 'Taking a rest' },
  death: { path: 'combat/death-saves', title: 'Death Saves', priority: 8, reason: 'Character dying' },
}

/**
 * Game context interface for topic detection
 */
export interface GameContext {
  pendingRollType?: string
  pendingRollSkill?: string
  pendingRollAbility?: string
  isInCombat: boolean
  characterConditions: string[]
  recentEventTypes: string[]
  turnPhase?: string
}

/**
 * Determines the best wiki topic based on current game context
 */
export function determineBestTopic(context: GameContext): SuggestedWikiTopic | null {
  const candidates: SuggestedWikiTopic[] = []

  // Priority 1: Pending dice rolls (most immediate context)
  if (context.pendingRollType) {
    // Check for specific skill first
    if (context.pendingRollSkill) {
      const skillKey = context.pendingRollSkill.toLowerCase().replace(/\s+/g, '_')
      if (SKILL_TOPICS[skillKey]) {
        candidates.push(SKILL_TOPICS[skillKey])
      }
    }

    // Then check roll type
    if (ROLL_TYPE_TOPICS[context.pendingRollType]) {
      candidates.push(ROLL_TYPE_TOPICS[context.pendingRollType])
    }
  }

  // Priority 2: Character conditions (may need immediate reference)
  for (const condition of context.characterConditions) {
    const normalized = condition.toLowerCase()
    if (CONDITION_TOPICS[normalized]) {
      candidates.push(CONDITION_TOPICS[normalized])
    }
  }

  // Priority 3: Combat mode
  if (context.isInCombat) {
    candidates.push({
      path: 'combat/actions',
      title: 'Actions in Combat',
      priority: 4,
      reason: 'Currently in combat',
    })
  }

  // Priority 4: Recent events
  for (const eventType of context.recentEventTypes) {
    if (EVENT_TYPE_TOPICS[eventType]) {
      candidates.push(EVENT_TYPE_TOPICS[eventType])
    }
  }

  // Return highest priority candidate
  if (candidates.length === 0) {
    return null // Falls back to wiki home
  }

  return candidates.reduce((best, current) => (current.priority > best.priority ? current : best))
}

/**
 * Get all available topic mappings (for debugging/documentation)
 */
export function getAllTopicMappings() {
  return {
    rollTypes: ROLL_TYPE_TOPICS,
    skills: SKILL_TOPICS,
    conditions: CONDITION_TOPICS,
    eventTypes: EVENT_TYPE_TOPICS,
  }
}
