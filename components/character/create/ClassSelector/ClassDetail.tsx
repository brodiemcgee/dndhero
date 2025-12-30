'use client'

import type { DndClass, ClassFeature } from '@/types/character-options'
import { PixelButton } from '@/components/ui/PixelButton'
import { isSpellcaster } from '@/lib/character/stats-calculator'

interface ClassDetailProps {
  dndClass: DndClass
  onClose: () => void
  onSelect: (dndClass: DndClass) => void
  isSelected: boolean
}

export function ClassDetail({ dndClass, onClose, onSelect, isSelected }: ClassDetailProps) {
  const isCaster = isSpellcaster(dndClass)

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
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-fantasy-gold">{dndClass.name}</h2>
              <span className="px-2 py-1 bg-red-900/40 text-red-300 border border-red-700/50 rounded text-sm font-bold">
                {dndClass.hitDie.toUpperCase()}
              </span>
              {isCaster && (
                <span className="px-2 py-1 bg-purple-900/40 text-purple-300 border border-purple-700/50 rounded text-xs">
                  Spellcaster
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-fantasy-stone">
              <span>Primary: {dndClass.primaryAbilities.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}</span>
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
          <p className="text-fantasy-light">{dndClass.description}</p>

          {/* Proficiencies */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-2">Armor Proficiencies</h3>
              <p className="text-fantasy-light">
                {dndClass.armorProficiencies.length > 0
                  ? dndClass.armorProficiencies.join(', ')
                  : 'None'}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-2">Weapon Proficiencies</h3>
              <p className="text-fantasy-light">{dndClass.weaponProficiencies.join(', ')}</p>
            </div>
          </div>

          {/* Saving Throws */}
          <div>
            <h3 className="text-lg font-semibold text-amber-400 mb-2">Saving Throw Proficiencies</h3>
            <div className="flex gap-2">
              {dndClass.savingThrows.map(save => (
                <span
                  key={save}
                  className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-700/50 rounded capitalize"
                >
                  {save}
                </span>
              ))}
            </div>
          </div>

          {/* Skill Options */}
          <div>
            <h3 className="text-lg font-semibold text-amber-400 mb-2">
              Skill Proficiencies (Choose {dndClass.skillOptions.count})
            </h3>
            <div className="flex flex-wrap gap-2">
              {dndClass.skillOptions.options.map(skill => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-stone-700 text-fantasy-light border border-stone-600 rounded text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Tool Proficiencies */}
          {dndClass.toolProficiencies && dndClass.toolProficiencies.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-2">Tool Proficiencies</h3>
              <p className="text-fantasy-light">{dndClass.toolProficiencies.join(', ')}</p>
            </div>
          )}

          {/* Spellcasting */}
          {dndClass.spellcasting && (
            <div className="p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-300 mb-2">Spellcasting</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-fantasy-stone">Ability: </span>
                  <span className="text-fantasy-light capitalize">{dndClass.spellcasting.ability}</span>
                </div>
                <div>
                  <span className="text-fantasy-stone">Type: </span>
                  <span className="text-fantasy-light capitalize">{dndClass.spellcasting.type} caster</span>
                </div>
                <div>
                  <span className="text-fantasy-stone">Ritual Casting: </span>
                  <span className="text-fantasy-light">{dndClass.spellcasting.ritualCasting ? 'Yes' : 'No'}</span>
                </div>
                {dndClass.spellcasting.cantripsKnown && (
                  <div>
                    <span className="text-fantasy-stone">Cantrips at Lv1: </span>
                    <span className="text-fantasy-light">{dndClass.spellcasting.cantripsKnown[1] || 0}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Class Features */}
          <div>
            <h3 className="text-lg font-semibold text-amber-400 mb-3">Class Features</h3>
            <div className="space-y-4">
              {dndClass.features.map(feature => (
                <FeatureDetail key={feature.id} feature={feature} />
              ))}
            </div>
          </div>

          {/* Subclass info */}
          <div className="p-4 bg-stone-800/50 border border-stone-700 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-400 mb-2">{dndClass.subclassName}</h3>
            <p className="text-sm text-fantasy-stone">
              At level {dndClass.subclassLevel}, you choose a {dndClass.subclassName.toLowerCase()} that
              grants you additional features as you gain levels.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-700 flex justify-end gap-3">
          <PixelButton variant="secondary" onClick={onClose}>
            Close
          </PixelButton>
          <PixelButton onClick={() => { onSelect(dndClass); onClose() }}>
            {isSelected ? 'Selected' : 'Select Class'}
          </PixelButton>
        </div>
      </div>
    </div>
  )
}

interface FeatureDetailProps {
  feature: ClassFeature
}

function FeatureDetail({ feature }: FeatureDetailProps) {
  return (
    <div className="border-l-2 border-amber-700/50 pl-4">
      <h4 className="font-semibold text-fantasy-gold flex items-center gap-2">
        {feature.name}
        <span className="text-xs text-fantasy-stone bg-stone-700 px-2 py-0.5 rounded">
          Level {feature.level}
        </span>
      </h4>
      <p className="text-sm text-fantasy-light/80 mt-1">{feature.description}</p>

      {/* Show choices if any */}
      {feature.choices && (
        <div className="mt-2">
          <span className="text-xs text-fantasy-stone">
            Choose {feature.choices.count} from:{' '}
          </span>
          <span className="text-xs text-amber-400">
            {feature.choices.options.join(', ')}
          </span>
        </div>
      )}
    </div>
  )
}
