import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import NarrativeDisplay from '@/components/game/NarrativeDisplay'
import ActionInput from '@/components/game/ActionInput'
import DiceRoller from '@/components/game/DiceRoller'
import CombatTracker from '@/components/game/CombatTracker'
import CharacterPanel from '@/components/game/CharacterPanel'

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
    .single()

  // Get user's character
  const { data: character } = await supabase
    .from('characters')
    .select('*')
    .eq('campaign_id', params.id)
    .eq('user_id', user.id)
    .single()

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
              {scene.name || 'Scene'} • {scene.location}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-400">Turn:</span>{' '}
              <span className="text-amber-400 capitalize">
                {turnContract?.phase.replace('_', ' ') || 'No active turn'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Character & Combat */}
        <div className="w-80 border-r-2 border-amber-700 bg-gray-900 overflow-y-auto">
          <div className="p-4 space-y-4">
            {character && <CharacterPanel character={character} />}

            {entities && entities.length > 0 && (
              <CombatTracker
                entities={entities}
                characters={allCharacters || []}
              />
            )}

            <DiceRoller
              campaignId={params.id}
              characterId={character?.id}
            />
          </div>
        </div>

        {/* Center - Narrative & Input */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <NarrativeDisplay
              sceneId={scene.id}
              events={events || []}
              turnContract={turnContract}
            />
          </div>

          <div className="border-t-2 border-amber-700">
            <ActionInput
              campaignId={params.id}
              sceneId={scene.id}
              turnContractId={turnContract?.id}
              characterId={character?.id}
              mode={campaign.mode}
              turnPhase={turnContract?.phase}
              isHost={isHost}
            />
          </div>
        </div>

        {/* Right sidebar - Scene info (optional) */}
        <div className="w-64 border-l-2 border-amber-700 bg-gray-900 p-4 overflow-y-auto hidden xl:block">
          <div className="space-y-4">
            <div>
              <h3 className="font-['Press_Start_2P'] text-sm text-amber-300 mb-2">
                Scene
              </h3>
              <p className="text-gray-400 text-sm">{scene.description}</p>
            </div>

            {scene.environment && (
              <div>
                <h3 className="font-['Press_Start_2P'] text-sm text-amber-300 mb-2">
                  Environment
                </h3>
                <p className="text-gray-400 text-sm capitalize">{scene.environment}</p>
              </div>
            )}

            <div>
              <h3 className="font-['Press_Start_2P'] text-sm text-amber-300 mb-2">
                Current State
              </h3>
              <p className="text-gray-400 text-sm">{scene.current_state || 'No state info'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
