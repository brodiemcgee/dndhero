'use client'

/**
 * CharacterSheetHeader Component
 * Displays portrait, name, class, race, level, and basic info
 * Styled like the top of an official D&D character sheet
 */

import Image from 'next/image'
import { Character, CLASS_HIT_DICE } from './types'

interface CharacterSheetHeaderProps {
  character: Character
  onPortraitClick?: () => void
}

export function CharacterSheetHeader({ character, onPortraitClick }: CharacterSheetHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-fantasy-brown to-amber-900/80 border-4 border-fantasy-tan rounded-lg p-4 mb-6">
      <div className="flex gap-6">
        {/* Portrait */}
        <div
          className="relative flex-shrink-0 cursor-pointer group"
          onClick={onPortraitClick}
        >
          <div className="w-32 h-32 md:w-40 md:h-40 border-4 border-fantasy-gold bg-fantasy-dark rounded-lg overflow-hidden">
            {character.portrait_url ? (
              <Image
                src={character.portrait_url}
                alt={character.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-fantasy-stone">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            )}
          </div>
          {onPortraitClick && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
              <span className="text-white text-xs">Change</span>
            </div>
          )}
        </div>

        {/* Character Info */}
        <div className="flex-1 min-w-0">
          {/* Name Row */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold text-fantasy-gold truncate">
                {character.name}
              </h1>
              <p className="text-fantasy-tan text-lg">
                Level {character.level} {character.race} {character.class}
              </p>
            </div>

            {/* XP Badge */}
            <div className="flex-shrink-0 text-right">
              <div className="text-xs text-fantasy-stone uppercase tracking-wide">Experience</div>
              <div className="text-xl font-bold text-fantasy-tan">
                {(character.experience || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <InfoBox label="Background" value={character.background || 'None'} />
            <InfoBox label="Alignment" value={character.alignment || 'Neutral'} />
            <InfoBox label="Hit Dice" value={`${character.level}${CLASS_HIT_DICE[character.class] || 'd8'}`} />
            <InfoBox
              label="Proficiency"
              value={`+${character.proficiency_bonus || 2}`}
              highlight
            />
          </div>
        </div>
      </div>

      {/* Campaign Badge (if in campaign) */}
      {character.campaign_name && (
        <div className="mt-4 pt-3 border-t border-fantasy-stone/30">
          <span className="text-xs text-fantasy-stone">Campaign: </span>
          <span className="text-amber-400 font-bold">{character.campaign_name}</span>
        </div>
      )}
    </div>
  )
}

interface InfoBoxProps {
  label: string
  value: string
  highlight?: boolean
}

function InfoBox({ label, value, highlight }: InfoBoxProps) {
  return (
    <div className={`px-3 py-2 rounded border ${
      highlight
        ? 'bg-purple-900/40 border-purple-700'
        : 'bg-fantasy-dark/50 border-fantasy-stone/30'
    }`}>
      <div className="text-xs text-fantasy-stone uppercase tracking-wide">{label}</div>
      <div className={`font-bold truncate ${highlight ? 'text-purple-300' : 'text-white'}`}>
        {value}
      </div>
    </div>
  )
}
