/**
 * Spellcasting Rules Index
 */

import type { RuleEntry } from '@/types/rules'

import { SPELL_SLOTS_RULES } from './spell-slots'
import { CASTING_RULES } from './casting'
import { CONCENTRATION_RULES } from './concentration'
import { COMPONENTS_RULES } from './components'
import { SPELL_ATTACKS_RULES } from './spell-attacks'
import { RITUAL_CASTING_RULES } from './ritual-casting'

export const SPELLCASTING_RULES: RuleEntry[] = [
  ...SPELL_SLOTS_RULES,
  ...CASTING_RULES,
  ...CONCENTRATION_RULES,
  ...COMPONENTS_RULES,
  ...SPELL_ATTACKS_RULES,
  ...RITUAL_CASTING_RULES,
]

export {
  SPELL_SLOTS_RULES,
  CASTING_RULES,
  CONCENTRATION_RULES,
  COMPONENTS_RULES,
  SPELL_ATTACKS_RULES,
  RITUAL_CASTING_RULES,
}
