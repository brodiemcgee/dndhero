'use client'

import type { DndClass, ClassFeature } from '@/types/character-options'
import { ALL_CLASSES } from '@/data/character-options/classes'
import { isSpellcaster } from '@/lib/character/stats-calculator'

interface ClassSelectorProps {
  selectedClass: DndClass | null
  onClassSelect: (dndClass: DndClass) => void
}

export function ClassSelector({
  selectedClass,
  onClassSelect,
}: ClassSelectorProps) {
  return (
    <div>
      <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
        Choose Your Class
      </h2>
      <p className="text-fantasy-stone mb-6">
        Your class defines your character's capabilities in combat, exploration, and social interaction.
      </p>

      {/* List + Detail Panel Layout */}
      <div className="flex gap-6">
        {/* Left: Class List */}
        <div className="w-44 flex-shrink-0">
          <div className="space-y-1">
            {ALL_CLASSES.map(dndClass => (
              <ClassListItem
                key={dndClass.id}
                dndClass={dndClass}
                selected={selectedClass?.id === dndClass.id}
                onSelect={onClassSelect}
              />
            ))}
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div className="flex-1 min-w-0">
          {selectedClass ? (
            <ClassDetailPanel dndClass={selectedClass} />
          ) : (
            <div className="h-full flex items-center justify-center p-8 bg-stone-800/30 border-2 border-stone-700 border-dashed rounded-lg">
              <p className="text-fantasy-stone text-center">
                Select a class from the list to see details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// List item component
interface ClassListItemProps {
  dndClass: DndClass
  selected: boolean
  onSelect: (dndClass: DndClass) => void
}

function ClassListItem({ dndClass, selected, onSelect }: ClassListItemProps) {
  const isCaster = isSpellcaster(dndClass)

  return (
    <button
      onClick={() => onSelect(dndClass)}
      className={`w-full text-left px-3 py-2 rounded transition-colors ${
        selected
          ? 'bg-amber-900/50 border-l-2 border-amber-500 text-amber-300 font-medium'
          : 'hover:bg-stone-800 text-fantasy-light border-l-2 border-transparent'
      }`}
    >
      <span>{dndClass.name}</span>
      {isCaster && (
        <span className="ml-1 text-purple-400 text-xs">✦</span>
      )}
    </button>
  )
}

// Detail panel component
interface ClassDetailPanelProps {
  dndClass: DndClass
}

function ClassDetailPanel({ dndClass }: ClassDetailPanelProps) {
  const isCaster = isSpellcaster(dndClass)

  return (
    <div className="bg-stone-800/50 border-2 border-stone-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-700 bg-stone-800/50">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-fantasy-gold">{dndClass.name}</h3>
          <span className="px-2 py-0.5 bg-red-900/40 text-red-300 border border-red-700/50 rounded text-sm font-bold">
            {dndClass.hitDie.toUpperCase()}
          </span>
          {isCaster && (
            <span className="px-2 py-0.5 bg-purple-900/40 text-purple-300 border border-purple-700/50 rounded text-xs">
              Spellcaster
            </span>
          )}
        </div>
        <div className="mt-1 text-sm text-fantasy-stone">
          Primary: <span className="text-fantasy-light">{dndClass.primaryAbilities.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-4 max-h-[400px] overflow-y-auto">
        {/* Description */}
        <p className="text-fantasy-light text-sm leading-relaxed">{dndClass.description}</p>

        {/* Proficiencies Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-1">Armor</h4>
            <p className="text-xs text-fantasy-light">
              {dndClass.armorProficiencies.length > 0
                ? dndClass.armorProficiencies.join(', ')
                : 'None'}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-1">Weapons</h4>
            <p className="text-xs text-fantasy-light">{dndClass.weaponProficiencies.join(', ')}</p>
          </div>
        </div>

        {/* Saving Throws */}
        <div>
          <h4 className="text-sm font-semibold text-amber-400 mb-2">Saving Throws</h4>
          <div className="flex gap-2">
            {dndClass.savingThrows.map(save => (
              <span
                key={save}
                className="px-2 py-0.5 bg-green-900/30 text-green-400 border border-green-700/50 rounded text-xs capitalize"
              >
                {save}
              </span>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <h4 className="text-sm font-semibold text-amber-400 mb-2">
            Skills (Choose {dndClass.skillOptions.count})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {dndClass.skillOptions.options.map(skill => (
              <span
                key={skill}
                className="px-2 py-0.5 bg-stone-700 text-fantasy-light border border-stone-600 rounded text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Tool Proficiencies */}
        {dndClass.toolProficiencies && dndClass.toolProficiencies.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-1">Tools</h4>
            <p className="text-xs text-fantasy-light">{dndClass.toolProficiencies.join(', ')}</p>
          </div>
        )}

        {/* Spellcasting */}
        {dndClass.spellcasting && (
          <div className="p-3 bg-purple-900/20 border border-purple-700/50 rounded-lg">
            <h4 className="text-sm font-semibold text-purple-300 mb-2">Spellcasting</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-fantasy-stone">Ability: </span>
                <span className="text-fantasy-light capitalize">{dndClass.spellcasting.ability}</span>
              </div>
              <div>
                <span className="text-fantasy-stone">Type: </span>
                <span className="text-fantasy-light capitalize">{dndClass.spellcasting.type}</span>
              </div>
              {dndClass.spellcasting.cantripsKnown && (
                <div>
                  <span className="text-fantasy-stone">Cantrips (Lv1): </span>
                  <span className="text-fantasy-light">{dndClass.spellcasting.cantripsKnown[1] || 0}</span>
                </div>
              )}
              <div>
                <span className="text-fantasy-stone">Ritual: </span>
                <span className="text-fantasy-light">{dndClass.spellcasting.ritualCasting ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Level 1 Features */}
        <div>
          <h4 className="text-sm font-semibold text-amber-400 mb-3">Level 1 Features</h4>
          <div className="space-y-3">
            {dndClass.features
              .filter(f => f.level === 1)
              .map(feature => (
                <FeatureDetail key={feature.id} feature={feature} />
              ))}
          </div>
        </div>

        {/* Subclass Info */}
        <div className="p-3 bg-stone-800/50 border border-stone-700 rounded-lg">
          <h4 className="text-sm font-semibold text-amber-400 mb-1">{dndClass.subclassName}</h4>
          <p className="text-xs text-fantasy-stone">
            At level {dndClass.subclassLevel}, you choose a {dndClass.subclassName.toLowerCase()} that
            grants additional features.
          </p>
        </div>
      </div>
    </div>
  )
}

// Feature detail component
interface FeatureDetailProps {
  feature: ClassFeature
}

function FeatureDetail({ feature }: FeatureDetailProps) {
  return (
    <div className="border-l-2 border-amber-700/50 pl-3">
      <h5 className="font-medium text-fantasy-gold text-sm">{feature.name}</h5>
      <p className="text-xs text-fantasy-light/80 mt-0.5">{feature.description}</p>

      {feature.choices && (
        <div className="mt-1">
          <span className="text-[10px] text-fantasy-stone">
            Choose {feature.choices.count}:{' '}
          </span>
          <span className="text-[10px] text-amber-400">
            {feature.choices.options.join(', ')}
          </span>
        </div>
      )}
    </div>
  )
}
