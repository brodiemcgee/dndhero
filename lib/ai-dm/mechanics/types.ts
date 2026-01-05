/**
 * Types for the DM Mechanics Pipeline
 *
 * This pipeline ensures game mechanics are enforced deterministically:
 * 1. Intent Classification - What is the player trying to do?
 * 2. Validation - Is the action possible?
 * 3. Execution - Apply state changes
 * 4. Narration - AI tells the story about what happened
 */

// =============================================================================
// INTENT TYPES
// =============================================================================

/**
 * All mechanical intent types that require validation/execution
 */
export type MechanicalIntentType =
  // Economic
  | 'purchase'      // Buy item(s) from merchant
  | 'sell'          // Sell item(s) to merchant
  | 'trade'         // Barter/exchange items
  | 'pay'           // Pay gold for service/tip/bribe
  | 'steal'         // Attempt theft (requires check)
  // Inventory
  | 'pickup_item'   // Pick up item from environment
  | 'drop_item'     // Drop/discard item
  | 'give_item'     // Give item to another character/NPC
  | 'use_item'      // Use consumable (potion, scroll, etc.)
  // Combat & Magic
  | 'attack'        // Combat attack
  | 'cast_spell'    // Cast a leveled spell (uses slot)
  | 'cast_cantrip'  // Cast cantrip (no slot needed)
  // Rest
  | 'short_rest'    // Take short rest
  | 'long_rest'     // Take long rest
  // Other
  | 'skill_check'   // Explicit skill usage request
  | 'roleplay'      // Pure roleplay, no mechanics needed

/**
 * Base classified intent structure
 */
export interface ClassifiedIntent {
  type: MechanicalIntentType
  confidence: number  // 0-1, how confident the classifier is
  characterId: string
  characterName: string
  params: Record<string, unknown>
  originalInput: string
  requiresMechanics: boolean
}

/**
 * Purchase intent parameters
 */
export interface PurchaseParams {
  items: Array<{
    name: string
    quantity: number
    estimatedPrice?: number  // AI-estimated price for unknown items
    estimatedUnit?: 'cp' | 'sp' | 'ep' | 'gp' | 'pp'
  }>
  merchantName?: string
  negotiating?: boolean
}

/**
 * Sell intent parameters
 */
export interface SellParams {
  items: Array<{
    name: string
    quantity: number
  }>
  merchantName?: string
}

/**
 * Pay intent parameters (tips, bribes, services)
 */
export interface PayParams {
  amount: number
  unit: 'cp' | 'sp' | 'ep' | 'gp' | 'pp'
  recipientName?: string
  reason?: string
}

/**
 * Spell casting intent parameters
 */
export interface SpellCastParams {
  spellName: string
  spellLevel: number
  upcastLevel?: number
  targets?: string[]
  isConcentration?: boolean
}

/**
 * Attack intent parameters
 */
export interface AttackParams {
  targetName: string
  targetType: 'npc' | 'monster' | 'object'
  weaponName?: string
  isRanged?: boolean
  isMelee?: boolean
}

/**
 * Rest intent parameters
 */
export interface RestParams {
  restType: 'short' | 'long'
  hitDiceToSpend?: number  // For short rest healing
}

/**
 * Item use intent parameters
 */
export interface UseItemParams {
  itemName: string
  targetName?: string  // For items that target others (potions given to allies)
}

/**
 * Inventory manipulation intent parameters
 */
