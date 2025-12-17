'use client'

/**
 * User Dashboard
 * Campaign and character management
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { UserMenu } from '@/components/auth/UserMenu'
import { PixelButton } from '@/components/ui/PixelButton'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { CharacterCard } from '@/components/character/CharacterCard'
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

interface Character {
  id: string
  name: string
  race: string
  class: string
  level: number
  max_hp: number
  current_hp: number
  armor_class: number
  campaign_id: string | null
  campaign_name: string | null
  campaign_state: string | null
  is_standalone: boolean
}

interface CharacterLimits {
  current: number
  max: number
  tier: string
}

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [characterLimits, setCharacterLimits] = useState<CharacterLimits>({
    current: 0,
    max: 3,
    tier: 'free',
  })
  const [loading, setLoading] = useState(true)
  const [charactersLoading, setCharactersLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Fetch campaigns and characters in parallel
      const [campaignsResult, charactersResult] = await Promise.all([
        fetchCampaigns(supabase, user.id),
        fetchCharacters(),
      ])

      if (campaignsResult) {
        setCampaigns(campaignsResult)
      }

      if (charactersResult) {
        console.log('Dashboard - Characters received:', charactersResult.characters)
        console.log('Dashboard - Character count:', charactersResult.characters?.length || 0)
        console.log('Dashboard - Full API response:', charactersResult)
        setCharacters(charactersResult.characters || [])
        setCharacterLimits(charactersResult.limits)
      }

      setLoading(false)
      setCharactersLoading(false)
    }

    const fetchCampaigns = async (supabase: any, userId: string) => {
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
        .eq('user_id', userId)
        .eq('active', true)

      if (!memberships) return null

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

      return memberships.map((m: any) => ({
        id: m.campaigns.id,
        name: m.campaigns.name,
        setting: m.campaigns.setting,
        mode: m.campaigns.mode,
        state: m.campaigns.state,
        created_at: m.campaigns.created_at,
        is_host: m.role === 'host',
        member_count: countsMap?.[m.campaign_id] || 0,
      }))
    }

    const fetchCharacters = async () => {
      try {
        const response = await fetch('/api/characters')
        if (!response.ok) return null
        return await response.json()
      } catch (error) {
        console.error('Error fetching characters:', error)
        return null
      }
    }

    fetchData()
  }, [])

  const canCreateCharacter = characterLimits.max === -1 || characterLimits.current < characterLimits.max

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

          {/* Characters Section */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-fantasy-gold mb-2">Your Characters</h2>
                <p className="text-fantasy-tan">
                  {characterLimits.max === -1
                    ? `${characterLimits.current} characters`
                    : `${characterLimits.current}/${characterLimits.max} characters`}
                  {' '}
                  <span className="text-fantasy-stone">({characterLimits.tier} tier)</span>
                </p>
              </div>
              <Link href="/character/create">
                <PixelButton
                  variant="secondary"
                  disabled={!canCreateCharacter}
                >
                  CREATE CHARACTER
                </PixelButton>
              </Link>
            </div>

            {charactersLoading ? (
              <div className="text-center text-fantasy-tan py-12">Loading characters...</div>
            ) : characters.length === 0 ? (
              <PixelPanel className="p-12 text-center">
                <div className="text-6xl mb-4">&#9876;</div>
                <h3 className="text-2xl font-bold text-fantasy-gold mb-4">
                  No Characters Yet
                </h3>
                <p className="text-fantasy-tan mb-6">
                  Create your first character to use across campaigns!
                </p>
                <Link href="/character/create">
                  <PixelButton variant="primary" disabled={!canCreateCharacter}>
                    CREATE CHARACTER
                  </PixelButton>
                </Link>
              </PixelPanel>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {characters.map((character) => (
                  <CharacterCard key={character.id} character={character} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
