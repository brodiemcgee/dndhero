/**
 * Sign Up API Route
 * Handles user registration with email verification
 */

import { createRouteClient as createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const SignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  birthdate: z.string().refine((date) => {
    const age = new Date().getFullYear() - new Date(date).getFullYear()
    return age >= 13
  }, 'You must be at least 13 years old'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validation = SignUpSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { email, password, username, birthdate } = validation.data

    const { client: supabase } = createClient(request)

    // Check if username is already taken
    const { data: existingUsername } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUsername) {
      return NextResponse.json(
        {
          error: 'Username already taken',
        },
        { status: 400 }
      )
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${request.headers.get('origin')}/api/auth/callback`,
        data: {
          username,
          birthdate,
        },
      },
    })

    if (authError) {
      return NextResponse.json(
        {
          error: authError.message,
        },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          error: 'Failed to create user',
        },
        { status: 500 }
      )
    }

    // Create profile (will be created in callback, but we can try here too)
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      email,
      username,
      birthdate,
      created_at: new Date().toISOString(),
    } as any)

    // Ignore profile error if it's a duplicate (callback will handle it)
    if (profileError && !profileError.message.includes('duplicate')) {
      console.error('Profile creation error:', profileError)
    }

    return NextResponse.json({
      success: true,
      message: 'Sign up successful! Please check your email to verify your account.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    })
  } catch (error) {
    console.error('Sign up error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
