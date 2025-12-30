/**
 * Character Context Formatter for AI DM
 * Formats full character data for inclusion in DM prompts
 */

import { getSpellsByIds } from '@/data/spells'

export interface CharacterForPrompt {
  id: string
  name: string
  class: string | null
  level: number | null
  race: string | null
  // Combat
  current_hp: number
  max_hp: number
  armor_class: number
  speed: number
  // Ability scores
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  proficiency_bonus: number
  // Spells
  cantrips: string[] | null
  known_spells: string[] | null
  prepared_spells: string[] | null
  spell_slots: Record<string, number | { max: number; used?: number }> | null
  spell_slots_used: Record<string, number> | null
  spellcasting_ability: string | null
  spell_save_dc: number | null
  spell_attack_bonus: number | null
  // Equipment
  equipment: Record<string, unknown> | null
  inventory: unknown[] | null
  // Proficiencies
  skill_proficiencies: string[] | null
  saving_throw_proficiencies: string[] | null
  // Personality (for roleplay integration)
  personality_traits: string[] | null
  bonds: string[] | null
  ideals: string[] | null
  flaws: string[] | null
  backstory: string | null
}

/**
 * Get ability modifier from score
 */
export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

/**
 * Format ability score with modifier, e.g. "16 (+3)"
 */
export function formatAbilityScore(score: number): string {
  const mod = getModifier(score)
  const sign = mod >= 0 ? '+' : ''
  return `${score} (${sign}${mod})`
}

/**
 * Format ability score compactly, e.g. "STR: 16 (+3)"
 */
function formatAbilityCompact(name: string, score: number): string {
  const mod = getModifier(score)
  const sign = mod >= 0 ? '+' : ''
  return `${name}: ${score} (${sign}${mod})`
}

/**
 * Format spell slots showing remaining/max
 */
export function formatSpellSlots(
  slots: Record<string, number | { max: number; used?: number }> | null,
  used: Record<string, number> | null
): string {
  if (!slots) return ''

  const parts: string[] = []

  for (let level = 1; level <= 9; level++) {
    const key = level.toString()
    const slotData = slots[key]

    if (!slotData) continue

    let max = 0
    let usedCount = 0

    if (typeof slotData === 'number') {
      max = slotData
      usedCount = used?.[key] || 0
    } else if (slotData && typeof slotData === 'object') {
      max = slotData.max || 0
      usedCount = slotData.used ?? used?.[key] ?? 0
    }

    if (max > 0) {
      const remaining = max - usedCount
      parts.push(`${level}st: ${remaining}/${max}`.replace('1st', '1st').replace('2st', '2nd').replace('3st', '3rd'))
    }
  }

  // Fix ordinal suffixes
  return parts.map(p => {
    return p
      .replace('1st:', '1st:')
      .replace('2st:', '2nd:')
      .replace('3st:', '3rd:')
      .replace('4st:', '4th:')
      .replace('5st:', '5th:')
      .replace('6st:', '6th:')
      .replace('7st:', '7th:')
      .replace('8st:', '8th:')
      .replace('9st:', '9th:')
  }).join(' | ')
}

/**
 * Get spell names from IDs
 */
function getSpellNames(spellIds: string[] | null): string[] {
  if (!spellIds || spellIds.length === 0) return []
  const spells = getSpellsByIds(spellIds)
  return spells.map(s => s.name)
}

/**
 * Format equipment for display
 */
function formatEquipment(equipment: Record<string, unknown> | null): string {
  if (!equipment) return ''

  const items: string[] = []

  // Handle common equipment slots
  const slots = ['mainHand', 'offHand', 'armor', 'shield']
  for (const slot of slots) {
    const item = equipment[slot]
    if (item && typeof item === 'object' && 'name' in item) {
      items.push((item as { name: string }).name)
    } else if (typeof item === 'string' && item) {
      items.push(item)
    }
  }

  // Handle other equipment
  for (const [key, value] of Object.entries(equipment)) {
    if (slots.includes(key)) continue
    if (value && typeof value === 'object' && 'name' in value) {
      items.push((value as { name: string }).name)
    } else if (typeof value === 'string' && value) {
      items.push(value)
    }
  }

  return items.join(', ')
}

/**
 * Format inventory for display (limited to prevent token bloat)
 */
function formatInventory(inventory: unknown[] | null, maxItems = 10): string {
  if (!inventory || inventory.length === 0) return ''

  const items: string[] = []

  for (const item of inventory.slice(0, maxItems)) {
    if (typeof item === 'string') {
      items.push(item)
    } else if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>
      const name = obj.name as string || 'Unknown Item'
      const qty = obj.quantity as number || 1
      items.push(qty > 1 ? `${name} x${qty}` : name)
    }
  }

  if (inventory.length > maxItems) {
    items.push(`+${inventory.length - maxItems} more...`)
  }

  return items.join(', ')
}

/**
 * Format a single character for the DM prompt
 */
