/**
 * Economic Executor
 *
 * Executes purchase, sell, pay, and other economic intents.
 * Applies currency and inventory changes to the database.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import {
  ClassifiedIntent,
  ValidationResult,
  EconomicValidationResult,
  MechanicsResult,
  PipelineContext,
  StateChange,
  PurchaseParams,
  SellParams,
  PayParams,
  InventoryParams,
  CurrencyBreakdown,
  CURRENCY_TO_COPPER,
} from '../types'
import { getItemByNameWithAliases, formatPrice } from '@/data/items'

/**
 * Execute an economic intent
 */
export async function executeEconomicIntent(
  supabase: SupabaseClient,
  intent: ClassifiedIntent,
  validation: ValidationResult,
  context: PipelineContext,
  dmMessageId?: string
): Promise<MechanicsResult> {
  switch (intent.type) {
    case 'purchase':
      return executePurchase(supabase, intent, validation as EconomicValidationResult, context, dmMessageId)
    case 'sell':
      return executeSell(supabase, intent, validation as EconomicValidationResult, context, dmMessageId)
    case 'pay':
      return executePay(supabase, intent, validation as EconomicValidationResult, context, dmMessageId)
    case 'steal':
      return executeSteal(supabase, intent, validation, context, dmMessageId)
    case 'trade':
      return executeTrade(supabase, intent, validation, context, dmMessageId)
    default:
      return {
        success: false,
        outcome: 'failure',
        changes: [],
        narrativeContext: `Unknown economic intent type: ${intent.type}`,
        errors: [`Unknown economic intent type: ${intent.type}`],
      }
  }
}

/**
 * Execute a purchase
 */
async function executePurchase(
  supabase: SupabaseClient,
  intent: ClassifiedIntent,
  validation: EconomicValidationResult,
  context: PipelineContext,
  dmMessageId?: string
): Promise<MechanicsResult> {
  const params = intent.params as unknown as PurchaseParams
  const changes: StateChange[] = []

  // Get character's current data
  const { data: character, error: fetchError } = await supabase
    .from('characters')
    .select('id, name, currency, inventory')
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

  const oldCurrency = { ...character.currency }
  const newCurrency = { ...oldCurrency }
  const oldInventory = [...(character.inventory || [])]
  const newInventory = [...oldInventory]

  // Deduct currency using the breakdown from validation
  if (validation.currencyBreakdown) {
    for (const [denom, amount] of Object.entries(validation.currencyBreakdown)) {
      if (amount > 0) {
        newCurrency[denom as keyof CurrencyBreakdown] -= amount
      }
    }
  } else {
    // Fallback: deduct from gold
    const costInGp = Math.ceil((validation.totalCostCp || 0) / 100)
    newCurrency.gp = Math.max(0, newCurrency.gp - costInGp)
  }

  // Add items to inventory
  const itemsAdded: string[] = []
  for (const item of params.items || []) {
    const quantity = item.quantity || 1
    const lookup = getItemByNameWithAliases(item.name)
    const itemName = lookup.found && lookup.item ? lookup.item.name : item.name

    newInventory.push({
      name: itemName,
      quantity,
      description: lookup.found && lookup.item ? lookup.item.description : undefined,
      added_at: new Date().toISOString(),
      added_reason: `Purchased${params.merchantName ? ` from ${params.merchantName}` : ''}`,
    })

    itemsAdded.push(quantity > 1 ? `${quantity}x ${itemName}` : itemName)
  }

  // Update database
  const { error: updateError } = await supabase
    .from('characters')
    .update({
      currency: newCurrency,
      inventory: newInventory,
      updated_at: new Date().toISOString(),
    })
    .eq('id', character.id)

  if (updateError) {
    return {
      success: false,
      outcome: 'failure',
      changes: [],
      narrativeContext: 'Failed to update character data.',
      errors: [updateError.message],
    }
  }

  // Create audit log
  await supabase.from('character_state_changes').insert({
    character_id: character.id,
    campaign_id: context.campaignId,
    dm_message_id: dmMessageId || null,
    change_type: 'purchase',
    field_name: 'currency_and_inventory',
    old_value: { currency: oldCurrency, inventory: oldInventory },
    new_value: { currency: newCurrency, inventory: newInventory },
    reason: `Purchased ${itemsAdded.join(', ')}`,
  })

  // Record changes for narrative
  changes.push({
    type: 'currency',
    characterId: character.id,
    characterName: character.name,
    description: `Paid ${formatPrice(validation.totalCostCp || 0)}`,
    field: 'currency',
    before: oldCurrency,
    after: newCurrency,
  })

  for (const item of params.items || []) {
    changes.push({
      type: 'inventory_add',
      characterId: character.id,
      characterName: character.name,
      description: `Received ${item.quantity || 1}x ${item.name}`,
      field: 'inventory',
      before: oldInventory,
      after: newInventory,
    })
  }

  return {
    success: true,
    outcome: 'success',
    changes,
    narrativeContext: `Purchase SUCCESSFUL. ${character.name} paid ${formatPrice(validation.totalCostCp || 0)} and received: ${itemsAdded.join(', ')}.`,
  }
}

