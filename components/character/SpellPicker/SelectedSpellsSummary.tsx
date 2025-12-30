'use client'

import type { Spell } from '@/types/spells'

interface SelectedSpellsSummaryProps {
  title: string
  selectedSpells: Spell[]
  maxCount: number
  onRemove: (spellId: string) => void
  onViewDetails: (spell: Spell) => void
}

export function SelectedSpellsSummary({
  title,
  selectedSpells,
  maxCount,
  onRemove,
  onViewDetails,
}: SelectedSpellsSummaryProps) {
  const remaining = maxCount - selectedSpells.length
  const isAtLimit = remaining <= 0
  const isOverLimit = remaining < 0

  return (
    <div className="bg-stone-800/50 rounded-lg border border-stone-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-stone-200">{title}</h3>
        <span
          className={`
            text-sm font-medium px-2 py-0.5 rounded
            ${isOverLimit
              ? 'bg-red-900/30 text-red-400'
              : isAtLimit
              ? 'bg-amber-900/30 text-amber-400'
              : 'bg-stone-700 text-stone-300'
            }
          `}
        >
          {selectedSpells.length}/{maxCount}
        </span>
      </div>

      {/* Selected spells list */}
      {selectedSpells.length === 0 ? (
        <p className="text-xs text-stone-500 italic">
          No {title.toLowerCase()} selected yet
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {selectedSpells.map((spell) => (
            <div
              key={spell.id}
              className="flex items-center justify-between bg-stone-900/50 rounded px-2 py-1.5 group"
            >
              <button
                type="button"
                onClick={() => onViewDetails(spell)}
                className="text-sm text-stone-200 hover:text-amber-400 truncate text-left flex-1"
              >
                {spell.name}
                {spell.level > 0 && (
                  <span className="text-xs text-stone-500 ml-1">
                    (Lv.{spell.level})
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => onRemove(spell.id)}
                className="ml-2 p-1 text-stone-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Remaining slots */}
      {remaining > 0 && (
        <p className="mt-2 text-xs text-stone-500">
          {remaining} more {remaining === 1 ? 'slot' : 'slots'} available
        </p>
      )}
      {isOverLimit && (
        <p className="mt-2 text-xs text-red-400">
          {Math.abs(remaining)} too many selected
        </p>
      )}
    </div>
  )
}
