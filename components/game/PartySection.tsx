'use client'

import { useState } from 'react'
import { PixelPanel } from '@/components/ui/PixelPanel'
import CharacterDetailModal from './CharacterDetailModal'

interface Character {
  id: string
  name: string
  class: string
  level: number
  current_hp: number
  max_hp: number
  armor_class: number
  profiles: { username: string }
}

interface PartySectionProps {
  characters: Character[]
}

export default function PartySection({ characters }: PartySectionProps) {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null)
  const getHealthColor = (current: number, max: number) => {
    const percent = (current / max) * 100
    if (percent > 50) return 'text-green-400'
    if (percent > 25) return 'text-amber-400'
    return 'text-red-400'
  }

  const getHealthBar = (current: number, max: number) => {
    const percent = Math.min(100, Math.max(0, (current / max) * 100))
    return (
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            percent > 50 ? 'bg-green-500' : percent > 25 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    )
  }

  if (characters.length === 0) {
    return (
      <PixelPanel>
        <div className="p-4">
          <h3 className="font-['Press_Start_2P'] text-sm text-amber-300 mb-3">
            Party
          </h3>
          <p className="text-gray-500 text-sm">No party members</p>
        </div>
      </PixelPanel>
    )
  }

  return (
    <PixelPanel>
      <div className="p-4">
        <h3 className="font-['Press_Start_2P'] text-sm text-amber-300 mb-3">
          Party
        </h3>
        <div className="space-y-2">
          {characters.map((char) => (
            <button
              key={char.id}
              onClick={() => setSelectedCharacterId(char.id)}
              className="w-full text-left p-3 bg-gray-800 border-2 border-green-700 rounded cursor-pointer hover:bg-gray-700 hover:border-green-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold truncate">{char.name}</div>
                  <div className="text-xs text-gray-400">
                    Lvl {char.level} {char.class}
                  </div>
                </div>
                <div className="text-right text-sm ml-2">
                  <div className="text-gray-400">AC {char.armor_class}</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">HP</span>
                  <span className={getHealthColor(char.current_hp, char.max_hp)}>
                    {char.current_hp}/{char.max_hp}
                  </span>
                </div>
                {getHealthBar(char.current_hp, char.max_hp)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Character Detail Modal */}
      {selectedCharacterId && (
        <CharacterDetailModal
          characterId={selectedCharacterId}
          onClose={() => setSelectedCharacterId(null)}
        />
      )}
    </PixelPanel>
  )
}
