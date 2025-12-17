/**
 * Portrait Usage API Route
 * GET: Get current user's portrait generation usage stats
 */

export const dynamic = 'force-dynamic'

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkPortraitUsage } from '@/lib/quotas/portrait-usage'

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
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get usage stats using service client (for RLS bypass)
    const serviceSupabase = createServiceClient()
    const usage = await checkPortraitUsage(serviceSupabase, user.id)

    return NextResponse.json({
      usage: {
        used: usage.used,
        limit: usage.limit,
        remaining: usage.remaining,
        canGenerate: usage.canGenerate,
        tier: usage.tier,
        periodStart: usage.periodStart,
        periodEnd: usage.periodEnd,
      },
    })
  } catch (error) {
    console.error('Portrait usage error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
