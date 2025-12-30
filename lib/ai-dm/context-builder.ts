/**
 * AI DM Context Builder
 * Constructs comprehensive prompts for the AI DM with game state
 */

import { TurnContract, PlayerInput } from '../turn-contract'
import {
  getToneGuidance,
  getNarrativeStyleGuidance,
  buildSensoryGuidance,
  buildDramaticPacingGuidance,
  buildNPCVoiceGuidance,
  buildCharacterIntegrationGuidance,
  type Tone,
  type NarrativeStyle
} from './storytelling-guidance'

export interface Character {
  id: string
  name: string
  class: string
  level: number
  race: string
  background: string
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  current_hp: number
  max_hp: number
  armor_class: number
  proficiency_bonus: number
  conditions: string[]
}

export interface Entity {
  id: string
  name: string
  type: 'pc' | 'npc' | 'monster'
  current_hp: number
  max_hp: number
  armor_class: number
  conditions: string[]
  description?: string
  // Personality fields for memorable NPCs
  speech_pattern?: string
  personality_quirk?: string
  motivation?: string
  disposition?: string
}

export interface Scene {
  id: string
  name: string
  description: string
  location: string
  environment: string
  npcs: Entity[]
  monsters: Entity[]
  current_state: string
}

export interface Campaign {
  id: string
  name: string
  setting: string
  dm_config: {
    tone?: string
    difficulty?: string
    house_rules?: string[]
    narrative_style?: string
  }
  strict_mode: boolean
}

export interface EventLogEntry {
  id: string
  event_type: string
  narrative: string
  created_at: Date
}

export interface DMContext {
  campaign: Campaign
  scene: Scene
  characters: Character[]
  entities: Entity[]
  turnContract: TurnContract
  playerInputs: PlayerInput[]
  recentEvents: EventLogEntry[]
  pendingRolls?: DiceRollRequest[]
  completedRolls?: CompletedRoll[]
}

export interface DiceRollRequest {
  id: string
  character_id: string
  character_name?: string
  roll_type: string
  notation: string
  ability?: string
  skill?: string
  dc?: number
  advantage: boolean
  disadvantage: boolean
  description: string
  reason?: string
  // Result fields (populated after roll)
  resolved?: boolean
  result_total?: number
  result_breakdown?: string
  result_critical?: boolean
  result_fumble?: boolean
  success?: boolean
}

export interface CompletedRoll extends DiceRollRequest {
  resolved: true
  result_total: number
  result_breakdown: string
}

/**
 * Build system prompt for AI DM
 */
export function buildSystemPrompt(campaign: Campaign): string {
  const { dm_config, strict_mode } = campaign

  const tone = (dm_config.tone || 'balanced') as Tone
  const difficulty = dm_config.difficulty || 'normal'
  const narrativeStyle = (dm_config.narrative_style || 'descriptive') as NarrativeStyle

  // Get tone-specific and style-specific guidance
  const toneGuidance = getToneGuidance(tone)
  const styleGuidance = getNarrativeStyleGuidance(narrativeStyle)

  return `You are an expert Dungeon Master for Dungeons & Dragons 5th Edition.

CAMPAIGN SETTING: ${campaign.setting}

DM STYLE:
- Tone: ${tone}
- Difficulty: ${difficulty}
- Narrative Style: ${narrativeStyle}
${dm_config.house_rules && dm_config.house_rules.length > 0 ? `\nHOUSE RULES:\n${dm_config.house_rules.map((rule) => `- ${rule}`).join('\n')}` : ''}

RULES ADHERENCE:
${strict_mode ? '- STRICT MODE: You must follow D&D 5e rules precisely. No rule bending.' : '- FLEXIBLE MODE: You may bend rules for dramatic effect, but explain why.'}

YOUR RESPONSIBILITIES:
1. Narrate the story based on player actions
2. Roleplay NPCs with distinct personalities and consistent voices
3. Describe environments vividly using sensory details
4. Apply D&D 5e rules correctly (ability checks, saves, combat, etc.)
5. Request dice rolls when needed for actions
6. Track and apply conditions, HP changes, and status effects
7. Keep the story engaging and reactive to player choices
8. Provide clear consequences for player decisions
9. Reference character personality traits, bonds, and flaws to create personal moments

=== STORYTELLING GUIDANCE ===

${toneGuidance.atmosphere}

${toneGuidance.dialogueStyle}

${styleGuidance.lengthGuidance}

${buildSensoryGuidance()}

${buildDramaticPacingGuidance()}

${buildNPCVoiceGuidance()}

${buildCharacterIntegrationGuidance()}

NARRATION GUIDELINES:
- Use second person ("you") when addressing players

DICE ROLLING:
- Request rolls when outcomes are uncertain
- Clearly state the DC (Difficulty Class) for checks
- Apply advantage/disadvantage per 5e rules
- Narrate results based on the roll outcome

Remember: You're a collaborative storyteller. Your goal is to create an exciting, fair, and memorable D&D experience.

=== ABSOLUTE RULE - MESSAGE ENDINGS ===
NEVER END YOUR MESSAGE WITH ANY OF THESE:
- Questions of ANY kind ("What will you do?" "What will you ask?" "Will you...?")
- Invitations to act ("The grove awaits..." "The choice is yours...")
- Philosophical musings ("What secrets lie ahead?" "What fate awaits?")
- Meta-prompts about the player's next action

YOUR FINAL SENTENCE MUST BE a concrete sensory detail or NPC action:
✓ "The old oak creaks in the wind."
✓ "Mira's gaze drifts to the horizon."
✓ "Somewhere below, water drips steadily."
✓ "The fire crackles, casting dancing shadows on the walls."

✗ "What will you do next?"
✗ "The grove waits in anticipation..."
✗ "What secrets will you uncover?"
✗ "Will you aid the spirit or seek your own path?"

This is NON-NEGOTIABLE. End on atmosphere, not a prompt.`
}