export function formatCharacterContext(char: CharacterForPrompt): string {
  const lines: string[] = []

  // Header
  lines.push(`${char.name.toUpperCase()} (Level ${char.level || 1} ${char.race || ''} ${char.class || 'Adventurer'})`)

  // Combat stats
  lines.push(`  HP: ${char.current_hp}/${char.max_hp} | AC: ${char.armor_class} | Speed: ${char.speed || 30}ft`)

  // Ability scores (compact format)
  const abilities = [
    formatAbilityCompact('STR', char.strength || 10),
    formatAbilityCompact('DEX', char.dexterity || 10),
    formatAbilityCompact('CON', char.constitution || 10),
    formatAbilityCompact('INT', char.intelligence || 10),
    formatAbilityCompact('WIS', char.wisdom || 10),
    formatAbilityCompact('CHA', char.charisma || 10),
  ]
  lines.push(`  ${abilities.join(' | ')}`)

  // Proficiencies
  const skills = char.skill_proficiencies?.map(s => s.replace(/_/g, ' ')).join(', ')
  const saves = char.saving_throw_proficiencies?.map(s => s.toUpperCase()).join(', ')
  if (skills || saves) {
    const profParts = []
    if (skills) profParts.push(`Skills: ${skills}`)
    if (saves) profParts.push(`Saves: ${saves}`)
    lines.push(`  ${profParts.join(' | ')}`)
  }

  // Spellcasting (if applicable)
  if (char.spellcasting_ability) {
    const ability = char.spellcasting_ability.toUpperCase().slice(0, 3)
    lines.push(`  Spellcasting (${ability}): Save DC ${char.spell_save_dc || 10} | Attack +${char.spell_attack_bonus || 0}`)

    // Spell slots
    const slotsStr = formatSpellSlots(char.spell_slots, char.spell_slots_used)
    if (slotsStr) {
      lines.push(`  Slots: ${slotsStr}`)
    }

    // Cantrips
    const cantrips = getSpellNames(char.cantrips)
    if (cantrips.length > 0) {
      lines.push(`  Cantrips: ${cantrips.join(', ')}`)
    }

    // Prepared/Known spells
    const prepared = getSpellNames(char.prepared_spells)
    if (prepared.length > 0) {
      lines.push(`  Prepared: ${prepared.join(', ')}`)
    } else {
      const known = getSpellNames(char.known_spells)
      if (known.length > 0) {
        lines.push(`  Known Spells: ${known.join(', ')}`)
      }
    }
  }

  // Equipment
  const equipped = formatEquipment(char.equipment)
  if (equipped) {
    lines.push(`  Equipped: ${equipped}`)
  }

  // Inventory (limited)
  const inv = formatInventory(char.inventory, 8)
  if (inv) {
    lines.push(`  Inventory: ${inv}`)
  }

  // Personality (for roleplay hooks)
  const personalityParts: string[] = []
  if (char.personality_traits?.length) {
    personalityParts.push(`Traits: "${char.personality_traits.join('", "')}"`)
  }
  if (char.ideals?.length) {
    personalityParts.push(`Ideals: "${char.ideals.join('", "')}"`)
  }
  if (char.bonds?.length) {
    personalityParts.push(`Bonds: "${char.bonds.join('", "')}"`)
  }
  if (char.flaws?.length) {
    personalityParts.push(`Flaws: "${char.flaws.join('", "')}"`)
  }
  if (personalityParts.length > 0) {
    lines.push(`  Personality: ${personalityParts.join(' | ')}`)
  }

  // Backstory (condensed if present)
  if (char.backstory) {
    // Truncate backstory to first 200 chars to avoid token bloat
    const truncatedBackstory = char.backstory.length > 200
      ? char.backstory.substring(0, 200) + '...'
      : char.backstory
    lines.push(`  Backstory: ${truncatedBackstory}`)
  }

  return lines.join('\n')
}

/**
 * Format all characters for the DM prompt
 */
export function formatAllCharacters(characters: CharacterForPrompt[]): string {
  if (characters.length === 0) return ''

  const sections = characters.map(char => formatCharacterContext(char))
  return 'PLAYER CHARACTERS:\n\n' + sections.join('\n\n')
}

/**
 * Build rules enforcement section for strict mode
 */
export function buildRulesEnforcementSection(): string {
  return `
RULES ENFORCEMENT (Strict Mode):
- Characters can ONLY cast spells listed in their Prepared or Known Spells
- Casting a leveled spell requires an available spell slot of that level or higher
- Cantrips can be cast unlimited times (no slot required)
- If a player attempts to cast a spell they don't have:
  * Narrate the attempt and why it fails gracefully
  * Example: "You reach for the arcane words of Fireball, but realize you didn't prepare that spell today"
- If a player is out of spell slots:
  * Narrate their attempt and the exhaustion of their magical reserves
  * Example: "You try to channel the spell, but feel only emptiness - your magical reserves are depleted"
- Track and reference character resources when appropriate
- Apply D&D 5e rules for ability checks, saving throws, and combat`
}
