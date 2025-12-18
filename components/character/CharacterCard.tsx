'use client'

/**
 * CharacterCard Component
 * Displays a character in a card format for the dashboard
 * Now includes portrait thumbnail
 */

import Image from 'next/image'
import Link from 'next/link'
import { PixelPanel } from '@/components/ui/PixelPanel'

interface Character {
  id: string
  name: string
  race: string
  class: string
  level: number
  max_hp: number
  current_hp: number
  armor_class: number
  campaign_id: string | null
  campaign_name: string | null
  campaign_state: string | null
  is_standalone: boolean
  portrait_url?: string | null
}

interface CharacterCardProps {
  character: Character
}

export function CharacterCard({ character }: CharacterCardProps) {
  const isInCampaign = !character.is_standalone && character.campaign_id

  return (
    <Link href={`/character/${character.id}`}>
      <PixelPanel
        className="p-4 hover:border-fantasy-gold transition-colors cursor-pointer h-full"
      >
        <div className="flex gap-4">
          {/* Portrait Thumbnail */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 border-2 border-fantasy-stone bg-fantasy-dark rounded-lg overflow-hidden">
              {character.portrait_url ? (
                <Image
                  src={character.portrait_url}
                  alt={character.name}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-fantasy-stone">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Character Info */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Name & Level */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-fantasy-gold truncate">
                {character.name}
              </h3>
              <span className="text-fantasy-tan text-sm font-bold flex-shrink-0">
                Lv. {character.level}
              </span>
            </div>

            {/* Race & Class */}
            <div className="text-fantasy-tan text-sm">
              {character.race} {character.class}
            </div>

            {/* Stats Row */}
            <div className="flex gap-4 text-sm">
              <div className="text-fantasy-stone">
                <span className="text-red-400">HP:</span>{' '}
                <span className={`font-bold ${
                  character.current_hp / character.max_hp > 0.5
                    ? 'text-white'
                    : character.current_hp / character.max_hp > 0.25
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}>
                  {character.current_hp}/{character.max_hp}
                </span>
              </div>
              <div className="text-fantasy-stone">
                <span className="text-blue-400">AC:</span>{' '}
                <span className="text-white font-bold">{character.armor_class}</span>
              </div>
            </div>

            {/* Campaign Status */}
            <div className="pt-2 border-t border-fantasy-stone/30">
              {isInCampaign ? (
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2 py-0.5 bg-amber-700/30 border border-amber-600 text-amber-400 text-xs font-bold rounded">
                    IN CAMPAIGN
                  </span>
                  <span className="text-fantasy-tan text-xs truncate">
                    {character.campaign_name}
                  </span>
                </div>
              ) : (
                <span className="inline-block px-2 py-0.5 bg-green-700/30 border border-green-600 text-green-400 text-xs font-bold rounded">
                  AVAILABLE
                </span>
              )}
            </div>
          </div>
        </div>
      </PixelPanel>
    </Link>
  )
}
