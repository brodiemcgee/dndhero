/**
 * Portrait Preview API Route
 * POST: Generate a preview portrait without saving to database
 * Used during character creation before the character exists
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generatePortrait, type PortraitPromptParams } from '@/lib/ai-dm/dalle-client'
import { checkPortraitUsage, incrementPortraitUsage } from '@/lib/quotas/portrait-usage'
import { isValidArtStyle, DEFAULT_ART_STYLE, type ArtStyle } from '@/lib/ai-dm/art-styles'

interface PreviewRequest {
  // Character appearance data
  name?: string
  race: string
  class: string
  background?: string
  gender?: string
  age?: string
  height?: string
  build?: string
  skin_tone?: string
  hair_color?: string
  hair_style?: string
  eye_color?: string
  distinguishing_features?: string
  clothing_style?: string
  // Optional art style (defaults to standard fantasy)
  art_style?: string
}

export async function POST(request: Request) {
  try {
    const { client: supabase } = createClient(request)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: PreviewRequest = await request.json()

    if (!body.race || !body.class) {
      return NextResponse.json(
        { error: 'Race and class are required' },
        { status: 400 }
      )
    }

    // Check usage limits
    const serviceSupabase = createServiceClient()
    const usage = await checkPortraitUsage(serviceSupabase, user.id)

    if (!usage.canGenerate) {
      return NextResponse.json(
        {
          error: 'Portrait generation limit reached for this month',
          code: 'PORTRAIT_LIMIT_REACHED',
          usage: {
            used: usage.used,
            limit: usage.limit,
            remaining: usage.remaining,
            tier: usage.tier,
          },
        },
        { status: 403 }
      )
    }

    // Determine art style
    const artStyle: ArtStyle = isValidArtStyle(body.art_style) ? body.art_style : DEFAULT_ART_STYLE

    // Build portrait params
    const portraitParams: PortraitPromptParams = {
      name: body.name || 'Character',
      race: body.race,
      class: body.class,
      gender: body.gender,
      age: body.age,
      height: body.height,
      build: body.build,
      skinTone: body.skin_tone,
      hairColor: body.hair_color,
      hairStyle: body.hair_style,
      eyeColor: body.eye_color,
      distinguishingFeatures: body.distinguishing_features,
      clothingStyle: body.clothing_style,
      background: body.background,
      artStyle: artStyle,
    }

    // Generate the portrait
    const result = await generatePortrait(portraitParams)

    if (!result.success || !result.imageData) {
      console.error('Portrait generation failed:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to generate portrait' },
        { status: 500 }
      )
    }

    // Increment usage counter (we're generating, so count it)
    const incrementResult = await incrementPortraitUsage(serviceSupabase, user.id)
    if (!incrementResult.success) {
      console.error('Failed to increment usage counter')
    }

    // Get updated usage
    const updatedUsage = await checkPortraitUsage(serviceSupabase, user.id)

    // Return the image as base64 (not saved to storage yet)
    const base64Image = result.imageData.toString('base64')
    const dataUrl = `data:${result.mimeType || 'image/png'};base64,${base64Image}`

    return NextResponse.json({
      success: true,
      portrait_data: dataUrl,
      mime_type: result.mimeType || 'image/png',
      usage: {
        used: updatedUsage.used,
        limit: updatedUsage.limit,
        remaining: updatedUsage.remaining,
        tier: updatedUsage.tier,
      },
    })
  } catch (error) {
    console.error('Portrait preview error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
