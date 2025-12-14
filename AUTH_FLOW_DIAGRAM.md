# Authentication Flow Diagram

## Current (BROKEN) Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ USER AUTHENTICATION FLOW - CURRENT (BROKEN)                                 │
└─────────────────────────────────────────────────────────────────────────────┘

1. USER INITIATES LOGIN/SIGNUP
   └─> Browser sends credentials OR redirected to OAuth provider

2. SUPABASE PROCESSES AUTH
   └─> Creates session in Supabase backend
   └─> Generates auth tokens

3. BROWSER REDIRECTED TO /api/auth/callback?code=XXX
   ┌──────────────────────────────────────────────────────────┐
   │ /api/auth/callback/route.ts                              │
   │                                                          │
   │ const { client: supabase } = createRouteClient(request) │
   │ ❌ IGNORES getCookiesToSet return value               │
   │                                                          │
   │ await supabase.auth.exchangeCodeForSession(code)        │
   │ ✅ Successfully exchanges code for session             │
   │                                                          │
   │ const { data: { user } } = await supabase.auth.getUser()│
   │ ✅ Gets user data                                       │
   │                                                          │
   │ return NextResponse.redirect(new URL(next))             │
   │ ❌ MISSING: getCookiesToSet().forEach(...)             │
   │ ❌ MISSING: response.cookies.set(...)                  │
   └──────────────────────────────────────────────────────────┘
   
   ❌ CRITICAL: Auth cookies accumulated in createRouteClient
      but NEVER extracted and sent to browser

4. BROWSER RECEIVES REDIRECT (WITHOUT COOKIES)
   └─> Browser navigates to /dashboard or /campaign/[id]/lobby
   └─> NO AUTH COOKIES in subsequent request

5. MIDDLEWARE RUNS ON /campaign/[id]/lobby
   ┌──────────────────────────────────────────────────────────┐
   │ middleware.ts                                            │
   │                                                          │
   │ const supabase = createServerClient(...)               │
   │ const { data: { user } } = await supabase.auth.getUser()│
   │                                                          │
   │ if (!user && isProtectedRoute)                          │
   │   return NextResponse.redirect('/auth/login')          │
   │                                                          │
   │ Note: Lobby NOT in protectedServerRoutes               │
   │       So middleware doesn't redirect                    │
   └──────────────────────────────────────────────────────────┘
   └─> No cookies = getUser() returns null
   └─> Middleware passes request through (lobby not protected)

6. SERVER COMPONENT PROCESSES REQUEST
   ┌──────────────────────────────────────────────────────────┐
   │ /campaign/[id]/lobby/page.tsx                           │
   │                                                          │
   │ const supabase = await createClient()                   │
   │ const { data: { user } } = await supabase.auth.getUser()│
   │ ❌ No cookies = user is null                           │
   │                                                          │
   │ if (!user) {                                            │
   │   redirect('/auth/login')  ← USER REDIRECTED HERE     │
   │ }                                                        │
   └──────────────────────────────────────────────────────────┘

7. USER SEES LOGIN PAGE
   └─> Despite being authenticated in Supabase
   └─> Despite cookies missing from callback response


COOKIES JOURNEY (THE PROBLEM)
═════════════════════════════════════════════════════════════

Supabase SDK creates auth cookies:
  ┌─────────────────────┐
  │ exchangeCodeForSession()
  │   ↓
  │ SDK calls setAll()
  │   ↓
  │ Cookies accumulated in createRouteClient array
  │   ↓
  │ getCookiesToSet() available but NOT CALLED
  │   ↓
  │ NextResponse.redirect() sent WITHOUT cookies
  │   ↓
  │ ❌ Browser receives redirect, NOT cookies
  │   ↓
  │ ❌ Session lost immediately
  └─────────────────────┘
