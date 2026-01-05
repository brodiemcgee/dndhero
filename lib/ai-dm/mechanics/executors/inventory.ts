/**
 * Inventory Executor
 *
 * Executes pickup, drop, give, and use item intents.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import {
  ClassifiedIntent,
  ValidationResult,
  MechanicsResult,
  PipelineContext,
  StateChange,
  InventoryParams,
  UseItemParams,
} from '../types'
import { getItemByNameWithAliases } from '@/data/items'
import { CONSUMABLES } from '@/data/items/consumables'

/**
 * Execute an inventory intent
 */
export async function executeInventoryIntent(
  supabase: SupabaseClient,
  intent: ClassifiedIntent,
  validation: ValidationResult,
  context: PipelineContext,
  dmMessageId?: string
): Promise<MechanicsResult> {
  switch (intent.type) {
    case 'pickup_item':
      return executePickup(supabase, intent, validation, context, dmMessageId)
    case 'drop_item':
      return executeDrop(supabase, intent, validation, context, dmMessageId)
    case 'give_item':
      return executeGive(supabase, intent, validation, context, dmMessageId)
    case 'use_item':
      return executeUseItem(supabase, intent, validation, context, dmMessageId)
    default:
      return {
        success: false,
        outcome: 'failure',
        changes: [],
        narrativeContext: `Unknown inventory intent type: ${intent.type}`,
        errors: [`Unknown inventory intent type: ${intent.type}`],
      }
  }
}

/**
 * Execute item pickup
 */
async function executePickup(
  supabase: SupabaseClient,
  intent: ClassifiedIntent,
  validation: ValidationResult,
  context: PipelineContext,
  dmMessageId?: string
): Promise<MechanicsResult> {
  const params = intent.params as unknown as InventoryParams
  const changes: StateChange[] = []

  // Get character's current data
  const { data: character, error: fetchError } = await supabase
    .from('characters')
    .select('id, name, inventory')
    .eq('id', intent.characterId)
    .single()

  if (fetchError || !character) {
    return {
      success: false,
      outcome: 'failure',
      changes: [],
      narrativeContext: 'Character not found in database.',
      errors: ['Character not found'],
    }
  }

  // Look up item for proper name/description
  const lookup = getItemByNameWithAliases(params.itemName)
  const itemName = lookup.found && lookup.item ? lookup.item.name : params.itemName
  const quantity = params.quantity || 1

  const oldInventory = [...(character.inventory || [])]
  const newInventory = [...oldInventory]

  newInventory.push({
    name: itemName,
    quantity,
    description: lookup.found && lookup.item ? lookup.item.description : undefined,
    added_at: new Date().toISOString(),
    added_reason: 'Picked up',
  })

  // Update database
  const { error: updateError } = await supabase
    .from('characters')
    .update({
      inventory: newInventory,
      updated_at: new Date().toISOString(),
    })
    .eq('id', character.id)

  if (updateError) {
    return {
      success: false,
      outcome: 'failure',
      changes: [],
      narrativeContext: 'Failed to update inventory.',
      errors: [updateError.message],
    }
  }

  // Create audit log
  await supabase.from('character_state_changes').insert({
    character_id: character.id,
    campaign_id: context.campaignId,
    dm_message_id: dmMessageId || null,
    change_type: 'inventory_add',
    field_name: 'inventory',
    old_value: oldInventory,
    new_value: newInventory,
    reason: `Picked up ${quantity > 1 ? `${quantity}x ` : ''}${itemName}`,
  })

  changes.push({
    type: 'inventory_add',
    characterId: character.id,
    characterName: character.name,
    description: `Picked up ${quantity > 1 ? `${quantity}x ` : ''}${itemName}`,
    field: 'inventory',
    before: oldInventory,
    after: newInventory,
  })

  return {
    success: true,
    outcome: 'success',
    changes,
    narrativeContext: `${character.name} picks up ${quantity > 1 ? `${quantity}x ` : ''}${itemName}.`,
  }
}

/**
 * Execute item drop
 */
