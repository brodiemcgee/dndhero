/**
 * Portrait Upload API Route
 * POST: Upload a custom portrait image for a character
 * Uploads are free and don't count against generation limits
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp']

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

    // Get character and verify ownership
    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, user_id, name, portrait_url, portrait_asset_id')
      .eq('id', characterId)
      .single()

    if (charError || !character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      )
    }

    if (character.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not own this character' },
        { status: 403 }
      )
    }

    // Parse the multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: PNG, JPEG, WebP' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Determine file extension
    const ext = file.type === 'image/png' ? 'png'
              : file.type === 'image/jpeg' ? 'jpg'
              : 'webp'

    // Upload to Supabase Storage
    const serviceSupabase = createServiceClient()
    const filename = `${crypto.randomUUID()}.${ext}`
    const storagePath = `${user.id}/${characterId}/${filename}`

    const { error: uploadError } = await serviceSupabase.storage
      .from('portraits')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Portrait upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload portrait' },
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
        name: `${character.name} Portrait (Uploaded)`,
        description: `User-uploaded portrait for ${character.name}`,
        url: portraitUrl,
        style_tags: ['user-uploaded', 'character-portrait'],
        metadata: {
          characterId: character.id,
          uploadedAt: new Date().toISOString(),
          originalFilename: file.name,
          mimeType: file.type,
          fileSize: file.size,
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

    return NextResponse.json({
      success: true,
      portrait_url: portraitUrl,
      asset_id: asset?.id,
    })
  } catch (error) {
    console.error('Portrait upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
