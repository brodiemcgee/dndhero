'use client'

import type { Race, RacialTrait } from '@/types/character-options'
import { AbilityBonusList } from '../shared/AbilityBonusBadge'
import { PixelButton } from '@/components/ui/PixelButton'

interface RaceDetailProps {
  race: Race
  onClose: () => void
  onSelect: (race: Race) => void
  isSelected: boolean
}

export function RaceDetail({ race, onClose, onSelect, isSelected }: RaceDetailProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <div
        className="bg-stone-900 border-2 border-stone-600 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-700 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-fantasy-gold">{race.name}</h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-fantasy-stone">
              <span>Size: {race.size}</span>
              <span>Speed: {race.speed} ft</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-fantasy-stone hover:text-fantasy-light text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Description */}
          <p className="text-fantasy-light">{race.description}</p>

          {/* Ability Bonuses */}
          <div>
            <h3 className="text-lg font-semibold text-amber-400 mb-2">Ability Score Increases</h3>
            <AbilityBonusList bonuses={race.abilityBonuses} />
          </div>

          {/* Languages */}
          <div>
            <h3 className="text-lg font-semibold text-amber-400 mb-2">Languages</h3>
            <p className="text-fantasy-light">{race.languages.join(', ')}</p>
          </div>

          {/* Traits */}
          <div>
            <h3 className="text-lg font-semibold text-amber-400 mb-3">Racial Traits</h3>
            <div className="space-y-4">
              {race.traits.map(trait => (
                <TraitDetail key={trait.id} trait={trait} />
              ))}
            </div>
          </div>

          {/* Subraces */}
          {race.subraces && race.subraces.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-3">Subraces</h3>
              <div className="space-y-4">
                {race.subraces.map(subrace => (
                  <div
                    key={subrace.id}
                    className="p-4 bg-stone-800/50 border border-stone-700 rounded-lg"
                  >
                    <h4 className="font-bold text-purple-300 mb-1">{subrace.name}</h4>
                    <p className="text-sm text-fantasy-light/80 mb-2">{subrace.description}</p>
                    <div className="mb-2">
                      <AbilityBonusList bonuses={subrace.abilityBonuses} size="sm" />
                    </div>
                    {subrace.traits.length > 0 && (
                      <div className="space-y-2 mt-3">
                        {subrace.traits.map(trait => (
                          <div key={trait.id} className="text-sm">
                            <span className="text-amber-400">{trait.name}: </span>
                            <span className="text-fantasy-light/80">{trait.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-700 flex justify-end gap-3">
          <PixelButton variant="secondary" onClick={onClose}>
            Close
          </PixelButton>
          <PixelButton onClick={() => { onSelect(race); onClose() }}>
            {isSelected ? 'Selected' : 'Select Race'}
          </PixelButton>
        </div>
      </div>
    </div>
  )
}

interface TraitDetailProps {
  trait: RacialTrait
}

function TraitDetail({ trait }: TraitDetailProps) {
  return (
    <div className="border-l-2 border-amber-700/50 pl-4">
      <h4 className="font-semibold text-fantasy-gold flex items-center gap-2">
        {trait.name}
        {trait.darkvision && (
          <span className="text-xs text-blue-400">({trait.darkvision} ft)</span>
        )}
      </h4>
      <p className="text-sm text-fantasy-light/80 mt-1">{trait.description}</p>

      {/* Show special mechanics */}
      <div className="flex flex-wrap gap-2 mt-2">
        {trait.resistances && trait.resistances.length > 0 && (
          <span className="text-xs px-2 py-0.5 bg-red-900/30 text-red-400 rounded">
            Resistance: {trait.resistances.join(', ')}
          </span>
        )}
        {trait.proficiencies?.skills && (
          <span className="text-xs px-2 py-0.5 bg-green-900/30 text-green-400 rounded">
            Skills: {trait.proficiencies.skills.join(', ')}
          </span>
        )}
        {trait.proficiencies?.weapons && (
          <span className="text-xs px-2 py-0.5 bg-orange-900/30 text-orange-400 rounded">
            Weapons: {trait.proficiencies.weapons.join(', ')}
          </span>
        )}
        {trait.proficiencies?.tools && (
          <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded">
            Tools: {trait.proficiencies.tools.join(', ')}
          </span>
        )}
      </div>
    </div>
  )
}
