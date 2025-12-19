import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import ChatDisplay from '@/components/game/ChatDisplay'
import ChatInput from '@/components/game/ChatInput'
import DiceRoller from '@/components/game/DiceRoller'
import CombatTracker from '@/components/game/CombatTracker'
import CharacterPanel from '@/components/game/CharacterPanel'
import GameMenu from '@/components/game/GameMenu'

export default async function GameRoomPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Get current user (getUser validates and refreshes session)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get campaign
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*, campaign_members!inner(user_id, role)')
    .eq('id', params.id)
    .eq('campaign_members.user_id', user.id)
    .single()

  if (campaignError || !campaign) {
    redirect('/dashboard')
  }

  const membership = campaign.campaign_members[0]
  const isHost = membership.role === 'host'

  // Get active scene (using only columns that exist in production)
  const { data: scene } = await supabase
    .from('scenes')
    .select('*')
    .eq('campaign_id', params.id)
    .limit(1)
    .maybeSingle()

  // If no active scene, redirect to lobby
  if (!scene) {
    redirect(`/campaign/${params.id}/lobby`)
  }

  // Get current turn contract
  const { data: turnContract } = await supabase
    .from('turn_contracts')
    .select('*')
    .eq('scene_id', scene.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Get user's character
  const { data: character } = await supabase
    .from('characters')
    .select('*')
    .eq('campaign_id', params.id)
    .eq('user_id', user.id)
    .maybeSingle()

  // Get all characters in campaign
  const { data: allCharacters } = await supabase
    .from('characters')
    .select('*, profiles!inner(username)')
    .eq('campaign_id', params.id)

  // Get entities in scene
  const { data: entities } = await supabase
    .from('entities')
    .select(`
      *,
      entity_state!inner(*)
    `)
    .eq('entity_state.scene_id', scene.id)
    .order('created_at')

  // Get recent events
  const { data: events } = await supabase
    .from('event_log')
    .select('*')
    .eq('scene_id', scene.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <div className="border-b-2 border-amber-700 bg-gray-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-['Press_Start_2P'] text-2xl text-amber-400">
              {campaign.name}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {scene.name || 'Scene'} - {scene.location}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">
                {isHost ? '🎲 Dungeon Master' : '⚔️ Player'}
              </p>
              {character && (
                <p className="text-sm text-amber-400">
                  {character.name}
                </p>
              )}
            </div>
            <GameMenu campaignId={params.id} isHost={isHost} />
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Character Panel */}
        <div className="w-80 border-r-2 border-amber-700 overflow-y-auto">
          {character ? (
            <CharacterPanel character={character} />
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-400">No character</p>
            </div>
          )}
        </div>

        {/* Center - Chat Display & Input */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Display */}
          <div className="flex-1 overflow-y-auto">
            <ChatDisplay
              campaignId={params.id}
              sceneId={scene.id}
            />
          </div>

          {/* Chat Input */}
          <ChatInput
            campaignId={params.id}
            sceneId={scene.id}
          />
        </div>

        {/* Right Sidebar - Combat Tracker & Dice */}
        <div className="w-80 border-l-2 border-amber-700 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <CombatTracker
              entities={entities || []}
              characters={allCharacters || []}
            />
          </div>
          <div className="border-t-2 border-amber-700">
            <DiceRoller />
          </div>
        </div>
      </div>
    </div>
  )
}
