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
    const className = character.class.toLowerCase().split(' ')[0] // Handle multiclass like "Fighter / Wizard"
    return CLASS_ICONS[className] || '⚔️'
  }

  return (
    <button
      onClick={onClick}
      disabled={!hasCharacter}
      className={`
        w-full p-3 rounded border-2 transition-all text-left
        ${hasCharacter
          ? 'bg-gray-800 border-gray-700 hover:border-amber-600 hover:bg-gray-750 cursor-pointer'
          : 'bg-gray-800/50 border-gray-700/50 cursor-not-allowed opacity-70'
        }
      `}
    >
      <div className="flex gap-3">
        {/* Portrait/Avatar */}
        <div className="w-14 h-14 rounded-lg border-2 border-amber-700 bg-gray-900 overflow-hidden flex-shrink-0">
          {character?.portrait_url ? (
            <Image
              src={character.portrait_url}
              alt={character.name}
              width={56}
              height={56}
              className="object-cover w-full h-full"
            />
          ) : hasCharacter ? (
            <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-800">
              {getClassIcon()}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl text-gray-600 bg-gray-800">
              ?
            </div>
          )}
        </div>

        {/* Character Info */}
        <div className="flex-1 min-w-0">
          {hasCharacter ? (
            <>
              {/* Character Name + Level */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-300 truncate">
                  {character!.name}
                </span>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  Lv.{character!.level}
                </span>
              </div>

              {/* Race & Class */}
              <div className="text-sm text-gray-400 truncate">
                {character!.race} {character!.class}
              </div>

              {/* HP Bar + AC */}
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${getHealthColor()}`}
                    style={{ width: `${getHealthPercent()}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  AC {character!.armor_class}
                </span>
              </div>
            </>
          ) : (
            <div className="text-gray-500 italic py-2">
              No character assigned
            </div>
          )}

          {/* Player Username */}
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="text-gray-500">
              {member.profiles.username}
            </span>
            {member.role === 'host' && (
              <span className="px-1.5 py-0.5 bg-amber-700/30 text-amber-400 rounded text-[10px]">
                DM
              </span>
            )}
            {isCurrentUser && (
              <span className="text-gray-600">(You)</span>
            )}
          </div>
        </div>

        {/* Click indicator for characters */}
        {hasCharacter && (
          <div className="flex items-center text-gray-600 text-sm self-center">
            ›
          </div>
        )}
      </div>
    </button>
  )
}
