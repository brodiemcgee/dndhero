/**
 * Inventory Validator
 *
 * Validates pickup, drop, give, and use item intents.
 */

import {
  ClassifiedIntent,
  ValidationResult,
  PipelineContext,
  InventoryParams,
  UseItemParams,
} from '../types'
import { getItemByNameWithAliases } from '@/data/items'
import { getConsumableById, CONSUMABLES } from '@/data/items/consumables'

/**
 * Normalize item name for comparison
 */
function normalizeItemName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/['']/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/^(a|an|the|some)\s+/i, '')
}

/**
 * Find item in character's inventory
 */
function findInInventory(
  characterId: string,
  itemName: string,
  context: PipelineContext
): { name: string; quantity: number } | null {
  const character = context.characters.find(c => c.id === characterId)
  if (!character) return null

  const normalizedSearch = normalizeItemName(itemName)

  for (const item of character.inventory) {
    if (normalizeItemName(item.name) === normalizedSearch) {
      return { name: item.name, quantity: item.quantity || 1 }
    }
    // Partial match
    if (normalizeItemName(item.name).includes(normalizedSearch)) {
      return { name: item.name, quantity: item.quantity || 1 }
    }
  }

  return null
}

/**
 * Check if an item is a consumable
 */
function isConsumable(itemName: string): boolean {
  const normalizedSearch = normalizeItemName(itemName)

  for (const consumable of CONSUMABLES) {
    if (normalizeItemName(consumable.name) === normalizedSearch) {
      return true
    }
    if (normalizeItemName(consumable.name).includes(normalizedSearch)) {
      return true
    }
  }

  return false
}

/**
 * Validate a pickup item intent
 */
async function validatePickupItem(
  intent: ClassifiedIntent,
  context: PipelineContext
): Promise<ValidationResult> {
  const params = intent.params as unknown as InventoryParams
  const warnings: string[] = []

  // Find the character
  const character = context.characters.find(c => c.id === intent.characterId)
  if (!character) {
    return {
      valid: false,
      errors: ['Character not found'],
    }
  }

  if (!params.itemName) {
    return {
      valid: false,
      errors: ['No item specified to pick up'],
    }
  }

  // We can't validate if the item exists in the environment without scene tracking
  // Trust the DM to handle this narratively
  warnings.push(`Attempting to pick up "${params.itemName}" - DM will confirm availability`)

  return {
    valid: true,
    errors: [],
    warnings,
  }
}

/**
 * Validate a drop item intent
 */
async function validateDropItem(
  intent: ClassifiedIntent,
  context: PipelineContext
): Promise<ValidationResult> {
  const params = intent.params as unknown as InventoryParams
  const errors: string[] = []

  // Find the character
  const character = context.characters.find(c => c.id === intent.characterId)
  if (!character) {
    return {
      valid: false,
      errors: ['Character not found'],
    }
  }

  if (!params.itemName) {
    return {
      valid: false,
      errors: ['No item specified to drop'],
    }
  }

  // Check if character has the item
  const inventoryItem = findInInventory(intent.characterId, params.itemName, context)
  if (!inventoryItem) {
    errors.push(`"${params.itemName}" not found in ${character.name}'s inventory`)
  } else {
    const quantity = params.quantity || 1
    if (quantity > inventoryItem.quantity) {
      errors.push(`Cannot drop ${quantity} of "${params.itemName}". Only have ${inventoryItem.quantity}.`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate a give item intent
 */
async function validateGiveItem(
  intent: ClassifiedIntent,
  context: PipelineContext
): Promise<ValidationResult> {
  const params = intent.params as unknown as InventoryParams
  const errors: string[] = []
  const warnings: string[] = []

  // Find the character
  const character = context.characters.find(c => c.id === intent.characterId)
  if (!character) {
    return {
      valid: false,
      errors: ['Character not found'],
    }
  }

  if (!params.itemName) {
    return {
      valid: false,
      errors: ['No item specified to give'],
    }
  }

  // Check if character has the item
  const inventoryItem = findInInventory(intent.characterId, params.itemName, context)
  if (!inventoryItem) {
    errors.push(`"${params.itemName}" not found in ${character.name}'s inventory`)
  } else {
    const quantity = params.quantity || 1
    if (quantity > inventoryItem.quantity) {
      errors.push(`Cannot give ${quantity} of "${params.itemName}". Only have ${inventoryItem.quantity}.`)
    }
  }

  // Check recipient
  if (!params.recipientName) {
    warnings.push('No recipient specified - DM will determine who receives the item')
  } else {
    // Check if recipient exists (another PC or NPC)
    const recipientPC = context.characters.find(c =>
      c.name.toLowerCase().includes(params.recipientName!.toLowerCase())
    )
    const recipientNPC = context.entities.find(e =>
      e.name.toLowerCase().includes(params.recipientName!.toLowerCase())
    )

    if (!recipientPC && !recipientNPC) {
      warnings.push(`Recipient "${params.recipientName}" not found in scene - DM will adjudicate`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  }
}

/**
 * Validate a use item intent
 */
async function validateUseItem(
  intent: ClassifiedIntent,
  context: PipelineContext
): Promise<ValidationResult> {
  const params = intent.params as unknown as UseItemParams
  const errors: string[] = []
  const warnings: string[] = []

  // Find the character
  const character = context.characters.find(c => c.id === intent.characterId)
  if (!character) {
    return {
      valid: false,
      errors: ['Character not found'],
    }
  }

  if (!params.itemName) {
    return {
      valid: false,
      errors: ['No item specified to use'],
    }
  }

  // Check if character has the item
  const inventoryItem = findInInventory(intent.characterId, params.itemName, context)
  if (!inventoryItem) {
    errors.push(`"${params.itemName}" not found in ${character.name}'s inventory`)
    return {
      valid: false,
      errors,
    }
  }

  // Check if item is consumable
  const itemIsConsumable = isConsumable(params.itemName)
  if (!itemIsConsumable) {
    warnings.push(`"${params.itemName}" may not be a consumable item - DM will determine effect`)
  }

  // Check target if specified
  if (params.targetName) {
    const targetPC = context.characters.find(c =>
      c.name.toLowerCase().includes(params.targetName!.toLowerCase())
    )
    const targetNPC = context.entities.find(e =>
      e.name.toLowerCase().includes(params.targetName!.toLowerCase())
    )

    if (!targetPC && !targetNPC && params.targetName.toLowerCase() !== 'self') {
      warnings.push(`Target "${params.targetName}" not found in scene`)
    }
  }

  // Check for conditions that might prevent item use
  if (character.conditions.some(c =>
    ['unconscious', 'paralyzed', 'stunned', 'incapacitated', 'petrified'].includes(c.toLowerCase())
  )) {
    const condition = character.conditions.find(c =>
      ['unconscious', 'paralyzed', 'stunned', 'incapacitated', 'petrified'].includes(c.toLowerCase())
    )
    errors.push(`${character.name} is ${condition} and cannot use items`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  }
}

/**
 * Main inventory validator - routes to specific validators
 */
export async function validateInventoryIntent(
  intent: ClassifiedIntent,
  context: PipelineContext
): Promise<ValidationResult> {
  switch (intent.type) {
    case 'pickup_item':
      return validatePickupItem(intent, context)
    case 'drop_item':
      return validateDropItem(intent, context)
    case 'give_item':
      return validateGiveItem(intent, context)
    case 'use_item':
      return validateUseItem(intent, context)
    default:
      return {
        valid: false,
        errors: [`Unknown inventory intent type: ${intent.type}`],
      }
  }
}