/**
 * Execute a sell
 */
async function executeSell(
  supabase: SupabaseClient,
  intent: ClassifiedIntent,
  validation: EconomicValidationResult,
  context: PipelineContext,
  dmMessageId?: string
): Promise<MechanicsResult> {
  const params = intent.params as unknown as SellParams
  const changes: StateChange[] = []

  // Get character's current data
  const { data: character, error: fetchError } = await supabase
    .from('characters')
    .select('id, name, currency, inventory')
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

  const oldCurrency = { ...character.currency }
  const newCurrency = { ...oldCurrency }
  const oldInventory = [...(character.inventory || [])]
  let newInventory = [...oldInventory]

  // Remove items from inventory
  const itemsSold: string[] = []
  for (const item of params.items || []) {
    const quantity = item.quantity || 1
    const itemIndex = newInventory.findIndex(
      inv => inv.name.toLowerCase() === item.name.toLowerCase()
    )

    if (itemIndex !== -1) {
      const existingItem = newInventory[itemIndex]
      const existingQty = existingItem.quantity || 1

      if (existingQty <= quantity) {
        newInventory.splice(itemIndex, 1)
      } else {
        newInventory[itemIndex] = { ...existingItem, quantity: existingQty - quantity }
      }

      itemsSold.push(quantity > 1 ? `${quantity}x ${item.name}` : item.name)
    }
  }

  // Add gold (sell value is negative totalCostCp)
  const goldGained = Math.abs(Math.floor((validation.totalCostCp || 0) / 100))
  const silverRemainder = Math.abs(Math.floor(((validation.totalCostCp || 0) % 100) / 10))

  if (goldGained > 0) newCurrency.gp += goldGained
  if (silverRemainder > 0) newCurrency.sp += silverRemainder

  // Update database
  const { error: updateError } = await supabase
    .from('characters')
    .update({
      currency: newCurrency,
      inventory: newInventory,
      updated_at: new Date().toISOString(),
    })
    .eq('id', character.id)

  if (updateError) {
    return {
      success: false,
      outcome: 'failure',
      changes: [],
      narrativeContext: 'Failed to update character data.',
      errors: [updateError.message],
    }
  }

  // Create audit log
  await supabase.from('character_state_changes').insert({
    character_id: character.id,
    campaign_id: context.campaignId,
    dm_message_id: dmMessageId || null,
    change_type: 'sell',
    field_name: 'currency_and_inventory',
    old_value: { currency: oldCurrency, inventory: oldInventory },
    new_value: { currency: newCurrency, inventory: newInventory },
    reason: `Sold ${itemsSold.join(', ')}`,
  })

  changes.push({
    type: 'inventory_remove',
    characterId: character.id,
    characterName: character.name,
    description: `Sold ${itemsSold.join(', ')}`,
    field: 'inventory',
    before: oldInventory,
    after: newInventory,
  })

  changes.push({
    type: 'currency',
    characterId: character.id,
    characterName: character.name,
    description: `Received ${formatPrice(Math.abs(validation.totalCostCp || 0))}`,
    field: 'currency',
    before: oldCurrency,
    after: newCurrency,
  })

  return {
    success: true,
    outcome: 'success',
    changes,
    narrativeContext: `Sale SUCCESSFUL. ${character.name} sold ${itemsSold.join(', ')} and received ${formatPrice(Math.abs(validation.totalCostCp || 0))}.`,
  }
}

