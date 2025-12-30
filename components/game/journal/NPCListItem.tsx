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

interface NPCListItemProps {
  npc: JournalNPC
  selected: boolean
  onClick: () => void
}

function getEntityIcon(type: 'npc' | 'monster'): string {
  return type === 'monster' ? '👹' : '👤'
}

export default function NPCListItem({ npc, selected, onClick }: NPCListItemProps) {
  const entity = npc.entity
  const hasPortrait = entity.portrait_url && entity.portrait_generation_status === 'completed'

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-2.5 transition-colors text-left ${
        selected
          ? 'bg-gray-800 border-l-3 border-l-amber-400'
          : 'hover:bg-gray-800/50 border-l-3 border-l-transparent'
      }`}
    >
      {/* Portrait thumbnail */}
      <div className={`w-7 h-7 rounded-full border ${entity.type === 'monster' ? 'border-red-600' : 'border-blue-600'} bg-gray-900 overflow-hidden flex-shrink-0`}>
        {hasPortrait ? (
          <Image
            src={entity.portrait_url!}
            alt={entity.name}
            width={28}
            height={28}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs flex items-center justify-center h-full">
            {getEntityIcon(entity.type)}
          </span>
        )}
      </div>

      {/* Name */}
      <span className={`text-sm truncate ${selected ? 'text-white' : 'text-gray-300'}`}>
        {entity.name}
      </span>
    </button>
  )
}
