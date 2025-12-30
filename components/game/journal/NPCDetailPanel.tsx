'use client'

import Image from 'next/image'

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

interface NPCDetailPanelProps {
  npc: JournalNPC
}

function getEntityIcon(type: 'npc' | 'monster'): string {
  return type === 'monster' ? '👹' : '👤'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getDispositionColor(disposition?: string): string {
  switch (disposition?.toLowerCase()) {
    case 'friendly':
      return 'text-green-400'
    case 'hostile':
      return 'text-red-400'
    case 'suspicious':
    case 'wary':
      return 'text-yellow-400'
    default:
      return 'text-gray-400'
  }
}

export default function NPCDetailPanel({ npc }: NPCDetailPanelProps) {
  const entity = npc.entity
  const statBlock = entity.stat_block || {}
  const hasPortrait = entity.portrait_url && entity.portrait_generation_status === 'completed'

  return (
    <div className="space-y-4">
      {/* Header with portrait */}
      <div className="flex items-start gap-4">
        {/* Large portrait */}
        <div className={`w-20 h-20 rounded-lg border-2 ${entity.type === 'monster' ? 'border-red-600' : 'border-blue-600'} bg-gray-900 overflow-hidden flex-shrink-0`}>
          {hasPortrait ? (
            <Image
              src={entity.portrait_url!}
              alt={entity.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl flex items-center justify-center h-full">
              {getEntityIcon(entity.type)}
            </span>
          )}
        </div>

        {/* Name and meta */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-medium text-white mb-1">{entity.name}</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-0.5 rounded ${entity.type === 'monster' ? 'bg-red-900/50 text-red-300' : 'bg-blue-900/50 text-blue-300'}`}>
              {entity.type === 'monster' ? 'Monster' : 'NPC'}
            </span>
            {statBlock.disposition && (
              <span className={`capitalize ${getDispositionColor(statBlock.disposition)}`}>
                {statBlock.disposition}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Met at {npc.first_met_scene?.name || 'Unknown'} • {formatDate(npc.first_met_at)}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700" />

      {/* Description */}
      {statBlock.description && (
        <div>
          <p className="text-xs text-gray-500 uppercase mb-1">Description</p>
          <p className="text-sm text-gray-300">{statBlock.description}</p>
        </div>
      )}

      {/* Personality */}
      {statBlock.personality_quirk && (
        <div>
          <p className="text-xs text-gray-500 uppercase mb-1">Personality</p>
          <p className="text-sm text-gray-300 italic">&quot;{statBlock.personality_quirk}&quot;</p>
        </div>
      )}

      {/* Speech Pattern */}
      {statBlock.speech_pattern && (
        <div>
          <p className="text-xs text-gray-500 uppercase mb-1">Speech</p>
          <p className="text-sm text-gray-300">{statBlock.speech_pattern}</p>
        </div>
      )}

      {/* Motivation */}
      {statBlock.motivation && (
        <div>
          <p className="text-xs text-gray-500 uppercase mb-1">Motivation</p>
          <p className="text-sm text-gray-300">{statBlock.motivation}</p>
        </div>
      )}

      {/* Location met */}
      {npc.first_met_scene && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">📍</span>
          <span className="text-gray-400">
            First met at <span className="text-amber-400">{npc.first_met_scene.name}</span>
            {npc.first_met_scene.location && ` (${npc.first_met_scene.location})`}
          </span>
        </div>
      )}

      {/* Related Quests */}
      {npc.related_quests && npc.related_quests.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase mb-1">Related Quests</p>
          <div className="space-y-1">
            {npc.related_quests.map(quest => (
              <div
                key={quest.id}
                className="flex items-center gap-2 text-sm"
              >
                <span className={quest.status === 'completed' ? 'text-green-400' : 'text-amber-400'}>
                  {quest.status === 'completed' ? '✓' : '○'}
                </span>
                <span className="text-gray-300">{quest.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player Notes */}
      {npc.player_notes && (
        <div>
          <p className="text-xs text-gray-500 uppercase mb-1">Your Notes</p>
          <p className="text-sm text-gray-300 bg-gray-900/50 p-2 rounded">{npc.player_notes}</p>
        </div>
      )}
    </div>
  )
}
