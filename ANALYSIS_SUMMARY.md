# Authentication Analysis - Quick Reference Guide

## The Problem in One Sentence
Auth callback route doesn't set session cookies in the response, so authenticated users are immediately redirected to login when accessing protected routes.

## Root Cause
`/api/auth/callback/route.ts` calls `exchangeCodeForSession()` successfully but fails to extract and set the resulting cookies in the HTTP response.

## The Bug in Code

```typescript
// WRONG - Current implementation
const { client: supabase } = createClient(request)  // ❌ Drops getCookiesToSet
await supabase.auth.exchangeCodeForSession(code)    // ✅ Creates cookies
return NextResponse.redirect(...)                    // ❌ Doesn't send cookies

// RIGHT - What it should be
const { client: supabase, getCookiesToSet } = createClient(request)  // ✅ Captures function
await supabase.auth.exchangeCodeForSession(code)                      // ✅ Creates cookies
const response = NextResponse.redirect(...)                            // ✅ Creates response
const cookiesToSet = getCookiesToSet()                                 // ✅ Extracts cookies
cookiesToSet.forEach(({ name, value, options }) => {                  // ✅ Sets each cookie
  response.cookies.set(name, value, options)
})
return response                                                         // ✅ Returns with cookies
```

## Impact
- Users complete authentication successfully in Supabase
- Browser redirects to `/dashboard` or `/campaign/[id]/lobby`
- No auth cookies sent with request
- Server component calls `getUser()` with empty session
- User gets redirected to `/auth/login`
- Session is lost despite successful authentication

## Affected Files

| File | Status | Issue |
|------|--------|-------|
| `/api/auth/callback/route.ts` | Critical | Missing cookie response setup |
| `/api/auth/signup/route.ts` | Important | Likely same issue |
| `/api/campaign/create/route.ts` | Good Reference | Shows correct pattern |
| `/campaign/[id]/lobby/page.tsx` | Correct Logic | Receives null user due to missing cookies |
| `/campaign/[id]/game/page.tsx` | Correct Logic | Receives null user due to missing cookies |
| `middleware.ts` | Good | Properly sets cookies but doesn't protect lobby |
| `/dashboard/page.tsx` | Inconsistent | Uses client component when should use server |

## The Fix (3 Lines of Code)

```typescript
// After exchangeCodeForSession() succeeds:
const response = NextResponse.redirect(new URL(next, requestUrl.origin))
const cookiesToSet = getCookiesToSet()
cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
return response // Return the response WITH cookies
```

## How the Bug Happens

1. User completes OAuth or email auth
2. Browser calls `/api/auth/callback?code=XXX`
3. Supabase SDK exchanges code for session
4. SDK's `setAll()` accumulates cookies in an array
5. `createRouteClient()` stores them for later
6. But the callback route **never asks for them** (`getCookiesToSet` not called)
7. Response sent without cookies
8. Browser has no auth tokens
9. Next request to protected route has empty session
10. User redirected to login

## Authentication Flow

```
Login Form
    ↓
OAuth Provider / Email Verification
    ↓
/api/auth/callback?code=XXX
    ├─ exchangeCodeForSession() ✅
    ├─ getCookiesToSet() ❌ NOT CALLED
    └─ response.cookies.set() ❌ NOT CALLED
    ↓
Browser redirect WITHOUT cookies
    ↓
/campaign/[id]/lobby
    ├─ Request has NO auth cookies
    └─ getUser() returns null
    ↓
Middleware/Server Component
    └─ redirect('/auth/login') ❌
```

## Session Cookies Generated

When `exchangeCodeForSession()` succeeds, Supabase creates:

```
sb-{PROJECT_ID}-auth-token
├─ Contains: Access token + session data
├─ Expires: ~1 hour
└─ HttpOnly: Yes (secure)

sb-{PROJECT_ID}-auth-token-code-verifier
├─ Contains: PKCE verification code
├─ Expires: ~1 hour
└─ HttpOnly: Yes (secure)
```

These cookies are created but **never sent to the browser** in the callback response.

## Verification Steps

1. Open browser DevTools while logging in
2. Go to Application → Cookies
3. Look for cookies starting with `sb-`
4. **Before fix**: Cookies NOT present after callback
5. **After fix**: Cookies present after callback
6. Navigate to `/campaign/[id]/lobby`
7. **Before fix**: Redirected to login
8. **After fix**: Page renders normally

## The Working Example

This pattern WORKS in `/api/campaign/create/route.ts`:

```typescript
const { client: supabase, getCookiesToSet } = createRouteClient(request)
// ... do work ...
const response = NextResponse.json({ campaign })

// ✅ This is what callback route NEEDS
const cookiesToSet = getCookiesToSet()
cookiesToSet.forEach(({ name, value, options }) => {
  response.cookies.set(name, value, options)
})

return response
```

Just copy this pattern into the callback route!

## Files to Read

1. **Primary Analysis**: `AUTH_ANALYSIS.md` (comprehensive technical breakdown)
2. **Visual Guide**: `AUTH_FLOW_DIAGRAM.md` (flow charts and diagrams)
3. **Code Changes**: `FIXES_CODE_SNIPPETS.md` (exact code before/after)

## Quick Facts

- **Framework**: Next.js 14 with App Router
- **Auth**: Supabase with SSR cookie handling
- **Bug Type**: Missing response header integration
- **Severity**: Critical - breaks entire auth flow
- **Lines to Change**: ~4 lines in callback route
- **Time to Fix**: 5 minutes
- **Testing Time**: 5 minutes

## Why It Went Unnoticed

1. Callback route runs correctly - `exchangeCodeForSession()` works
2. Error isn't in the callback - it's in the response
3. User sees a valid redirect (not an error page)
4. Problem only manifests at next request
5. Developer might think redirect is working "as intended"

## Related Files for Context

```
lib/supabase/
├─ client.ts          ✅ Browser client (correct)
├─ server.ts          ✅ Server component client (correct)
└─ server.ts:createRouteClient  ⚠️ API route client (design good, not used properly)

middleware.ts         ✅ Middleware (correct, but incomplete)

app/api/auth/
├─ callback/route.ts  ❌ CRITICAL BUG
└─ signup/route.ts    ⚠️ Possibly same issue

app/campaign/[id]/
├─ lobby/page.tsx     ⚠️ Correct logic, wrong session
└─ game/page.tsx      ⚠️ Correct logic, wrong session
```

## Next Steps

1. Read `AUTH_ANALYSIS.md` for full context
2. Review `AUTH_FLOW_DIAGRAM.md` to understand the flow
3. Apply the fix from `FIXES_CODE_SNIPPETS.md`
4. Test in development environment
5. Verify cookies are set in browser DevTools
6. Deploy with confidence

---

**Generated**: Analysis of dndhero authentication system
**Issue**: Users redirected to login despite successful authentication
**Root Cause**: Missing cookie response setup in auth callback
**Severity**: Critical
**Fix Complexity**: Simple (4 lines of code)
