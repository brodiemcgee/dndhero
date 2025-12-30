/**
 * Combat Rules Index
 */

import type { RuleEntry } from '@/types/rules'

import { INITIATIVE_RULES } from './initiative'
import { ACTIONS_RULES } from './actions'
import { ATTACK_ROLL_RULES } from './attack-rolls'
import { DAMAGE_RULES } from './damage'
import { CONDITIONS_RULES } from './conditions'
import { DEATH_SAVES_RULES } from './death-saves'
import { MOVEMENT_RULES } from './movement'
import { COVER_RULES } from './cover'

export const COMBAT_RULES: RuleEntry[] = [
  ...INITIATIVE_RULES,
  ...ACTIONS_RULES,
  ...ATTACK_ROLL_RULES,
  ...DAMAGE_RULES,
  ...CONDITIONS_RULES,
  ...DEATH_SAVES_RULES,
  ...MOVEMENT_RULES,
  ...COVER_RULES,
]

export {
  INITIATIVE_RULES,
  ACTIONS_RULES,
  ATTACK_ROLL_RULES,
  DAMAGE_RULES,
  CONDITIONS_RULES,
  DEATH_SAVES_RULES,
  MOVEMENT_RULES,
  COVER_RULES,
}
