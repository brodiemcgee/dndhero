'use client'

import type { Spell } from '@/types/spells'

interface SpellDetailProps {
  spell: Spell
  onClose: () => void
  selected: boolean
  onToggle: (spellId: string) => void
  disabled?: boolean
}

const SCHOOL_COLORS: Record<string, string> = {
  abjuration: 'text-blue-400',
  conjuration: 'text-yellow-400',
  divination: 'text-purple-400',
  enchantment: 'text-pink-400',
  evocation: 'text-red-400',
  illusion: 'text-indigo-400',
  necromancy: 'text-gray-400',
  transmutation: 'text-green-400',
}

export function SpellDetail({
  spell,
  onClose,
  selected,
  onToggle,
  disabled = false,
}: SpellDetailProps) {
  const schoolColor = SCHOOL_COLORS[spell.school] || 'text-gray-400'

  const formatDuration = (duration: Spell['duration']): string => {
    if (typeof duration === 'string') {
      return duration
    }
    if ('count' in duration) {
      const concentration = duration.concentration ? ' (Concentration)' : ''
      return `${duration.count} ${duration.type}${concentration}`
    }
    return 'Unknown'
  }

  const formatRange = (range: Spell['range']): string => {
    if (typeof range === 'string') {
      return range
    }
    if ('distance' in range) {
      return `${range.distance} ${range.type}`
    }
    return range.type.charAt(0).toUpperCase() + range.type.slice(1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-stone-900 border border-stone-700 rounded-lg max-w-lg w-full max-h-[80vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-stone-700">
          <div>
            <h2 className="text-xl font-bold text-amber-400">{spell.name}</h2>
            <p className={`text-sm ${schoolColor} capitalize`}>
              {spell.level === 0 ? `${spell.school} cantrip` : `${spell.level}${getOrdinal(spell.level)}-level ${spell.school}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-8rem)]">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div>
              <span className="text-stone-500">Casting Time:</span>
              <span className="ml-2 text-stone-200">{spell.castingTime}</span>
            </div>
            <div>
              <span className="text-stone-500">Range:</span>
              <span className="ml-2 text-stone-200">{formatRange(spell.range)}</span>
            </div>
            <div>
              <span className="text-stone-500">Components:</span>
              <span className="ml-2 text-stone-200">
                {spell.components.join(', ')}
                {spell.materialComponent && (
                  <span className="text-stone-400 text-xs block">
                    ({spell.materialComponent})
                  </span>
                )}
              </span>
            </div>
            <div>
              <span className="text-stone-500">Duration:</span>
              <span className="ml-2 text-stone-200">{formatDuration(spell.duration)}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {spell.concentration && (
              <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-400 text-xs rounded">
                Concentration
              </span>
            )}
            {spell.ritual && (
              <span className="px-2 py-0.5 bg-purple-900/30 text-purple-400 text-xs rounded">
                Ritual
              </span>
            )}
            {spell.attackRoll && (
              <span className="px-2 py-0.5 bg-red-900/30 text-red-400 text-xs rounded">
                Attack Roll
              </span>
            )}
            {spell.savingThrow && (
              <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 text-xs rounded uppercase">
                {spell.savingThrow} Save
              </span>
            )}
            {spell.damageType && (
              <span className="px-2 py-0.5 bg-orange-900/30 text-orange-400 text-xs rounded capitalize">
                {spell.damageType} Damage
              </span>
            )}
            {spell.healingDice && (
              <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-xs rounded">
                Healing
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <h3 className="text-stone-400 text-sm font-medium mb-2">Description</h3>
            <p className="text-stone-200 text-sm leading-relaxed whitespace-pre-wrap">
              {spell.description}
            </p>
          </div>

          {/* Higher levels */}
          {spell.higherLevels && (
            <div className="mb-4">
              <h3 className="text-stone-400 text-sm font-medium mb-2">At Higher Levels</h3>
              <p className="text-stone-200 text-sm leading-relaxed">
                {spell.higherLevels}
              </p>
            </div>
          )}

          {/* Classes */}
          <div>
            <h3 className="text-stone-400 text-sm font-medium mb-2">Classes</h3>
            <p className="text-stone-200 text-sm">
              {spell.classes.join(', ')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-700 flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-stone-400 hover:text-stone-200 text-sm"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onToggle(spell.id)}
            disabled={disabled}
            className={`
              px-4 py-2 rounded font-medium text-sm transition-colors
              ${selected
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-stone-900'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {selected ? 'Remove' : 'Select'}
          </button>
        </div>
      </div>
    </div>
  )
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
