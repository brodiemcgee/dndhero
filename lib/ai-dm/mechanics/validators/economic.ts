/**
 * Economic Validator
 *
 * Validates purchase, sell, trade, pay, and steal intents.
 * Ensures characters have sufficient funds and items exist.
 */

import {
  ClassifiedIntent,
  EconomicValidationResult,
  PipelineContext,
  PurchaseParams,
  SellParams,
  PayParams,
  InventoryParams,
  CurrencyBreakdown,
  CURRENCY_TO_COPPER,
  MAX_AI_ESTIMATED_PRICE_GP,
} from '../types'
import { getItemByNameWithAliases, formatPrice } from '@/data/items'

/**
 * Calculate total wealth in copper pieces
 */
function calculateTotalWealthCp(currency: CurrencyBreakdown): number {
  return (
    (currency.cp || 0) * CURRENCY_TO_COPPER.cp +
    (currency.sp || 0) * CURRENCY_TO_COPPER.sp +
    (currency.ep || 0) * CURRENCY_TO_COPPER.ep +
    (currency.gp || 0) * CURRENCY_TO_COPPER.gp +
    (currency.pp || 0) * CURRENCY_TO_COPPER.pp
  )
}

/**
 * Calculate optimal currency breakdown for a given cost
 * Tries to use higher denomination coins first, then works down
 */
function calculateOptimalPayment(
  costCp: number,
  available: CurrencyBreakdown
): CurrencyBreakdown | null {
  let remainingCost = costCp
  const payment: CurrencyBreakdown = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }
  const availableCopy = { ...available }

  // Pay with highest denominations first (pp -> gp -> ep -> sp -> cp)
  const denominations: (keyof CurrencyBreakdown)[] = ['pp', 'gp', 'ep', 'sp', 'cp']

  for (const denom of denominations) {
    const denomValue = CURRENCY_TO_COPPER[denom]
    const canUse = Math.min(
      Math.floor(remainingCost / denomValue),
      availableCopy[denom]
    )

    if (canUse > 0) {
      payment[denom] = canUse
      remainingCost -= canUse * denomValue
      availableCopy[denom] -= canUse
    }
  }

  // If we couldn't cover the full cost, return null
  if (remainingCost > 0) {
    return null
  }

  return payment
}

/**
 * Validate a purchase intent
 */
