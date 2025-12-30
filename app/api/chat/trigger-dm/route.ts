import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateNarrativeWithTools, ToolCall, ALL_DM_TOOLS, NPC_TOOL_NAMES, SCENE_ART_TOOL_NAMES, ROLL_REQUEST_TOOL_NAMES } from '@/lib/ai-dm/openai-client'
import { formatAllCharacters, buildRulesEnforcementSection, CharacterForPrompt } from '@/lib/ai-dm/character-context'
import { processCharacterToolCalls, CHARACTER_TOOL_NAMES } from '@/lib/ai-dm/character-tool-processor'
import { processNpcStateToolCalls, NPC_STATE_TOOL_NAMES } from '@/lib/ai-dm/npc-tool-processor'
import { processRollRequestToolCalls } from '@/lib/ai-dm/roll-request-processor'
import { isValidArtStyle, DEFAULT_ART_STYLE, type ArtStyle } from '@/lib/ai-dm/art-styles'
import {
  aggregateCampaignSafetySettings,
  buildSafetyPromptSection,
  LinesVeilsSettings,
  AggregatedSafetySettings,
} from '@/lib/safety'
import {
  buildStorytellingPromptSection,
  detectActionType,
  getAdaptiveLengthGuidance,
} from '@/lib/ai-dm/storytelling-guidance'

