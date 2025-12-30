'use client'

import type { AbilityName } from '@/types/character-options'

interface AbilityBonusBadgeProps {
  ability: AbilityName
  bonus: number
  size?: 'sm' | 'md'
}

const ABILITY_COLORS: Record<AbilityName, string> = {
  strength: 'bg-red-900/40 text-red-300 border-red-700/50',
  dexterity: 'bg-green-900/40 text-green-300 border-green-700/50',
  constitution: 'bg-orange-900/40 text-orange-300 border-orange-700/50',
  intelligence: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
  wisdom: 'bg-purple-900/40 text-purple-300 border-purple-700/50',
  charisma: 'bg-pink-900/40 text-pink-300 border-pink-700/50',
}

const ABILITY_ABBREV: Record<AbilityName, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}

export function AbilityBonusBadge({ ability, bonus, size = 'md' }: AbilityBonusBadgeProps) {
  const colorClass = ABILITY_COLORS[ability]
  const abbrev = ABILITY_ABBREV[ability]
  const bonusStr = bonus >= 0 ? `+${bonus}` : `${bonus}`

  const sizeClasses = size === 'sm'
    ? 'px-1.5 py-0.5 text-xs'
    : 'px-2 py-1 text-sm'

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded border font-medium
        ${colorClass}
        ${sizeClasses}
      `}
    >
      <span className="font-bold">{bonusStr}</span>
      <span className="opacity-80">{abbrev}</span>
    </span>
  )
}

interface AbilityBonusListProps {
  bonuses: { ability: AbilityName; bonus: number }[]
  size?: 'sm' | 'md'
}

export function AbilityBonusList({ bonuses, size = 'md' }: AbilityBonusListProps) {
  if (bonuses.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {bonuses.map((b, i) => (
        <AbilityBonusBadge
          key={`${b.ability}-${i}`}
          ability={b.ability}
          bonus={b.bonus}
          size={size}
        />
      ))}
    </div>
  )
}
