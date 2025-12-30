'use client'

import type { Race, Subrace, RacialTrait } from '@/types/character-options'
import { ALL_RACES } from '@/data/character-options/races'
import { hasSubraces } from '@/lib/character/stats-calculator'
import { AbilityBonusList } from '../shared/AbilityBonusBadge'

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
  const handleRaceSelect = (race: Race) => {
    onRaceSelect(race)
    // Clear subrace if race changed or new race has no subraces
    if (!hasSubraces(race)) {
      onSubraceSelect(null)
    } else if (selectedRace?.id !== race.id) {
      onSubraceSelect(null)
    }
  }

  return (
    <div>
      <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
        Choose Your Race
      </h2>
      <p className="text-fantasy-stone mb-6">
        Your race determines your character's physical traits, abilities, and cultural background.
      </p>

      {/* List + Detail Panel Layout */}
      <div className="flex gap-6">
        {/* Left: Race List */}
        <div className="w-44 flex-shrink-0">
          <div className="space-y-1">
            {ALL_RACES.map(race => (
              <RaceListItem
                key={race.id}
                race={race}
                selected={selectedRace?.id === race.id}
                onSelect={handleRaceSelect}
              />
            ))}
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div className="flex-1 min-w-0">
          {selectedRace ? (
            <RaceDetailPanel
              race={selectedRace}
              selectedSubrace={selectedSubrace}
              onSubraceSelect={onSubraceSelect}
            />
          ) : (
            <div className="h-full flex items-center justify-center p-8 bg-stone-800/30 border-2 border-stone-700 border-dashed rounded-lg">
              <p className="text-fantasy-stone text-center">
                Select a race from the list to see details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Subrace required warning */}
      {selectedRace && hasSubraces(selectedRace) && !selectedSubrace && (
        <div className="mt-4 p-3 bg-amber-900/30 border border-amber-700 rounded text-amber-400 text-sm">
          Please select a subrace to continue.
        </div>
      )}
    </div>
  )
}

// List item component
interface RaceListItemProps {
  race: Race
  selected: boolean
  onSelect: (race: Race) => void
}

function RaceListItem({ race, selected, onSelect }: RaceListItemProps) {
  const hasSubraceOptions = hasSubraces(race)

  return (
    <button
      onClick={() => onSelect(race)}
      className={`w-full text-left px-3 py-2 rounded transition-colors ${
        selected
          ? 'bg-amber-900/50 border-l-2 border-amber-500 text-amber-300 font-medium'
          : 'hover:bg-stone-800 text-fantasy-light border-l-2 border-transparent'
      }`}
    >
      <span>{race.name}</span>
      {hasSubraceOptions && (
        <span className="ml-1 text-purple-400 text-xs">●</span>
      )}
    </button>
  )
}

// Detail panel component
interface RaceDetailPanelProps {
  race: Race
  selectedSubrace: Subrace | null
  onSubraceSelect: (subrace: Subrace | null) => void
}

function RaceDetailPanel({ race, selectedSubrace, onSubraceSelect }: RaceDetailPanelProps) {
  return (
    <div className="bg-stone-800/50 border-2 border-stone-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-700 bg-stone-800/50">
        <h3 className="text-xl font-bold text-fantasy-gold">{race.name}</h3>
        <div className="flex items-center gap-4 mt-1 text-sm text-fantasy-stone">
          <span>Size: <span className="text-fantasy-light">{race.size}</span></span>
          <span>Speed: <span className="text-fantasy-light">{race.speed} ft</span></span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-5 max-h-[400px] overflow-y-auto">
        {/* Description */}
        <p className="text-fantasy-light text-sm leading-relaxed">{race.description}</p>

        {/* Ability Bonuses */}
        <div>
          <h4 className="text-sm font-semibold text-amber-400 mb-2">Ability Score Increases</h4>
          <AbilityBonusList bonuses={race.abilityBonuses} />
        </div>

        {/* Languages */}
        <div>
          <h4 className="text-sm font-semibold text-amber-400 mb-1">Languages</h4>
          <p className="text-fantasy-light text-sm">{race.languages.join(', ')}</p>
        </div>

        {/* Traits */}
        <div>
          <h4 className="text-sm font-semibold text-amber-400 mb-3">Racial Traits</h4>
          <div className="space-y-3">
            {race.traits.map(trait => (
              <TraitDetail key={trait.id} trait={trait} />
            ))}
          </div>
        </div>

        {/* Subraces */}
        {race.subraces && race.subraces.length > 0 && (
          <div className="pt-3 border-t border-stone-700">
            <h4 className="text-sm font-semibold text-purple-400 mb-3">
              Choose Subrace
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {race.subraces.map(subrace => (
                <SubraceOption
                  key={subrace.id}
                  subrace={subrace}
                  selected={selectedSubrace?.id === subrace.id}
                  onSelect={() => onSubraceSelect(subrace)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Trait detail component
interface TraitDetailProps {
  trait: RacialTrait
}

function TraitDetail({ trait }: TraitDetailProps) {
  return (
    <div className="border-l-2 border-amber-700/50 pl-3">
      <h5 className="font-medium text-fantasy-gold text-sm flex items-center gap-2">
        {trait.name}
        {trait.darkvision && (
          <span className="text-xs text-blue-400">({trait.darkvision} ft)</span>
        )}
      </h5>
      <p className="text-xs text-fantasy-light/80 mt-0.5">{trait.description}</p>

      {/* Special mechanics badges */}
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {trait.resistances && trait.resistances.length > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 bg-red-900/30 text-red-400 rounded">
            Resist: {trait.resistances.join(', ')}
          </span>
        )}
        {trait.proficiencies?.skills && (
          <span className="text-[10px] px-1.5 py-0.5 bg-green-900/30 text-green-400 rounded">
            Skills: {trait.proficiencies.skills.join(', ')}
          </span>
        )}
        {trait.proficiencies?.weapons && (
          <span className="text-[10px] px-1.5 py-0.5 bg-orange-900/30 text-orange-400 rounded">
            Weapons: {trait.proficiencies.weapons.join(', ')}
          </span>
        )}
      </div>
    </div>
  )
}

// Subrace option component
interface SubraceOptionProps {
  subrace: Subrace
  selected: boolean
  onSelect: () => void
}

function SubraceOption({ subrace, selected, onSelect }: SubraceOptionProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
        selected
          ? 'border-purple-500 bg-purple-900/30'
          : 'border-stone-600 bg-stone-800/30 hover:border-purple-600'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              selected
                ? 'bg-purple-500 border-purple-500'
                : 'bg-transparent border-stone-500'
            }`}
          >
            {selected && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className="font-medium text-purple-300">{subrace.name}</span>
        </div>
        <AbilityBonusList bonuses={subrace.abilityBonuses} size="sm" />
      </div>
      {subrace.traits.length > 0 && (
        <div className="mt-1.5 ml-6 text-xs text-fantasy-stone">
          {subrace.traits.map(t => t.name).join(', ')}
        </div>
      )}
    </button>
  )
}