/**
 * Execute a payment (tip, bribe, service)
 */
async function executePay(
  supabase: SupabaseClient,
  intent: ClassifiedIntent,
  validation: EconomicValidationResult,
  context: PipelineContext,
  dmMessageId?: string
): Promise<MechanicsResult> {
  const params = intent.params as unknown as PayParams
  const changes: StateChange[] = []

  // Get character's current data
  const { data: character, error: fetchError } = await supabase
    .from('characters')
    .select('id, name, currency')
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

  const oldCurrency = { ...character.currency }
  const newCurrency = { ...oldCurrency }

  // Deduct currency
  if (validation.currencyBreakdown) {
    for (const [denom, amount] of Object.entries(validation.currencyBreakdown)) {
      if (amount > 0) {
        newCurrency[denom as keyof CurrencyBreakdown] -= amount
      }
    }
  } else {
    // Direct deduction from specified unit
    const unit = params.unit || 'gp'
    newCurrency[unit] = Math.max(0, newCurrency[unit] - params.amount)
  }

  // Update database
  const { error: updateError } = await supabase
    .from('characters')
    .update({
      currency: newCurrency,
      updated_at: new Date().toISOString(),
    })
    .eq('id', character.id)

  if (updateError) {
    return {
      success: false,
      outcome: 'failure',
      changes: [],
      narrativeContext: 'Failed to update character data.',
      errors: [updateError.message],
    }
  }

  // Create audit log
  await supabase.from('character_state_changes').insert({
    character_id: character.id,
    campaign_id: context.campaignId,
    dm_message_id: dmMessageId || null,
    change_type: 'pay',
    field_name: 'currency',
    old_value: oldCurrency,
    new_value: newCurrency,
    reason: params.reason || `Payment${params.recipientName ? ` to ${params.recipientName}` : ''}`,
  })

  changes.push({
    type: 'currency',
    characterId: character.id,
    characterName: character.name,
    description: `Paid ${params.amount} ${params.unit}${params.recipientName ? ` to ${params.recipientName}` : ''}`,
    field: 'currency',
    before: oldCurrency,
    after: newCurrency,
  })

  return {
    success: true,
    outcome: 'success',
    changes,
    narrativeContext: `Payment SUCCESSFUL. ${character.name} paid ${params.amount} ${params.unit}${params.recipientName ? ` to ${params.recipientName}` : ''}.`,
  }
}

/**
 * Execute a steal attempt (requires skill check)
 */
async function executeSteal(
  supabase: SupabaseClient,
  intent: ClassifiedIntent,
  validation: ValidationResult,
  context: PipelineContext,
  dmMessageId?: string
): Promise<MechanicsResult> {
  const params = intent.params as unknown as InventoryParams

  // Theft doesn't apply changes directly - it requires a skill check
  // The result of the skill check determines success
  return {
    success: true,
    outcome: 'success',
    changes: [],
    narrativeContext: `Theft attempt: ${intent.characterName} attempts to steal ${params.itemName || 'something'}. A Sleight of Hand check is required.`,
    rollsRequired: [
      {
        characterId: intent.characterId,
        characterName: intent.characterName,
        rollType: 'skill_check',
        skill: 'sleight_of_hand',
        ability: 'dexterity',
        notation: '1d20',
        dc: 15, // Default DC, DM can adjust
        description: `Sleight of Hand check to steal ${params.itemName || 'item'}`,
        reason: 'Theft attempt',
      },
    ],
  }
}

/**
 * Execute a trade (simplified - just describe the exchange)
 */
async function executeTrade(
  supabase: SupabaseClient,
  intent: ClassifiedIntent,
  validation: ValidationResult,
  context: PipelineContext,
  dmMessageId?: string
): Promise<MechanicsResult> {
  // Trade is complex - for now, let the DM narrate it
  return {
    success: true,
    outcome: 'success',
    changes: [],
    narrativeContext: `Trade proposed by ${intent.characterName}. DM will determine if the trade is fair and facilitate the exchange.`,
  }
}