```

## Fixed Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ USER AUTHENTICATION FLOW - FIXED                                            │
└─────────────────────────────────────────────────────────────────────────────┘

1. USER INITIATES LOGIN/SIGNUP
   └─> Browser sends credentials OR redirected to OAuth provider

2. SUPABASE PROCESSES AUTH
   └─> Creates session in Supabase backend
   └─> Generates auth tokens

3. BROWSER REDIRECTED TO /api/auth/callback?code=XXX
   ┌──────────────────────────────────────────────────────────┐
   │ /api/auth/callback/route.ts (FIXED)                     │
   │                                                          │
   │ const { client: supabase, getCookiesToSet } =          │
   │   createRouteClient(request)                           │
   │ ✅ NOW captures getCookiesToSet                        │
   │                                                          │
   │ await supabase.auth.exchangeCodeForSession(code)        │
   │ ✅ Exchanges code for session                          │
   │                                                          │
   │ const { data: { user } } = await supabase.auth.getUser()│
   │ ✅ Gets user data                                       │
   │                                                          │
   │ const response = NextResponse.redirect(next)            │
   │ ✅ Creates response object                             │
   │                                                          │
   │ const cookiesToSet = getCookiesToSet()                  │
   │ ✅ Extracts accumulated cookies                        │
   │                                                          │
   │ cookiesToSet.forEach(({ name, value, options }) => {   │
   │   response.cookies.set(name, value, options)          │
   │ })                                                       │
   │ ✅ Sets all auth cookies in response                   │
   │                                                          │
   │ return response                                         │
   │ ✅ Returns response WITH cookies                       │
   └──────────────────────────────────────────────────────────┘
   
   ✅ CRITICAL: Auth cookies properly set in response

4. BROWSER RECEIVES REDIRECT WITH COOKIES
   └─> Browser navigates to /dashboard or /campaign/[id]/lobby
   └─> ✅ AUTH COOKIES included in subsequent request

5. MIDDLEWARE RUNS ON /campaign/[id]/lobby
   ┌──────────────────────────────────────────────────────────┐
   │ middleware.ts                                            │
   │                                                          │
   │ const supabase = createServerClient(...)               │
   │ ✅ Cookies available                                    │
   │                                                          │
   │ const { data: { user } } = await supabase.auth.getUser()│
   │ ✅ Returns valid user                                   │
   │                                                          │
   │ if (!user && isProtectedRoute)                          │
   │   return NextResponse.redirect('/auth/login')          │
   │                                                          │
   │ return supabaseResponse (with refreshed cookies)       │
   │ ✅ Middleware passes request through with updated auth │
   └──────────────────────────────────────────────────────────┘
   └─> ✅ User found, continues to server component

6. SERVER COMPONENT PROCESSES REQUEST
   ┌──────────────────────────────────────────────────────────┐
   │ /campaign/[id]/lobby/page.tsx                           │
   │                                                          │
   │ const supabase = await createClient()                   │
   │ ✅ Cookies available from request                      │
   │                                                          │
   │ const { data: { user } } = await supabase.auth.getUser()│
   │ ✅ user is valid                                        │
   │                                                          │
   │ if (!user) {                                            │
   │   redirect('/auth/login')                               │
   │ }                                                        │
   │                                                          │
   │ // Render campaign lobby page                          │
   │ return <CampaignLobby campaign={campaign} />          │
   │ ✅ PAGE RENDERS SUCCESSFULLY                           │
   └──────────────────────────────────────────────────────────┘

7. USER SEES CAMPAIGN LOBBY
   └─> Session properly established
   └─> Cookies correctly set in response and requests


COOKIES JOURNEY (FIXED)
═════════════════════════════════════════════════════════════

Supabase SDK creates auth cookies:
  ┌─────────────────────┐
  │ exchangeCodeForSession()
  │   ↓
  │ SDK calls setAll()
  │   ↓
  │ Cookies accumulated in createRouteClient array
  │   ↓
  │ getCookiesToSet() CALLED
  │   ↓
  │ Cookies extracted from array
  │   ↓
  │ response.cookies.set() called for each cookie
  │   ↓
  │ ✅ Browser receives redirect WITH cookies
  │   ↓
  │ ✅ Session maintained across requests
  │   ↓
  │ ✅ Subsequent getUser() calls succeed
  └─────────────────────┘
```

## Cookie Flow Comparison

```
BEFORE (BROKEN)
═══════════════════════════════════════════════════════════════

1. exchangeCodeForSession() → Supabase backend creates session
                               │
                               └─> SDK generates cookies
                                   │
                                   └─> setAll() called
                                       │
                                       └─> stored in array in createRouteClient
                                           │
                                           ❌ NEVER EXTRACTED
                                           │
                                           └─> Response sent without cookies
                                               │
                                               └─> Browser has no auth tokens
                                                   │
                                                   └─> getUser() fails on next request


AFTER (FIXED)
═══════════════════════════════════════════════════════════════

1. exchangeCodeForSession() → Supabase backend creates session
                               │
                               └─> SDK generates cookies
                                   │
                                   └─> setAll() called
                                       │
                                       └─> stored in array in createRouteClient
                                           │
                                           ✅ getCookiesToSet() called
                                           │
                                           └─> Cookies extracted
                                               │
                                               └─> response.cookies.set() for each
                                                   │
                                                   └─> ✅ Response sent WITH cookies
                                                       │
                                                       └─> ✅ Browser stores auth tokens
                                                           │
                                                           └─> ✅ getUser() succeeds on next request
```

## Cookie Names and Values

When authentication succeeds, Supabase creates these cookies:

```
Cookie: sb-{PROJECT_ID}-auth-token
├─ Contains: Access token + session data
├─ HttpOnly: Yes (secure)
├─ SameSite: Lax
└─ Max-Age: ~1 hour

Cookie: sb-{PROJECT_ID}-auth-token-code-verifier
├─ Contains: PKCE code verifier (OAuth security)
├─ HttpOnly: Yes (secure)
├─ SameSite: Lax
└─ Max-Age: ~1 hour
```

**Problem**: These cookies are created by Supabase SDK but never sent to the browser

**Solution**: Extract them and set them in the response via `response.cookies.set()`

## Session Validation Chain

### Working Path (with fix)
```
Browser Request
    ↓
Has auth cookies (from callback response)
    ↓
Middleware runs
    ↓
Supabase client reads cookies
    ↓
getUser() succeeds
    ↓
Server component gets valid user
    ↓
Page renders
```

### Broken Path (current)
```
Browser Request
    ↓
NO auth cookies (callback didn't set them)
    ↓
Middleware runs
    ↓
Supabase client reads no cookies
    ↓
getUser() returns null
    ↓
Server component detects no user
    ↓
redirect('/auth/login')
```

## Root Cause Summary

```
API Design:
  createRouteClient() returns { client, getCookiesToSet }
  ├─ client: Supabase client instance
  └─ getCookiesToSet: Function to extract cookies

Usage in /api/campaign/create/route.ts:
  const { client, getCookiesToSet } = createRouteClient(request)
  // ... do work ...
  const response = NextResponse.json({...})
  const cookiesToSet = getCookiesToSet()
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })
  return response
  ✅ CORRECT PATTERN

Usage in /api/auth/callback/route.ts:
  const { client: supabase } = createRouteClient(request)
  ❌ Doesn't capture getCookiesToSet
  // ... do work ...
  return NextResponse.redirect(new URL(next))
  ❌ No cookies set in response
  ❌ INCORRECT PATTERN (missing second part)
```

The fix is simple: Use the same pattern as the campaign creation route.
