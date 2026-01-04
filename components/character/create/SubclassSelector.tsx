'use client'

import { getSubclassLevel, getSubclassesForClass, type Subclass, type SubclassFeature } from '@/data/character-options/subclasses'

interface SubclassSelectorProps {
  characterClass: string
  selectedSubclass: string | null
  onSubclassSelect: (subclass: string) => void
  characterLevel: number
}

export function SubclassSelector({
  characterClass,
  selectedSubclass,
  onSubclassSelect,
  characterLevel,
}: SubclassSelectorProps) {
  const subclassLevel = getSubclassLevel(characterClass)
  const isSubclassAvailable = characterLevel >= subclassLevel

  // Get subclasses for the selected class
  const availableSubclasses = getSubclassesForClass(characterClass)

  // Find the currently selected subclass object
  const selectedSubclassObj = availableSubclasses.find(
    (subclass) => subclass.id === selectedSubclass
  )

  if (!characterClass) {
    return null
  }

  return (
    <div>
      <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
        Choose Your Subclass
      </h2>

      {!isSubclassAvailable ? (
        <div className="p-4 bg-stone-800/50 border-2 border-stone-700 rounded-lg">
          <p className="text-fantasy-stone text-center">
            Subclass selection available at level {subclassLevel}
          </p>
        </div>
      ) : (
        <>
          <p className="text-fantasy-stone mb-6">
            Your subclass defines your specialized path and grants unique abilities.
          </p>

          {availableSubclasses.length === 0 ? (
            <div className="p-4 bg-stone-800/50 border-2 border-stone-700 rounded-lg">
              <p className="text-fantasy-stone text-center">
                No subclasses available for {characterClass}
              </p>
            </div>
          ) : (
            /* List + Detail Panel Layout */
            <div className="flex gap-6">
              {/* Left: Subclass List */}
              <div className="w-44 flex-shrink-0">
                <div className="space-y-1">
                  {availableSubclasses.map((subclass) => (
                    <SubclassListItem
                      key={subclass.id}
                      subclass={subclass}
                      selected={selectedSubclass === subclass.id}
                      onSelect={() => onSubclassSelect(subclass.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Right: Detail Panel */}
              <div className="flex-1 min-w-0">
                {selectedSubclassObj ? (
                  <SubclassDetailPanel
                    subclass={selectedSubclassObj}
                    characterLevel={characterLevel}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center p-8 bg-stone-800/30 border-2 border-stone-700 border-dashed rounded-lg">
                    <p className="text-fantasy-stone text-center">
                      Select a subclass from the list to see details
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// List item component
interface SubclassListItemProps {
  subclass: Subclass
  selected: boolean
  onSelect: () => void
}

function SubclassListItem({ subclass, selected, onSelect }: SubclassListItemProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2 rounded transition-colors ${
        selected
          ? 'bg-amber-900/50 border-l-2 border-amber-500 text-amber-300 font-medium'
          : 'hover:bg-stone-800 text-fantasy-light border-l-2 border-transparent'
      }`}
    >
      <span>{subclass.name}</span>
    </button>
  )
}

// Detail panel component
interface SubclassDetailPanelProps {
  subclass: Subclass
  characterLevel: number
}

function SubclassDetailPanel({ subclass, characterLevel }: SubclassDetailPanelProps) {
  // Group features by whether they're available at current level
  const availableFeatures = subclass.features.filter((f) => f.level <= characterLevel)
  const futureFeatures = subclass.features.filter((f) => f.level > characterLevel)

  return (
    <div className="bg-stone-800/50 border-2 border-stone-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-700 bg-stone-800/50">
        <h3 className="text-xl font-bold text-fantasy-gold">{subclass.name}</h3>
        <div className="mt-1 text-sm text-fantasy-stone">
          <span className="text-fantasy-light">{subclass.className}</span> Subclass
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-4 max-h-[400px] overflow-y-auto">
        {/* Description */}
        <p className="text-fantasy-light text-sm leading-relaxed">{subclass.description}</p>

        {/* Key Features Summary */}
        <div className="p-3 bg-amber-900/20 border border-amber-700/50 rounded-lg">
          <h4 className="text-sm font-semibold text-amber-400 mb-2">Key Features</h4>
          <div className="flex flex-wrap gap-1.5">
            {subclass.features.slice(0, 4).map((feature, idx) => (
              <span
                key={`${feature.level}-${feature.name}-${idx}`}
                className="px-2 py-0.5 bg-stone-700 text-fantasy-light border border-stone-600 rounded text-xs"
              >
                {feature.name}
              </span>
            ))}
            {subclass.features.length > 4 && (
              <span className="px-2 py-0.5 text-fantasy-stone text-xs">
                +{subclass.features.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Available Features */}
        {availableFeatures.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-3">
              Available Features (Level {characterLevel})
            </h4>
            <div className="space-y-3">
              {availableFeatures.map((feature, idx) => (
                <FeatureDetail key={`${feature.level}-${feature.name}-${idx}`} feature={feature} available />
              ))}
            </div>
          </div>
        )}

        {/* Future Features */}
        {futureFeatures.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-stone-500 mb-3">Future Features</h4>
            <div className="space-y-3">
              {futureFeatures.map((feature, idx) => (
                <FeatureDetail key={`future-${feature.level}-${feature.name}-${idx}`} feature={feature} available={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Feature detail component
interface FeatureDetailProps {
  feature: SubclassFeature
  available: boolean
}

function FeatureDetail({ feature, available }: FeatureDetailProps) {
  return (
    <div
      className={`border-l-2 pl-3 ${
        available ? 'border-amber-700/50' : 'border-stone-700/50 opacity-60'
      }`}
    >
      <div className="flex items-center gap-2">
        <h5
          className={`font-medium text-sm ${
            available ? 'text-fantasy-gold' : 'text-stone-500'
          }`}
        >
          {feature.name}
        </h5>
        <span
          className={`text-xs px-1.5 py-0.5 rounded ${
            available
              ? 'bg-green-900/30 text-green-400 border border-green-700/50'
              : 'bg-stone-800 text-stone-500 border border-stone-700'
          }`}
        >
          Lv {feature.level}
        </span>
      </div>
      <p
        className={`text-xs mt-0.5 ${
          available ? 'text-fantasy-light/80' : 'text-stone-600'
        }`}
      >
        {feature.description}
      </p>
    </div>
  )
}
