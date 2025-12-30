'use client'

import Image from 'next/image'

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

interface LocationJournalCardProps {
  location: JournalLocation
  expanded?: boolean
  onToggleExpand?: () => void
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

export default function LocationJournalCard({
  location,
  expanded = false,
  onToggleExpand
}: LocationJournalCardProps) {
  const scene = location.scene

  return (
    <div
      className="bg-gray-800 border-2 border-amber-700 rounded-lg overflow-hidden transition-all cursor-pointer hover:border-amber-500"
      onClick={onToggleExpand}
    >
      {/* Header - always visible */}
      <div className="p-3 flex items-center gap-3">
        {/* Location Icon */}
        <div className="w-12 h-12 rounded-lg border-2 border-amber-600 bg-gray-900 overflow-hidden flex-shrink-0 flex items-center justify-center">
          <span className="text-2xl">{getEnvironmentIcon(scene.environment)}</span>
        </div>

        {/* Name and basic info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-white font-medium truncate">{scene.name}</h4>
            {location.times_visited > 1 && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-300">
                {location.times_visited}x
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 truncate">
            {scene.location || scene.environment || 'Unknown location'} • First visited {formatDate(location.first_visited_at)}
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
          {scene.description && (
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Description</p>
              <p className="text-sm text-gray-300">{scene.description}</p>
            </div>
          )}

          {/* Environment & Location */}
          <div className="flex flex-wrap gap-3 text-sm">
            {scene.environment && (
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500">Environment:</span>
                <span className="text-amber-400 capitalize">{scene.environment}</span>
              </div>
            )}
            {scene.location && (
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500">Region:</span>
                <span className="text-amber-400">{scene.location}</span>
              </div>
            )}
          </div>

          {/* Visit stats */}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>
              First visit: <span className="text-white">{formatDate(location.first_visited_at)}</span>
            </span>
            {location.times_visited > 1 && (
              <>
                <span>•</span>
                <span>
                  Last visit: <span className="text-white">{formatDate(location.last_visited_at)}</span>
                </span>
                <span>•</span>
                <span>
                  Total: <span className="text-amber-400">{location.times_visited} visits</span>
                </span>
              </>
            )}
          </div>

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

          {/* Player Notes - future feature */}
          {location.player_notes && (
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Your Notes</p>
              <p className="text-sm text-gray-300 bg-gray-900/50 p-2 rounded">{location.player_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
