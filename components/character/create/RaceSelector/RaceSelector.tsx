'use client'

import { useState } from 'react'
import type { Race, Subrace } from '@/types/character-options'
import { ALL_RACES } from '@/data/character-options/races'
import { hasSubraces } from '@/lib/character/stats-calculator'
import { RaceCard } from './RaceCard'
import { RaceDetail } from './RaceDetail'
import { SubraceSelector } from './SubraceSelector'
import { SelectionGrid } from '../shared/SelectionCard'

interface RaceSelectorProps {
  selectedRace: Race | null
  selectedSubrace: Subrace | null
  onRaceSelect: (race: Race) => void
  onSubraceSelect: (subrace: Subrace | null) => void
}

export function RaceSelector({
  selectedRace,
  selectedSubrace,
  onRaceSelect,
  onSubraceSelect,
}: RaceSelectorProps) {
  const [detailRace, setDetailRace] = useState<Race | null>(null)

  const handleRaceSelect = (race: Race) => {
    onRaceSelect(race)
    // Clear subrace if race changed or new race has no subraces
    if (!hasSubraces(race)) {
      onSubraceSelect(null)
    } else if (selectedRace?.id !== race.id) {
      onSubraceSelect(null)
    }
  }

  const handleViewDetails = (race: Race) => {
    setDetailRace(race)
  }

  return (
    <div>
      <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
        Choose Your Race
      </h2>
      <p className="text-fantasy-stone mb-6">
        Your race determines your character's physical traits, abilities, and cultural background.
        Click on a race to select it, or click "Details" for more information.
      </p>

      {/* Race grid */}
      <SelectionGrid columns={3}>
        {ALL_RACES.map(race => (
          <RaceCard
            key={race.id}
            race={race}
            selected={selectedRace?.id === race.id}
            onSelect={handleRaceSelect}
            onViewDetails={handleViewDetails}
          />
        ))}
      </SelectionGrid>

      {/* Subrace selector (shows when race with subraces is selected) */}
      {selectedRace && hasSubraces(selectedRace) && (
        <SubraceSelector
          race={selectedRace}
          selectedSubrace={selectedSubrace}
          onSelect={onSubraceSelect}
        />
      )}

      {/* Subrace required warning */}
      {selectedRace && hasSubraces(selectedRace) && !selectedSubrace && (
        <div className="mt-4 p-3 bg-amber-900/30 border border-amber-700 rounded text-amber-400 text-sm">
          Please select a subrace to continue.
        </div>
      )}

      {/* Detail modal */}
      {detailRace && (
        <RaceDetail
          race={detailRace}
          onClose={() => setDetailRace(null)}
          onSelect={handleRaceSelect}
          isSelected={selectedRace?.id === detailRace.id}
        />
      )}
    </div>
  )
}
