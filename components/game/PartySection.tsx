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
  portrait_url?: string
  profiles: { username: string }
}

interface PartySectionProps {
  characters: Character[]
}

// Class icons for avatar fallback
const CLASS_ICONS: Record<string, string> = {
  barbarian: '🪓',
  bard: '🎸',
  cleric: '✝️',
  druid: '🌿',
  fighter: '⚔️',
  monk: '👊',
  paladin: '🛡️',
  ranger: '🏹',
  rogue: '🗡️',
  sorcerer: '✨',
  warlock: '👁️',
  wizard: '🔮',
}

export default function PartySection({ characters }: PartySectionProps) {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null)

  const getHealthBarColor = (current: number, max: number) => {
    const percent = (current / max) * 100
    if (percent > 50) return 'bg-green-500'
    if (percent > 25) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getHealthPercent = (current: number, max: number) => {
    return Math.min(100, Math.max(0, (current / max) * 100))
  }

  const getClassIcon = (className: string) => {
    return CLASS_ICONS[className.toLowerCase()] || '⚔️'
  }

  if (characters.length === 0) {
    return (
      <PixelPanel>
        <div className="p-3">
          <h3 className="font-['Press_Start_2P'] text-xs text-amber-300 mb-2">
            Party
          </h3>
          <p className="text-gray-500 text-xs">No party members</p>
        </div>
      </PixelPanel>
    )
  }

  return (
    <PixelPanel>
      <div className="p-3">
        <h3 className="font-['Press_Start_2P'] text-xs text-amber-300 mb-3">
          Party
        </h3>

        {/* Avatar Row */}
        <div className="flex justify-center gap-2">
          {characters.map((char) => (
            <button
              key={char.id}
              onClick={() => setSelectedCharacterId(char.id)}
              className="flex flex-col items-center group cursor-pointer"
              title={`${char.name} - Lvl ${char.level} ${char.class}`}
            >
              {/* Avatar Circle */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-green-700 bg-gray-800 overflow-hidden flex items-center justify-center group-hover:border-green-500 group-hover:scale-105 transition-all">
                  {char.portrait_url ? (
                    <img
                      src={char.portrait_url}
                      alt={char.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">{getClassIcon(char.class)}</span>
                  )}
                </div>

                {/* AC Badge */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-900 border border-amber-700 rounded-full flex items-center justify-center">
                  <span className="text-[8px] text-amber-400 font-bold">{char.armor_class}</span>
                </div>
              </div>

              {/* Name */}
              <div className="mt-1 text-[10px] text-gray-300 truncate max-w-[56px] text-center group-hover:text-white transition-colors">
                {char.name.split(' ')[0]}
              </div>

              {/* HP Bar */}
              <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden mt-0.5">
                <div
                  className={`h-full transition-all ${getHealthBarColor(char.current_hp, char.max_hp)}`}
                  style={{ width: `${getHealthPercent(char.current_hp, char.max_hp)}%` }}
                />
              </div>

              {/* HP Text */}
              <div className="text-[8px] text-gray-500 mt-0.5">
                {char.current_hp}/{char.max_hp}
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
