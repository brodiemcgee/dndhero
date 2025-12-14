'use client'

/**
 * User Dashboard
 * Campaign list and management
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { UserMenu } from '@/components/auth/UserMenu'
import { PixelButton } from '@/components/ui/PixelButton'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

interface Campaign {
  id: string
  name: string
  setting: string
  mode: string
  state: string
  created_at: string
  is_host: boolean
  member_count: number
}

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCampaigns = async () => {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

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

      if (memberships) {
        // Get member counts for each campaign
        const campaignIds = memberships.map((m: any) => m.campaign_id)

        const { data: memberCounts } = await supabase
          .from('campaign_members')
          .select('campaign_id')
          .in('campaign_id', campaignIds)
          .eq('active', true)

        const countsMap = memberCounts?.reduce(
          (acc: any, item: any) => {
            acc[item.campaign_id] = (acc[item.campaign_id] || 0) + 1
            return acc
          },
          {} as Record<string, number>
        )

        const campaignsData = memberships.map((m: any) => ({
          id: m.campaigns.id,
          name: m.campaigns.name,
          setting: m.campaigns.setting,
          mode: m.campaigns.mode,
          state: m.campaigns.state,
          created_at: m.campaigns.created_at,
          is_host: m.role === 'host',
          member_count: countsMap?.[m.campaign_id] || 0,
        }))

        setCampaigns(campaignsData)
      }

      setLoading(false)
    }

    fetchCampaigns()
  }, [])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-fantasy-dark">
        {/* Header */}
        <header className="border-b-4 border-fantasy-stone bg-fantasy-brown p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-fantasy-gold">
              DND HERO
            </Link>
            <UserMenu />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-fantasy-gold mb-2">Your Campaigns</h1>
              <p className="text-fantasy-tan">Join an adventure or start a new one</p>
            </div>
            <Link href="/campaign/create">
              <PixelButton variant="primary">CREATE CAMPAIGN</PixelButton>
            </Link>
          </div>

          {loading ? (
            <div className="text-center text-fantasy-tan py-12">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <PixelPanel className="p-12 text-center">
              <div className="text-6xl mb-4">🎲</div>
              <h2 className="text-2xl font-bold text-fantasy-gold mb-4">
                No Campaigns Yet
              </h2>
              <p className="text-fantasy-tan mb-6">
                You haven't joined any campaigns. Create a new campaign or ask a friend for an
                invite!
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/campaign/create">
                  <PixelButton variant="primary">CREATE CAMPAIGN</PixelButton>
                </Link>
                <Link href="/campaign/join">
                  <PixelButton variant="secondary">JOIN WITH CODE</PixelButton>
                </Link>
              </div>
            </PixelPanel>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <Link key={campaign.id} href={`/campaign/${campaign.id}/lobby`}>
                  <PixelPanel
                    title={campaign.name}
                    className="p-6 hover:border-fantasy-gold transition-colors cursor-pointer h-full"
                  >
                    <div className="space-y-3">
                      <div className="text-fantasy-tan text-sm">
                        <span className="font-bold">Setting:</span> {campaign.setting}
                      </div>

                      <div className="text-fantasy-tan text-sm">
                        <span className="font-bold">Mode:</span>{' '}
                        {campaign.mode.replace('_', ' ').toUpperCase()}
                      </div>

                      <div className="flex items-center gap-2 text-fantasy-stone text-sm">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        {campaign.member_count} {campaign.member_count === 1 ? 'member' : 'members'}
                      </div>

                      {campaign.is_host && (
                        <div className="pt-2">
                          <span className="inline-block px-3 py-1 bg-fantasy-gold/20 border border-fantasy-gold text-fantasy-gold text-xs font-bold rounded">
                            HOST
                          </span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-fantasy-stone">
                        <div className="text-fantasy-stone text-xs">
                          Created {new Date(campaign.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </PixelPanel>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
