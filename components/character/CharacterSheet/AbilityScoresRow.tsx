'use client'

/**
 * AbilityScoresRow Component
 * Displays all 6 ability scores in the iconic D&D box format
 * Score on top, modifier below
 */

import { Character, AbilityName, ABILITY_ABBREV, getModifier, formatModifier } from './types'

interface AbilityScoresRowProps {
  character: Character
}

export function AbilityScoresRow({ character }: AbilityScoresRowProps) {
  const abilities: AbilityName[] = [
    'strength',
    'dexterity',
    'constitution',
    'intelligence',
    'wisdom',
    'charisma'
  ]

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
      {abilities.map((ability) => (
        <AbilityBox
          key={ability}
          name={ABILITY_ABBREV[ability]}
          score={character[ability]}
        />
      ))}
    </div>
  )
}

interface AbilityBoxProps {
  name: string
  score: number
}

function AbilityBox({ name, score }: AbilityBoxProps) {
  const modifier = getModifier(score)

  return (
    <div className="relative bg-fantasy-brown border-4 border-fantasy-tan rounded-lg p-3 text-center">
      {/* Ability Name */}
      <div className="text-xs font-bold text-fantasy-gold tracking-wider mb-1">
        {name}
      </div>

      {/* Score */}
      <div className="text-3xl font-bold text-white mb-1">
        {score}
      </div>

      {/* Modifier in circle */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
        <div className={`
          w-10 h-10 rounded-full border-3 flex items-center justify-center text-lg font-bold
          ${modifier >= 0
            ? 'bg-green-900 border-green-600 text-green-300'
            : 'bg-red-900 border-red-600 text-red-300'
          }
        `}>
          {formatModifier(modifier)}
        </div>
      </div>
    </div>
  )
}
