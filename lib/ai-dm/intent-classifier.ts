/**
 * Intent Classifier for DM Mechanics Pipeline
 *
 * Uses GPT-4o-mini to quickly classify player intents into mechanical action types.
 * This is the first stage of the pipeline - determining WHAT the player is trying to do.
 */

import {
  ClassifiedIntent,
  MechanicalIntentType,
  PurchaseParams,
  SellParams,
  PayParams,
  SpellCastParams,
  AttackParams,
  RestParams,
  UseItemParams,
  InventoryParams,
  MIN_INTENT_CONFIDENCE,
  MAX_AI_ESTIMATED_PRICE_GP,
} from './mechanics/types'

// Use a faster, cheaper model for intent classification
const CLASSIFIER_MODEL = 'gpt-4o-mini'
const CLASSIFIER_TEMPERATURE = 0.3 // Lower temperature for more deterministic classification

interface ClassificationResult {
  intent_type: MechanicalIntentType
  confidence: number
  requires_mechanics: boolean
  params: Record<string, unknown>
}

/**
 * Get API key for OpenAI
 */
function getApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }
  return apiKey
}

/**
 * Build the classification prompt with character and context info
 */
function buildClassificationPrompt(
  playerInput: string,
  characterName: string,
  characterClass: string | null,
  recentContext?: string[]
): string {
  const contextStr = recentContext?.length
    ? `\nRecent conversation:\n${recentContext.slice(-3).join('\n')}\n`
    : ''

  return `You are an intent classifier for a D&D 5e game. Analyze the player's input and determine what mechanical action they are attempting.

CHARACTER: ${characterName} (${characterClass || 'Adventurer'})
${contextStr}
PLAYER INPUT: "${playerInput}"

Classify the intent into ONE of these categories:

ECONOMIC INTENTS:
- "purchase": Buying items from a merchant/shop (e.g., "I buy a sword", "Can I get a healing potion?")
- "sell": Selling items to merchant (e.g., "I sell the goblin's sword", "What will you give me for this?")
- "trade": Bartering items (e.g., "I'll trade my dagger for that")
- "pay": Giving gold for services/tips/bribes (e.g., "I tip the barmaid 5 silver", "Here's 10 gold for your trouble")
- "steal": Attempting theft (e.g., "I try to pickpocket", "Can I sneak that off the counter?")

INVENTORY INTENTS:
- "pickup_item": Taking item from environment (e.g., "I grab the key", "I pick up the sword from the ground")
- "drop_item": Discarding item (e.g., "I drop the torch", "I throw away the broken shield")
- "give_item": Giving item to NPC/player (e.g., "I hand the letter to the guard", "Here, take this potion")
- "use_item": Using consumable (e.g., "I drink the healing potion", "I use the scroll")

COMBAT/MAGIC INTENTS:
- "attack": Combat attack (e.g., "I attack the goblin", "I swing my sword at him")
- "cast_spell": Casting a leveled spell (e.g., "I cast Fireball", "I use Magic Missile")
- "cast_cantrip": Casting a cantrip (e.g., "I cast Fire Bolt", "I use Prestidigitation")

REST INTENTS:
- "short_rest": Taking short rest (e.g., "Let's take an hour to rest", "I want to catch my breath")
- "long_rest": Taking long rest (e.g., "We make camp for the night", "I sleep for 8 hours")

OTHER:
- "skill_check": Explicit skill usage (e.g., "I want to use my Perception", "Can I make an Insight check?")
- "roleplay": Pure conversation/roleplay with no mechanics (e.g., "I ask about the weather", "Hello there")

For PURCHASE intents, estimate item prices in gold pieces (gp) based on D&D 5e PHB prices:
- Common items: 1-10 gp
- Uncommon: 10-100 gp
- Rare: 100-500 gp (cap at ${MAX_AI_ESTIMATED_PRICE_GP} gp)

Respond with JSON only:
{
  "intent_type": "<type from list above>",
  "confidence": <0.0-1.0>,
  "requires_mechanics": <true if needs game state changes, false for pure roleplay>,
  "params": {
    // For purchase: { "items": [{ "name": "item name", "quantity": 1, "estimatedPrice": 50, "estimatedUnit": "gp" }], "merchantName": "optional" }
    // For sell: { "items": [{ "name": "item name", "quantity": 1 }], "merchantName": "optional" }
    // For pay: { "amount": 5, "unit": "gp", "recipientName": "optional", "reason": "optional" }
    // For attack: { "targetName": "goblin", "targetType": "monster", "weaponName": "optional" }
    // For cast_spell: { "spellName": "Fireball", "spellLevel": 3, "targets": ["goblin"] }
    // For cast_cantrip: { "spellName": "Fire Bolt", "targets": ["goblin"] }
    // For rest: { "restType": "short" or "long" }
    // For use_item: { "itemName": "Healing Potion", "targetName": "optional" }
    // For inventory actions: { "itemName": "item", "quantity": 1, "recipientName": "optional for give" }
    // For roleplay: {} (empty)
  }
}`
}

