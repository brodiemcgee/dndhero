/**
 * Create Stripe Checkout Session
 * For subscriptions and credit purchases
 */

import { createRouteClient as createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getStripe, STRIPE_PRODUCTS, STRIPE_CREDIT_PACKS } from '@/lib/stripe/client'
import { z } from 'zod'

const CheckoutSchema = z.object({
  type: z.enum(['subscription', 'credits']),
  tier: z.enum(['standard', 'premium']).optional(),
  creditPack: z.enum(['small', 'medium', 'large']).optional(),
})

export async function POST(request: Request) {
  try {
    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          error: 'Payment system is not configured. Please contact support.',
        },
        { status: 503 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = CheckoutSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { type, tier, creditPack } = validation.data

    const { client: supabase } = createClient(request)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    // Initialize Stripe client
    const stripe = getStripe()

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          user_id: user.id,
        },
      })

      customerId = customer.id

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    let checkoutSession

    if (type === 'subscription') {
      if (!tier) {
        return NextResponse.json(
          {
            error: 'Tier required for subscription',
          },
          { status: 400 }
        )
      }

      const priceId = tier === 'standard' ? STRIPE_PRODUCTS.STANDARD : STRIPE_PRODUCTS.PREMIUM

      if (!priceId) {
        return NextResponse.json(
          {
            error: 'Invalid tier or price not configured',
          },
          { status: 400 }
        )
      }

      checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `${origin}/pricing?canceled=true`,
        metadata: {
          user_id: user.id,
          tier,
        },
      })
    } else {
      // Credit purchase
      if (!creditPack) {
        return NextResponse.json(
          {
            error: 'Credit pack required',
          },
          { status: 400 }
        )
      }

      const priceIds = {
        small: STRIPE_CREDIT_PACKS.SMALL,
        medium: STRIPE_CREDIT_PACKS.MEDIUM,
        large: STRIPE_CREDIT_PACKS.LARGE,
      }

      const creditAmounts = {
        small: 100,
        medium: 500,
        large: 1500,
      }

      const priceId = priceIds[creditPack]

      if (!priceId) {
        return NextResponse.json(
          {
            error: 'Invalid credit pack or price not configured',
          },
          { status: 400 }
        )
      }

      checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&credits=true`,
        cancel_url: `${origin}/pricing?canceled=true`,
        metadata: {
          user_id: user.id,
          type: 'credits',
          amount: creditAmounts[creditPack].toString(),
        },
      })
    }

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}