async function validatePurchase(
  intent: ClassifiedIntent,
  context: PipelineContext
): Promise<EconomicValidationResult> {
  const params = intent.params as unknown as PurchaseParams
  const errors: string[] = []
  const warnings: string[] = []
  const itemsValidated: EconomicValidationResult['itemsValidated'] = []

  // Find the character
  const character = context.characters.find(c => c.id === intent.characterId)
  if (!character) {
    return {
      valid: false,
      errors: ['Character not found'],
    }
  }

  // Calculate total cost
  let totalCostCp = 0

  for (const item of params.items || []) {
    const quantity = item.quantity || 1
    const lookup = getItemByNameWithAliases(item.name)

    if (lookup.found && lookup.item) {
      // Item found in catalog
      const itemCostCp = lookup.priceInCp * quantity
      totalCostCp += itemCostCp

      itemsValidated.push({
        name: item.name,
        found: true,
        priceInCp: lookup.priceInCp,
        source: 'catalog',
      })
    } else if (item.estimatedPrice !== undefined) {
      // Use AI-estimated price (capped)
      const cappedPrice = Math.min(item.estimatedPrice, MAX_AI_ESTIMATED_PRICE_GP)
      const unit = item.estimatedUnit || 'gp'
      const estimatedCp = cappedPrice * CURRENCY_TO_COPPER[unit]
      const itemCostCp = estimatedCp * quantity

      totalCostCp += itemCostCp

      itemsValidated.push({
        name: item.name,
        found: false,
        priceInCp: estimatedCp,
        source: 'ai_estimated',
      })

      if (item.estimatedPrice > MAX_AI_ESTIMATED_PRICE_GP) {
        warnings.push(`Price for "${item.name}" capped at ${MAX_AI_ESTIMATED_PRICE_GP} gp`)
      }
    } else {
      // Unknown item with no estimate - reject
      errors.push(`Unknown item: "${item.name}". Cannot determine price.`)
      itemsValidated.push({
        name: item.name,
        found: false,
        priceInCp: 0,
        source: 'ai_estimated',
      })
    }
  }

  // Check affordability
  const characterWealthCp = calculateTotalWealthCp(character.currency)

  if (totalCostCp > characterWealthCp) {
    errors.push(
      `Cannot afford purchase. Cost: ${formatPrice(totalCostCp)}, Available: ${formatPrice(characterWealthCp)}`
    )
  }

  // Calculate optimal payment breakdown
  let currencyBreakdown: CurrencyBreakdown | undefined
  if (errors.length === 0) {
    currencyBreakdown = calculateOptimalPayment(totalCostCp, character.currency) || undefined
    if (!currencyBreakdown) {
      // This shouldn't happen if totalCostCp <= characterWealthCp, but just in case
      errors.push('Unable to calculate payment breakdown')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
    totalCostCp,
    characterWealthCp,
    currencyBreakdown,
    itemsValidated,
  }
}

/**
 * Validate a sell intent
 */
async function validateSell(
  intent: ClassifiedIntent,
  context: PipelineContext
): Promise<EconomicValidationResult> {
  const params = intent.params as unknown as SellParams
  const errors: string[] = []
  const itemsValidated: EconomicValidationResult['itemsValidated'] = []

  // Find the character
  const character = context.characters.find(c => c.id === intent.characterId)
  if (!character) {
    return {
      valid: false,
      errors: ['Character not found'],
    }
  }

  // Check that character has the items to sell
  let totalValueCp = 0

  for (const item of params.items || []) {
    const quantity = item.quantity || 1

    // Check inventory for item
    const inventoryItem = character.inventory.find(
      inv => inv.name.toLowerCase() === item.name.toLowerCase()
    )

    if (!inventoryItem) {
      errors.push(`"${item.name}" not found in inventory`)
      itemsValidated.push({
        name: item.name,
        found: false,
        priceInCp: 0,
        source: 'catalog',
      })
      continue
    }

    const availableQty = inventoryItem.quantity || 1
    if (availableQty < quantity) {
      errors.push(`Not enough "${item.name}" in inventory. Have: ${availableQty}, Need: ${quantity}`)
    }

    // Look up base price for sell value calculation
    const lookup = getItemByNameWithAliases(item.name)
    const basePriceCp = lookup.found ? lookup.priceInCp : 100 // Default to 1 gp if unknown
    const sellPriceCp = Math.floor(basePriceCp * 0.5) * quantity // Sell at 50% value

    totalValueCp += sellPriceCp

    itemsValidated.push({
      name: item.name,
      found: lookup.found,
      priceInCp: sellPriceCp / quantity, // Per-item sell price
      source: lookup.found ? 'catalog' : 'ai_estimated',
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    totalCostCp: -totalValueCp, // Negative because character gains money
    itemsValidated,
  }
}

/**
 * Validate a pay intent (tips, bribes, services)
 */
async function validatePay(
  intent: ClassifiedIntent,
  context: PipelineContext
): Promise<EconomicValidationResult> {
  const params = intent.params as unknown as PayParams
  const errors: string[] = []

  // Find the character
  const character = context.characters.find(c => c.id === intent.characterId)
  if (!character) {
    return {
      valid: false,
      errors: ['Character not found'],
    }
  }

  // Calculate cost
  const unit = params.unit || 'gp'
  const amount = params.amount || 0
  const costCp = amount * CURRENCY_TO_COPPER[unit]

  // Check affordability
  const characterWealthCp = calculateTotalWealthCp(character.currency)

  if (costCp > characterWealthCp) {
    errors.push(
      `Cannot afford payment. Cost: ${formatPrice(costCp)}, Available: ${formatPrice(characterWealthCp)}`
    )
  }

  // Calculate payment breakdown
  let currencyBreakdown: CurrencyBreakdown | undefined
  if (errors.length === 0) {
    currencyBreakdown = calculateOptimalPayment(costCp, character.currency) || undefined
  }

  return {
    valid: errors.length === 0,
    errors,
    totalCostCp: costCp,
    characterWealthCp,
    currencyBreakdown,
  }
}

/**
 * Validate a steal intent
 */
async function validateSteal(
  intent: ClassifiedIntent,
  context: PipelineContext
): Promise<EconomicValidationResult> {
  // Steal attempts are always "valid" - they just require a skill check
  // The validation here just ensures we have a target
  const params = intent.params as unknown as InventoryParams

  if (!params.itemName) {
    return {
      valid: false,
      errors: ['No target item specified for theft'],
    }
  }

  return {
    valid: true,
    errors: [],
    warnings: ['Theft requires a Sleight of Hand check'],
  }
}

/**
 * Validate a trade intent
 */
async function validateTrade(
  intent: ClassifiedIntent,
  context: PipelineContext
): Promise<EconomicValidationResult> {
  // Trade validation is complex - for now, treat as roleplay with warning
  return {
    valid: true,
    errors: [],
    warnings: ['Trade validation is simplified - DM should adjudicate fair exchange'],
  }
}

/**
 * Main economic validator - routes to specific validators
 */
export async function validateEconomicIntent(
  intent: ClassifiedIntent,
  context: PipelineContext
): Promise<EconomicValidationResult> {
  switch (intent.type) {
    case 'purchase':
      return validatePurchase(intent, context)
    case 'sell':
      return validateSell(intent, context)
    case 'pay':
      return validatePay(intent, context)
    case 'steal':
      return validateSteal(intent, context)
    case 'trade':
      return validateTrade(intent, context)
    default:
      return {
        valid: false,
        errors: [`Unknown economic intent type: ${intent.type}`],
      }
  }
}
