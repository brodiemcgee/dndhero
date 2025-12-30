/**
 * Avatar Upload API Route
 * POST: Upload a custom avatar image for user profile
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp']

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

    const serviceSupabase = createServiceClient()

    // Get current profile to check for existing avatar
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()

    // Delete old avatar if exists
    if (profile?.avatar_url) {
      try {
        // Extract path from URL
        const url = new URL(profile.avatar_url)
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/avatars\/(.+)/)
        if (pathMatch) {
          const oldPath = pathMatch[1]
          await serviceSupabase.storage.from('avatars').remove([oldPath])
        }
      } catch (e) {
        // Ignore errors when deleting old avatar
        console.warn('Failed to delete old avatar:', e)
      }
    }

    // Upload new avatar to Supabase Storage
    const filename = `avatar-${Date.now()}.${ext}`
    const storagePath = `${user.id}/${filename}`

    const { error: uploadError } = await serviceSupabase.storage
      .from('avatars')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Avatar upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload avatar' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = serviceSupabase.storage
      .from('avatars')
      .getPublicUrl(storagePath)

    const avatarUrl = urlData.publicUrl

    // Update profile with new avatar URL
    const { error: updateError } = await serviceSupabase
      .from('profiles')
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      avatar_url: avatarUrl,
    })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