export interface InventoryParams {
  itemName: string
  quantity?: number
  recipientName?: string  // For give_item
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

/**
 * Result of validating a mechanical action
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings?: string[]  // Non-blocking issues
  adjustedValues?: Record<string, unknown>  // Any adjustments made (e.g., price after haggling)
}

/**
 * Economic validation result with currency breakdown
 */
export interface EconomicValidationResult extends ValidationResult {
  totalCostCp?: number  // Total cost in copper for comparison
  characterWealthCp?: number  // Character's total wealth in copper
  currencyBreakdown?: CurrencyBreakdown  // How to pay optimally
  itemsValidated?: Array<{
    name: string
    found: boolean
    priceInCp: number
    source: 'catalog' | 'ai_estimated'
  }>
}

/**
 * Currency breakdown for a transaction
 */
export interface CurrencyBreakdown {
  cp: number
  sp: number
  ep: number
  gp: number
  pp: number
}

/**
 * Spell validation result
 */
export interface SpellValidationResult extends ValidationResult {
  spellFound?: boolean
  hasSpellSlot?: boolean
  isConcentrating?: boolean
  slotLevelUsed?: number
}

/**
 * Combat validation result
 */
export interface CombatValidationResult extends ValidationResult {
  targetFound?: boolean
  targetType?: 'npc' | 'monster' | 'object'
  weaponEquipped?: boolean
  inRange?: boolean
}

// =============================================================================
// EXECUTION TYPES
// =============================================================================

/**
 * A single state change applied during execution
 */
export interface StateChange {
  type: 'currency' | 'inventory_add' | 'inventory_remove' | 'hp' | 'spell_slot' | 'condition_add' | 'condition_remove' | 'rest' | 'xp'
  characterId: string
  characterName: string
  description: string  // Human-readable description for UI
  field: string  // Database field that changed
  before: unknown
  after: unknown
}

/**
 * Result of executing mechanics
 */
export interface MechanicsResult {
  success: boolean
  outcome: 'success' | 'failure' | 'partial'
  changes: StateChange[]
  narrativeContext: string  // Context for AI to narrate
  errors?: string[]
  rollsRequired?: DiceRollRequest[]  // If dice rolls are needed before resolving
}

/**
 * Dice roll request for mechanics that need rolls
 */
export interface DiceRollRequest {
  characterId: string
  characterName: string
  rollType: 'ability_check' | 'saving_throw' | 'attack_roll' | 'damage_roll' | 'skill_check'
  ability?: string
  skill?: string
  notation: string
  dc?: number
  advantage?: boolean
  disadvantage?: boolean
  description: string
  reason: string
}

// =============================================================================
// PIPELINE TYPES
// =============================================================================

/**
 * Context passed through the pipeline
 */
export interface PipelineContext {
  campaignId: string
  sceneId?: string
  characters: CharacterForPipeline[]
  entities: EntityForPipeline[]
  pendingMessages: PendingMessage[]
  recentHistory?: string[]
  activeQuests?: Array<{ title: string; objectives: Array<{ description: string; is_completed: boolean }> }>
}

/**
 * Simplified character data for pipeline validation
 */
export interface CharacterForPipeline {
  id: string
  name: string
  class: string | null
  level: number
  current_hp: number
  max_hp: number
  // Ability scores for combat/skill calculations
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  currency: CurrencyBreakdown
  inventory: InventoryItem[]
  equipment: Record<string, unknown>
  spell_slots: Record<string, number | { max: number; used?: number }> | null
  spell_slots_used: Record<string, number> | null
  known_spells: string[] | null
  prepared_spells: string[] | null
  cantrips: string[] | null
  conditions: string[]
}

/**
 * Inventory item structure
 */
export interface InventoryItem {
  name: string
  id?: string
  quantity?: number
  description?: string
  type?: string
  added_at?: string
  added_reason?: string
}

/**
 * Entity (NPC/monster) data for pipeline
 */
export interface EntityForPipeline {
  id: string
  name: string
  type: 'npc' | 'monster'
  current_hp: number
  max_hp: number
  conditions: string[]
}

/**
 * Pending message to process
 */
export interface PendingMessage {
  id: string
  characterId: string | null
  characterName: string | null
  content: string
  createdAt: string
}

/**
 * Final result of the DM pipeline
 */
export interface PipelineResult {
  success: boolean
  messageId?: string
  narrative: string
  intentsProcessed: number
  mechanicsApplied: number
  mechanicsFailed: number
  stateChanges: StateChange[]
  errors?: string[]
}

// =============================================================================
// VALIDATOR & EXECUTOR INTERFACES
// =============================================================================

/**
 * Interface for intent validators
 */
export interface IntentValidator<T extends ValidationResult = ValidationResult> {
  intentTypes: MechanicalIntentType[]
  validate(
    intent: ClassifiedIntent,
    context: PipelineContext
  ): Promise<T>
}

/**
 * Interface for mechanics executors
 */
export interface MechanicsExecutor {
  intentTypes: MechanicalIntentType[]
  execute(
    intent: ClassifiedIntent,
    validationResult: ValidationResult,
    context: PipelineContext
  ): Promise<MechanicsResult>
}

// =============================================================================
// HELPER TYPES
// =============================================================================

/**
 * Currency units with conversion rates to copper
 */
export const CURRENCY_TO_COPPER: Record<string, number> = {
  cp: 1,
  sp: 10,
  ep: 50,
  gp: 100,
  pp: 1000,
}

/**
 * Maximum price for AI-estimated items (safety cap)
 */
export const MAX_AI_ESTIMATED_PRICE_GP = 500

/**
 * Confidence threshold for falling back to roleplay mode
 */
export const MIN_INTENT_CONFIDENCE = 0.5
