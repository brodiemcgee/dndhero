/**
 * Character State Tool Processor
 * Handles validation, execution, and auditing of character state changes
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { ToolCall } from './openai-client'
import { CHARACTER_TOOL_NAMES } from './character-tools'

// Re-export for convenience
export { CHARACTER_TOOL_NAMES }

// Safety constraints to prevent AI abuse
const SAFETY_LIMITS = {
  MAX_GOLD_PER_TRANSACTION: 10000,
  MAX_ITEMS_PER_TRANSACTION: 10,
  MAX_XP_PER_AWARD: 5000,
  MAX_DAMAGE_PER_HIT: 200,
  MAX_HEALING_PER_SPELL: 100,
}

// XP thresholds for leveling (D&D 5e)
const XP_THRESHOLDS = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000,
]

interface CharacterRecord {
  id: string
  name: string
  class: string | null
  level: number
  current_hp: number
  max_hp: number
  temp_hp: number
  inventory: InventoryItem[]
  equipment: Record<string, EquipmentItem | null>
  currency: { cp: number; sp: number; ep: number; gp: number; pp: number }
  spell_slots: Record<string, number | { max: number; used?: number }>
  spell_slots_used: Record<string, number>
  experience: number
  conditions: string[]
  death_save_successes: number
  death_save_failures: number
}

interface InventoryItem {
  name: string
  id?: string
  quantity?: number
  description?: string
  added_at?: string
  added_reason?: string
}

interface EquipmentItem {
  name: string
  id?: string
}

interface CharacterChange {
  type: string
  characterName: string
  description: string
}

interface ProcessResult {
  success: boolean
  errors: string[]
  changes: Array<{ character: string; description: string }>
}

/**
 * Filter tool calls to only character-related tools
 */
export function filterCharacterToolCalls(toolCalls: ToolCall[]): ToolCall[] {
  return toolCalls.filter((tc) => CHARACTER_TOOL_NAMES.includes(tc.function.name))
}

/**
 * Process all character-related tool calls from AI DM response
 */
export async function processCharacterToolCalls(
  supabase: SupabaseClient,
  campaignId: string,
  toolCalls: ToolCall[],
  dmMessageId?: string
): Promise<ProcessResult> {
  const changes: Array<{ character: string; description: string }> = []
  const errors: string[] = []
  const characterToolCalls = filterCharacterToolCalls(toolCalls)

  if (characterToolCalls.length === 0) {
    return { success: true, errors: [], changes: [] }
  }

  // Get all characters in campaign for lookup
  const { data: characters, error: charError } = await supabase
    .from('characters')
    .select('*')
    .eq('campaign_id', campaignId)

  if (charError || !characters) {
    console.error('Failed to load characters:', charError)
    return { success: false, errors: ['Failed to load characters'], changes: [] }
  }

  const characterMap = new Map<string, CharacterRecord>(
    characters.map((c) => [c.name.toLowerCase(), c as CharacterRecord])
  )

  for (const toolCall of characterToolCalls) {
    try {
      const args = JSON.parse(toolCall.function.arguments)
      const result = await processToolCall(
        supabase,
        toolCall.function.name,
        args,
        characterMap,
        campaignId,
        dmMessageId
      )

      if (result.success && result.change) {
        changes.push({
          character: result.change.characterName,
          description: result.change.description
        })
      } else if (result.error) {
        errors.push(result.error)
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`Error processing ${toolCall.function.name}: ${errMsg}`)
      console.error(`Error processing tool call ${toolCall.function.name}:`, error)
    }
  }

  return { success: errors.length === 0, errors, changes }
}

/**
 * Process a single tool call
 */
