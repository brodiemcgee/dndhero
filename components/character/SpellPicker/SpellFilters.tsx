'use client'

import type { SpellSchool } from '@/types/spells'

interface SpellFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  selectedSchools: SpellSchool[]
  onSchoolToggle: (school: SpellSchool) => void
  showConcentrationOnly: boolean
  onConcentrationToggle: () => void
  showRitualOnly: boolean
  onRitualToggle: () => void
  compact?: boolean
}

const SCHOOLS: SpellSchool[] = [
  'abjuration',
  'conjuration',
  'divination',
  'enchantment',
  'evocation',
  'illusion',
  'necromancy',
  'transmutation',
]

const SCHOOL_COLORS: Record<SpellSchool, string> = {
  abjuration: 'bg-blue-900/30 text-blue-400 border-blue-700',
  conjuration: 'bg-yellow-900/30 text-yellow-400 border-yellow-700',
  divination: 'bg-purple-900/30 text-purple-400 border-purple-700',
  enchantment: 'bg-pink-900/30 text-pink-400 border-pink-700',
  evocation: 'bg-red-900/30 text-red-400 border-red-700',
  illusion: 'bg-indigo-900/30 text-indigo-400 border-indigo-700',
  necromancy: 'bg-gray-900/30 text-gray-400 border-gray-700',
  transmutation: 'bg-green-900/30 text-green-400 border-green-700',
}

export function SpellFilters({
  search,
  onSearchChange,
  selectedSchools,
  onSchoolToggle,
  showConcentrationOnly,
  onConcentrationToggle,
  showRitualOnly,
  onRitualToggle,
  compact = false,
}: SpellFiltersProps) {
  return (
    <div className={`space-y-3 ${compact ? 'p-2' : 'p-4'} bg-stone-800/50 rounded-lg border border-stone-700`}>
      {/* Search */}
      <div>
        <label htmlFor="spell-search" className="sr-only">
          Search spells
        </label>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            id="spell-search"
            type="text"
            placeholder="Search spells..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-900 border border-stone-700 rounded text-stone-200 text-sm placeholder-stone-500 focus:outline-none focus:border-amber-600"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* School filters */}
      <div>
        <h4 className="text-xs font-medium text-stone-400 mb-2">Schools</h4>
        <div className="flex flex-wrap gap-1.5">
          {SCHOOLS.map((school) => {
            const isActive = selectedSchools.includes(school)
            const colors = SCHOOL_COLORS[school]
            return (
              <button
                key={school}
                type="button"
                onClick={() => onSchoolToggle(school)}
                className={`
                  px-2 py-0.5 rounded text-xs capitalize border transition-all
                  ${isActive
                    ? colors
                    : 'bg-transparent text-stone-500 border-stone-700 hover:border-stone-600'
                  }
                `}
              >
                {school}
              </button>
            )
          })}
        </div>
      </div>

      {/* Toggle filters */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showConcentrationOnly}
            onChange={onConcentrationToggle}
            className="w-4 h-4 rounded border-stone-600 bg-stone-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-stone-900"
          />
          <span className="text-xs text-stone-400">Concentration only</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showRitualOnly}
            onChange={onRitualToggle}
            className="w-4 h-4 rounded border-stone-600 bg-stone-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-stone-900"
          />
          <span className="text-xs text-stone-400">Ritual only</span>
        </label>
      </div>
    </div>
  )
}
