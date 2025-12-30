'use client'

import type { Spell } from '@/types/spells'

interface SpellCardProps {
  spell: Spell
  selected: boolean
  onToggle: (spellId: string) => void
  onViewDetails: (spell: Spell) => void
  disabled?: boolean
}

const SCHOOL_COLORS: Record<string, string> = {
  abjuration: 'text-blue-400 bg-blue-900/30',
  conjuration: 'text-yellow-400 bg-yellow-900/30',
  divination: 'text-purple-400 bg-purple-900/30',
  enchantment: 'text-pink-400 bg-pink-900/30',
  evocation: 'text-red-400 bg-red-900/30',
  illusion: 'text-indigo-400 bg-indigo-900/30',
  necromancy: 'text-gray-400 bg-gray-900/30',
  transmutation: 'text-green-400 bg-green-900/30',
}

export function SpellCard({
  spell,
  selected,
  onToggle,
  onViewDetails,
  disabled = false,
}: SpellCardProps) {
  const schoolColor = SCHOOL_COLORS[spell.school] || 'text-gray-400 bg-gray-900/30'

  const handleClick = () => {
    if (!disabled) {
      onToggle(spell.id)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      className={`
        relative p-3 rounded-lg border cursor-pointer transition-all
        ${selected
          ? 'border-amber-500 bg-amber-900/20 ring-1 ring-amber-500/50'
          : 'border-stone-700 bg-stone-800/50 hover:border-stone-600 hover:bg-stone-800'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Selection checkbox */}
      <div className="absolute top-2 right-2">
        <div
          className={`
            w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
            ${selected
              ? 'bg-amber-500 border-amber-500'
              : 'border-stone-600 bg-transparent'
            }
          `}
        >
          {selected && (
            <svg className="w-3 h-3 text-stone-900" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Spell name and level */}
      <div className="pr-8">
        <h4 className="font-semibold text-stone-100 text-sm truncate">
          {spell.name}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded capitalize ${schoolColor}`}>
            {spell.school}
          </span>
          {spell.concentration && (
            <span className="text-xs text-yellow-500" title="Concentration">
              C
            </span>
          )}
          {spell.ritual && (
            <span className="text-xs text-purple-400" title="Ritual">
              R
            </span>
          )}
        </div>
      </div>

      {/* Brief info */}
      <div className="mt-2 text-xs text-stone-400 truncate">
        {spell.castingTime} • {formatRange(spell.range)}
      </div>

      {/* View details link */}
      <button
        type="button"
        className="mt-2 text-xs text-amber-500 hover:text-amber-400 underline"
        onClick={(e) => {
          e.stopPropagation()
          onViewDetails(spell)
        }}
      >
        View details
      </button>
    </div>
  )
}

function formatRange(range: Spell['range']): string {
  if (typeof range === 'string') {
    return range
  }
  if ('distance' in range) {
    return `${range.distance} ${range.type}`
  }
  return range.type.charAt(0).toUpperCase() + range.type.slice(1)
}
