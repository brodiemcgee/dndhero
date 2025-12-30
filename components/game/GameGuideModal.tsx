'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import NPCJournalCard from './journal/NPCJournalCard'
import LocationJournalCard from './journal/LocationJournalCard'

interface GameGuideModalProps {
  campaignId: string
  isOpen: boolean
  onClose: () => void
}

type TabType = 'people' | 'places'

interface JournalNPC {
  id: string
  entity_id: string
  first_met_at: string
  player_notes: string | null
  entity: {
    id: string
    name: string
    type: 'npc' | 'monster'
    portrait_url: string | null
    portrait_generation_status: string | null
    stat_block: {
      description?: string
      disposition?: string
      personality_quirk?: string
      motivation?: string
      speech_pattern?: string
    } | null
  }
  first_met_scene: {
    id: string
    name: string
    location: string | null
  } | null
  related_quests?: {
    id: string
    title: string
    status: string
  }[]
}

interface JournalLocation {
  id: string
  scene_id: string
  first_visited_at: string
  last_visited_at: string
  times_visited: number
  player_notes: string | null
  scene: {
    id: string
    name: string
    description: string | null
    location: string | null
    environment: string | null
  }
  npcs_met?: {
    id: string
    name: string
    type: 'npc' | 'monster'
    portrait_url: string | null
  }[]
}

export default function GameGuideModal({ campaignId, isOpen, onClose }: GameGuideModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('people')
  const [npcs, setNpcs] = useState<JournalNPC[]>([])
  const [locations, setLocations] = useState<JournalLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const supabase = createClient()

  // Fetch journal data
  useEffect(() => {
    if (!isOpen) return

    async function fetchJournalData() {
      setLoading(true)

      // Fetch NPCs with their entities and first met scene
      const { data: npcData } = await supabase
        .from('journal_npcs')
        .select(`
          id,
          entity_id,
          first_met_at,
          player_notes,
          entity:entities!inner(
            id,
            name,
            type,
            portrait_url,
            portrait_generation_status,
            stat_block
          ),
          first_met_scene:scenes(
            id,
            name,
            location
          )
        `)
        .eq('campaign_id', campaignId)
        .order('first_met_at', { ascending: false })

      // Fetch quests to link with NPCs
      const { data: questsData } = await supabase
        .from('quests')
        .select('id, title, status, quest_giver')
        .eq('campaign_id', campaignId)

      // Map quests to NPCs by quest_giver name
      const npcsWithQuests = (npcData || []).map((npc: JournalNPC) => {
        const relatedQuests = (questsData || [])
          .filter(q => q.quest_giver?.toLowerCase() === npc.entity.name.toLowerCase())
          .map(q => ({ id: q.id, title: q.title, status: q.status }))
        return { ...npc, related_quests: relatedQuests }
      })

      setNpcs(npcsWithQuests)

      // Fetch locations
      const { data: locationData } = await supabase
        .from('journal_locations')
        .select(`
          id,
          scene_id,
          first_visited_at,
          last_visited_at,
          times_visited,
          player_notes,
          scene:scenes!inner(
            id,
            name,
            description,
            location,
            environment
          )
        `)
        .eq('campaign_id', campaignId)
        .order('first_visited_at', { ascending: false })

      // For each location, find NPCs met there
      const locationsWithNpcs = (locationData || []).map((loc: JournalLocation) => {
        const npcsAtLocation = npcsWithQuests
          .filter(npc => npc.first_met_scene?.id === loc.scene_id)
          .map(npc => ({
            id: npc.entity.id,
            name: npc.entity.name,
            type: npc.entity.type,
            portrait_url: npc.entity.portrait_url
          }))
        return { ...loc, npcs_met: npcsAtLocation }
      })

      setLocations(locationsWithNpcs)
      setLoading(false)
    }

    fetchJournalData()

    // Subscribe to changes
    const npcChannel = supabase
      .channel('journal-npcs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journal_npcs', filter: `campaign_id=eq.${campaignId}` }, () => {
        fetchJournalData()
      })
      .subscribe()

    const locationChannel = supabase
      .channel('journal-locations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journal_locations', filter: `campaign_id=eq.${campaignId}` }, () => {
        fetchJournalData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(npcChannel)
      supabase.removeChannel(locationChannel)
    }
  }, [isOpen, campaignId, supabase])

  if (!isOpen) return null

  // Filter based on search
  const filteredNpcs = npcs.filter(npc =>
    npc.entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    npc.first_met_scene?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredLocations = locations.filter(loc =>
    loc.scene.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.scene.location?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-2xl h-[80vh] bg-gray-900 border-4 border-amber-700 rounded-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b-2 border-amber-700 flex items-center justify-between">
          <h2 className="font-['Press_Start_2P'] text-lg text-amber-400">
            Adventure Journal
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-700">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => { setActiveTab('people'); setExpandedId(null) }}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'people'
                ? 'text-amber-400 border-b-2 border-amber-400 bg-gray-800/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            👤 People ({npcs.length})
          </button>
          <button
            onClick={() => { setActiveTab('places'); setExpandedId(null) }}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'places'
                ? 'text-amber-400 border-b-2 border-amber-400 bg-gray-800/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📍 Places ({locations.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">Loading journal...</div>
            </div>
          ) : activeTab === 'people' ? (
            filteredNpcs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-4xl mb-4">👤</p>
                <p>No one encountered yet.</p>
                <p className="text-sm mt-2">NPCs and creatures you meet will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNpcs.map(npc => (
                  <NPCJournalCard
                    key={npc.id}
                    npc={npc}
                    expanded={expandedId === npc.id}
                    onToggleExpand={() => handleToggleExpand(npc.id)}
                  />
                ))}
              </div>
            )
          ) : (
            filteredLocations.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-4xl mb-4">📍</p>
                <p>No locations visited yet.</p>
                <p className="text-sm mt-2">Places you visit will be recorded here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLocations.map(location => (
                  <LocationJournalCard
                    key={location.id}
                    location={location}
                    expanded={expandedId === location.id}
                    onToggleExpand={() => handleToggleExpand(location.id)}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
