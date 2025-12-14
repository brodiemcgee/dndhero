# Authentication Fixes - Code Snippets

## Critical Fix #1: Auth Callback Route Cookie Handling

### File: `/app/api/auth/callback/route.ts`

**BEFORE (BROKEN):**
```typescript
/**
 * Supabase Auth Callback Route
 * Handles OAuth and email verification callbacks
 */

import { createRouteClient as createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const cookieStore = cookies()
    // ❌ PROBLEM: Only destructures 'client', ignores getCookiesToSet
    const { client: supabase } = createClient(request)

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

    // ❌ CRITICAL BUG: Redirect without setting cookies
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
}
```

**AFTER (FIXED):**
```typescript
/**
 * Supabase Auth Callback Route
 * Handles OAuth and email verification callbacks
 */

import { createRouteClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    // ✅ FIX: Extract both client and getCookiesToSet
    const { client: supabase, getCookiesToSet } = createRouteClient(request)

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

    // ✅ FIX: Create response object and set cookies before returning
    const response = NextResponse.redirect(new URL(next, requestUrl.origin))

    // ✅ FIX: Extract accumulated cookies and set them in response
    const cookiesToSet = getCookiesToSet()
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    return response
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
}
```

**What Changed:**
1. Line 11: Changed `const { client: supabase } = createClient(request)` 
   to `const { client: supabase, getCookiesToSet } = createRouteClient(request)`
2. Added lines 56-61: Extract and set cookies in response
3. Removed unused `cookies` import

---

## Fix #2: Auth Signup Route (May Also Need Fixing)

### File: `/app/api/auth/signup/route.ts`

**POTENTIAL ISSUE:**
```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json()
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

    // ⚠️ This uses createRouteClient but ONLY destructures client
    const { client: supabase } = createClient(request)

    // ... validation and signup logic ...

    // ❌ MISSING: getCookiesToSet extraction and cookie setting
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
```

**RECOMMENDED FIX:**
```typescript
const { client: supabase, getCookiesToSet } = createClient(request)

// ... existing signup logic ...

const response = NextResponse.json({
  success: true,
  message: 'Sign up successful! Please check your email to verify your account.',
  user: {
    id: authData.user.id,
    email: authData.user.email,
  },
})

// Set any cookies that may have been created
const cookiesToSet = getCookiesToSet()
cookiesToSet.forEach(({ name, value, options }) => {
  response.cookies.set(name, value, options)
})

return response
```

---

## Secondary Fix #1: Middleware - Add Lobby Protection

### File: `/middleware.ts`

**BEFORE:**
```typescript
// Only protects game route, not lobby
const protectedServerRoutes = ['/campaign/[id]/game']
```

**AFTER (OPTIONAL - ADDED PROTECTION):**
```typescript
// Protect both game and lobby routes
const protectedServerRoutes = [
  '/campaign/[id]/game',
  '/campaign/[id]/lobby', // ✅ Add this line for defense-in-depth
]
```

**Why This Helps:**
- Even if callback fix is applied, middleware provides backup protection
- Lobby will redirect to login if session is missing
- More consistent auth pattern across protected routes

---

## Secondary Fix #2: Dashboard Consistency

### File: `/app/dashboard/page.tsx`

**BEFORE (Client Component with AuthGuard):**
```typescript
'use client'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCampaigns = async () => {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return // Silently fails

      // Fetch campaigns...
    }

    fetchCampaigns()
  }, [])

  return (
    <AuthGuard> {/* Separate auth check */}
      {/* Dashboard content */}
    </AuthGuard>
  )
}
```

**Issue**: Double-checks auth (client + AuthGuard component), inconsistent with server components

**AFTER (Server Component):**
```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

async function DashboardContent() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user's campaigns
  const { data: memberships } = await supabase
    .from('campaign_members')
    .select(
      `
      campaign_id,
      role,
      campaigns (
        id,
        name,
        setting,
        mode,
        state,
        created_at
      )
    `
    )
    .eq('user_id', user.id)
    .eq('active', true)

  // ... rest of data fetching ...

  return (
    // Render dashboard with campaigns
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
```

**Benefits:**
- Consistent with lobby and game routes (all server components)
- Single auth check point (no duplicate AuthGuard)
- Better performance (data fetched on server)
- Clearer auth boundaries

---

## Testing the Fixes

### Manual Testing Checklist

1. **Test Auth Callback**
   ```bash
   # Check browser DevTools while logging in
   # Application -> Cookies -> Look for sb-*-auth-token
   
   # After callback, should see:
   # - sb-{PROJECT_ID}-auth-token
   # - sb-{PROJECT_ID}-auth-token-code-verifier
   ```

2. **Test Session Persistence**
   ```bash
   # 1. Log in
   # 2. Verify cookies are set
   # 3. Navigate to /campaign/[id]/lobby
   # 4. Verify page renders (not redirected)
   # 5. Refresh page
   # 6. Verify still on lobby (session persisted)
   ```

3. **Test Protected Routes**
   ```bash
   # 1. Log out and clear cookies
   # 2. Try to access /campaign/123/lobby
   # 3. Should redirect to /auth/login
   # 4. Log in
   # 5. Should redirect to /dashboard or next param
   ```

### Browser Console Debugging

```javascript
// Check for auth cookies
document.cookie.split(';').filter(c => c.includes('auth'))

// Check Supabase session in browser
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)

// Check if cookies are being sent
fetch('/api/campaign/create', {
  method: 'POST',
  body: JSON.stringify({ /* data */ }),
  credentials: 'include' // Important for cookies
})
```

---

## Implementation Order

1. **CRITICAL (Do First)**: Apply Fix #1 to `/api/auth/callback/route.ts`
2. **IMPORTANT (Do Second)**: Check and apply Fix #1b to `/api/auth/signup/route.ts`
3. **RECOMMENDED (Do Third)**: Apply Secondary Fix #1 to `/middleware.ts`
4. **OPTIONAL (Do Last)**: Apply Secondary Fix #2 to `/app/dashboard/page.tsx` for consistency

After each fix, test the authentication flow in development before deploying.

---

## Common Errors After Implementation

### Error: "getUser() returns null on protected routes"
**Cause**: Cookies not being set in callback response
**Fix**: Verify getCookiesToSet() is called and cookies are set before redirect

### Error: "Cannot read property 'getAll' of undefined"
**Cause**: createRouteClient not properly imported
**Fix**: Ensure you're using the correct import:
```typescript
import { createRouteClient } from '@/lib/supabase/server'
```

### Error: "Cookies are cleared after redirect"
**Cause**: Response not returned properly from callback
**Fix**: Verify the response object is created before setting cookies:
```typescript
const response = NextResponse.redirect(...)
// Set cookies
const cookiesToSet = getCookiesToSet()
cookiesToSet.forEach(({ name, value, options }) => {
  response.cookies.set(name, value, options)
})
return response // Must return the response with cookies
```

---

## Summary

The critical fix is straightforward:
1. Extract `getCookiesToSet` from `createRouteClient`
2. Create a response object
3. Call `getCookiesToSet()` to get accumulated cookies
4. Loop through and set each cookie in the response
5. Return the response

This pattern is already proven to work in `/api/campaign/create/route.ts`, just needs to be applied to the auth callback route.

