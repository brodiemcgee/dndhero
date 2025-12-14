import Stripe from 'stripe'

// Lazy initialization to avoid errors during build
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY

    // Use placeholder during build to prevent build failures
    // The API routes will validate and return proper errors at runtime
    const key = secretKey || 'sk_test_placeholder_for_build'

    stripeInstance = new Stripe(key, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    })
  }
  return stripeInstance
}

// Stripe Product IDs (configure these in Stripe Dashboard)
export const STRIPE_PRODUCTS = {
  FREE: null, // Free tier doesn't need a product
  STANDARD: process.env.STRIPE_STANDARD_PRICE_ID || '',
  PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID || '',
}

// Credit pack price IDs
export const STRIPE_CREDIT_PACKS = {
  SMALL: process.env.STRIPE_CREDITS_100_PRICE_ID || '',
  MEDIUM: process.env.STRIPE_CREDITS_500_PRICE_ID || '',
  LARGE: process.env.STRIPE_CREDITS_1500_PRICE_ID || '',
}

export const TIER_LIMITS = {
  free: {
    max_campaigns_per_month: 2,
    max_ai_turns_per_month: 150,
    max_content_jobs_per_month: 0,
  },
  standard: {
    max_campaigns_per_month: -1, // Unlimited
    max_ai_turns_per_month: 500,
    max_content_jobs_per_month: 10,
  },
  premium: {
    max_campaigns_per_month: -1, // Unlimited
    max_ai_turns_per_month: 1500,
    max_content_jobs_per_month: 50,
  },
}
