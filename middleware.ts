import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // Set cookies in both request and response
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: This getUser() call will refresh the session if needed
  // It's critical for server components to receive valid session cookies
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // Debug logging
  console.log('[MIDDLEWARE]', request.nextUrl.pathname, {
    hasUser: !!user,
    userId: user?.id,
    error: authError?.message,
    cookies: request.cookies.getAll().map(c => c.name).filter(n => n.startsWith('sb-'))
  })

  // Protected routes - require authentication
  // Note: Lobby route handles its own auth, only protect game route in middleware
  const protectedServerRoutes = ['/campaign/[id]/game']
  const isProtectedRoute = protectedServerRoutes.some(route =>
    request.nextUrl.pathname.match(new RegExp(route.replace('[id]', '[^/]+')))
  )

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Admin routes - require admin role
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    // Check admin role (will implement after database schema)
    // For now, just block non-authenticated users
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
