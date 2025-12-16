/**
 * User Profile API Route
 * Get and update user profile information
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const UpdateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  avatar_url: z.string().url().optional().nullable(),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional().nullable(),
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

    const updates = validation.data

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
