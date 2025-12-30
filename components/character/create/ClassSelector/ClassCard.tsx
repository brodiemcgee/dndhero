'use client'

import type { DndClass } from '@/types/character-options'
import { SelectionCard } from '../shared/SelectionCard'
import { isSpellcaster, getLevel1Features } from '@/lib/character/stats-calculator'

interface ClassCardProps {
  dndClass: DndClass
  selected: boolean
  onSelect: (dndClass: DndClass) => void
  onViewDetails: (dndClass: DndClass) => void
}

export function ClassCard({ dndClass, selected, onSelect, onViewDetails }: ClassCardProps) {
  const level1Features = getLevel1Features(dndClass)
  const isCaster = isSpellcaster(dndClass)

  return (
    <SelectionCard
      id={dndClass.id}
      name={dndClass.name}
      description={dndClass.description}
      selected={selected}
      onSelect={() => onSelect(dndClass)}
      onViewDetails={() => onViewDetails(dndClass)}
      badge={
        <div className="flex flex-wrap gap-2">
          {/* Hit Die */}
          <span className="px-2 py-1 bg-red-900/40 text-red-300 border border-red-700/50 rounded text-sm font-medium">
            {dndClass.hitDie.toUpperCase()}
          </span>

          {/* Primary abilities */}
          {dndClass.primaryAbilities.map(ability => (
            <span
              key={ability}
              className="px-2 py-1 bg-stone-700 text-fantasy-light border border-stone-600 rounded text-xs uppercase"
            >
              {ability.slice(0, 3)}
            </span>
          ))}

          {/* Spellcaster indicator */}
          {isCaster && (
            <span className="px-2 py-1 bg-purple-900/40 text-purple-300 border border-purple-700/50 rounded text-xs">
              Spellcaster
            </span>
          )}
        </div>
      }
    >
      <div className="space-y-2 text-sm">
        {/* Armor proficiencies */}
        <div className="text-fantasy-stone">
          Armor:{' '}
          <span className="text-fantasy-light">
            {dndClass.armorProficiencies.length > 0
              ? dndClass.armorProficiencies.join(', ')
              : 'None'}
          </span>
        </div>

        {/* Weapon proficiencies */}
        <div className="text-fantasy-stone">
          Weapons:{' '}
          <span className="text-fantasy-light">
            {dndClass.weaponProficiencies.join(', ')}
          </span>
        </div>

        {/* Saving throws */}
        <div className="text-fantasy-stone">
          Saves:{' '}
          <span className="text-fantasy-light uppercase">
            {dndClass.savingThrows.map(s => s.slice(0, 3)).join(', ')}
          </span>
        </div>

        {/* Level 1 features */}
        {level1Features.length > 0 && (
          <div className="text-fantasy-stone">
            Lv1 Features:{' '}
            <span className="text-amber-400">
              {level1Features.join(', ')}
            </span>
          </div>
        )}

        {/* Skill choices info */}
        <div className="text-fantasy-stone">
          Skills:{' '}
          <span className="text-fantasy-light">
            Choose {dndClass.skillOptions.count} from {dndClass.skillOptions.options.length} options
          </span>
        </div>
      </div>
    </SelectionCard>
  )
}