/**
 * Build user prompt with current game state
 */
export function buildGameStatePrompt(context: DMContext): string {
  const { campaign, scene, characters, entities, turnContract, playerInputs, recentEvents, pendingRolls } = context

  const sections: string[] = []

  // Scene information
  sections.push('=== CURRENT SCENE ===')
  sections.push(`Location: ${scene.location}`)
  sections.push(`Environment: ${scene.environment}`)
  sections.push(`\nDescription:\n${scene.description}`)
  sections.push(`\nCurrent State:\n${scene.current_state}`)

  // Player characters
  if (characters.length > 0) {
    sections.push('\n=== PLAYER CHARACTERS ===')
    characters.forEach((char) => {
      sections.push(`\n${char.name} (ID: ${char.id})`)
      sections.push(`  Level ${char.level} ${char.race} ${char.class}`)
      sections.push(`  HP: ${char.current_hp}/${char.max_hp} | AC: ${char.armor_class}`)

      if (char.conditions.length > 0) {
        sections.push(`  Conditions: ${char.conditions.join(', ')}`)
      }
    })
    sections.push('\nIMPORTANT: When requesting dice rolls, use the exact character ID (UUID) shown above.')
  }

  // NPCs and Monsters
  const npcs = entities.filter((e) => e.type === 'npc')
  const monsters = entities.filter((e) => e.type === 'monster')

  if (npcs.length > 0) {
    sections.push('\n=== NPCs PRESENT (ROLEPLAY CONSISTENTLY) ===')
    npcs.forEach((npc) => {
      const dispositionLabel = npc.disposition ? ` (${npc.disposition})` : ''
      sections.push(`\n${npc.name}${dispositionLabel}`)
      if (npc.description) {
        sections.push(`  Appearance: ${npc.description}`)
      }
      if (npc.speech_pattern) {
        sections.push(`  Speech: ${npc.speech_pattern}`)
      }
      if (npc.personality_quirk) {
        sections.push(`  Quirk: ${npc.personality_quirk}`)
      }
      if (npc.motivation) {
        sections.push(`  Motivation: ${npc.motivation}`)
      }
      if (npc.current_hp < npc.max_hp || npc.conditions.length > 0) {
        sections.push(`  HP: ${npc.current_hp}/${npc.max_hp}`)
        if (npc.conditions.length > 0) {
          sections.push(`  Conditions: ${npc.conditions.join(', ')}`)
        }
      }
    })
    sections.push('\nIMPORTANT: Roleplay each NPC consistently with their defined personality. Use their speech patterns when they speak.')
  }

  if (monsters.length > 0) {
    sections.push('\n=== MONSTERS/ENEMIES ===')
    monsters.forEach((monster) => {
      sections.push(`\n${monster.name}`)
      sections.push(`  HP: ${monster.current_hp}/${monster.max_hp} | AC: ${monster.armor_class}`)
      if (monster.conditions.length > 0) {
        sections.push(`  Conditions: ${monster.conditions.join(', ')}`)
      }
    })
  }

  // Recent events (last 10)
  if (recentEvents.length > 0) {
    sections.push('\n=== RECENT EVENTS ===')
    recentEvents.slice(-10).forEach((event, idx) => {
      sections.push(`\n[${idx + 1}] ${event.narrative}`)
    })
  }

  // Player inputs for current turn
  if (playerInputs.length > 0) {
    sections.push('\n=== PLAYER ACTIONS (CURRENT TURN) ===')

    const authoritativeInputs = playerInputs.filter((input) => input.classification === 'authoritative')
    const ambientInputs = playerInputs.filter((input) => input.classification === 'ambient')

    if (authoritativeInputs.length > 0) {
      sections.push('\nAuthoritative Actions:')
      authoritativeInputs.forEach((input, idx) => {
        sections.push(`[${idx + 1}] ${input.content}`)
      })
    }

    if (ambientInputs.length > 0) {
      sections.push('\nAdditional Context:')
      ambientInputs.forEach((input, idx) => {
        sections.push(`[${idx + 1}] ${input.content}`)
      })
    }
  }

  // Pending rolls
  if (pendingRolls && pendingRolls.length > 0) {
    sections.push('\n=== PENDING DICE ROLLS ===')
    pendingRolls.forEach((roll, idx) => {
      sections.push(`[${idx + 1}] ${roll.description}`)
      sections.push(`  Type: ${roll.roll_type} | Notation: ${roll.notation}`)
      if (roll.advantage) sections.push('  Advantage: Yes')
      if (roll.disadvantage) sections.push('  Disadvantage: Yes')
    })
  }

  // Completed rolls (for narrative generation)
  if (context.completedRolls && context.completedRolls.length > 0) {
    sections.push('\n=== COMPLETED DICE ROLLS ===')
    sections.push('Use these roll results to narrate the outcome:')
    context.completedRolls.forEach((roll, idx) => {
      const outcome = roll.dc
        ? roll.result_total >= roll.dc
          ? 'SUCCESS'
          : 'FAILURE'
        : ''
      sections.push(`\n[${idx + 1}] ${roll.description}`)
      sections.push(`  Character: ${roll.character_name || 'Unknown'}`)
      sections.push(`  Roll Type: ${roll.roll_type}`)
      sections.push(`  Result: ${roll.result_total} (${roll.result_breakdown})`)
      if (roll.dc) {
        sections.push(`  DC: ${roll.dc} - ${outcome}`)
      }
      if (roll.result_critical) {
        sections.push(`  *** CRITICAL HIT! ***`)
      }
      if (roll.result_fumble) {
        sections.push(`  *** CRITICAL FUMBLE! ***`)
      }
    })
    sections.push('\nIMPORTANT: Narrate the outcome based on these roll results. Success means the action succeeded, failure means it failed or had complications. Critical hits/fumbles should have dramatic consequences.')
  }

  // Turn context
  sections.push('\n=== TURN INFORMATION ===')
  sections.push(`Turn #${turnContract.turn_number}`)
  sections.push(`Mode: ${turnContract.mode}`)
  sections.push(`Phase: ${turnContract.phase}`)

  if (turnContract.narrative_context) {
    sections.push(`\nNarrative Context:\n${turnContract.narrative_context}`)
  }

  if (turnContract.ai_task) {
    sections.push(`\nCurrent Task:\n${turnContract.ai_task}`)
  }

  return sections.join('\n')
}

