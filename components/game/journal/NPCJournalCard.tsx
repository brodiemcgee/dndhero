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

interface NPCJournalCardProps {
  npc: JournalNPC
  onNotesChange?: (entityId: string, notes: string) => void
  expanded?: boolean
  onToggleExpand?: () => void
}

function getEntityIcon(type: 'npc' | 'monster'): string {
  return type === 'monster' ? '👹' : '👤'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

export default function NPCJournalCard({
  npc,
  expanded = false,
  onToggleExpand
}: NPCJournalCardProps) {
  const entity = npc.entity
  const statBlock = entity.stat_block || {}
  const hasPortrait = entity.portrait_url && entity.portrait_generation_status === 'completed'

  return (
    <div
      className={`bg-gray-800 border-2 ${entity.type === 'monster' ? 'border-red-700' : 'border-blue-700'} rounded-lg overflow-hidden transition-all cursor-pointer hover:border-amber-500`}
      onClick={onToggleExpand}
    >
      {/* Header - always visible */}
      <div className="p-3 flex items-center gap-3">
        {/* Portrait */}
        <div className={`w-12 h-12 rounded-full border-2 ${entity.type === 'monster' ? 'border-red-600' : 'border-blue-600'} bg-gray-900 overflow-hidden flex-shrink-0`}>
          {hasPortrait ? (
            <Image
              src={entity.portrait_url!}
              alt={entity.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl flex items-center justify-center h-full">
              {getEntityIcon(entity.type)}
            </span>
          )}
        </div>

        {/* Name and basic info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-white font-medium truncate">{entity.name}</h4>
            <span className={`text-xs px-1.5 py-0.5 rounded ${entity.type === 'monster' ? 'bg-red-900/50 text-red-300' : 'bg-blue-900/50 text-blue-300'}`}>
              {entity.type === 'monster' ? 'Monster' : 'NPC'}
            </span>
          </div>
          <p className="text-sm text-gray-400 truncate">
            Met at {npc.first_met_scene?.name || 'Unknown'} • {formatDate(npc.first_met_at)}
          </p>
        </div>

        {/* Expand indicator */}
        <span className={`text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-700 pt-3 space-y-3">
          {/* Description */}
          {statBlock.description && (
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Description</p>
              <p className="text-sm text-gray-300">{statBlock.description}</p>
            </div>
          )}

          {/* Disposition */}
          {statBlock.disposition && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 uppercase">Disposition:</span>
              <span className={`text-sm capitalize ${getDispositionColor(statBlock.disposition)}`}>
                {statBlock.disposition}
              </span>
            </div>
          )}

          {/* Personality */}
          {statBlock.personality_quirk && (
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Personality</p>
              <p className="text-sm text-gray-300 italic">"{statBlock.personality_quirk}"</p>
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

          {/* Player Notes - future feature */}
          {npc.player_notes && (
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Your Notes</p>
              <p className="text-sm text-gray-300 bg-gray-900/50 p-2 rounded">{npc.player_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
