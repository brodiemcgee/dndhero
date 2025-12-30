'use client'

import type { Spell } from '@/types/spells'
import { SpellCard } from './SpellCard'

interface SpellListProps {
  spells: Spell[]
  selectedSpellIds: string[]
  onToggleSpell: (spellId: string) => void
  onViewDetails: (spell: Spell) => void
  maxSelectable?: number
  emptyMessage?: string
}

export function SpellList({
  spells,
  selectedSpellIds,
  onToggleSpell,
  onViewDetails,
  maxSelectable,
  emptyMessage = 'No spells available',
}: SpellListProps) {
  if (spells.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-stone-500 text-sm">
        {emptyMessage}
      </div>
    )
  }

  const atLimit = maxSelectable !== undefined && selectedSpellIds.length >= maxSelectable

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
      {spells.map((spell) => {
        const isSelected = selectedSpellIds.includes(spell.id)
        const isDisabled = !isSelected && atLimit
        return (
          <SpellCard
            key={spell.id}
            spell={spell}
            selected={isSelected}
            onToggle={onToggleSpell}
            onViewDetails={onViewDetails}
            disabled={isDisabled}
          />
        )
      })}
    </div>
  )
}