/**
 * Build task prompt for AI DM
 */
export function buildTaskPrompt(
  context: DMContext,
  task: 'narrate_turn' | 'request_rolls' | 'resolve_combat' | 'describe_scene' | 'analyze_for_rolls'
): string {
  const baseContext = buildGameStatePrompt(context)

  switch (task) {
    case 'analyze_for_rolls':
      return `${baseContext}

=== YOUR TASK ===
Analyze the player actions and determine if any dice rolls are required BEFORE narrating the outcome.

DO NOT narrate what happens yet. Your job is only to identify needed rolls.

For actions that require rolls, consider:
- Ability checks for uncertain outcomes (climbing, persuading, searching)
- Skill checks when a specific skill applies (Stealth, Perception, Athletics)
- Saving throws when resisting effects (spells, traps, poisons)
- Attack rolls when attacking enemies
- Contested rolls when two characters oppose each other

Rules for when rolls ARE needed:
- The outcome is genuinely uncertain
- There's a risk of failure with consequences
- D&D 5e rules would require a roll

Rules for when rolls are NOT needed:
- The action is routine and low-stakes
- The action automatically succeeds (walking, talking casually)
- The player is just roleplaying or asking questions
- The action is purely narrative with no mechanical impact

For each required roll, specify:
- character_id (use the exact UUID from the character list above)
- roll_type (ability_check, skill_check, saving_throw, attack_roll, etc.)
- ability and/or skill
- notation with modifiers calculated from character stats
- dc (appropriate difficulty: 10=easy, 15=medium, 20=hard, 25=very hard)
- advantage/disadvantage based on conditions
- description (what the roll is for)
- reason (why this roll is needed)`

    case 'narrate_turn':
      return `${baseContext}

=== YOUR TASK ===
Based on the player actions and dice roll results above, narrate what happens next in the story.

1. Describe the immediate results of the player actions
2. If there are COMPLETED DICE ROLLS, narrate the outcome based on success/failure
3. Roleplay any NPC reactions
4. Describe environmental changes or consequences

IMPORTANT: If dice rolls were completed, you MUST base your narration on the results:
- Success means the action succeeded
- Failure means it failed or had complications
- Critical hits (natural 20) should have dramatic positive effects
- Critical fumbles (natural 1) should have dramatic negative effects

Remember to be descriptive, dramatic, and true to the D&D 5e rules.

*** FINAL SENTENCE REQUIREMENT ***
Your response MUST end with a concrete sensory detail or NPC action.
DO NOT end with questions, prompts, or invitations to act.
Example good endings: "Silence settles over the clearing." / "The creature's tail twitches." / "She turns back to her work."
Example BAD endings (NEVER USE): "What will you do?" / "The grove awaits..." / "What will you ask next?"`

    case 'request_rolls':
      return `${baseContext}

=== YOUR TASK ===
Analyze the player actions and determine which dice rolls are needed.

For each action that requires a roll:
1. Identify the type of roll (ability check, saving throw, attack roll, etc.)
2. Specify which ability/skill to use
3. Set an appropriate DC (Difficulty Class)
4. Determine if advantage or disadvantage applies
5. Explain why the roll is needed

Format your response as a structured list of required rolls.`

    case 'resolve_combat':
      return `${baseContext}

=== YOUR TASK ===
Resolve the combat round based on the dice rolls and actions.

1. Apply attack damage and effects
2. Update HP and conditions
3. Check for unconsciousness or death
4. Narrate the combat cinematically
5. Determine if combat continues or ends

Use proper D&D 5e combat rules for all resolution.`

    case 'describe_scene':
      return `${baseContext}

=== YOUR TASK ===
Provide a rich, immersive description of the current scene.

1. Describe what the players see, hear, smell
2. Establish the mood and atmosphere
3. Point out notable features or points of interest
4. Hint at potential interactions or dangers through description

Be vivid but concise - aim for 2-3 paragraphs.

*** FINAL SENTENCE REQUIREMENT ***
Your response MUST end with a concrete sensory detail (sound, sight, smell, texture).
DO NOT end with questions, prompts, or invitations to act.
Example good endings: "Water drips steadily somewhere in the darkness." / "The air tastes of iron and old stone."
Example BAD endings (NEVER USE): "What will you explore first?" / "The dungeon awaits..." / "What secrets lie within?"`

    default:
      return baseContext
  }
}

