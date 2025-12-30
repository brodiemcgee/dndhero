/**
 * Equipment Rules Index
 */

import type { RuleEntry } from '@/types/rules'

import { WEAPONS_RULES } from './weapons'
import { ARMOR_RULES } from './armor'
import { ADVENTURING_GEAR_RULES } from './adventuring-gear'
import { CURRENCY_RULES } from './currency'

export const EQUIPMENT_RULES: RuleEntry[] = [
  ...WEAPONS_RULES,
  ...ARMOR_RULES,
  ...ADVENTURING_GEAR_RULES,
  ...CURRENCY_RULES,
]

export {
  WEAPONS_RULES,
  ARMOR_RULES,
  ADVENTURING_GEAR_RULES,
  CURRENCY_RULES,
}
