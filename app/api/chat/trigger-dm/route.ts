import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateNarrativeWithTools, ToolCall } from '@/lib/ai-dm/openai-client'
import { formatAllCharacters, buildRulesEnforcementSection, CharacterForPrompt } from '@/lib/ai-dm/character-context'

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
        .select('id, name, setting, dm_config, strict_mode')
        .eq('id', campaignId)
        .single()

      if (!campaign) {
        throw new Error('Campaign not found')
      }

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

      // Get characters in the campaign with full context for DM
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
          skill_proficiencies, saving_throw_proficiencies
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

      // Process any quest-related tool calls
      if (result.toolCalls && result.toolCalls.length > 0) {
        await processQuestToolCalls(supabase, campaignId, result.toolCalls, activeQuests || [])
      }

      // Final update - mark streaming complete (TTS generated on-demand when user clicks play)
      await supabase
        .from('chat_messages')
        .update({
          content: finalContent,
          metadata: { streaming: false }
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
}

function buildChatPrompt(context: ChatContext): string {
  const { campaign, scene, characters, pendingMessages, recentHistory } = context

  const dmConfig = campaign.dm_config || {}
  const tone = dmConfig.tone || 'balanced'
  const narrativeStyle = dmConfig.narrative_style || 'descriptive'

  let prompt = `You are an expert Dungeon Master for a D&D 5th Edition game.

CAMPAIGN: ${campaign.name}
SETTING: ${campaign.setting || 'Classic fantasy'}
TONE: ${tone}
STYLE: ${narrativeStyle}

`

  if (scene) {
    prompt += `CURRENT SCENE: ${scene.name}
Location: ${scene.location || 'Unknown'}
Environment: ${scene.environment || 'Standard'}
${scene.description ? `\nDescription: ${scene.description}` : ''}
${scene.current_state ? `\nCurrent State: ${scene.current_state}` : ''}

`
  }

  // Add rich character context with stats, spells, equipment
  if (characters.length > 0) {
    prompt += formatAllCharacters(characters)
    prompt += '\n\n'
  }

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