async function executeDrop(
  supabase: SupabaseClient,
  intent: ClassifiedIntent,
  validation: ValidationResult,
  context: PipelineContext,
  dmMessageId?: string
): Promise<MechanicsResult> {
  const params = intent.params as unknown as InventoryParams
  const changes: StateChange[] = []

  // Get character's current data
  const { data: character, error: fetchError } = await supabase
    .from('characters')
    .select('id, name, inventory')
    .eq('id', intent.characterId)
    .single()

  if (fetchError || !character) {
    return {
      success: false,
      outcome: 'failure',
      changes: [],
      narrativeContext: 'Character not found in database.',
      errors: ['Character not found'],
    }
  }

  const oldInventory = [...(character.inventory || [])]
  const newInventory = [...oldInventory]
  const quantity = params.quantity || 1

  // Find and remove item
  const itemIndex = newInventory.findIndex(
    item => item.name.toLowerCase() === params.itemName.toLowerCase()
  )

  if (itemIndex === -1) {
    return {
      success: false,
      outcome: 'failure',
      changes: [],
      narrativeContext: `${params.itemName} not found in inventory.`,
      errors: ['Item not found in inventory'],
    }
  }

  const item = newInventory[itemIndex]
  const existingQty = item.quantity || 1

  if (existingQty <= quantity) {
    newInventory.splice(itemIndex, 1)
  } else {
    newInventory[itemIndex] = { ...item, quantity: existingQty - quantity }
  }

  // Update database
  const { error: updateError } = await supabase
    .from('characters')
    .update({
      inventory: newInventory,
      updated_at: new Date().toISOString(),
    })
    .eq('id', character.id)

  if (updateError) {
    return {
      success: false,
      outcome: 'failure',
      changes: [],
      narrativeContext: 'Failed to update inventory.',
      errors: [updateError.message],
    }
  }

  // Create audit log
  await supabase.from('character_state_changes').insert({
    character_id: character.id,
    campaign_id: context.campaignId,
    dm_message_id: dmMessageId || null,
    change_type: 'inventory_remove',
    field_name: 'inventory',
    old_value: oldInventory,
    new_value: newInventory,
    reason: `Dropped ${quantity > 1 ? `${quantity}x ` : ''}${params.itemName}`,
  })

  changes.push({
    type: 'inventory_remove',
    characterId: character.id,
    characterName: character.name,
    description: `Dropped ${quantity > 1 ? `${quantity}x ` : ''}${params.itemName}`,
    field: 'inventory',
    before: oldInventory,
    after: newInventory,
  })

  return {
    success: true,
    outcome: 'success',
    changes,
    narrativeContext: `${character.name} drops ${quantity > 1 ? `${quantity}x ` : ''}${params.itemName}.`,
  }
}

/**
 * Execute item give
 */
async function executeGive(
  supabase: SupabaseClient,
  intent: ClassifiedIntent,
  validation: ValidationResult,
  context: PipelineContext,
  dmMessageId?: string
): Promise<MechanicsResult> {
  const params = intent.params as unknown as InventoryParams
  const changes: StateChange[] = []

  // Get giver's current data
  const { data: giver, error: giverError } = await supabase
    .from('characters')
    .select('id, name, inventory')
    .eq('id', intent.characterId)
    .single()

  if (giverError || !giver) {
    return {
      success: false,
      outcome: 'failure',
      changes: [],
      narrativeContext: 'Giver not found in database.',
      errors: ['Giver not found'],
    }
  }

  const quantity = params.quantity || 1
  const oldGiverInventory = [...(giver.inventory || [])]
  const newGiverInventory = [...oldGiverInventory]

  // Remove item from giver
  const itemIndex = newGiverInventory.findIndex(
    item => item.name.toLowerCase() === params.itemName.toLowerCase()
  )

  if (itemIndex === -1) {
    return {
      success: false,
      outcome: 'failure',
      changes: [],
      narrativeContext: `${params.itemName} not found in inventory.`,
      errors: ['Item not found in inventory'],
    }
  }

  const item = newGiverInventory[itemIndex]
  const existingQty = item.quantity || 1

  if (existingQty <= quantity) {
    newGiverInventory.splice(itemIndex, 1)
  } else {
    newGiverInventory[itemIndex] = { ...item, quantity: existingQty - quantity }
  }

  // Update giver's inventory
  const { error: giverUpdateError } = await supabase
    .from('characters')
    .update({
      inventory: newGiverInventory,
      updated_at: new Date().toISOString(),
    })
    .eq('id', giver.id)

  if (giverUpdateError) {
    return {
      success: false,
      outcome: 'failure',
      changes: [],
      narrativeContext: 'Failed to update giver inventory.',
      errors: [giverUpdateError.message],
    }
  }

  changes.push({
    type: 'inventory_remove',
    characterId: giver.id,
    characterName: giver.name,
    description: `Gave ${quantity > 1 ? `${quantity}x ` : ''}${params.itemName}${params.recipientName ? ` to ${params.recipientName}` : ''}`,
    field: 'inventory',
    before: oldGiverInventory,
    after: newGiverInventory,
  })

  // Try to find recipient as another PC
  if (params.recipientName) {
    const recipientPC = context.characters.find(
      c => c.name.toLowerCase().includes(params.recipientName!.toLowerCase())
    )

    if (recipientPC) {
      // Add to recipient's inventory
      const { data: recipient, error: recipientFetchError } = await supabase
        .from('characters')
        .select('id, name, inventory')
        .eq('id', recipientPC.id)
        .single()

      if (!recipientFetchError && recipient) {
        const oldRecipientInventory = [...(recipient.inventory || [])]
        const newRecipientInventory = [...oldRecipientInventory]

        newRecipientInventory.push({
          name: item.name,
          quantity,
          description: item.description,
          added_at: new Date().toISOString(),
          added_reason: `Received from ${giver.name}`,
        })

        await supabase
          .from('characters')
          .update({
            inventory: newRecipientInventory,
            updated_at: new Date().toISOString(),
          })
          .eq('id', recipient.id)

        changes.push({
          type: 'inventory_add',
          characterId: recipient.id,
          characterName: recipient.name,
          description: `Received ${quantity > 1 ? `${quantity}x ` : ''}${params.itemName} from ${giver.name}`,
          field: 'inventory',
          before: oldRecipientInventory,
          after: newRecipientInventory,
        })
      }
    }
  }

  // Create audit log
  await supabase.from('character_state_changes').insert({
    character_id: giver.id,
    campaign_id: context.campaignId,
    dm_message_id: dmMessageId || null,
    change_type: 'inventory_give',
    field_name: 'inventory',
    old_value: oldGiverInventory,
    new_value: newGiverInventory,
    reason: `Gave ${quantity > 1 ? `${quantity}x ` : ''}${params.itemName} to ${params.recipientName || 'someone'}`,
  })

  return {
    success: true,
    outcome: 'success',
    changes,
    narrativeContext: `${giver.name} gives ${quantity > 1 ? `${quantity}x ` : ''}${params.itemName} to ${params.recipientName || 'someone'}.`,
  }
}

