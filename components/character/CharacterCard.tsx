'use client'

/**
 * CharacterCard Component
 * Displays a character in a card format for the dashboard
 */

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
}

interface CharacterCardProps {
  character: Character
}

export function CharacterCard({ character }: CharacterCardProps) {
  const isInCampaign = !character.is_standalone && character.campaign_id

  return (
    <Link href={`/character/${character.id}`}>
      <PixelPanel
        className="p-6 hover:border-fantasy-gold transition-colors cursor-pointer h-full"
      >
        <div className="space-y-3">
          {/* Character Name & Level */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-fantasy-gold truncate">
              {character.name}
            </h3>
            <span className="text-fantasy-tan text-sm font-bold">
              Lv. {character.level}
            </span>
          </div>

          {/* Race & Class */}
          <div className="text-fantasy-tan text-sm">
            {character.race} {character.class}
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <div className="text-fantasy-stone">
              <span className="text-red-400">HP:</span>{' '}
              <span className="text-white">
                {character.current_hp}/{character.max_hp}
              </span>
            </div>
            <div className="text-fantasy-stone">
              <span className="text-blue-400">AC:</span>{' '}
              <span className="text-white">{character.armor_class}</span>
            </div>
          </div>

          {/* Campaign Status */}
          <div className="pt-2 border-t border-fantasy-stone">
            {isInCampaign ? (
              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-1 bg-amber-700/30 border border-amber-600 text-amber-400 text-xs font-bold rounded">
                  IN CAMPAIGN
                </span>
                <span className="text-fantasy-tan text-xs truncate">
                  {character.campaign_name}
                </span>
              </div>
            ) : (
              <span className="inline-block px-2 py-1 bg-green-700/30 border border-green-600 text-green-400 text-xs font-bold rounded">
                AVAILABLE
              </span>
            )}
          </div>
        </div>
      </PixelPanel>
    </Link>
  )
}
