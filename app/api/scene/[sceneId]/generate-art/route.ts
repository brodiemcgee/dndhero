/**
 * Scene Art Generation API Route
 * POST: Generate AI artwork for a scene using OpenAI DALL-E
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isValidArtStyle, DEFAULT_ART_STYLE, type ArtStyle } from '@/lib/ai-dm/art-styles'
import { generateSceneArt } from '@/lib/ai-dm/dalle-client'
import { checkSceneArtUsage, incrementSceneArtUsage } from '@/lib/quotas/scene-art-usage'
import {
  findExactArtworkMatch,
  storeArtworkInLibrary,
  parseSceneToTags,
} from '@/lib/artwork/artwork-matcher'

const GenerateSceneArtSchema = z.object({
  sceneDescription: z.string().min(10).max(1000),
  locationName: z.string().min(1).max(200),
  mood: z.string().optional(),
  campaignId: z.string().uuid(),
})

export async function POST(
  request: Request,
  { params }: { params: { sceneId: string } }
) {
  try {
    const sceneId = params.sceneId
    const body = await request.json()

    // Validate input
    const validation = GenerateSceneArtSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { sceneDescription, locationName, mood, campaignId } = validation.data
    const { client: supabase } = createClient(request)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is in the campaign
    const { data: membership } = await supabase
      .from('campaign_players')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('player_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this campaign' },
        { status: 403 }
      )
    }

    const serviceSupabase = createServiceClient()

    // Get campaign details including art style and host
    const { data: campaign } = await serviceSupabase
      .from('campaigns')
      .select('art_style, host_player_id, setting')
      .eq('id', campaignId)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const artStyle: ArtStyle = isValidArtStyle(campaign.art_style)
      ? campaign.art_style
      : DEFAULT_ART_STYLE

    // Check usage limits (use host's quota)
    const usage = await checkSceneArtUsage(serviceSupabase, campaign.host_player_id, campaignId)

    if (!usage.canGenerate) {
      return NextResponse.json(
        {
          error: 'Scene art generation limit reached for this month',
          code: 'SCENE_ART_LIMIT_REACHED',
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

    // Try to find existing artwork in library
    const { tags, environmentType, detectedMood } = parseSceneToTags(locationName, sceneDescription, mood)

    const existingMatch = await findExactArtworkMatch(serviceSupabase, {
      artStyle,
      assetType: 'scene',
      tags,
      environmentType: environmentType || undefined,
      mood: detectedMood || undefined,
    })

    if (existingMatch && existingMatch.matchScore === 100) {
      // Reuse existing artwork - no API call needed!
      const { error: insertError } = await serviceSupabase.from('scene_images').insert({
        scene_id: sceneId,
        campaign_id: campaignId,
        image_url: existingMatch.imageUrl,
        prompt: 'Reused from artwork library',
        location_name: locationName,
        mood: mood || null,
        art_style: artStyle,
        generation_status: 'completed',
        is_current: true,
      })

      if (insertError) {
        console.error('Scene image insert error:', insertError)
      }

      // Update scene's current image
      await serviceSupabase
        .from('scenes')
        .update({ current_scene_image_id: sceneId })
        .eq('id', sceneId)

      return NextResponse.json({
        success: true,
        image_url: existingMatch.imageUrl,
        reused: true,
        usage: {
          used: usage.used,
          limit: usage.limit,
          remaining: usage.remaining,
        },
      })
    }

    // No match found - generate new artwork using DALL-E
    const result = await generateSceneArt({
      locationName,
      sceneDescription,
      mood,
      artStyle,
      campaignSetting: campaign.setting,
    })

    if (!result.success || !result.imageData) {
      console.error('Scene art generation failed:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to generate scene art' },
        { status: 500 }
      )
    }

    // Upload to Supabase Storage
    const filename = `${crypto.randomUUID()}.png`
    const storagePath = `${campaignId}/${sceneId}/${filename}`

    const { error: uploadError } = await serviceSupabase.storage
      .from('scene-art')
      .upload(storagePath, result.imageData, {
        contentType: 'image/png',
        upsert: false,
      })

    if (uploadError) {
      console.error('Scene art upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to save scene art' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = serviceSupabase.storage
      .from('scene-art')
      .getPublicUrl(storagePath)

    const imageUrl = urlData.publicUrl

    // Mark any existing scene images as not current
    await serviceSupabase
      .from('scene_images')
      .update({ is_current: false })
      .eq('scene_id', sceneId)

    // Build prompt for logging
    const prompt = `Scene: ${locationName}. ${sceneDescription}. Style: ${artStyle}${mood ? `. Mood: ${mood}` : ''}`

    // Insert new scene image record
    const { data: sceneImage, error: insertError } = await serviceSupabase
      .from('scene_images')
      .insert({
        scene_id: sceneId,
        campaign_id: campaignId,
        image_url: imageUrl,
        prompt,
        location_name: locationName,
        mood: mood || null,
        art_style: artStyle,
        generation_status: 'completed',
        is_current: true,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Scene image insert error:', insertError)
    }

    // Update scene's current image
    if (sceneImage) {
      await serviceSupabase
        .from('scenes')
        .update({ current_scene_image_id: sceneImage.id })
        .eq('id', sceneId)
    }

    // Store in artwork library for future reuse
    await storeArtworkInLibrary(
      serviceSupabase,
      imageUrl,
      {
        artStyle,
        assetType: 'scene',
        tags,
        environmentType: environmentType || undefined,
        mood: detectedMood || undefined,
      },
      prompt,
      sceneDescription,
      campaign.host_player_id
    )

    // Increment usage counter
    await incrementSceneArtUsage(serviceSupabase, campaign.host_player_id, campaignId)
    const updatedUsage = await checkSceneArtUsage(serviceSupabase, campaign.host_player_id, campaignId)

    return NextResponse.json({
      success: true,
      image_url: imageUrl,
      scene_image_id: sceneImage?.id,
      reused: false,
      usage: {
        used: updatedUsage.used,
        limit: updatedUsage.limit,
        remaining: updatedUsage.remaining,
      },
    })
  } catch (error) {
    console.error('Scene art generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