/**
 * Execute item use (consumables)
 */
async function executeUseItem(
  supabase: SupabaseClient,
  intent: ClassifiedIntent,
  validation: ValidationResult,
  context: PipelineContext,
  dmMessageId?: string
): Promise<MechanicsResult> {
  const params = intent.params as unknown as UseItemParams
  const changes: StateChange[] = []

  // Get character's current data
  const { data: character, error: fetchError } = await supabase
    .from('characters')
    .select('id, name, inventory, current_hp, max_hp')
    .eq('id', intent.characterId)
    .single()

  if (fetchError || !character) {
    return {
      success: false,
      outcome: 'failure',
      changes: [],
      narrativeContext: 'Character not found in database.',
      errors: ['Character not found'],
    }
  }

  // Find item in inventory
  const oldInventory = [...(character.inventory || [])]
  const newInventory = [...oldInventory]

  const itemIndex = newInventory.findIndex(
    item => item.name.toLowerCase().includes(params.itemName.toLowerCase())
  )

  if (itemIndex === -1) {
    return {
      success: false,
      outcome: 'failure',
      changes: [],
      narrativeContext: `${params.itemName} not found in inventory.`,
      errors: ['Item not found in inventory'],
    }
  }

  // Remove item (consume it)
  const item = newInventory[itemIndex]
  const existingQty = item.quantity || 1

  if (existingQty <= 1) {
    newInventory.splice(itemIndex, 1)
  } else {
    newInventory[itemIndex] = { ...item, quantity: existingQty - 1 }
  }

  // Check if it's a known consumable with an effect
  const consumable = CONSUMABLES.find(
    c => c.name.toLowerCase().includes(params.itemName.toLowerCase())
  )

  const updates: Record<string, unknown> = {
    inventory: newInventory,
    updated_at: new Date().toISOString(),
  }

  let effectDescription = ''

  if (consumable?.effect.type === 'healing') {
    // For healing potions, we need to roll or apply healing
    // Check if it has a dice value
    if (consumable.effect.value) {
      // Return a roll request instead
      return {
        success: true,
        outcome: 'success',
        changes: [{
          type: 'inventory_remove',
          characterId: character.id,
          characterName: character.name,
          description: `Used ${item.name}`,
          field: 'inventory',
          before: oldInventory,
          after: newInventory,
        }],
        narrativeContext: `${character.name} drinks the ${item.name}. Rolling ${consumable.effect.value} for healing.`,
        rollsRequired: [{
          characterId: character.id,
          characterName: character.name,
          rollType: 'damage_roll', // Using damage_roll for healing dice
          notation: consumable.effect.value,
          description: `Healing from ${item.name}`,
          reason: 'Potion healing',
        }],
      }
    }
  } else if (consumable?.effect.type === 'buff') {
    effectDescription = `Effect: ${consumable.effect.description}`
    // Could apply condition here if we track buff conditions
  }

  // Update database
  const { error: updateError } = await supabase
    .from('characters')
    .update(updates)
    .eq('id', character.id)

  if (updateError) {
    return {
      success: false,
      outcome: 'failure',
      changes: [],
      narrativeContext: 'Failed to update inventory.',
      errors: [updateError.message],
    }
  }

  // Create audit log
  await supabase.from('character_state_changes').insert({
    character_id: character.id,
    campaign_id: context.campaignId,
    dm_message_id: dmMessageId || null,
    change_type: 'item_use',
    field_name: 'inventory',
    old_value: oldInventory,
    new_value: newInventory,
    reason: `Used ${item.name}`,
  })

  changes.push({
    type: 'inventory_remove',
    characterId: character.id,
    characterName: character.name,
    description: `Used ${item.name}`,
    field: 'inventory',
    before: oldInventory,
    after: newInventory,
  })

  let narrative = `${character.name} uses ${item.name}.`
  if (effectDescription) {
    narrative += ` ${effectDescription}`
  }

  return {
    success: true,
    outcome: 'success',
    changes,
    narrativeContext: narrative,
  }
}
