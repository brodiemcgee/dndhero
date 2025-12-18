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
    <div className="bg-fantasy-brown border-4 border-fantasy-tan rounded-lg p-4 text-center">
      {/* Ability Name */}
      <div className="text-xs font-bold text-fantasy-gold tracking-wider mb-2">
        {name}
      </div>

      {/* Score and Modifier inline */}
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-3xl font-bold text-white">
          {score}
        </span>
        <span className={`text-lg font-bold ${
          modifier >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          ({formatModifier(modifier)})
        </span>
      </div>
    </div>
  )
}
