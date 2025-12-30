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

interface LocationDetailPanelProps {
  location: JournalLocation
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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

export default function LocationDetailPanel({ location }: LocationDetailPanelProps) {
  const scene = location.scene

  return (
    <div className="space-y-4">
      {/* Header with icon */}
      <div className="flex items-start gap-4">
        {/* Large icon */}
        <div className="w-20 h-20 rounded-lg border-2 border-amber-600 bg-gray-900 overflow-hidden flex-shrink-0 flex items-center justify-center">
          <span className="text-4xl">{getEnvironmentIcon(scene.environment)}</span>
        </div>

        {/* Name and meta */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-medium text-white mb-1">{scene.name}</h3>
          <div className="flex items-center gap-2 flex-wrap text-sm">
            {scene.environment && (
              <span className="px-2 py-0.5 rounded bg-amber-900/50 text-amber-300 capitalize">
                {scene.environment}
              </span>
            )}
            {scene.location && (
              <span className="text-gray-400">{scene.location}</span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1">
            First visited {formatDate(location.first_visited_at)}
            {location.times_visited > 1 && ` • ${location.times_visited} visits`}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700" />

      {/* Description */}
      {scene.description && (
        <div>
          <p className="text-xs text-gray-500 uppercase mb-1">Description</p>
          <p className="text-sm text-gray-300">{scene.description}</p>
        </div>
      )}

      {/* Visit stats */}
      {location.times_visited > 1 && (
        <div>
          <p className="text-xs text-gray-500 uppercase mb-1">Visit History</p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>
              First: <span className="text-white">{formatDate(location.first_visited_at)}</span>
            </span>
            <span>
              Last: <span className="text-white">{formatDate(location.last_visited_at)}</span>
            </span>
            <span>
              Total: <span className="text-amber-400">{location.times_visited} visits</span>
            </span>
          </div>
        </div>
      )}

      {/* NPCs met here */}
      {location.npcs_met && location.npcs_met.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase mb-2">NPCs Met Here</p>
          <div className="flex flex-wrap gap-2">
            {location.npcs_met.map(npc => (
              <div
                key={npc.id}
                className="flex items-center gap-1.5 px-2 py-1 bg-gray-900/50 rounded-full border border-gray-700"
              >
                <span className="text-sm">
                  {npc.type === 'monster' ? '👹' : '👤'}
                </span>
                <span className="text-sm text-gray-300">{npc.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player Notes */}
      {location.player_notes && (
        <div>
          <p className="text-xs text-gray-500 uppercase mb-1">Your Notes</p>
          <p className="text-sm text-gray-300 bg-gray-900/50 p-2 rounded">{location.player_notes}</p>
        </div>
      )}
    </div>
  )
}
