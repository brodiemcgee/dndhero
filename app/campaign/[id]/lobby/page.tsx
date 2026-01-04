import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PixelButton } from '@/components/ui/PixelButton'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { CopyInviteButton } from '@/components/campaign/CopyInviteButton'
import { StartGameButton } from '@/components/campaign/StartGameButton'
import { CharacterSelector } from '@/components/campaign/CharacterSelector'
import { LeaveCampaignButton } from '@/components/campaign/LeaveCampaignButton'
import { DeleteCampaignButton } from '@/components/campaign/DeleteCampaignButton'
import CampaignSafetyBadges from '@/components/campaign/CampaignSafetyBadges'
import { EditCampaignButton } from '@/components/campaign/EditCampaignButton'
import { PartyMembersSection } from '@/components/campaign/PartyMembersSection'

export default async function CampaignLobbyPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Get current user (getUser validates and refreshes session)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // Debug logging
  console.log('[LOBBY] Auth check:', {
    hasUser: !!user,
    userId: user?.id,
    error: authError?.message
  })

  if (!user) {
    console.log('[LOBBY] No user, redirecting to login')
    redirect('/auth/login')
  }

  // Get campaign with members
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select(`
      *,
      campaign_members!inner (
        user_id,
        role,
        active,
        profiles!inner (
          username,
          avatar_url
        )
      )
    `)
    .eq('id', params.id)
    .eq('campaign_members.active', true)
    .single()

  if (campaignError || !campaign) {
    redirect('/dashboard')
  }

  // Check user is a member
  const membership = campaign.campaign_members.find((m: any) => m.user_id === user.id)
  if (!membership) {
    redirect('/dashboard')
  }

  const isHost = membership.role === 'host'

  // Get user's character for this campaign
  const { data: character } = await supabase
    .from('characters')
    .select('*')
    .eq('campaign_id', params.id)
    .eq('user_id', user.id)
    .single()

  // Get user's available (standalone) characters if they don't have one in this campaign
  let availableCharacters: any[] = []
  if (!character) {
    const { data: standaloneChars } = await supabase
      .from('characters')
      .select('id, name, race, class, level, max_hp, current_hp, armor_class')
      .eq('user_id', user.id)
      .is('campaign_id', null)
      .order('created_at', { ascending: false })

    availableCharacters = standaloneChars || []
  }

  // Get all party members' characters for the party display
  const { data: partyCharacters } = await supabase
    .from('characters')
    .select('id, name, race, class, level, current_hp, max_hp, armor_class, portrait_url, user_id')
    .eq('campaign_id', params.id)

  // Create a map of user_id to character for easy lookup
  const charactersByUserId = new Map(
    (partyCharacters || []).map((char: any) => [char.user_id, char])
  )

  // Enrich campaign members with character data
  const enrichedMembers = campaign.campaign_members.map((member: any) => ({
    ...member,
    character: charactersByUserId.get(member.user_id) || null,
  }))

  // Get active scene if game has started
  const { data: activeScene } = await supabase
    .from('scenes')
    .select('id')
    .eq('campaign_id', params.id)
    .limit(1)
    .maybeSingle()

  // Note: We no longer auto-redirect to game here
  // Players should be able to access the lobby even during an active game
  // to view party members, manage settings, etc.

  // Generate invite link
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const inviteUrl = `${origin}/campaign/join?campaign=${params.id}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-amber-400 hover:text-amber-300 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="font-['Press_Start_2P'] text-4xl text-amber-400">
            {campaign.name}
          </h1>
          <p className="text-gray-400 mt-2">{campaign.setting}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Campaign info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign details */}
            <PixelPanel>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-['Press_Start_2P'] text-xl text-amber-300">
                    Campaign Details
                  </h2>
                  {isHost && (
                    <EditCampaignButton
                      campaign={{
                        id: campaign.id,
                        name: campaign.name,
                        setting: campaign.setting,
                        mode: campaign.mode,
                        art_style: campaign.art_style,
                        dm_config: campaign.dm_config,
                        strict_mode: campaign.strict_mode,
                        adult_content_enabled: campaign.adult_content_enabled,
                        min_level: campaign.min_level || 1,
                        max_level: campaign.max_level || 20,
                      }}
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400">Mode:</span>{' '}
                    <span className="text-white capitalize">{campaign.mode.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">State:</span>{' '}
                    <span className={`capitalize ${
                      campaign.state === 'active' ? 'text-green-400' : 'text-amber-400'
                    }`}>
                      {campaign.state}
                    </span>
                  </div>
                  {/* Level Requirements */}
                  {(campaign.min_level > 1 || campaign.max_level < 20) && (
                    <div>
                      <span className="text-gray-400">Level Range:</span>{' '}
                      <span className="text-amber-400 font-bold">
                        {campaign.min_level === campaign.max_level
                          ? `Level ${campaign.min_level}`
                          : `Level ${campaign.min_level}-${campaign.max_level}`}
                      </span>
                    </div>
                  )}
                  {campaign.strict_mode && (
                    <div>
                      <span className="text-red-400">⚠ Strict Mode Enabled</span>
                      <p className="text-sm text-gray-400 mt-1">
                        The DM will enforce rules strictly
                      </p>
                    </div>
                  )}

                  {/* Safety Settings (Lines & Veils) */}
                  <div className="border-t border-gray-700 pt-3">
                    <span className="text-gray-400 block mb-2">Content Restrictions:</span>
                    <CampaignSafetyBadges campaignId={params.id} />
                  </div>
                </div>
              </div>
            </PixelPanel>

            {/* Your character */}
            <PixelPanel>
              <div className="p-6">
                <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
                  Your Character
                </h2>

                {character ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xl font-bold text-white">{character.name}</div>
                        <div className="text-gray-400">
                          Level {character.level} {character.race} {character.class}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-gray-400">HP: <span className="text-white">{Number(character.current_hp) || 0}/{Number(character.max_hp) || 0}</span></div>
                        <div className="text-gray-400">AC: <span className="text-white">{Number(character.armor_class) || 10}</span></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-6 gap-2 text-center text-sm">
                      {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((ability, i) => {
                        const rawScore = character[ability.toLowerCase() as keyof typeof character]
                        const score = Number(rawScore) || 10
                        const modifier = Math.floor((score - 10) / 2)
                        return (
                          <div key={ability} className="p-2 bg-gray-800 border border-amber-700 rounded">
                            <div className="text-amber-400 text-xs">{ability}</div>
                            <div className="text-white font-bold">{score}</div>
                            <div className="text-gray-400 text-xs">
                              {modifier >= 0 ? '+' : ''}{modifier}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Leave Campaign option (only in setup phase) */}
                    {campaign.state === 'setup' && (
                      <LeaveCampaignButton
                        characterId={character.id}
                        characterName={character.name}
                      />
                    )}
                  </div>
                ) : (
                  <CharacterSelector
                    campaignId={params.id}
                    availableCharacters={availableCharacters}
                    minLevel={campaign.min_level || 1}
                    maxLevel={campaign.max_level || 20}
                  />
                )}
              </div>
            </PixelPanel>

            {/* Invite section (host only) */}
            {isHost && (
              <PixelPanel>
                <div className="p-6">
                  <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
                    Invite Players
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 mb-2 text-sm">Share this link:</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inviteUrl}
                          readOnly
                          className="flex-1 px-4 py-2 bg-gray-800 border-2 border-amber-700 rounded text-white text-sm"
                        />
                        <CopyInviteButton inviteUrl={inviteUrl} />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Note: Generate a proper invite via API for production use
                      </p>
                    </div>
                  </div>
                </div>
              </PixelPanel>
            )}

            {/* Danger zone (host only) */}
            {isHost && (
              <PixelPanel>
                <div className="p-6">
                  <h2 className="font-['Press_Start_2P'] text-lg text-red-400 mb-4">
                    Danger Zone
                  </h2>
                  <DeleteCampaignButton campaignId={params.id} campaignName={campaign.name} />
                </div>
              </PixelPanel>
            )}
          </div>

          {/* Right column: Members list */}
          <div>
            <PartyMembersSection
              members={enrichedMembers}
              currentUserId={user.id}
            />

            {/* Start game button (host only, in setup state) */}
            {isHost && campaign.state === 'setup' && (
              <div className="mt-6">
                <PixelPanel>
                  <div className="p-6 text-center">
                    <p className="text-gray-400 mb-4 text-sm">
                      All players should create characters before starting
                    </p>
                    <StartGameButton campaignId={params.id} />
                  </div>
                </PixelPanel>
              </div>
            )}

            {/* Continue to game button (when game is active and user has character) */}
            {character && activeScene && (
              <div className="mt-6">
                <PixelPanel>
                  <div className="p-6 text-center">
                    <p className="text-gray-400 mb-4 text-sm">
                      The adventure awaits!
                    </p>
                    <Link href={`/campaign/${params.id}/game`}>
                      <PixelButton size="large">
                        Continue to Game
                      </PixelButton>
                    </Link>
                  </div>
                </PixelPanel>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
