/**
 * Supabase Auth Callback Route
 * Handles OAuth and email verification callbacks
 */

import { createRouteClient as createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const { client: supabase, getCookiesToSet } = createClient(request)

    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      )
    }

    // Get user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Check if profile exists, create if not
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!profile) {
        // Create profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email!,
          username: user.email!.split('@')[0], // Default username from email
          created_at: new Date().toISOString(),
        } as any)

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }
      }
    }

    // Create redirect response and set auth cookies
    const response = NextResponse.redirect(new URL(next, requestUrl.origin))

    const cookiesToSet = getCookiesToSet()
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    return response
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
}
