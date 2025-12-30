/**
 * Campaign Setting Description Generator API
 * Generates AI-powered setting descriptions based on user selections
 */

import { createRouteClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai-dm/openai-client'
import { z } from 'zod'
import { SETTING_CATEGORIES, type SettingOptions } from '@/types/campaign-settings'

const GenerateSettingSchema = z.object({
  settingOptions: z.object({
    themes: z.array(z.string()).min(1, 'Select at least one theme'),
    storyTypes: z.array(z.string()).min(1, 'Select at least one story type'),
    eras: z.array(z.string()).min(1, 'Select at least one era'),
    moods: z.array(z.string()).min(1, 'Select at least one mood'),
    scales: z.array(z.string()).min(1, 'Select at least one scale'),
  }),
})

/**
 * Convert option values to readable labels
 */
function getLabelsForCategory(categoryId: keyof SettingOptions, values: string[]): string[] {
  const category = SETTING_CATEGORIES.find(c => c.id === categoryId)
  if (!category) return values

  return values.map(value => {
    const option = category.options.find(o => o.value === value)
    return option?.label || value
  })
}

/**
 * Build the AI prompt from selected options
 */
function buildPrompt(options: SettingOptions): string {
  const themes = getLabelsForCategory('themes', options.themes).join(', ')
  const storyTypes = getLabelsForCategory('storyTypes', options.storyTypes).join(', ')
  const eras = getLabelsForCategory('eras', options.eras).join(', ')
  const moods = getLabelsForCategory('moods', options.moods).join(', ')
  const scales = getLabelsForCategory('scales', options.scales).join(', ')

  return `You are a creative D&D campaign designer. Generate a compelling campaign setting description based on these choices:

THEMES: ${themes}
STORY TYPES: ${storyTypes}
ERA/TIME PERIOD: ${eras}
MOOD/ATMOSPHERE: ${moods}
SCALE: ${scales}

Write a vivid, evocative 2-3 sentence setting description (250-450 characters) that:
- Weaves all the selected elements together naturally
- Establishes the world's atmosphere and feel
- Hints at adventure possibilities
- Avoids generic fantasy cliches
- Does NOT mention specific character names or player actions
- Does NOT use phrases like "In this campaign" or "Players will"

Just describe the world itself - make it feel real and intriguing.`
}

export async function POST(request: Request) {
  try {
    // Auth check
    const { client: supabase } = createRouteClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate input
    const body = await request.json()
    const parseResult = GenerateSettingSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const { settingOptions } = parseResult.data

    // Build prompt and generate description
    const prompt = buildPrompt(settingOptions)
    const description = await generateContent(prompt)

    // Trim to ensure it's within limits (10-500 chars)
    const trimmedDescription = description.trim().slice(0, 500)

    return NextResponse.json({ description: trimmedDescription })
  } catch (error) {
    console.error('Error generating setting description:', error)
    return NextResponse.json(
      { error: 'Failed to generate setting description' },
      { status: 500 }
    )
  }
}
