/**
 * Combat Validator
 *
 * Validates attack intents - checks for valid targets and weapon availability.
 */

import {
  ClassifiedIntent,
  CombatValidationResult,
  PipelineContext,
  AttackParams,
} from '../types'

/**
 * Normalize entity name for comparison
 */
function normalizeEntityName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/['']/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/^(a|an|the)\s+/i, '')
}

/**
 * Find a target entity by name
 */
function findTarget(
  targetName: string,
  context: PipelineContext
): { id: string; name: string; type: 'npc' | 'monster' } | null {
  const normalizedTarget = normalizeEntityName(targetName)

  for (const entity of context.entities) {
    if (normalizeEntityName(entity.name) === normalizedTarget) {
      return { id: entity.id, name: entity.name, type: entity.type }
    }

    // Partial match
    if (normalizeEntityName(entity.name).includes(normalizedTarget)) {
      return { id: entity.id, name: entity.name, type: entity.type }
    }
  }

  return null
}

/**
 * Check if character has a weapon equipped
 */
function hasWeaponEquipped(
  characterId: string,
  weaponName: string | undefined,
  context: PipelineContext
): boolean {
  const character = context.characters.find(c => c.id === characterId)
  if (!character) return false

  // Check equipment for weapons
  const equipment = character.equipment
  if (!equipment) return true // Assume unarmed is always available

  // If no specific weapon requested, check if any weapon is equipped
  if (!weaponName) {
    // Check mainHand slot
    const mainHand = equipment.mainHand
    if (mainHand) return true

    // Check for any weapon in equipment
    for (const [slot, item] of Object.entries(equipment)) {
      if (item && typeof item === 'object' && 'damage_dice' in (item as object)) {
        return true
      }
    }

    // Unarmed is always available
    return true
  }

  // Check for specific weapon
  const normalizedWeapon = normalizeEntityName(weaponName)
  for (const [slot, item] of Object.entries(equipment)) {
    if (!item) continue
    if (typeof item === 'object' && 'name' in item) {
      if (normalizeEntityName((item as { name: string }).name).includes(normalizedWeapon)) {
        return true
      }
    }
    if (typeof item === 'string' && normalizeEntityName(item).includes(normalizedWeapon)) {
      return true
    }
  }

  // Check inventory as backup (might not be equipped but available)
  for (const item of character.inventory) {
    if (normalizeEntityName(item.name).includes(normalizedWeapon)) {
      return true
    }
  }

  return false
}

/**
 * Validate an attack intent
 */
export async function validateCombatIntent(
  intent: ClassifiedIntent,
  context: PipelineContext
): Promise<CombatValidationResult> {
  const params = intent.params as unknown as AttackParams
  const errors: string[] = []
  const warnings: string[] = []

  // Find the character
  const character = context.characters.find(c => c.id === intent.characterId)
  if (!character) {
    return {
      valid: false,
      errors: ['Character not found'],
      targetFound: false,
      weaponEquipped: false,
    }
  }

  // Check target
  const targetName = params.targetName
  let targetFound = false
  let targetType: 'npc' | 'monster' | 'object' | undefined

  if (!targetName) {
    errors.push('No target specified for attack')
  } else {
    const target = findTarget(targetName, context)
    if (target) {
      targetFound = true
      targetType = target.type
    } else {
      // Target not in scene - might be valid for narrative attacks
      warnings.push(`Target "${targetName}" not found in current scene. DM will adjudicate.`)
      targetFound = false // But still allow the attack attempt
    }
  }

  // Check weapon
  const weaponEquipped = hasWeaponEquipped(intent.characterId, params.weaponName, context)

  if (params.weaponName && !weaponEquipped) {
    errors.push(`${character.name} doesn't have "${params.weaponName}" equipped`)
  }

  // Check if character is incapacitated
  if (character.conditions.some(c =>
    ['unconscious', 'paralyzed', 'stunned', 'incapacitated', 'petrified'].includes(c.toLowerCase())
  )) {
    const condition = character.conditions.find(c =>
      ['unconscious', 'paralyzed', 'stunned', 'incapacitated', 'petrified'].includes(c.toLowerCase())
    )
    errors.push(`${character.name} is ${condition} and cannot attack`)
  }

  // Range check is complex without position tracking - just warn
  if (params.isRanged && !params.isMelee) {
    warnings.push('Ranged attack - ensure target is within range')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
    targetFound,
    targetType,
    weaponEquipped,
    inRange: true, // Assume in range (DM handles this narratively)
  }
}
