/**
 * Generate Primary Quest API Route
 * Auto-generates a compelling primary quest based on campaign setting
 */

import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateStructuredOutput } from '@/lib/ai-dm/openai-client'

interface PrimaryQuestData {
  title: string
  description: string
  objectives: string[]
  revelation_hook: string
}

const QUEST_GENERATION_SCHEMA = `{
  "title": "string - Short, evocative quest title (3-6 words)",
  "description": "string - 2-3 sentence description of the quest objective and stakes",
  "objectives": ["string"] - Array of 3-4 objectives (early, mid, late game, climax)",
  "revelation_hook": "string - Opening hook for DM to weave into narrative (mysterious stranger, prophecy, urgent plea, etc.)"
}`

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: campaignId } = params
    const serviceSupabase = createServiceClient()

    // Get campaign with setting options
    const { data: campaign, error: campaignError } = await serviceSupabase
      .from('campaigns')
      .select('id, name, setting, dm_config')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check if primary quest already exists
    const { data: existingQuest } = await serviceSupabase
      .from('quests')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('quest_type', 'primary')
      .eq('status', 'active')
      .single()

    if (existingQuest) {
      return NextResponse.json(
        { error: 'Primary quest already exists for this campaign' },
        { status: 400 }
      )
    }

    // Extract setting options from dm_config
    const dmConfig = campaign.dm_config as {
      tone?: string
      difficulty?: string
      narrative_style?: string
      setting_options?: {
        themes?: string[]
        storyTypes?: string[]
        eras?: string[]
        moods?: string[]
        scales?: string[]
      }
    } | null

    const settingOptions = dmConfig?.setting_options || {}
    const themes = settingOptions.themes?.join(', ') || 'Fantasy'
    const storyTypes = settingOptions.storyTypes?.join(', ') || 'Adventure'
    const eras = settingOptions.eras?.join(', ') || 'Medieval'
    const moods = settingOptions.moods?.join(', ') || 'Epic'
    const scales = settingOptions.scales?.join(', ') || 'Regional'
    const tone = dmConfig?.tone || 'balanced'
    const difficulty = dmConfig?.difficulty || 'normal'

    // Build prompt for quest generation
    const prompt = `You are a master D&D campaign designer. Create a compelling primary quest for a new campaign.

CAMPAIGN SETTING:
${campaign.setting}

SETTING DETAILS:
- Themes: ${themes}
- Story Types: ${storyTypes}
- Era: ${eras}
- Mood: ${moods}
- Scale: ${scales}
- Tone: ${tone}
- Difficulty: ${difficulty}

REQUIREMENTS:
1. The quest should take approximately 20-30 turns (2-3 hours of gameplay) to complete
2. Create a clear narrative arc with rising action and climax
3. The quest should be discoverable organically through gameplay (not immediately obvious)
4. Design it to involve ALL player characters in the discovery and resolution
5. Match the world's tone, themes, and scale
6. The objectives should progress from early game (discovery/investigation) to late game (confrontation/resolution)

REVELATION HOOK GUIDELINES:
- Should feel organic and dramatic, not forced
- Ideas: dying messenger, mysterious artifact, prophetic dream, urgent NPC plea, strange occurrence, overheard conversation
- The hook should draw players in naturally without feeling like a "quest giver" tutorial

Generate a quest that will be memorable and engaging for the entire 2-3 hour session.`

    // Generate quest using AI
    const questData = await generateStructuredOutput<PrimaryQuestData>(
      prompt,
      QUEST_GENERATION_SCHEMA
    )

    // Validate the response
    if (!questData.title || !questData.objectives || questData.objectives.length < 2) {
      return NextResponse.json(
        { error: 'Failed to generate valid quest data' },
        { status: 500 }
      )
    }

    // Insert the quest in hidden state
    const { data: quest, error: questError } = await serviceSupabase
      .from('quests')
      .insert({
        campaign_id: campaignId,
        title: '???',  // Hidden until revealed
        description: null,  // Hidden until revealed
        quest_type: 'primary',
        is_revealed: false,
        hidden_title: questData.title,
        hidden_description: questData.description,
        revelation_hook: questData.revelation_hook,
        estimated_turns: 25,
        progress_percentage: 0,
        status: 'active',
        priority: 100,  // High priority for primary quest
      })
      .select()
      .single()

    if (questError || !quest) {
      console.error('Quest creation error:', questError)
      return NextResponse.json(
        { error: 'Failed to create quest' },
        { status: 500 }
      )
    }

    // Insert objectives (also hidden until revelation)
    const objectivesToInsert = questData.objectives.map((desc, index) => ({
      quest_id: quest.id,
      description: desc,
      is_completed: false,
      sort_order: index,
    }))

    const { error: objectivesError } = await serviceSupabase
      .from('quest_objectives')
      .insert(objectivesToInsert)

    if (objectivesError) {
      console.error('Objectives creation error:', objectivesError)
      // Don't fail the whole request, quest is created
    }

    return NextResponse.json({
      success: true,
      quest: {
        id: quest.id,
        hidden_title: questData.title,
        revelation_hook: questData.revelation_hook,
        objectives_count: questData.objectives.length,
      },
    })
  } catch (error) {
    console.error('Generate primary quest error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
