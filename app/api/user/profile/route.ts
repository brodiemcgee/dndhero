/**
 * User Profile API Route
 * Get and update user profile information
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sanitizeLinesVeilsSettings } from '@/lib/safety'

// Schema for lines_veils settings
const LinesVeilsSchema = z.object({
  topics: z.record(z.enum(['line', 'veil', 'ok'])).optional(),
  custom_lines: z.array(z.string().max(100)).max(20).optional(),
  custom_veils: z.array(z.string().max(100)).max(20).optional(),
}).optional()

const UpdateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters').optional(),
  avatar_url: z.string().url().optional().nullable(),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional().nullable(),
  interests: z.array(z.string()).optional(),
  adult_content_opt_in: z.boolean().optional(),
  lines_veils: LinesVeilsSchema,
})

const DeleteAccountSchema = z.object({
  confirm: z.literal('DELETE MY ACCOUNT', {
    errorMap: () => ({ message: 'You must type "DELETE MY ACCOUNT" to confirm' }),
  }),
})

/**
 * GET /api/user/profile
 * Get current user's profile
 */
export async function GET(request: Request) {
  try {
    const { client: supabase } = createClient(request)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        {
          error: 'Profile not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      profile,
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/user/profile
 * Update current user's profile
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validation = UpdateProfileSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { client: supabase } = createClient(request)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const updates = { ...validation.data }

    // Sanitize lines_veils if provided
    if (updates.lines_veils) {
      updates.lines_veils = sanitizeLinesVeilsSettings(updates.lines_veils)
    }

    // If enabling adult content, verify user is 18+
    if (updates.adult_content_opt_in === true) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('birthdate')
        .eq('id', user.id)
        .single()

      if (profile?.birthdate) {
        const birthDate = new Date(profile.birthdate)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }

        if (age < 18) {
          return NextResponse.json(
            {
              error: 'You must be 18 or older to enable adult content',
            },
            { status: 403 }
          )
        }
      }
    }

    // If username is being updated, check if it's available
    if (updates.username) {
      const { data: existingUsername } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', updates.username)
        .neq('id', user.id)
        .single()

      if (existingUsername) {
        return NextResponse.json(
          {
            error: 'Username already taken',
          },
          { status: 400 }
        )
      }
    }

    // Update profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        {
          error: updateError.message,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      profile: updatedProfile,
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/user/profile
 * Delete current user's account permanently
 */
export async function DELETE(request: Request) {
  try {
    const body = await request.json()

    // Validate confirmation
    const validation = DeleteAccountSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { client: supabase } = createClient(request)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const serviceSupabase = createServiceClient()

    // Delete user's avatar from storage
    try {
      const { data: files } = await serviceSupabase.storage
        .from('avatars')
        .list(user.id)

      if (files && files.length > 0) {
        const filePaths = files.map(f => `${user.id}/${f.name}`)
        await serviceSupabase.storage.from('avatars').remove(filePaths)
      }
    } catch (e) {
      console.warn('Failed to delete avatar files:', e)
    }

    // Delete user's portrait files from storage
    try {
      const { data: files } = await serviceSupabase.storage
        .from('portraits')
        .list(user.id)

      if (files && files.length > 0) {
        // portraits are in subdirectories by characterId
        for (const folder of files) {
          if (folder.id) continue // Skip if it's a file, not a folder
          const { data: subFiles } = await serviceSupabase.storage
            .from('portraits')
            .list(`${user.id}/${folder.name}`)

          if (subFiles && subFiles.length > 0) {
            const subFilePaths = subFiles.map(f => `${user.id}/${folder.name}/${f.name}`)
            await serviceSupabase.storage.from('portraits').remove(subFilePaths)
          }
        }
      }
    } catch (e) {
      console.warn('Failed to delete portrait files:', e)
    }

    // Delete user's characters (this will cascade to related records)
    const { error: charError } = await serviceSupabase
      .from('characters')
      .delete()
      .eq('user_id', user.id)

    if (charError) {
      console.warn('Failed to delete characters:', charError)
    }

    // Delete user's campaigns where they are the host
    const { error: campError } = await serviceSupabase
      .from('campaigns')
      .delete()
      .eq('host_id', user.id)

    if (campError) {
      console.warn('Failed to delete campaigns:', campError)
    }

    // Delete the profile (this will cascade to other records)
    const { error: profileError } = await serviceSupabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (profileError) {
      console.error('Failed to delete profile:', profileError)
      return NextResponse.json(
        {
          error: 'Failed to delete account',
        },
        { status: 500 }
      )
    }

    // Delete the auth user
    const { error: deleteUserError } = await serviceSupabase.auth.admin.deleteUser(user.id)

    if (deleteUserError) {
      console.error('Failed to delete auth user:', deleteUserError)
      return NextResponse.json(
        {
          error: 'Failed to delete account',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
