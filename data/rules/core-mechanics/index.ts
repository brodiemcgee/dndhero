/**
 * Core Mechanics Rules Index
 */

export { ABILITY_CHECK_RULES } from './ability-checks'
export { SAVING_THROW_RULES } from './saving-throws'
export { ADVANTAGE_RULES } from './advantage-disadvantage'
export { PROFICIENCY_RULES } from './proficiency'

import { ABILITY_CHECK_RULES } from './ability-checks'
import { SAVING_THROW_RULES } from './saving-throws'
import { ADVANTAGE_RULES } from './advantage-disadvantage'
import { PROFICIENCY_RULES } from './proficiency'

import type { RuleEntry } from '@/types/rules'

export const CORE_MECHANICS_RULES: RuleEntry[] = [
  ...ABILITY_CHECK_RULES,
  ...SAVING_THROW_RULES,
  ...ADVANTAGE_RULES,
  ...PROFICIENCY_RULES,
]
