/**
 * Combat Rules Index
 */

export { INITIATIVE_RULES } from './initiative'
export { ACTIONS_RULES } from './actions'
export { ATTACK_ROLL_RULES } from './attack-rolls'
export { CONDITIONS_RULES } from './conditions'
export { DEATH_SAVES_RULES } from './death-saves'

import { INITIATIVE_RULES } from './initiative'
import { ACTIONS_RULES } from './actions'
import { ATTACK_ROLL_RULES } from './attack-rolls'
import { CONDITIONS_RULES } from './conditions'
import { DEATH_SAVES_RULES } from './death-saves'

import type { RuleEntry } from '@/types/rules'

export const COMBAT_RULES: RuleEntry[] = [
  ...INITIATIVE_RULES,
  ...ACTIONS_RULES,
  ...ATTACK_ROLL_RULES,
  ...CONDITIONS_RULES,
  ...DEATH_SAVES_RULES,
]
