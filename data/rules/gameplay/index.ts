/**
 * Gameplay Rules Index
 */

import type { RuleEntry } from '@/types/rules'

import { RESTING_RULES } from './resting'
import { EXPLORATION_RULES } from './exploration'
import { SOCIAL_RULES } from './social'
import { DOWNTIME_RULES } from './downtime'
import { ENVIRONMENT_RULES } from './environment'

export const GAMEPLAY_RULES: RuleEntry[] = [
  ...RESTING_RULES,
  ...EXPLORATION_RULES,
  ...SOCIAL_RULES,
  ...DOWNTIME_RULES,
  ...ENVIRONMENT_RULES,
]

export {
  RESTING_RULES,
  EXPLORATION_RULES,
  SOCIAL_RULES,
  DOWNTIME_RULES,
  ENVIRONMENT_RULES,
}
