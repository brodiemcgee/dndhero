/**
 * Roll Request Processor
 * Processes AI DM roll request tool calls and creates chat messages
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { ToolCall } from './openai-client'
import {
  RollRequestParams,
  SKILL_TO_ABILITY,
  ROLL_REQUEST_TOOL_NAMES,
} from './roll-request-tool'

interface Character {
  id: string
  name: string
  user_id: string
  strength: number | null
  dexterity: number | null
  constitution: number | null
  intelligence: number | null
  wisdom: number | null
  charisma: number | null
  proficiency_bonus: number | null
  skill_proficiencies: string[] | null
  saving_throw_proficiencies: string[] | null
}

interface RollRequestResult {
  requestId: string
  characterId: string
  characterName: string
}

/**
 * Calculate ability modifier from ability score
 */
function getAbilityModifier(score: number | null): number {
  if (score === null) return 0
  return Math.floor((score - 10) / 2)
}

/**
 * Get the ability score value for a character
 */
function getAbilityScore(
  character: Character,
  ability: string
): number | null {
  const abilityMap: Record<string, number | null> = {
    strength: character.strength,
    dexterity: character.dexterity,
    constitution: character.constitution,
    intelligence: character.intelligence,
    wisdom: character.wisdom,
    charisma: character.charisma,
  }
  return abilityMap[ability.toLowerCase()] ?? null
}

/**
 * Calculate the roll notation for a character based on roll type
 */
