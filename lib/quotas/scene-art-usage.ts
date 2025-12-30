/**
 * Scene Art Usage Quota Management
 * Tracks and limits scene art generation per campaign per month
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface SceneArtUsageResult {
  canGenerate: boolean
  used: number
  limit: number
  remaining: number
  tier: string
}

/**
 * Get scene art generation limits based on subscription tier
 */
export function getSceneArtLimits(tier: string): { monthly: number } {
  switch (tier.toLowerCase()) {
    case 'premium':
    case 'paid':
    case 'pro':
      return { monthly: 50 }
    case 'standard':
      return { monthly: 25 }
    case 'free':
    default:
      return { monthly: 10 }
  }
}

/**
 * Get NPC portrait generation limits based on subscription tier
 */
export function getNpcPortraitLimits(tier: string): { monthly: number } {
  switch (tier.toLowerCase()) {
    case 'premium':
    case 'paid':
    case 'pro':
      return { monthly: 100 }
    case 'standard':
      return { monthly: 50 }
    case 'free':
    default:
      return { monthly: 15 }
  }
}

/**
 * Get current month in YYYY-MM format
 */
function getCurrentMonthYear(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Check scene art usage for a user's campaign
 */
export async function checkSceneArtUsage(
  supabase: SupabaseClient,
  userId: string,
  campaignId: string
): Promise<SceneArtUsageResult> {
  const monthYear = getCurrentMonthYear()

  // Get user's subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  const tier = profile?.subscription_tier || 'free'
  const limits = getSceneArtLimits(tier)

  // Get current usage
  const { data: usage } = await supabase
    .from('scene_art_usage')
    .select('usage_count')
    .eq('user_id', userId)
    .eq('campaign_id', campaignId)
    .eq('month_year', monthYear)
    .single()

  const used = usage?.usage_count || 0
  const remaining = Math.max(0, limits.monthly - used)

  return {
    canGenerate: used < limits.monthly,
    used,
    limit: limits.monthly,
    remaining,
    tier,
  }
}

/**
 * Increment scene art usage counter
 */
export async function incrementSceneArtUsage(
  supabase: SupabaseClient,
  userId: string,
  campaignId: string
): Promise<{ success: boolean; newCount: number }> {
  const monthYear = getCurrentMonthYear()

  // Upsert the usage record
  const { data, error } = await supabase
    .from('scene_art_usage')
    .upsert(
      {
        user_id: userId,
        campaign_id: campaignId,
        month_year: monthYear,
        usage_count: 1,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,campaign_id,month_year',
      }
    )
    .select('usage_count')
    .single()

  if (error) {
    // Try increment approach if upsert fails
    const { data: existing } = await supabase
      .from('scene_art_usage')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('campaign_id', campaignId)
      .eq('month_year', monthYear)
      .single()

    if (existing) {
      const newCount = existing.usage_count + 1
      await supabase
        .from('scene_art_usage')
        .update({ usage_count: newCount, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('campaign_id', campaignId)
        .eq('month_year', monthYear)

      return { success: true, newCount }
    }

    // Insert new record
    await supabase.from('scene_art_usage').insert({
      user_id: userId,
      campaign_id: campaignId,
      month_year: monthYear,
      usage_count: 1,
    })

    return { success: true, newCount: 1 }
  }

  return { success: true, newCount: data?.usage_count || 1 }
}

/**
 * Check NPC portrait usage for a user's campaign
 */
export async function checkNpcPortraitUsage(
  supabase: SupabaseClient,
  userId: string,
  campaignId: string
): Promise<SceneArtUsageResult> {
  const monthYear = getCurrentMonthYear()

  // Get user's subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  const tier = profile?.subscription_tier || 'free'
  const limits = getNpcPortraitLimits(tier)

  // Get current usage
  const { data: usage } = await supabase
    .from('npc_portrait_usage')
    .select('usage_count')
    .eq('user_id', userId)
    .eq('campaign_id', campaignId)
    .eq('month_year', monthYear)
    .single()

  const used = usage?.usage_count || 0
  const remaining = Math.max(0, limits.monthly - used)

  return {
    canGenerate: used < limits.monthly,
    used,
    limit: limits.monthly,
    remaining,
    tier,
  }
}

/**
 * Increment NPC portrait usage counter
 */
export async function incrementNpcPortraitUsage(
  supabase: SupabaseClient,
  userId: string,
  campaignId: string
): Promise<{ success: boolean; newCount: number }> {
  const monthYear = getCurrentMonthYear()

  // Upsert the usage record
  const { data, error } = await supabase
    .from('npc_portrait_usage')
    .upsert(
      {
        user_id: userId,
        campaign_id: campaignId,
        month_year: monthYear,
        usage_count: 1,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,campaign_id,month_year',
      }
    )
    .select('usage_count')
    .single()

  if (error) {
    // Try increment approach if upsert fails
    const { data: existing } = await supabase
      .from('npc_portrait_usage')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('campaign_id', campaignId)
      .eq('month_year', monthYear)
      .single()

    if (existing) {
      const newCount = existing.usage_count + 1
      await supabase
        .from('npc_portrait_usage')
        .update({ usage_count: newCount, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('campaign_id', campaignId)
        .eq('month_year', monthYear)

      return { success: true, newCount }
    }

    // Insert new record
    await supabase.from('npc_portrait_usage').insert({
      user_id: userId,
      campaign_id: campaignId,
      month_year: monthYear,
      usage_count: 1,
    })

    return { success: true, newCount: 1 }
  }

  return { success: true, newCount: data?.usage_count || 1 }
}
