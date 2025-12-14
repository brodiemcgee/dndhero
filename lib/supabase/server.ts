import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Next.js cookies() already returns decoded cookies
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// For API routes - reads and writes cookies properly
export function createRouteClient(request: Request, response?: Response) {
  const parseCookies = () => {
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) return []

    return cookieHeader.split(';').map(cookie => {
      const [name, ...valueParts] = cookie.trim().split('=')
      const value = valueParts.join('=')
      return {
        name: name.trim(),
        value: decodeURIComponent(value) // Decode URL-encoded cookie values
      }
    }).filter(cookie => cookie.name)
  }

  // Store cookies that need to be set in the response
  const cookiesToSet: { name: string; value: string; options: CookieOptions }[] = []

  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookies = parseCookies()
          return cookies.find(cookie => cookie.name === name)?.value
        },
        getAll() {
          return parseCookies()
        },
        setAll(cookies: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.push(...cookies)
        },
      },
    }
  )

  return {
    client,
    getCookiesToSet: () => cookiesToSet
  }
}

// Service role client for admin operations (server-side only)
export function createServiceClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    }
  )
}
