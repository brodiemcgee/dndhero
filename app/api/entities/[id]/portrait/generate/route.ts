/**
 * Entity Portrait Generation API Route
 * POST: Generate an AI portrait for an NPC or monster using Google Imagen
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isValidArtStyle, DEFAULT_ART_STYLE, type ArtStyle } from '@/lib/ai-dm/art-styles'
import { buildNpcPortraitPrompt } from '@/lib/ai-dm/npc-portrait-prompt'
import { checkNpcPortraitUsage, incrementNpcPortraitUsage } from '@/lib/quotas/scene-art-usage'
import {
  findExactArtworkMatch,
  storeArtworkInLibrary,
  parseNpcToTags,
} from '@/lib/artwork/artwork-matcher'

const GeneratePortraitSchema = z.object({
  campaignId: z.string().uuid(),
})

// Imagen API config
const IMAGEN_MODEL = 'imagen-4.0-generate-001'
const IMAGEN_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const entityId = params.id
    const body = await request.json()

    // Validate input
    const validation = GeneratePortraitSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { campaignId } = validation.data
    const { client: supabase } = createClient(request)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()

    // Get entity with campaign details
    const { data: entity, error: entityError } = await serviceSupabase
      .from('entities')
      .select(`
        id,
        name,
        type,
        portrait_url,
        stat_block,
        campaign_id,
        campaigns (
          art_style,
          host_player_id,
          setting
        )
      `)
      .eq('id', entityId)
      .single()

    if (entityError || !entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 })
    }

    // Verify user is in the campaign
    const { data: membership } = await supabase
      .from('campaign_players')
      .select('id')
      .eq('campaign_id', entity.campaign_id)
      .eq('player_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this campaign' },
        { status: 403 }
      )
    }

    const campaign = entity.campaigns as {
      art_style?: string
      host_player_id: string
      setting?: string
    } | null

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const artStyle: ArtStyle = isValidArtStyle(campaign.art_style)
      ? campaign.art_style
      : DEFAULT_ART_STYLE

    // Check usage limits (use host's quota)
    const usage = await checkNpcPortraitUsage(serviceSupabase, campaign.host_player_id, entity.campaign_id)

    if (!usage.canGenerate) {
      return NextResponse.json(
        {
          error: 'NPC portrait generation limit reached for this month',
          code: 'NPC_PORTRAIT_LIMIT_REACHED',
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

    // Get entity description from stat_block
    const statBlock = entity.stat_block as { description?: string } | null
    const description = statBlock?.description || ''
    const entityType = entity.type as 'npc' | 'monster'

    // Try to find existing artwork in library
    const { tags, creatureType, creatureSubtype } = parseNpcToTags(entity.name, entityType, description)

    const existingMatch = await findExactArtworkMatch(serviceSupabase, {
      artStyle,
      assetType: entityType === 'monster' ? 'monster_portrait' : 'npc_portrait',
      tags,
      creatureType: creatureType || undefined,
      creatureSubtype: creatureSubtype || undefined,
    })

    if (existingMatch && existingMatch.matchScore === 100) {
      // Reuse existing artwork - no API call needed!
      await serviceSupabase
        .from('entities')
        .update({
          portrait_url: existingMatch.imageUrl,
          portrait_generation_status: 'completed',
        })
        .eq('id', entityId)

      return NextResponse.json({
        success: true,
        portrait_url: existingMatch.imageUrl,
        reused: true,
        usage: {
          used: usage.used,
          limit: usage.limit,
          remaining: usage.remaining,
        },
      })
    }

    // No match found - generate new artwork
    const prompt = buildNpcPortraitPrompt({
      name: entity.name,
      type: entityType,
      description,
      artStyle,
      campaignSetting: campaign.setting,
    })

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Image generation not configured' },
        { status: 500 }
      )
    }

    // Update status to generating
    await serviceSupabase
      .from('entities')
      .update({ portrait_generation_status: 'generating' })
      .eq('id', entityId)

    // Generate image with Imagen
    const response = await fetch(
      `${IMAGEN_API_ENDPOINT}/${IMAGEN_MODEL}:generateImages?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '1:1', // Square for portraits
            personGeneration: 'allow_adult',
            safetySetting: 'block_low_and_above',
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Imagen API error:', errorData)

      await serviceSupabase
        .from('entities')
        .update({ portrait_generation_status: 'failed' })
        .eq('id', entityId)

      return NextResponse.json(
        { error: 'Failed to generate portrait' },
        { status: 500 }
      )
    }

    const data = await response.json()
    if (!data.predictions || data.predictions.length === 0) {
      await serviceSupabase
        .from('entities')
        .update({ portrait_generation_status: 'failed' })
        .eq('id', entityId)

      return NextResponse.json({ error: 'No image generated' }, { status: 500 })
    }

    const base64Image = data.predictions[0].bytesBase64Encoded
    if (!base64Image) {
      await serviceSupabase
        .from('entities')
        .update({ portrait_generation_status: 'failed' })
        .eq('id', entityId)

      return NextResponse.json({ error: 'No image data in response' }, { status: 500 })
    }

    // Upload to Supabase Storage
    const imageBuffer = Buffer.from(base64Image, 'base64')
    const filename = `${crypto.randomUUID()}.png`
    const storagePath = `npc/${entity.campaign_id}/${entityId}/${filename}`

    const { error: uploadError } = await serviceSupabase.storage
      .from('portraits')
      .upload(storagePath, imageBuffer, {
        contentType: 'image/png',
        upsert: false,
      })

    if (uploadError) {
      console.error('Portrait upload error:', uploadError)

      await serviceSupabase
        .from('entities')
        .update({ portrait_generation_status: 'failed' })
        .eq('id', entityId)

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
    const { data: asset } = await serviceSupabase
      .from('assets')
      .insert({
        type: 'portrait',
        name: `${entity.name} Portrait`,
        description: `AI-generated portrait for ${entity.name}`,
        url: portraitUrl,
        style_tags: ['ai-generated', 'npc-portrait', entityType],
        metadata: {
          entityId: entity.id,
          campaignId: entity.campaign_id,
          generatedAt: new Date().toISOString(),
          model: IMAGEN_MODEL,
        },
        is_library: false,
        created_by: campaign.host_player_id,
      })
      .select('id')
      .single()

    // Update entity with portrait URL
    await serviceSupabase
      .from('entities')
      .update({
        portrait_url: portraitUrl,
        portrait_asset_id: asset?.id,
        portrait_generation_status: 'completed',
      })
      .eq('id', entityId)

    // Store in artwork library for future reuse
    await storeArtworkInLibrary(
      serviceSupabase,
      portraitUrl,
      {
        artStyle,
        assetType: entityType === 'monster' ? 'monster_portrait' : 'npc_portrait',
        tags,
        creatureType: creatureType || undefined,
        creatureSubtype: creatureSubtype || undefined,
      },
      prompt,
      description,
      campaign.host_player_id
    )

    // Increment usage counter
    await incrementNpcPortraitUsage(serviceSupabase, campaign.host_player_id, entity.campaign_id)
    const updatedUsage = await checkNpcPortraitUsage(serviceSupabase, campaign.host_player_id, entity.campaign_id)

    return NextResponse.json({
      success: true,
      portrait_url: portraitUrl,
      asset_id: asset?.id,
      reused: false,
      usage: {
        used: updatedUsage.used,
        limit: updatedUsage.limit,
        remaining: updatedUsage.remaining,
      },
    })
  } catch (error) {
    console.error('Entity portrait generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
