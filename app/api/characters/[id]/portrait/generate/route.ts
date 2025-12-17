/**
 * Portrait Generation API Route
 * POST: Generate an AI portrait for a character using Google Imagen
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generatePortrait } from '@/lib/ai-dm/imagen-client'
import { checkPortraitUsage, incrementPortraitUsage } from '@/lib/quotas/portrait-usage'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const characterId = params.id
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

    // Get character with all appearance fields
    const { data: character, error: charError } = await supabase
      .from('characters')
      .select(`
        id,
        user_id,
        name,
        race,
        class,
        background,
        gender,
        age,
        height,
        build,
        skin_tone,
        hair_color,
        hair_style,
        eye_color,
        distinguishing_features,
        clothing_style,
        portrait_url,
        portrait_asset_id
      `)
      .eq('id', characterId)
      .single()

    if (charError || !character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (character.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not own this character' },
        { status: 403 }
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

    // Generate the portrait
    const result = await generatePortrait({
      name: character.name,
      race: character.race,
      class: character.class,
      gender: character.gender,
      age: character.age,
      height: character.height,
      build: character.build,
      skinTone: character.skin_tone,
      hairColor: character.hair_color,
      hairStyle: character.hair_style,
      eyeColor: character.eye_color,
      distinguishingFeatures: character.distinguishing_features,
      clothingStyle: character.clothing_style,
      background: character.background,
    })

    if (!result.success || !result.imageData) {
      console.error('Portrait generation failed:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to generate portrait' },
        { status: 500 }
      )
    }

    // Upload to Supabase Storage
    const filename = `${crypto.randomUUID()}.png`
    const storagePath = `${user.id}/${characterId}/${filename}`

    const { error: uploadError } = await serviceSupabase.storage
      .from('portraits')
      .upload(storagePath, result.imageData, {
        contentType: result.mimeType || 'image/png',
        upsert: false,
      })

    if (uploadError) {
      console.error('Portrait upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to save portrait' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = serviceSupabase.storage
      .from('portraits')
      .getPublicUrl(storagePath)

    const portraitUrl = urlData.publicUrl

    // Create asset record
    const { data: asset, error: assetError } = await serviceSupabase
      .from('assets')
      .insert({
        type: 'portrait',
        name: `${character.name} Portrait`,
        description: `AI-generated portrait for ${character.name}`,
        url: portraitUrl,
        style_tags: ['ai-generated', 'character-portrait'],
        metadata: {
          characterId: character.id,
          generatedAt: new Date().toISOString(),
          model: 'imagen-3.0-generate-002',
        },
        is_library: false,
        created_by: user.id,
      })
      .select('id')
      .single()

    if (assetError) {
      console.error('Asset creation error:', assetError)
      // Continue anyway - we have the URL
    }

    // Update character with portrait URL and asset ID
    const updateData: Record<string, any> = {
      portrait_url: portraitUrl,
    }
    if (asset?.id) {
      updateData.portrait_asset_id = asset.id
    }

    const { error: updateError } = await serviceSupabase
      .from('characters')
      .update(updateData)
      .eq('id', characterId)

    if (updateError) {
      console.error('Character update error:', updateError)
      // Continue anyway - portrait is saved
    }

    // Increment usage counter
    const incrementResult = await incrementPortraitUsage(serviceSupabase, user.id)
    if (!incrementResult.success) {
      console.error('Failed to increment usage counter')
    }

    // Get updated usage
    const updatedUsage = await checkPortraitUsage(serviceSupabase, user.id)

    return NextResponse.json({
      success: true,
      portrait_url: portraitUrl,
      asset_id: asset?.id,
      usage: {
        used: updatedUsage.used,
        limit: updatedUsage.limit,
        remaining: updatedUsage.remaining,
        tier: updatedUsage.tier,
      },
    })
  } catch (error) {
    console.error('Portrait generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
