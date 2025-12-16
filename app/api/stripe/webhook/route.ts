/**
 * Stripe Webhook Handler
 * Processes subscription and payment events
 */

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getStripe, TIER_LIMITS } from '@/lib/stripe/client'
import { createServiceClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: Request) {
  // Check if Stripe is properly configured
  if (!process.env.STRIPE_SECRET_KEY || !webhookSecret) {
    return NextResponse.json(
      { error: 'Payment system is not configured' },
      { status: 503 }
    )
  }

  const stripe = getStripe()
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  try {
    switch (event.type) {
      // Subscription created or updated
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.user_id

        if (!userId) {
          console.error('No user_id in subscription metadata')
          break
        }

        const tier = subscription.metadata.tier as 'standard' | 'premium'
        const limits = TIER_LIMITS[tier]

        // Upsert subscription
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0].price.id,
          status: subscription.status,
          tier,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        })

        // Update entitlements (derived view will auto-calculate, but we can trigger reset)
        // Reset usage counters at the start of new billing period
        if (event.type === 'customer.subscription.updated') {
          const now = new Date()
          const periodStart = new Date(subscription.current_period_start * 1000)

          // If this is a new billing period, reset counters
          if (now.getMonth() !== periodStart.getMonth()) {
            await supabase
              .from('usage_counters')
              .update({
                campaigns_created_this_month: 0,
                ai_turns_used_this_month: 0,
                content_jobs_this_month: 0,
              })
              .eq('user_id', userId)
          }
        }

        break
      }

      // Subscription deleted/canceled
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.user_id

        if (!userId) break

        // Mark subscription as canceled
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        break
      }

      // Payment succeeded (for one-time credit purchases)
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'payment' && session.metadata?.type === 'credits') {
          const userId = session.metadata.user_id
          const creditAmount = parseInt(session.metadata.amount || '0')

          if (!userId || !creditAmount) break

          // Add credits to user's balance
          const { data: currentBalance } = await supabase
            .from('usage_counters')
            .select('credit_balance')
            .eq('user_id', userId)
            .single()

          const newBalance = (currentBalance?.credit_balance || 0) + creditAmount

          await supabase
            .from('usage_counters')
            .update({ credit_balance: newBalance })
            .eq('user_id', userId)

          // Log the purchase
          await supabase.from('credit_purchases').insert({
            user_id: userId,
            amount: creditAmount,
            price_paid: session.amount_total! / 100, // Convert cents to dollars
            stripe_payment_intent_id: session.payment_intent as string,
            purchased_at: new Date().toISOString(),
          })
        }

        break
      }

      // Payment failed
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (!subscriptionId) break

        // Mark subscription as past_due
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', subscriptionId)

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