function calculateNotation(
  character: Character,
  params: RollRequestParams
): string {
  const profBonus = character.proficiency_bonus || 2

  // For custom rolls, use the provided notation
  if (params.roll_type === 'custom' && params.notation) {
    return params.notation
  }

  // For initiative, use dexterity
  if (params.roll_type === 'initiative') {
    const dexMod = getAbilityModifier(character.dexterity)
    const modifier = dexMod >= 0 ? `+${dexMod}` : `${dexMod}`
    return `1d20${modifier}`
  }

  // For skill checks, determine ability from skill and check proficiency
  if (params.roll_type === 'skill_check' && params.skill) {
    const ability = SKILL_TO_ABILITY[params.skill.toLowerCase()]
    if (!ability) {
      // Fallback to provided ability or wisdom
      const fallbackAbility = params.ability || 'wisdom'
      const abilityScore = getAbilityScore(character, fallbackAbility)
      const abilityMod = getAbilityModifier(abilityScore)
      const modifier = abilityMod >= 0 ? `+${abilityMod}` : `${abilityMod}`
      return `1d20${modifier}`
    }

    const abilityScore = getAbilityScore(character, ability)
    const abilityMod = getAbilityModifier(abilityScore)

    // Check skill proficiency
    const skillProficiencies = character.skill_proficiencies || []
    const isProficient = skillProficiencies.some(
      (s) => s.toLowerCase().replace(/\s+/g, '_') === params.skill?.toLowerCase()
    )

    const totalMod = isProficient ? abilityMod + profBonus : abilityMod
    const modifier = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`
    return `1d20${modifier}`
  }

  // For ability checks, use the specified ability
  if (params.roll_type === 'ability_check' && params.ability) {
    const abilityScore = getAbilityScore(character, params.ability)
    const abilityMod = getAbilityModifier(abilityScore)
    const modifier = abilityMod >= 0 ? `+${abilityMod}` : `${abilityMod}`
    return `1d20${modifier}`
  }

  // For saving throws, use the specified ability and check proficiency
  if (params.roll_type === 'saving_throw' && params.ability) {
    const abilityScore = getAbilityScore(character, params.ability)
    const abilityMod = getAbilityModifier(abilityScore)

    // Check saving throw proficiency
    const saveProficiencies = character.saving_throw_proficiencies || []
    const isProficient = saveProficiencies.some(
      (s) => s.toLowerCase() === params.ability?.toLowerCase()
    )

    const totalMod = isProficient ? abilityMod + profBonus : abilityMod
    const modifier = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`
    return `1d20${modifier}`
  }

  // For attack rolls, default to d20 with strength or dexterity
  if (params.roll_type === 'attack_roll') {
    const ability = params.ability || 'strength'
    const abilityScore = getAbilityScore(character, ability)
    const abilityMod = getAbilityModifier(abilityScore)
    const totalMod = abilityMod + profBonus // Assume proficient with attack
    const modifier = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`
    return `1d20${modifier}`
  }

  // Default to plain d20
  return '1d20'
}

/**
 * Build a human-readable label for the roll
 */
function buildRollLabel(params: RollRequestParams): string {
  if (params.skill) {
    // Capitalize skill name
    const skillName = params.skill
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    return `${skillName} Check`
  }

  if (params.ability) {
    const abilityName =
      params.ability.charAt(0).toUpperCase() + params.ability.slice(1)

    if (params.roll_type === 'saving_throw') {
      return `${abilityName} Saving Throw`
    }
    if (params.roll_type === 'ability_check') {
      return `${abilityName} Check`
    }
  }

  if (params.roll_type === 'initiative') {
    return 'Initiative'
  }

  if (params.roll_type === 'attack_roll') {
    return 'Attack Roll'
  }

  return 'Roll'
}

/**
 * Process roll request tool calls from AI DM
 */
export async function processRollRequestToolCalls(
  supabase: SupabaseClient,
  campaignId: string,
  sceneId: string,
  toolCalls: ToolCall[]
): Promise<{ results: RollRequestResult[]; errors: string[] }> {
  const results: RollRequestResult[] = []
  const errors: string[] = []

  // Filter for roll request tool calls
  const rollRequestCalls = toolCalls.filter((tc) =>
    ROLL_REQUEST_TOOL_NAMES.includes(tc.function.name)
  )

  if (rollRequestCalls.length === 0) {
    return { results, errors }
  }

  // Get all characters in the campaign
  const { data: characters, error: charError } = await supabase
    .from('characters')
    .select(
      'id, name, user_id, strength, dexterity, constitution, intelligence, wisdom, charisma, proficiency_bonus, skill_proficiencies, saving_throw_proficiencies'
    )
    .eq('campaign_id', campaignId)

  if (charError) {
    errors.push(`Failed to fetch characters: ${charError.message}`)
    return { results, errors }
  }

  for (const toolCall of rollRequestCalls) {
    try {
      const params: RollRequestParams = JSON.parse(toolCall.function.arguments)

      // Find target characters
      let targetCharacters: Character[] = []

      if (params.character_name.toLowerCase() === 'party') {
        // All characters in the campaign
        targetCharacters = characters || []
      } else {
        // Find specific character by name (case-insensitive)
        const char = characters?.find(
          (c) => c.name.toLowerCase() === params.character_name.toLowerCase()
        )
        if (char) {
          targetCharacters = [char]
        } else {
          errors.push(`Character "${params.character_name}" not found`)
          continue
        }
      }

      // Create roll request message for each target character
      for (const character of targetCharacters) {
        const notation = calculateNotation(character, params)
        const rollLabel = buildRollLabel(params)

        // Build content for the roll request message
        let content = `**${rollLabel}** requested for **${character.name}**`
        if (params.reason) {
          content += ` ${params.reason}`
        }

        // Insert roll request as chat message
        const { data: message, error: insertError } = await supabase
          .from('chat_messages')
          .insert({
            campaign_id: campaignId,
            scene_id: sceneId,
            sender_type: 'system',
            sender_id: null,
            character_id: character.id,
            character_name: character.name,
            content,
            message_type: 'roll_request',
            metadata: {
              pending: true,
              character_id: character.id,
              character_user_id: character.user_id,
              roll_type: params.roll_type,
              roll_label: rollLabel,
              notation,
              ability: params.ability,
              skill: params.skill,
              dc: params.dc,
              advantage: params.advantage || false,
              disadvantage: params.disadvantage || false,
              reason: params.reason,
            },
          })
          .select('id')
          .single()

        if (insertError) {
          errors.push(
            `Failed to create roll request for ${character.name}: ${insertError.message}`
          )
          continue
        }

        results.push({
          requestId: message.id,
          characterId: character.id,
          characterName: character.name,
        })
      }
    } catch (error) {
      errors.push(
        `Failed to parse roll request: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  return { results, errors }
}
