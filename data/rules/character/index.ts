/**
 * Character Rules Index
 */

import type { RuleEntry } from '@/types/rules'

import { ABILITY_SCORES_RULES } from './ability-scores'
import { SKILLS_RULES } from './skills'
import { CLASSES_RULES } from './classes'
import { RACES_RULES } from './races'
import { BACKGROUNDS_RULES } from './backgrounds'
import { LEVELING_RULES } from './leveling'
import { MULTICLASSING_RULES } from './multiclassing'

export const CHARACTER_RULES: RuleEntry[] = [
  ...ABILITY_SCORES_RULES,
  ...SKILLS_RULES,
  ...CLASSES_RULES,
  ...RACES_RULES,
  ...BACKGROUNDS_RULES,
  ...LEVELING_RULES,
  ...MULTICLASSING_RULES,
]

export {
  ABILITY_SCORES_RULES,
  SKILLS_RULES,
  CLASSES_RULES,
  RACES_RULES,
  BACKGROUNDS_RULES,
  LEVELING_RULES,
  MULTICLASSING_RULES,
}
