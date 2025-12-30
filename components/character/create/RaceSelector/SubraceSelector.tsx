'use client'

import type { Race, Subrace } from '@/types/character-options'
import { AbilityBonusList } from '../shared/AbilityBonusBadge'

interface SubraceSelectorProps {
  race: Race
  selectedSubrace: Subrace | null
  onSelect: (subrace: Subrace) => void
}

export function SubraceSelector({ race, selectedSubrace, onSelect }: SubraceSelectorProps) {
  if (!race.subraces || race.subraces.length === 0) {
    return null
  }

  return (
    <div className="mt-6 p-4 bg-purple-900/20 border-2 border-purple-700/50 rounded-lg">
      <h3 className="font-['Press_Start_2P'] text-sm text-purple-300 mb-4">
        Choose Your {race.name} Subrace
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {race.subraces.map(subrace => (
          <SubraceCard
            key={subrace.id}
            subrace={subrace}
            selected={selectedSubrace?.id === subrace.id}
            onSelect={() => onSelect(subrace)}
          />
        ))}
      </div>
    </div>
  )
}

interface SubraceCardProps {
  subrace: Subrace
  selected: boolean
  onSelect: () => void
}

function SubraceCard({ subrace, selected, onSelect }: SubraceCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`
        p-3 rounded-lg border-2 text-left transition-all
        ${selected
          ? 'border-purple-500 bg-purple-900/30 ring-1 ring-purple-500/50'
          : 'border-stone-700 bg-stone-800/50 hover:border-purple-600 hover:bg-stone-800'
        }
      `}
    >
      {/* Header with checkbox */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`
            w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0
            ${selected
              ? 'bg-purple-500 border-purple-500'
              : 'bg-transparent border-stone-500'
            }
          `}
        >
          {selected && (
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <h4 className="font-bold text-purple-300">{subrace.name}</h4>
      </div>

      {/* Ability bonuses */}
      <div className="mb-2">
        <AbilityBonusList bonuses={subrace.abilityBonuses} size="sm" />
      </div>

      {/* Trait names */}
      <div className="text-xs text-fantasy-stone">
        {subrace.traits.map(t => t.name).join(', ')}
      </div>
    </button>
  )
}
