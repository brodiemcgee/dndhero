'use client'

import Image from 'next/image'

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

interface PartyMemberCardProps {
  member: {
    user_id: string
    role: 'host' | 'player'
    profiles: {
      username: string
      avatar_url?: string | null
    }
    character: {
      id: string
      name: string
      race: string
      class: string
      level: number
      current_hp: number
      max_hp: number
      armor_class: number
      portrait_url?: string | null
    } | null
  }
  isCurrentUser: boolean
  onClick: () => void
}

export function PartyMemberCard({ member, isCurrentUser, onClick }: PartyMemberCardProps) {
  const { character } = member
  const hasCharacter = !!character

  const getHealthPercent = () => {
    if (!character) return 100
    return Math.min(100, Math.max(0, (character.current_hp / character.max_hp) * 100))
  }

  const getHealthColor = () => {
    const percent = getHealthPercent()
    if (percent > 50) return 'bg-green-500'
    if (percent > 25) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getClassIcon = () => {
    if (!character) return '?'
    const className = character.class.toLowerCase().split(' ')[0]
    return CLASS_ICONS[className] || '⚔️'
  }

  return (
    <button
      onClick={onClick}
      disabled={!hasCharacter}
      className={`
        w-full rounded-lg border-2 transition-all overflow-hidden
        ${hasCharacter
          ? 'bg-gray-800 border-amber-700 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-900/30 cursor-pointer'
          : 'bg-gray-800/50 border-gray-700 cursor-not-allowed opacity-70'
        }
        ${isCurrentUser ? 'ring-2 ring-amber-500/50' : ''}
      `}
    >
      {/* Portrait Area */}
      <div className="relative aspect-[3/4] bg-gray-900">
        {character?.portrait_url ? (
          <Image
            src={character.portrait_url}
            alt={character.name}
            fill
            className="object-cover"
          />
        ) : hasCharacter ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
            <span className="text-6xl">{getClassIcon()}</span>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
            <span className="text-5xl text-gray-600">?</span>
          </div>
        )}

        {/* Level badge */}
        {hasCharacter && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded text-amber-400 text-xs font-bold">
            Lv.{character!.level}
          </div>
        )}

        {/* HP Bar overlay at bottom of portrait */}
        {hasCharacter && (
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-700/80 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${getHealthColor()}`}
                  style={{ width: `${getHealthPercent()}%` }}
                />
              </div>
              <span className="text-xs text-white font-medium">
                {character!.current_hp}/{character!.max_hp}
              </span>
            </div>
          </div>
        )}

        {/* Current user indicator */}
        {isCurrentUser && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-amber-600 rounded text-white text-xs font-bold">
            YOU
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className="p-3">
        {hasCharacter ? (
          <>
            {/* Character Name */}
            <div className="font-bold text-amber-300 truncate text-sm">
              {character!.name}
            </div>

            {/* Race & Class */}
            <div className="text-xs text-gray-400 truncate">
              {character!.race} {character!.class}
            </div>

            {/* AC */}
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-gray-500">AC</span>
              <span className="text-xs text-white font-bold">{character!.armor_class}</span>
            </div>
          </>
        ) : (
          <div className="text-gray-500 text-xs italic text-center py-1">
            No character
          </div>
        )}

        {/* Player info */}
        <div className="mt-2 pt-2 border-t border-gray-700 flex items-center justify-between">
          <span className="text-xs text-gray-500 truncate">
            {member.profiles.username}
          </span>
          {member.role === 'host' && (
            <span className="px-1.5 py-0.5 bg-amber-700/30 text-amber-400 rounded text-[10px] font-medium">
              DM
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