export async function POST(request: NextRequest) {
  try {
    const { campaignId, timestamp } = await request.json()

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Check debounce state - only proceed if this is still the latest timestamp
    const { data: debounceState } = await supabase
      .from('dm_debounce_state')
      .select('*')
      .eq('campaign_id', campaignId)
      .single()

    // If there's a newer message, skip this trigger (debounce reset)
    // Compare as Date objects since PostgreSQL and JS use different timestamp formats
    if (debounceState && timestamp) {
      const dbTime = new Date(debounceState.last_player_message_at).getTime()
      const reqTime = new Date(timestamp).getTime()
      if (Math.abs(dbTime - reqTime) > 1000) { // Allow 1 second tolerance
        return NextResponse.json({ skipped: true, reason: 'newer_message' })
      }
    }

    // If already processing, skip
    if (debounceState?.is_processing) {
      return NextResponse.json({ skipped: true, reason: 'already_processing' })
    }

    // Set processing flag
    await supabase
      .from('dm_debounce_state')
      .update({ is_processing: true, updated_at: new Date().toISOString() })
      .eq('campaign_id', campaignId)

    try {
      // Get campaign and scene info
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('id, name, setting, dm_config, strict_mode, art_style, host_id, adult_content_enabled')
        .eq('id', campaignId)
        .single()

      if (!campaign) {
        throw new Error('Campaign not found')
      }

      // Get all campaign members for safety settings and adult content check
      const { data: members } = await supabase
        .from('campaign_members')
        .select('user_id')
        .eq('campaign_id', campaignId)

      let adultContentAllowed = false
      let safetySettings: AggregatedSafetySettings | null = null

      if (members && members.length > 0) {
        const memberIds = members.map(m => m.user_id)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, adult_content_opt_in, lines_veils')
          .in('id', memberIds)

        // Check if adult content is allowed for this campaign
        // Requires: campaign has it enabled AND all players have opted in
        if (campaign.adult_content_enabled) {
          adultContentAllowed = profiles?.every(p => p.adult_content_opt_in === true) ?? false
        }

        // Aggregate safety settings (Lines & Veils) from all members
        const memberLinesVeils = (profiles || []).map(
          p => p.lines_veils as LinesVeilsSettings | null
        )
        safetySettings = aggregateCampaignSafetySettings(memberLinesVeils)
      }

      // Get host's subscription tier for art generation limits
      const { data: hostSubscription } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', campaign.host_id)
        .single()

      const hostTier = hostSubscription?.tier || 'free'
      const artStyle: ArtStyle = isValidArtStyle(campaign.art_style) ? campaign.art_style : DEFAULT_ART_STYLE

      // Get active scene
      const { data: scene } = await supabase
        .from('scenes')
        .select('id, name, description, location, environment, current_state')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Get all pending messages (player messages without DM response)
      const { data: pendingMessages } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('sender_type', 'player')
        .is('dm_response_id', null)
        .order('created_at', { ascending: true })

      if (!pendingMessages || pendingMessages.length === 0) {
        // No pending messages, reset state and exit
        await supabase
          .from('dm_debounce_state')
          .update({
            is_processing: false,
            pending_message_count: 0,
            updated_at: new Date().toISOString()
          })
          .eq('campaign_id', campaignId)

        return NextResponse.json({ skipped: true, reason: 'no_pending_messages' })
      }

      // Get recent chat history (last 20 messages for context)
      const { data: recentHistory } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })
        .limit(20)

      // Get characters in the campaign with full context for DM (including personality)
      const { data: characters } = await supabase
        .from('characters')
        .select(`
          id, name, class, level, race,
          current_hp, max_hp, armor_class, speed,
          strength, dexterity, constitution, intelligence, wisdom, charisma,
          proficiency_bonus,
          cantrips, known_spells, prepared_spells,
          spell_slots, spell_slots_used,
          spellcasting_ability, spell_save_dc, spell_attack_bonus,
          equipment, inventory,
          skill_proficiencies, saving_throw_proficiencies,
          personality_traits, bonds, ideals, flaws, backstory
        `)
        .eq('campaign_id', campaignId)

      // Get active quests for context
      const { data: activeQuests } = await supabase
        .from('quests')
        .select('id, title, description, quest_objectives(id, description, is_completed, sort_order)')
        .eq('campaign_id', campaignId)
        .eq('status', 'active')
        .order('priority', { ascending: false })

      // Format quests for the AI
      const questsForAI = (activeQuests || []).map(q => ({
        title: q.title,
        objectives: (q.quest_objectives || [])
          .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
          .map((obj: { description: string; is_completed: boolean }) => ({
            description: obj.description,
            is_completed: obj.is_completed
          }))
      }))

      // Build AI prompt
      const prompt = buildChatPrompt({
        campaign,
        scene,
        characters: characters || [],
        pendingMessages,
        recentHistory: (recentHistory || []).reverse(),
        hostTier,
        adultContentAllowed,
        safetySettings,
      })

      // Create placeholder DM message immediately
      const { data: dmMessage, error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          campaign_id: campaignId,
          scene_id: scene?.id,
          sender_type: 'dm',
          sender_id: null,
          character_id: null,
          character_name: 'Dungeon Master',
          content: '...',  // Placeholder while streaming
          message_type: 'narrative',
          metadata: { streaming: true },
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (insertError) {
        throw new Error(`Failed to insert DM response: ${insertError.message}`)
      }

      // Stream AI response and update message progressively
      let lastUpdateTime = Date.now()
      const updateInterval = 500 // Update DB every 500ms

      const result = await generateNarrativeWithTools(
        prompt,
        questsForAI,
        async (chunk, fullText) => {
          // Throttle DB updates to avoid too many writes
          const now = Date.now()
          if (now - lastUpdateTime >= updateInterval) {
            await supabase
              .from('chat_messages')
              .update({ content: fullText })
              .eq('id', dmMessage.id)
            lastUpdateTime = now
          }
        }
      )

      const finalContent = result.content

      // Separate tool calls by type
      const questToolCalls = result.toolCalls?.filter(tc =>
        ['create_quest', 'update_quest_objective', 'complete_quest'].includes(tc.function.name)
      ) || []

      const npcToolCalls = result.toolCalls?.filter(tc =>
        NPC_TOOL_NAMES.includes(tc.function.name)
      ) || []

      const characterToolCalls = result.toolCalls?.filter(tc =>
        CHARACTER_TOOL_NAMES.includes(tc.function.name)
      ) || []

      const npcStateToolCalls = result.toolCalls?.filter(tc =>
        NPC_STATE_TOOL_NAMES.includes(tc.function.name)
      ) || []

      const sceneArtToolCalls = result.toolCalls?.filter(tc =>
        SCENE_ART_TOOL_NAMES.includes(tc.function.name)
      ) || []

      const rollRequestToolCalls = result.toolCalls?.filter(tc =>
        ROLL_REQUEST_TOOL_NAMES.includes(tc.function.name)
      ) || []

      // Process quest-related tool calls
      if (questToolCalls.length > 0) {
        await processQuestToolCalls(supabase, campaignId, questToolCalls, activeQuests || [])
      }

      // Process NPC-related tool calls (and trigger portrait generation for new NPCs)
      if (npcToolCalls.length > 0 && scene?.id) {
        await processNpcToolCalls(supabase, campaignId, scene.id, npcToolCalls, {
          artStyle,
          hostPlayerId: campaign.host_id,
        })
      }

      // Process character state tool calls and get the changes for UI display
      let characterChanges: Array<{ character: string; description: string }> = []
      if (characterToolCalls.length > 0) {
        const charResult = await processCharacterToolCalls(
          supabase,
          campaignId,
          characterToolCalls,
          dmMessage.id
        )
        characterChanges = charResult.changes

        if (charResult.errors.length > 0) {
          console.warn('Character tool call errors:', charResult.errors)
        }
      }

      // Process NPC state tool calls (HP, conditions) and get changes for UI display
      let npcStateChanges: Array<{ npc: string; description: string }> = []
      if (npcStateToolCalls.length > 0 && scene?.id) {
        const npcResult = await processNpcStateToolCalls(
          supabase,
          scene.id,
          npcStateToolCalls
        )
        npcStateChanges = npcResult.changes

        if (npcResult.errors.length > 0) {
          console.warn('NPC state tool call errors:', npcResult.errors)
        }
      }

      // Process scene art tool calls (fire-and-forget, don't block DM response)
      if (sceneArtToolCalls.length > 0 && scene?.id) {
        // Run async without awaiting to not block DM response
        processSceneArtToolCalls(
          supabase,
          campaignId,
          scene.id,
          sceneArtToolCalls,
          artStyle
        ).catch(err => console.error('Scene art generation error:', err))
      }

      // Process roll request tool calls (creates clickable roll buttons in chat)
      if (rollRequestToolCalls.length > 0 && scene?.id) {
        const rollResult = await processRollRequestToolCalls(
          supabase,
          campaignId,
          scene.id,
          rollRequestToolCalls
        )
        if (rollResult.errors.length > 0) {
          console.warn('Roll request tool call errors:', rollResult.errors)
        }
      }

      // Final update - mark streaming complete with character/NPC changes metadata
      const messageMetadata: Record<string, unknown> = { streaming: false }
      if (characterChanges.length > 0) {
        messageMetadata.character_changes = characterChanges
      }
      if (npcStateChanges.length > 0) {
        messageMetadata.npc_changes = npcStateChanges
      }

      await supabase
        .from('chat_messages')
        .update({
          content: finalContent,
          metadata: messageMetadata
        })
        .eq('id', dmMessage.id)

      // Link pending messages to this DM response
      const pendingIds = pendingMessages.map(m => m.id)
      await supabase
        .from('chat_messages')
        .update({ dm_response_id: dmMessage.id })
        .in('id', pendingIds)

      // Reset debounce state
      await supabase
        .from('dm_debounce_state')
        .update({
          is_processing: false,
          last_dm_response_at: new Date().toISOString(),
          pending_message_count: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('campaign_id', campaignId)

      return NextResponse.json({
        success: true,
        messageId: dmMessage.id,
        respondedTo: pendingIds.length,
      })

    } catch (error) {
      // Reset processing flag on error
      await supabase
        .from('dm_debounce_state')
        .update({ is_processing: false, updated_at: new Date().toISOString() })
        .eq('campaign_id', campaignId)

      throw error
    }

  } catch (error) {
    console.error('DM trigger error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

interface ChatContext {
  campaign: {
    id: string
    name: string
    setting: string | null
    dm_config: any
    strict_mode: boolean | null
  }
  scene: {
    id: string
    name: string
    description: string | null
    location: string | null
    environment: string | null
    current_state: string | null
  } | null
  characters: CharacterForPrompt[]
  pendingMessages: Array<{
    id: string
    character_name: string | null
    content: string
    created_at: string
  }>
  recentHistory: Array<{
    sender_type: string
    character_name: string | null
    content: string
  }>
  hostTier?: string
  adultContentAllowed?: boolean
  safetySettings?: AggregatedSafetySettings | null
}

function buildChatPrompt(context: ChatContext): string {
  const { campaign, scene, characters, pendingMessages, recentHistory, hostTier, adultContentAllowed, safetySettings } = context

  const dmConfig = campaign.dm_config || {}
  const tone = dmConfig.tone || 'balanced'
  const narrativeStyle = dmConfig.narrative_style || 'descriptive'

  // Detect action type for adaptive length guidance
  const playerMessageContents = pendingMessages.map(m => m.content)
  const actionType = detectActionType(playerMessageContents)

  let prompt = `You are an expert Dungeon Master for a D&D 5th Edition game.

CAMPAIGN: ${campaign.name}
SETTING: ${campaign.setting || 'Classic fantasy'}
TONE: ${tone}
STYLE: ${narrativeStyle}

`

  // Add content guidelines based on adult content setting
  if (adultContentAllowed) {
    prompt += `CONTENT RATING: MATURE (18+)
This campaign allows mature themes. You may include:
- Graphic violence and detailed combat descriptions
- Dark themes (torture, corruption, moral ambiguity)
- Mature romantic or suggestive content (tastefully handled)
- Horror elements, body horror, psychological terror
- Complex adult topics (addiction, trauma, moral dilemmas)
- Strong language when appropriate for NPCs

Use mature content to enhance the narrative, not gratuitously. Match the tone the players set.

`
  } else {
    prompt += `CONTENT RATING: TEEN-FRIENDLY
Keep all content appropriate for ages 13+. You must:
- Avoid graphic violence (describe outcomes, not gore)
- Keep romance PG (fade to black for anything intimate)
- No explicit language or slurs
- Handle dark themes with care and appropriate distance
- Focus on heroic adventure rather than grimdark content
- Avoid detailed descriptions of torture, abuse, or body horror

`
  }

  // Add Lines & Veils safety settings if any are set
  if (safetySettings) {
    const safetySection = buildSafetyPromptSection(safetySettings)
    if (safetySection) {
      prompt += safetySection
      prompt += '\n'
    }
  }

  if (scene) {
    prompt += `CURRENT SCENE: ${scene.name}
Location: ${scene.location || 'Unknown'}
Environment: ${scene.environment || 'Standard'}
${scene.description ? `\nDescription: ${scene.description}` : ''}
${scene.current_state ? `\nCurrent State: ${scene.current_state}` : ''}

`
  }

  // Add rich character context with stats, spells, equipment, and personality
  if (characters.length > 0) {
    prompt += formatAllCharacters(characters)
    prompt += '\n\n'
  }

  // Add storytelling guidance based on tone and narrative style
  prompt += buildStorytellingPromptSection(tone, narrativeStyle, actionType)
  prompt += '\n\n'

  // Add adaptive length hint based on action type
  prompt += getAdaptiveLengthGuidance(actionType)
  prompt += '\n\n'

  // Include recent history for context
  if (recentHistory.length > 0) {
    prompt += `RECENT CONVERSATION:\n`
    recentHistory.slice(-10).forEach(msg => {
      const speaker = msg.sender_type === 'dm' ? 'DM' : (msg.character_name || 'Player')
      prompt += `${speaker}: ${msg.content}\n`
    })
    prompt += '\n'
  }

  // The messages to respond to
  prompt += `PLAYER MESSAGES TO RESPOND TO:\n`
  pendingMessages.forEach(msg => {
    prompt += `${msg.character_name || 'Player'}: ${msg.content}\n`
  })

  prompt += `
YOUR TASK:
Respond to the player messages above as the Dungeon Master. Consider ALL the messages together - they may be from the same player adding more detail, or from multiple players acting together.

Guidelines:
- Be descriptive but concise (2-4 paragraphs max)
- Use second person ("you") when addressing players
- React to what players say and do
- Describe the environment and NPC reactions
- Keep the story engaging and moving forward
- If players attempt actions, narrate the results (assume reasonable success for simple actions)
- For risky actions, you may describe partial success or interesting consequences
- When players cast spells, check their Prepared/Known spells list - only allow spells they actually have
- When players use items, check their Equipment/Inventory - only reference items they possess
- Reference character abilities and stats when relevant to the narrative
`

  // Add rules enforcement section for strict mode
  if (campaign.strict_mode) {
    prompt += buildRulesEnforcementSection()
  }

  // Add tier-based art generation instructions
  const isPaidTier = hostTier === 'standard' || hostTier === 'premium'

  if (isPaidTier) {
    prompt += `
ART GENERATION (Paid Tier - Generate Freely):
You have tools to generate visual artwork for the game. Use them liberally to enhance immersion:

- generate_scene_art: Use when describing any new location, dramatic moment, or environmental change.
  Generate scenes for: entering new areas, dramatic story beats, weather/time changes, battles.

- NPCs and creatures: New NPCs/monsters introduced via add_npc_to_scene will automatically get portraits generated.
  Include vivid descriptions in the 'description' field to get better portraits.
`
  } else {
    prompt += `
ART GENERATION (Free Tier - Be Selective):
You have tools to generate visual artwork, but use them SPARINGLY to conserve generation quota:

- generate_scene_art: Only use for MAJOR location changes and climactic moments:
  • First entry to a significant location (new town, dungeon, castle, landmark)
  • Major story climax or dramatic turning points
  • Maximum 1-2 scene images per session
  Skip for: minor rooms, corridors, returning to familiar places

- NPCs: Portraits auto-generate for new NPCs added via add_npc_to_scene.
  Only add key NPCs (quest givers, bosses, recurring characters).
  Skip: guards, shopkeepers, random townsfolk, minor enemies.
`
  }

  prompt += `
Write your response as narrative prose only. Do not use JSON or any special formatting.`

  return prompt
}

/**
 * Process quest-related tool calls from the AI
 */
interface ActiveQuest {
  id: string
  title: string
  description: string | null
  quest_objectives: Array<{
    id: string
    description: string
    is_completed: boolean
    sort_order: number
  }> | null
}

async function processQuestToolCalls(
  supabase: ReturnType<typeof createServiceClient>,
  campaignId: string,
  toolCalls: ToolCall[],
  activeQuests: ActiveQuest[]
): Promise<void> {
  for (const toolCall of toolCalls) {
    try {
      const args = JSON.parse(toolCall.function.arguments)

      switch (toolCall.function.name) {
        case 'create_quest': {
          // Create new quest
          const { data: quest, error: questError } = await supabase
            .from('quests')
            .insert({
              campaign_id: campaignId,
              title: args.title,
              description: args.description || null,
              quest_giver: args.quest_giver || null,
              status: 'active',
              priority: 1, // New quests get priority 1
            })
            .select('id')
            .single()

          if (questError) {
            console.error('Failed to create quest:', questError)
            break
          }

          // Create objectives
          if (args.objectives && Array.isArray(args.objectives)) {
            const objectives = args.objectives.map((obj: string, index: number) => ({
              quest_id: quest.id,
              description: obj,
              is_completed: false,
              sort_order: index,
            }))

            const { error: objError } = await supabase
              .from('quest_objectives')
              .insert(objectives)

            if (objError) {
              console.error('Failed to create quest objectives:', objError)
            }
          }
          break
        }

        case 'update_quest_objective': {
          // Find the quest by title (fuzzy match)
          const quest = activeQuests.find(q =>
            q.title.toLowerCase().includes(args.quest_title.toLowerCase()) ||
            args.quest_title.toLowerCase().includes(q.title.toLowerCase())
          )

          if (!quest || !quest.quest_objectives) {
            console.error('Quest not found:', args.quest_title)
            break
          }

          // Find the objective (fuzzy match)
          const objective = quest.quest_objectives.find(obj =>
            obj.description.toLowerCase().includes(args.objective_description.toLowerCase()) ||
            args.objective_description.toLowerCase().includes(obj.description.toLowerCase())
          )

          if (!objective) {
            console.error('Objective not found:', args.objective_description)
            break
          }

          // Update the objective
          const { error } = await supabase
            .from('quest_objectives')
            .update({ is_completed: true })
            .eq('id', objective.id)

          if (error) {
            console.error('Failed to update objective:', error)
          }
          break
        }

        case 'complete_quest': {
          // Find the quest by title (fuzzy match)
          const quest = activeQuests.find(q =>
            q.title.toLowerCase().includes(args.quest_title.toLowerCase()) ||
            args.quest_title.toLowerCase().includes(q.title.toLowerCase())
          )

          if (!quest) {
            console.error('Quest not found:', args.quest_title)
            break
          }

          // Update the quest status
          const { error } = await supabase
            .from('quests')
            .update({ status: args.status })
            .eq('id', quest.id)

          if (error) {
            console.error('Failed to complete quest:', error)
          }
          break
        }

        default:
          console.warn('Unknown tool call:', toolCall.function.name)
      }
    } catch (error) {
      console.error('Error processing tool call:', error)
    }
  }
}

/**
 * Process NPC-related tool calls from the AI
 */
interface NpcToolCallOptions {
  artStyle: ArtStyle
  hostPlayerId: string
}

async function processNpcToolCalls(
  supabase: ReturnType<typeof createServiceClient>,
  campaignId: string,
  sceneId: string,
  toolCalls: ToolCall[],
  options: NpcToolCallOptions
): Promise<void> {
  for (const toolCall of toolCalls) {
    try {
      const args = JSON.parse(toolCall.function.arguments)

      switch (toolCall.function.name) {
        case 'add_npc_to_scene': {
          // Check if entity already exists with this name in the campaign
          const { data: existingEntity } = await supabase
            .from('entities')
            .select('id')
            .eq('campaign_id', campaignId)
            .ilike('name', args.name)
            .single()

          let entityId: string

          if (existingEntity) {
            entityId = existingEntity.id
          } else {
            // Create new entity with personality for memorable NPCs
            const { data: newEntity, error: entityError } = await supabase
              .from('entities')
              .insert({
                campaign_id: campaignId,
                name: args.name,
                type: args.type || 'npc',
                stat_block: {
                  description: args.description || null,
                  speech_pattern: args.speech_pattern || null,
                  personality_quirk: args.personality_quirk || null,
                  motivation: args.motivation || null,
                  disposition: args.disposition_to_party || 'neutral',
                  max_hp: args.max_hp || 10,
                  armor_class: args.armor_class || 10,
                },
                portrait_generation_status: 'pending',
              })
              .select('id')
              .single()

            if (entityError) {
              console.error('Failed to create entity:', entityError)
              break
            }
            entityId = newEntity.id

            // Trigger portrait generation for new entity (fire-and-forget)
            triggerEntityPortraitGeneration(
              entityId,
              campaignId,
              options.artStyle
            ).catch(err => console.error('Entity portrait generation error:', err))
          }

          // Check if entity_state already exists for this scene
          const { data: existingState } = await supabase
            .from('entity_state')
            .select('id')
            .eq('entity_id', entityId)
            .eq('scene_id', sceneId)
            .single()

          if (!existingState) {
            // Create entity state for this scene
            const maxHp = args.max_hp || 10
            const { error: stateError } = await supabase
              .from('entity_state')
              .insert({
                entity_id: entityId,
                scene_id: sceneId,
                current_hp: maxHp,
                max_hp: maxHp,
                temp_hp: 0,
                armor_class: args.armor_class || 10,
                initiative: null,
                conditions: [],
              })

            if (stateError) {
              console.error('Failed to create entity state:', stateError)
            }
          }
          break
        }

        case 'remove_npc_from_scene': {
          // Find the entity by name
          const { data: entity } = await supabase
            .from('entities')
            .select('id')
            .eq('campaign_id', campaignId)
            .ilike('name', args.name)
            .single()

          if (!entity) {
            console.warn('Entity not found:', args.name)
            break
          }

          // Remove entity state for this scene (keeps the entity for future use)
          const { error } = await supabase
            .from('entity_state')
            .delete()
            .eq('entity_id', entity.id)
            .eq('scene_id', sceneId)

          if (error) {
            console.error('Failed to remove entity from scene:', error)
          }
          break
        }

        default:
          console.warn('Unknown NPC tool call:', toolCall.function.name)
      }
    } catch (error) {
      console.error('Error processing NPC tool call:', error)
    }
  }
}

/**
 * Process scene art tool calls from the AI
 */
async function processSceneArtToolCalls(
  _supabase: ReturnType<typeof createServiceClient>,
  campaignId: string,
  sceneId: string,
  toolCalls: ToolCall[],
  _artStyle: ArtStyle
): Promise<void> {
  for (const toolCall of toolCalls) {
    try {
      const args = JSON.parse(toolCall.function.arguments)

      if (toolCall.function.name === 'generate_scene_art') {
        // Call the scene art generation API internally
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000'

        await fetch(`${baseUrl}/api/scene/${sceneId}/generate-art`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId,
            sceneDescription: args.scene_description,
            locationName: args.location_name,
            mood: args.mood,
          }),
        })
      }
    } catch (error) {
      console.error('Error processing scene art tool call:', error)
    }
  }
}

/**
 * Trigger portrait generation for a new entity
 */
async function triggerEntityPortraitGeneration(
  entityId: string,
  campaignId: string,
  _artStyle: ArtStyle
): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    await fetch(`${baseUrl}/api/entities/${entityId}/portrait/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId }),
    })
  } catch (error) {
    console.error('Error triggering entity portrait generation:', error)
  }
}