/**
 * Classify a single player input into a mechanical intent
 */
export async function classifyIntent(
  playerInput: string,
  characterId: string,
  characterName: string,
  characterClass: string | null,
  recentContext?: string[]
): Promise<ClassifiedIntent> {
  const apiKey = getApiKey()
  const prompt = buildClassificationPrompt(playerInput, characterName, characterClass, recentContext)

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: CLASSIFIER_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an intent classifier. Respond only with valid JSON. Be precise about D&D mechanics.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: CLASSIFIER_TEMPERATURE,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Intent classification failed: ${response.status} ${error}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || '{}'

    let result: ClassificationResult
    try {
      result = JSON.parse(text)
    } catch {
      // Fallback to roleplay if parsing fails
      console.warn('[IntentClassifier] Failed to parse classification result, defaulting to roleplay')
      result = {
        intent_type: 'roleplay',
        confidence: 0.3,
        requires_mechanics: false,
        params: {}
      }
    }

    // Validate and sanitize the result
    const validatedResult = validateClassificationResult(result)

    return {
      type: validatedResult.intent_type,
      confidence: validatedResult.confidence,
      characterId,
      characterName,
      params: validatedResult.params,
      originalInput: playerInput,
      requiresMechanics: validatedResult.requires_mechanics,
    }
  } catch (error) {
    console.error('[IntentClassifier] Classification error:', error)
    // Fallback to roleplay on error
    return {
      type: 'roleplay',
      confidence: 0.3,
      characterId,
      characterName,
      params: {},
      originalInput: playerInput,
      requiresMechanics: false,
    }
  }
}

/**
 * Validate and sanitize classification result
 */
function validateClassificationResult(result: ClassificationResult): ClassificationResult {
  const validIntentTypes: MechanicalIntentType[] = [
    'purchase', 'sell', 'trade', 'pay', 'steal',
    'pickup_item', 'drop_item', 'give_item', 'use_item',
    'attack', 'cast_spell', 'cast_cantrip',
    'short_rest', 'long_rest',
    'skill_check', 'roleplay'
  ]

  // Validate intent type
  if (!validIntentTypes.includes(result.intent_type)) {
    console.warn(`[IntentClassifier] Invalid intent type: ${result.intent_type}, defaulting to roleplay`)
    result.intent_type = 'roleplay'
    result.requires_mechanics = false
    result.confidence = Math.min(result.confidence, 0.5)
  }

  // Clamp confidence
  result.confidence = Math.max(0, Math.min(1, result.confidence || 0.5))

  // Cap AI-estimated prices
  if (result.intent_type === 'purchase' && result.params?.items) {
    const items = result.params.items as PurchaseParams['items']
    for (const item of items) {
      if (item.estimatedPrice && item.estimatedPrice > MAX_AI_ESTIMATED_PRICE_GP) {
        console.warn(`[IntentClassifier] Capped item price from ${item.estimatedPrice} to ${MAX_AI_ESTIMATED_PRICE_GP}`)
        item.estimatedPrice = MAX_AI_ESTIMATED_PRICE_GP
      }
    }
  }

  // Ensure params is always an object
  if (!result.params || typeof result.params !== 'object') {
    result.params = {}
  }

  return result
}