async function processToolCall(
  supabase: SupabaseClient,
  toolName: string,
  args: Record<string, unknown>,
  characterMap: Map<string, CharacterRecord>,
  campaignId: string,
  dmMessageId?: string
): Promise<{ success: boolean; change?: CharacterChange }> {
  // Find character by name (case-insensitive)
  const findCharacter = (name: string): CharacterRecord | undefined => {
    return characterMap.get(name.toLowerCase())
  }

  // Get all characters for party-wide actions
  const getAllCharacters = (): CharacterRecord[] => {
    return Array.from(characterMap.values())
  }

  switch (toolName) {
    // ============ INVENTORY ============
    case 'add_item_to_inventory': {
      const char = findCharacter(args.character_name as string)
      if (!char) {
        console.warn(`Character not found: ${args.character_name}`)
        return { success: false }
      }

      const quantity = (args.quantity as number) || 1
      if (quantity > SAFETY_LIMITS.MAX_ITEMS_PER_TRANSACTION) {
        console.warn(`Blocked: Too many items (${quantity})`)
        return { success: false }
      }

      const newItem: InventoryItem = {
        name: args.item_name as string,
        id: (args.item_id as string) || undefined,
        quantity: quantity,
        description: (args.custom_description as string) || undefined,
        added_at: new Date().toISOString(),
        added_reason: args.reason as string,
      }

      const oldInventory = [...(char.inventory || [])]
      const newInventory = [...oldInventory, newItem]

      await updateCharacterAndLog(supabase, char.id, campaignId, dmMessageId, {
        field: 'inventory',
        oldValue: oldInventory,
        newValue: newInventory,
        changeType: 'inventory_add',
        reason: args.reason as string,
      })

      return {
        success: true,
        change: {
          type: 'inventory_add',
          characterName: char.name,
          description: `Received ${quantity}x ${args.item_name}: ${args.reason}`,
        },
      }
    }

    case 'remove_item_from_inventory': {
      const char = findCharacter(args.character_name as string)
      if (!char) return { success: false }

      const inventory = [...(char.inventory || [])]
      const itemIndex = inventory.findIndex(
        (item) => item.name?.toLowerCase() === (args.item_name as string).toLowerCase()
      )

      if (itemIndex === -1) {
        console.warn(`Item not found: ${args.item_name}`)
        return { success: false }
      }

      const oldInventory = [...inventory]
      const item = inventory[itemIndex]
      const removeQty = (args.quantity as number) || 1

      if ((item.quantity || 1) <= removeQty) {
        inventory.splice(itemIndex, 1)
      } else {
        inventory[itemIndex] = { ...item, quantity: (item.quantity || 1) - removeQty }
      }

      await updateCharacterAndLog(supabase, char.id, campaignId, dmMessageId, {
        field: 'inventory',
        oldValue: oldInventory,
        newValue: inventory,
        changeType: 'inventory_remove',
        reason: args.reason as string,
      })

      return {
        success: true,
        change: {
          type: 'inventory_remove',
          characterName: char.name,
          description: `Lost ${removeQty}x ${args.item_name}: ${args.reason}`,
        },
      }
    }

    // ============ CURRENCY ============
    case 'modify_currency': {
      const char = findCharacter(args.character_name as string)
      if (!char) return { success: false }

      const oldCurrency = { ...(char.currency || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }) }
      const newCurrency = { ...oldCurrency }

      let totalGoldValue = 0
      const changeList: string[] = []
      const goldMultipliers: Record<string, number> = { cp: 0.01, sp: 0.1, ep: 0.5, gp: 1, pp: 10 }

      for (const [type, amount] of Object.entries(args)) {
        if (['cp', 'sp', 'ep', 'gp', 'pp'].includes(type) && typeof amount === 'number') {
          // Prevent going negative
          const currentAmount = newCurrency[type as keyof typeof newCurrency] || 0
          if (currentAmount + amount < 0) {
            console.warn(`Blocked: Would make ${type} negative`)
            continue
          }

          totalGoldValue += amount * goldMultipliers[type]
          newCurrency[type as keyof typeof newCurrency] = currentAmount + amount

          if (amount !== 0) {
            changeList.push(`${amount > 0 ? '+' : ''}${amount} ${type}`)
          }
        }
      }

      // Safety check
      if (Math.abs(totalGoldValue) > SAFETY_LIMITS.MAX_GOLD_PER_TRANSACTION) {
        console.warn(`Blocked: Transaction too large (${totalGoldValue} gp equivalent)`)
        return { success: false }
      }

      if (changeList.length === 0) {
        return { success: false }
      }

      await updateCharacterAndLog(supabase, char.id, campaignId, dmMessageId, {
        field: 'currency',
        oldValue: oldCurrency,
        newValue: newCurrency,
        changeType: 'currency_change',
        reason: args.reason as string,
      })

      return {
        success: true,
        change: {
          type: 'currency_change',
          characterName: char.name,
          description: `${changeList.join(', ')}: ${args.reason}`,
        },
      }
    }

    // ============ HP ============
    case 'modify_hp': {
      const char = findCharacter(args.character_name as string)
      if (!char) return { success: false }

      const hpChange = args.hp_change as number

      // Safety checks
      if (hpChange < -SAFETY_LIMITS.MAX_DAMAGE_PER_HIT) {
        console.warn(`Blocked: Damage too high (${Math.abs(hpChange)})`)
        return { success: false }
      }
      if (hpChange > SAFETY_LIMITS.MAX_HEALING_PER_SPELL) {
        console.warn(`Blocked: Healing too high (${hpChange})`)
        return { success: false }
      }

      const oldHp = char.current_hp
      let newHp = oldHp
      let newTempHp = char.temp_hp || 0

      if (hpChange < 0) {
        // Damage - absorb with temp HP first
        let damage = Math.abs(hpChange)
        if (newTempHp > 0) {
          const tempAbsorbed = Math.min(newTempHp, damage)
          damage -= tempAbsorbed
          newTempHp -= tempAbsorbed
        }
        newHp = Math.max(0, oldHp - damage)
      } else {
        // Healing - cap at max HP
        newHp = Math.min(char.max_hp, oldHp + hpChange)
      }

      // Update character
      await supabase
        .from('characters')
        .update({ current_hp: newHp, temp_hp: newTempHp, updated_at: new Date().toISOString() })
        .eq('id', char.id)

      // Create audit log
      await supabase.from('character_state_changes').insert({
        character_id: char.id,
        campaign_id: campaignId,
        dm_message_id: dmMessageId || null,
        change_type: 'hp_change',
        field_name: 'current_hp',
        old_value: oldHp,
        new_value: newHp,
        reason: `${args.damage_type || 'unknown'}: ${args.reason}`,
      })

      const damageType = args.damage_type as string
      return {
        success: true,
        change: {
          type: 'hp_change',
          characterName: char.name,
          description:
            hpChange < 0
              ? `Took ${Math.abs(hpChange)} ${damageType || ''} damage: ${args.reason}`
              : `Healed ${hpChange} HP: ${args.reason}`,
        },
      }
    }

    case 'set_temp_hp': {
      const char = findCharacter(args.character_name as string)
      if (!char) return { success: false }

      const oldTempHp = char.temp_hp || 0
      const newTempHp = Math.max(oldTempHp, args.temp_hp as number) // Temp HP doesn't stack, take higher

      await updateCharacterAndLog(supabase, char.id, campaignId, dmMessageId, {
        field: 'temp_hp',
        oldValue: oldTempHp,
        newValue: newTempHp,
        changeType: 'temp_hp_set',
        reason: args.source as string,
      })

      return {
        success: true,
        change: {
          type: 'temp_hp_set',
          characterName: char.name,
          description: `Gained ${newTempHp} temp HP: ${args.source}`,
        },
      }
    }

    case 'modify_death_saves': {
      const char = findCharacter(args.character_name as string)
      if (!char) return { success: false }

      const updates: Record<string, number> = {}
      if (args.successes !== undefined) {
        updates.death_save_successes = args.successes as number
      }
      if (args.failures !== undefined) {
        updates.death_save_failures = args.failures as number
      }

      await supabase
        .from('characters')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', char.id)

      await supabase.from('character_state_changes').insert({
        character_id: char.id,
        campaign_id: campaignId,
        dm_message_id: dmMessageId || null,
        change_type: 'death_save',
        field_name: 'death_saves',
        old_value: { successes: char.death_save_successes, failures: char.death_save_failures },
        new_value: { successes: args.successes ?? char.death_save_successes, failures: args.failures ?? char.death_save_failures },
        reason: args.reason as string,
      })

      return {
        success: true,
        change: {
          type: 'death_save',
          characterName: char.name,
          description: `Death save: ${args.reason}`,
        },
      }
    }

    // ============ CONDITIONS ============
    case 'apply_condition': {
      const char = findCharacter(args.character_name as string)
      if (!char) return { success: false }

      const condition = args.condition as string
      const oldConditions = [...(char.conditions || [])]

      if (oldConditions.includes(condition)) {
        return { success: true } // Already has condition
      }

      const newConditions = [...oldConditions, condition]

      await updateCharacterAndLog(supabase, char.id, campaignId, dmMessageId, {
        field: 'conditions',
        oldValue: oldConditions,
        newValue: newConditions,
        changeType: 'condition_add',
        reason: `${args.source} (${args.duration || 'indefinite'})`,
      })

      return {
        success: true,
        change: {
          type: 'condition_add',
          characterName: char.name,
          description: `Now ${condition}: ${args.source}`,
        },
      }
    }

    case 'remove_condition': {
      const char = findCharacter(args.character_name as string)
      if (!char) return { success: false }

      const condition = args.condition as string
      const oldConditions = [...(char.conditions || [])]
      const newConditions = oldConditions.filter((c) => c !== condition)

      if (oldConditions.length === newConditions.length) {
        return { success: true } // Didn't have condition
      }

      await updateCharacterAndLog(supabase, char.id, campaignId, dmMessageId, {
        field: 'conditions',
        oldValue: oldConditions,
        newValue: newConditions,
        changeType: 'condition_remove',
        reason: args.reason as string,
      })

      return {
        success: true,
        change: {
          type: 'condition_remove',
          characterName: char.name,
          description: `No longer ${condition}: ${args.reason}`,
        },
      }
    }

    // ============ SPELL SLOTS ============
    case 'use_spell_slot': {
      const char = findCharacter(args.character_name as string)
      if (!char) return { success: false }

      const level = (args.spell_level as number).toString()
      const slots = char.spell_slots || {}
      const used = { ...(char.spell_slots_used || {}) }

      // Get max slots (handle both formats)
      const slotData = slots[level]
      const maxSlots = typeof slotData === 'number' ? slotData : (slotData as { max: number })?.max || 0
      const currentUsed = used[level] || 0

      if (currentUsed >= maxSlots) {
        console.warn(`No spell slots remaining at level ${level}`)
        return { success: false }
      }

      const oldUsed = { ...used }
      used[level] = currentUsed + 1

      await updateCharacterAndLog(supabase, char.id, campaignId, dmMessageId, {
        field: 'spell_slots_used',
        oldValue: oldUsed,
        newValue: used,
        changeType: 'spell_slot_use',
        reason: `Cast ${args.spell_name} (level ${level})`,
      })

      return {
        success: true,
        change: {
          type: 'spell_slot_use',
          characterName: char.name,
          description: `Cast ${args.spell_name} using level ${level} slot`,
        },
      }
    }

    case 'restore_spell_slots': {
      const char = findCharacter(args.character_name as string)
      if (!char) return { success: false }

      const oldUsed = { ...(char.spell_slots_used || {}) }
      let newUsed: Record<string, number>

      if ((args.rest_type as string) === 'long') {
        // Long rest: restore all slots
        newUsed = {}
      } else {
        // Short rest: only warlock pact magic (check class)
        if (char.class?.toLowerCase() === 'warlock') {
          newUsed = {}
        } else {
          // No change for non-warlocks on short rest
          return { success: true }
        }
      }

      await updateCharacterAndLog(supabase, char.id, campaignId, dmMessageId, {
        field: 'spell_slots_used',
        oldValue: oldUsed,
        newValue: newUsed,
        changeType: 'spell_slot_restore',
        reason: `${args.rest_type} rest`,
      })

      return {
        success: true,
        change: {
          type: 'spell_slot_restore',
          characterName: char.name,
          description: `Spell slots restored after ${args.rest_type} rest`,
        },
      }
    }

    // ============ XP ============
    case 'award_xp': {
      const xpAmount = args.xp_amount as number

      if (xpAmount > SAFETY_LIMITS.MAX_XP_PER_AWARD) {
        console.warn(`Blocked: XP award too high (${xpAmount})`)
        return { success: false }
      }

      const targetChars =
        (args.character_name as string).toLowerCase() === 'party'
          ? getAllCharacters()
          : [findCharacter(args.character_name as string)].filter(Boolean) as CharacterRecord[]

      const changes: CharacterChange[] = []

      for (const char of targetChars) {
        const oldXp = char.experience || 0
        const newXp = oldXp + xpAmount
        const oldLevel = char.level

        await updateCharacterAndLog(supabase, char.id, campaignId, dmMessageId, {
          field: 'experience',
          oldValue: oldXp,
          newValue: newXp,
          changeType: 'xp_gain',
          reason: args.reason as string,
        })

        // Check for level up eligibility
        const canLevel = newXp >= XP_THRESHOLDS[oldLevel]

        changes.push({
          type: 'xp_gain',
          characterName: char.name,
          description: canLevel
            ? `Gained ${xpAmount} XP - Ready to level up!`
            : `Gained ${xpAmount} XP: ${args.reason}`,
        })
      }

      return {
        success: true,
        change: {
          type: 'xp_gain',
          characterName: args.character_name as string,
          description: `Gained ${xpAmount} XP: ${args.reason}`,
        },
      }
    }

    // ============ EQUIPMENT ============
    case 'equip_item': {
      const char = findCharacter(args.character_name as string)
      if (!char) return { success: false }

      const itemName = args.item_name as string
      const slot = args.slot as string

      // Find item in inventory
      const inventory = [...(char.inventory || [])]
      const itemIndex = inventory.findIndex(
        (item) => item.name?.toLowerCase() === itemName.toLowerCase()
      )

      if (itemIndex === -1) {
        console.warn(`Item not in inventory: ${itemName}`)
        return { success: false }
      }

      // Remove from inventory
      const item = inventory[itemIndex]
      if ((item.quantity || 1) <= 1) {
        inventory.splice(itemIndex, 1)
      } else {
        inventory[itemIndex] = { ...item, quantity: (item.quantity || 1) - 1 }
      }

      // Add to equipment slot (move existing to inventory if present)
      const equipment = { ...(char.equipment || {}) }
      const existingItem = equipment[slot]
      if (existingItem) {
        inventory.push({ name: existingItem.name, id: existingItem.id, quantity: 1 })
      }
      equipment[slot] = { name: item.name, id: item.id }

      // Update both fields
      await supabase
        .from('characters')
        .update({ inventory, equipment, updated_at: new Date().toISOString() })
        .eq('id', char.id)

      await supabase.from('character_state_changes').insert({
        character_id: char.id,
        campaign_id: campaignId,
        dm_message_id: dmMessageId || null,
        change_type: 'equip_item',
        field_name: 'equipment',
        old_value: char.equipment,
        new_value: equipment,
        reason: `Equipped ${itemName} to ${slot}`,
      })

      return {
        success: true,
        change: {
          type: 'equip_item',
          characterName: char.name,
          description: `Equipped ${itemName}`,
        },
      }
    }

    case 'unequip_item': {
      const char = findCharacter(args.character_name as string)
      if (!char) return { success: false }

      const slot = args.slot as string
      const equipment = { ...(char.equipment || {}) }
      const item = equipment[slot]

      if (!item) {
        return { success: true } // Nothing in slot
      }

      // Move to inventory
      const inventory = [...(char.inventory || [])]
      inventory.push({ name: item.name, id: item.id, quantity: 1 })

      // Clear slot
      equipment[slot] = null

      await supabase
        .from('characters')
        .update({ inventory, equipment, updated_at: new Date().toISOString() })
        .eq('id', char.id)

      await supabase.from('character_state_changes').insert({
        character_id: char.id,
        campaign_id: campaignId,
        dm_message_id: dmMessageId || null,
        change_type: 'unequip_item',
        field_name: 'equipment',
        old_value: char.equipment,
        new_value: equipment,
        reason: args.reason as string,
      })

      return {
        success: true,
        change: {
          type: 'unequip_item',
          characterName: char.name,
          description: `Unequipped ${item.name}: ${args.reason}`,
        },
      }
    }

    // ============ REST ============
    case 'apply_rest': {
      const restType = args.rest_type as string
      const targetChars =
        (args.character_name as string).toLowerCase() === 'party'
          ? getAllCharacters()
          : [findCharacter(args.character_name as string)].filter(Boolean) as CharacterRecord[]

      for (const char of targetChars) {
        if (restType === 'long') {
          // Long rest: full HP, reset spell slots, clear some conditions
          const conditionsToRemove = ['exhaustion'] // Could expand this
          const newConditions = (char.conditions || []).filter(
            (c) => !conditionsToRemove.includes(c)
          )

          await supabase
            .from('characters')
            .update({
              current_hp: char.max_hp,
              temp_hp: 0,
              spell_slots_used: {},
              death_save_successes: 0,
              death_save_failures: 0,
              conditions: newConditions,
              updated_at: new Date().toISOString(),
            })
            .eq('id', char.id)

          await supabase.from('character_state_changes').insert({
            character_id: char.id,
            campaign_id: campaignId,
            dm_message_id: dmMessageId || null,
            change_type: 'long_rest',
            field_name: 'rest',
            old_value: { hp: char.current_hp, spell_slots_used: char.spell_slots_used },
            new_value: { hp: char.max_hp, spell_slots_used: {} },
            reason: 'Long rest',
          })
        }
        // Short rest with hit dice would require more complex logic
      }

      return {
        success: true,
        change: {
          type: 'rest',
          characterName: args.character_name as string,
          description: `Completed ${restType} rest`,
        },
      }
    }

    default:
      console.warn(`Unknown character tool: ${toolName}`)
      return { success: false }
  }
}

/**
 * Helper function to update character and create audit log
 */
async function updateCharacterAndLog(
  supabase: SupabaseClient,
  characterId: string,
  campaignId: string,
  dmMessageId: string | undefined,
  change: {
    field: string
    oldValue: unknown
    newValue: unknown
    changeType: string
    reason: string
  }
): Promise<void> {
  // Update character
  await supabase
    .from('characters')
    .update({ [change.field]: change.newValue, updated_at: new Date().toISOString() })
    .eq('id', characterId)

  // Create audit log
  await supabase.from('character_state_changes').insert({
    character_id: characterId,
    campaign_id: campaignId,
    dm_message_id: dmMessageId || null,
    change_type: change.changeType,
    field_name: change.field,
    old_value: change.oldValue,
    new_value: change.newValue,
    reason: change.reason,
  })
}
