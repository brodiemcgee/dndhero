'use client'

/**
 * SavingThrowsPanel Component
 * Displays all 6 saving throws with proficiency indicators
 */

import { Character, AbilityName, ABILITY_ABBREV, getSavingThrowModifier, formatModifier } from './types'

interface SavingThrowsPanelProps {
  character: Character
}

export function SavingThrowsPanel({ character }: SavingThrowsPanelProps) {
  const saves: AbilityName[] = [
    'strength',
    'dexterity',
    'constitution',
    'intelligence',
    'wisdom',
    'charisma'
  ]

  return (
    <div className="bg-fantasy-brown border-4 border-fantasy-tan rounded-lg p-4">
      <h3 className="text-sm font-bold text-fantasy-gold uppercase tracking-wider mb-3 text-center border-b-2 border-fantasy-tan pb-2">
        Saving Throws
      </h3>

      <div className="space-y-2">
        {saves.map((save) => {
          const isProficient = character.saving_throw_proficiencies?.includes(save)
          const modifier = getSavingThrowModifier(character, save)

          return (
            <div key={save} className="flex items-center gap-2">
              {/* Proficiency Indicator */}
              <div className={`
                w-4 h-4 rounded-full border-2 flex-shrink-0
                ${isProficient
                  ? 'bg-fantasy-gold border-fantasy-gold'
                  : 'bg-transparent border-fantasy-stone'
                }
              `} />

              {/* Modifier */}
              <span className={`
                w-8 text-center font-bold text-sm
                ${modifier >= 0 ? 'text-green-400' : 'text-red-400'}
              `}>
                {formatModifier(modifier)}
              </span>

              {/* Name */}
              <span className="text-fantasy-tan text-sm capitalize">
                {save}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