/**
 * Classify multiple player messages (batch processing)
 * This is useful when processing multiple pending messages at once
 */
export async function classifyIntents(
  messages: Array<{
    content: string
    characterId: string
    characterName: string
    characterClass: string | null
  }>,
  recentContext?: string[]
): Promise<ClassifiedIntent[]> {
  // Process in parallel for speed
  const classifications = await Promise.all(
    messages.map(msg =>
      classifyIntent(
        msg.content,
        msg.characterId,
        msg.characterName,
        msg.characterClass,
        recentContext
      )
    )
  )

  return classifications
}

/**
 * Check if an intent should be processed mechanically or fall back to roleplay
 */
export function shouldProcessMechanically(intent: ClassifiedIntent): boolean {
  // Low confidence intents should fall back to roleplay
  if (intent.confidence < MIN_INTENT_CONFIDENCE) {
    console.log(`[IntentClassifier] Low confidence (${intent.confidence}), falling back to roleplay`)
    return false
  }

  // Roleplay intents don't need mechanical processing
  if (intent.type === 'roleplay') {
    return false
  }

  // Check if the intent explicitly requires mechanics
  return intent.requiresMechanics
}

/**
 * Get a human-readable description of the intent for logging
 */
export function describeIntent(intent: ClassifiedIntent): string {
  const { type, params, characterName } = intent

  switch (type) {
    case 'purchase': {
      const p = params as unknown as PurchaseParams
      const items = p.items?.map(i => `${i.quantity || 1}x ${i.name}`).join(', ') || 'items'
      return `${characterName} wants to purchase: ${items}`
    }
    case 'sell': {
      const p = params as unknown as SellParams
      const items = p.items?.map(i => `${i.quantity || 1}x ${i.name}`).join(', ') || 'items'
      return `${characterName} wants to sell: ${items}`
    }
    case 'pay': {
      const p = params as unknown as PayParams
      return `${characterName} wants to pay ${p.amount} ${p.unit}${p.recipientName ? ` to ${p.recipientName}` : ''}`
    }
    case 'attack': {
      const p = params as unknown as AttackParams
      return `${characterName} attacks ${p.targetName}${p.weaponName ? ` with ${p.weaponName}` : ''}`
    }
    case 'cast_spell': {
      const p = params as unknown as SpellCastParams
      return `${characterName} casts ${p.spellName}${p.targets?.length ? ` on ${p.targets.join(', ')}` : ''}`
    }
    case 'cast_cantrip': {
      const p = params as unknown as SpellCastParams
      return `${characterName} casts cantrip ${p.spellName}`
    }
    case 'short_rest':
    case 'long_rest': {
      const p = params as unknown as RestParams
      return `${characterName} takes a ${p.restType} rest`
    }
    case 'use_item': {
      const p = params as unknown as UseItemParams
      return `${characterName} uses ${p.itemName}${p.targetName ? ` on ${p.targetName}` : ''}`
    }
    case 'pickup_item':
    case 'drop_item':
    case 'give_item': {
      const p = params as unknown as InventoryParams
      const action = type === 'pickup_item' ? 'picks up' : type === 'drop_item' ? 'drops' : 'gives'
      return `${characterName} ${action} ${p.itemName}${p.recipientName ? ` to ${p.recipientName}` : ''}`
    }
    case 'steal': {
      const p = params as unknown as InventoryParams
      return `${characterName} attempts to steal ${p.itemName || 'something'}`
    }
    case 'skill_check':
      return `${characterName} requests a skill check`
    case 'roleplay':
      return `${characterName} engages in roleplay`
    default:
      return `${characterName} attempts: ${type}`
  }
}
