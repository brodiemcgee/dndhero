/**
 * Portrait Usage Tracking
 * Handles checking and incrementing portrait generation usage limits
 */

import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Result from checking portrait usage limits
 */
export interface PortraitUsageResult {
  canGenerate: boolean
  used: number
  limit: number
  remaining: number
  tier: string
  periodStart: string
  periodEnd: string
}

/**
 * Check if user can generate a portrait and get usage stats
 * Uses the database function check_portrait_limit for consistency
 */
export async function checkPortraitUsage(
  supabase: SupabaseClient,
  userId: string
): Promise<PortraitUsageResult> {
  // Call the database function
  const { data, error } = await supabase.rpc('check_portrait_limit', {
    check_user_id: userId,
  })

  if (error) {
    console.error('Error checking portrait limit:', error)
    // Default to conservative limits on error
    return {
      canGenerate: false,
      used: 0,
      limit: 5,
      remaining: 0,
      tier: 'free',
      periodStart: new Date().toISOString(),
      periodEnd: new Date().toISOString(),
    }
  }

  // data is an array with single row from the function
  const result = Array.isArray(data) ? data[0] : data

  return {
    canGenerate: result.can_generate,
    used: result.current_usage,
    limit: result.max_allowed,
    remaining: result.remaining,
    tier: result.tier,
    periodStart: result.period_start,
    periodEnd: result.period_end,
  }
}

/**
 * Increment portrait usage after successful generation
 * Uses the database function increment_portrait_usage for atomic operation
 */
export async function incrementPortraitUsage(
  supabase: SupabaseClient,
  userId: string
): Promise<{ success: boolean; newCount: number }> {
  // Call the database function
  const { data, error } = await supabase.rpc('increment_portrait_usage', {
    p_user_id: userId,
  })

  if (error) {
    console.error('Error incrementing portrait usage:', error)
    return {
      success: false,
      newCount: -1,
    }
  }

  return {
    success: true,
    newCount: data || 0,
  }
}

/**
 * Get tier-specific portrait limits
 */
export function getPortraitLimits(tier: string): {
  monthly: number
  canUpload: boolean
} {
  switch (tier.toLowerCase()) {
    case 'premium':
    case 'paid':
      return {
        monthly: 25,
        canUpload: true,
      }
    case 'standard':
      return {
        monthly: 15,
        canUpload: true,
      }
    case 'free':
    default:
      return {
        monthly: 5,
        canUpload: true, // All users can upload
      }
  }
}

/**
 * Format usage for display
 */
export function formatPortraitUsage(usage: PortraitUsageResult): string {
  if (usage.limit === -1) {
    return `${usage.used} used (unlimited)`
  }
  return `${usage.used}/${usage.limit} used this month`
}

/**
 * Check if user is at their limit
 */
export function isAtPortraitLimit(usage: PortraitUsageResult): boolean {
  if (usage.limit === -1) return false // Unlimited
  return usage.used >= usage.limit
}
