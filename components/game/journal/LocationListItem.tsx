'use client'

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

interface LocationListItemProps {
  location: JournalLocation
  selected: boolean
  onClick: () => void
}

function getEnvironmentIcon(environment?: string | null): string {
  switch (environment?.toLowerCase()) {
    case 'dungeon':
    case 'cave':
      return '🏰'
    case 'forest':
    case 'woods':
      return '🌲'
    case 'town':
    case 'city':
    case 'village':
      return '🏘️'
    case 'tavern':
    case 'inn':
      return '🍺'
    case 'mountain':
      return '⛰️'
    case 'coast':
    case 'beach':
    case 'ocean':
      return '🌊'
    case 'swamp':
    case 'marsh':
      return '🐸'
    case 'desert':
      return '🏜️'
    case 'temple':
    case 'shrine':
      return '⛩️'
    default:
      return '📍'
  }
}

export default function LocationListItem({ location, selected, onClick }: LocationListItemProps) {
  const scene = location.scene

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-2.5 transition-colors text-left ${
        selected
          ? 'bg-gray-800 border-l-3 border-l-amber-400'
          : 'hover:bg-gray-800/50 border-l-3 border-l-transparent'
      }`}
    >
      {/* Environment icon */}
      <div className="w-7 h-7 rounded border border-amber-600 bg-gray-900 overflow-hidden flex-shrink-0 flex items-center justify-center">
        <span className="text-sm">{getEnvironmentIcon(scene.environment)}</span>
      </div>

      {/* Name */}
      <span className={`text-sm truncate flex-1 ${selected ? 'text-white' : 'text-gray-300'}`}>
        {scene.name}
      </span>

      {/* Visit count badge */}
      {location.times_visited > 1 && (
        <span className="text-xs px-1 py-0.5 rounded bg-amber-900/50 text-amber-300 flex-shrink-0">
          {location.times_visited}x
        </span>
      )}
    </button>
  )
}