/**
 * Build full context for AI DM
 */
export function buildFullContext(
  context: DMContext,
  task: 'narrate_turn' | 'request_rolls' | 'resolve_combat' | 'describe_scene' | 'analyze_for_rolls'
): {
  systemPrompt: string
  userPrompt: string
  fullPrompt: string
} {
  const systemPrompt = buildSystemPrompt(context.campaign)
  const userPrompt = buildTaskPrompt(context, task)
  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`

  return {
    systemPrompt,
    userPrompt,
    fullPrompt,
  }
}

/**
 * Estimate token count for context
 */
export function estimateContextTokens(context: DMContext): number {
  const { systemPrompt, userPrompt } = buildFullContext(context, 'narrate_turn')

  // Rough estimate: ~4 characters per token
  const systemTokens = Math.ceil(systemPrompt.length / 4)
  const userTokens = Math.ceil(userPrompt.length / 4)

  return systemTokens + userTokens
}

/**
 * Validate context size
 */
export function validateContextSize(
  context: DMContext,
  maxTokens: number = 128000
): { valid: boolean; estimatedTokens: number; warning?: string } {
  const estimatedTokens = estimateContextTokens(context)

  if (estimatedTokens > maxTokens) {
    return {
      valid: false,
      estimatedTokens,
      warning: `Context size (${estimatedTokens} tokens) exceeds maximum (${maxTokens} tokens). Consider reducing event log history.`,
    }
  }

  if (estimatedTokens > maxTokens * 0.8) {
    return {
      valid: true,
      estimatedTokens,
      warning: `Context size (${estimatedTokens} tokens) is approaching maximum (${maxTokens} tokens).`,
    }
  }

  return { valid: true, estimatedTokens }
}
