'use client'

import type { Race } from '@/types/character-options'
import { SelectionCard } from '../shared/SelectionCard'
import { AbilityBonusList } from '../shared/AbilityBonusBadge'
import { hasSubraces } from '@/lib/character/stats-calculator'

interface RaceCardProps {
  race: Race
  selected: boolean
  onSelect: (race: Race) => void
  onViewDetails: (race: Race) => void
}

export function RaceCard({ race, selected, onSelect, onViewDetails }: RaceCardProps) {
  const hasSubraceOptions = hasSubraces(race)

  return (
    <SelectionCard
      id={race.id}
      name={race.name}
      description={race.description}
      selected={selected}
      onSelect={() => onSelect(race)}
      onViewDetails={() => onViewDetails(race)}
      badge={
        <AbilityBonusList bonuses={race.abilityBonuses} />
      }
    >
      <div className="space-y-2 text-sm">
        {/* Size and Speed */}
        <div className="flex gap-4 text-fantasy-stone">
          <span>Size: <span className="text-fantasy-light">{race.size}</span></span>
          <span>Speed: <span className="text-fantasy-light">{race.speed} ft</span></span>
        </div>

        {/* Languages */}
        <div className="text-fantasy-stone">
          Languages: <span className="text-fantasy-light">{race.languages.join(', ')}</span>
        </div>

        {/* Trait names */}
        <div className="text-fantasy-stone">
          Traits:{' '}
          <span className="text-fantasy-light">
            {race.traits.map(t => t.name).join(', ')}
          </span>
        </div>

        {/* Subrace indicator */}
        {hasSubraceOptions && (
          <div className="mt-2 px-2 py-1 bg-purple-900/30 border border-purple-700/50 rounded text-purple-300 text-xs">
            Has {race.subraces?.length} subraces to choose from
          </div>
        )}
      </div>
    </SelectionCard>
  )
}
