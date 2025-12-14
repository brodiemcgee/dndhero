import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PixelButton } from '@/components/ui/PixelButton'
import { PixelPanel } from '@/components/ui/PixelPanel'

export default async function BillingPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get subscription info
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  // Get usage and entitlements
  const { data: usage } = await supabase
    .from('usage_counters')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: entitlements } = await supabase
    .from('entitlements')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const currentTier = subscription?.tier || 'free'
  const campaignsUsed = usage?.campaigns_created_this_month || 0
  const campaignsLimit = entitlements?.max_campaigns_per_month || 2
  const turnsUsed = usage?.ai_turns_used_this_month || 0
  const turnsLimit = entitlements?.max_ai_turns_per_month || 150
  const credits = usage?.credit_balance || 0

  const campaignPercent = campaignsLimit === -1 ? 0 : (campaignsUsed / campaignsLimit) * 100
  const turnPercent = turnsLimit === -1 ? 0 : (turnsUsed / turnsLimit) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="text-amber-400 hover:text-amber-300 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="font-['Press_Start_2P'] text-4xl text-amber-400">
            Billing & Usage
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current plan */}
          <div className="lg:col-span-2 space-y-6">
            <PixelPanel>
              <div className="p-6">
                <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
                  Current Plan
                </h2>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-3xl font-bold text-white capitalize mb-2">
                      {currentTier}
                    </div>
                    {subscription && (
                      <div className="text-sm text-gray-400">
                        {subscription.status === 'active' ? (
                          <>
                            Renews{' '}
                            {new Date(subscription.current_period_end).toLocaleDateString()}
                          </>
                        ) : (
                          <span className="text-amber-500">
                            Status: {subscription.status}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {currentTier === 'free' && (
                    <Link href="/pricing">
                      <PixelButton>Upgrade</PixelButton>
                    </Link>
                  )}
                </div>

                {subscription && subscription.cancel_at_period_end && (
                  <div className="p-4 bg-amber-900/30 border border-amber-700 rounded mb-4">
                    <p className="text-amber-300 text-sm">
                      Your subscription will be canceled at the end of the current billing period.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Monthly Campaigns:</span>
                    <span className="text-white ml-2 font-bold">
                      {campaignsLimit === -1 ? 'Unlimited' : campaignsLimit}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Monthly AI Turns:</span>
                    <span className="text-white ml-2 font-bold">
                      {turnsLimit === -1 ? 'Unlimited' : turnsLimit}
                    </span>
                  </div>
                </div>
              </div>
            </PixelPanel>

            {/* Usage */}
            <PixelPanel>
              <div className="p-6">
                <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
                  This Month's Usage
                </h2>

                <div className="space-y-6">
                  {/* Campaigns */}
                  {campaignsLimit !== -1 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Campaigns Created</span>
                        <span className="text-white font-bold">
                          {campaignsUsed} / {campaignsLimit}
                        </span>
                      </div>
                      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            campaignPercent >= 100
                              ? 'bg-red-500'
                              : campaignPercent >= 70
                              ? 'bg-amber-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, campaignPercent)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* AI Turns */}
                  {turnsLimit !== -1 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">AI Turns Used</span>
                        <span className="text-white font-bold">
                          {turnsUsed} / {turnsLimit}
                        </span>
                      </div>
                      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            turnPercent >= 100
                              ? 'bg-red-500'
                              : turnPercent >= 70
                              ? 'bg-amber-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, turnPercent)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Credits */}
                  <div className="p-4 bg-gray-800 border border-amber-700 rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-gray-400 text-sm">Credit Balance</div>
                        <div className="text-2xl font-bold text-white">{credits}</div>
                      </div>
                      <Link href="/pricing#credits">
                        <PixelButton variant="secondary">Buy Credits</PixelButton>
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Credits are used when you exceed your monthly limits. They never expire.
                    </p>
                  </div>
                </div>
              </div>
            </PixelPanel>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            <PixelPanel>
              <div className="p-6">
                <h3 className="font-['Press_Start_2P'] text-sm text-amber-300 mb-4">
                  Quick Actions
                </h3>

                <div className="space-y-3">
                  {currentTier === 'free' && (
                    <Link href="/pricing" className="block">
                      <PixelButton className="w-full">Upgrade Plan</PixelButton>
                    </Link>
                  )}

                  {subscription && subscription.status === 'active' && (
                    <form action="/api/stripe/manage-subscription" method="POST">
                      <PixelButton type="submit" variant="secondary" className="w-full">
                        Manage Subscription
                      </PixelButton>
                    </form>
                  )}

                  <Link href="/pricing" className="block">
                    <PixelButton variant="secondary" className="w-full">
                      View All Plans
                    </PixelButton>
                  </Link>
                </div>
              </div>
            </PixelPanel>

            <PixelPanel>
              <div className="p-6">
                <h3 className="font-['Press_Start_2P'] text-sm text-amber-300 mb-4">
                  Need Help?
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Questions about billing, upgrades, or usage limits?
                </p>
                <a
                  href="mailto:support@dndhero.com"
                  className="text-amber-400 hover:text-amber-300 text-sm"
                >
                  Contact Support
                </a>
              </div>
            </PixelPanel>
          </div>
        </div>
      </div>
    </div>
  )
}
