'use client'

import { useState, useMemo } from 'react'
import type { Spell, SpellSchool, SpellLevel } from '@/types/spells'
import { SpellFilters } from './SpellFilters'
import { SpellList } from './SpellList'
import { SpellDetail } from './SpellDetail'
import { SelectedSpellsSummary } from './SelectedSpellsSummary'
import { getSpellsByIds } from '@/data/spells'

interface SpellPickerProps {
  availableSpells: Spell[]
  selectedSpellIds: string[]
  onSelectionChange: (spellIds: string[]) => void
  maxSelectable: number
  title?: string
  showLevelTabs?: boolean
  minLevel?: SpellLevel
  maxLevel?: SpellLevel
}

export function SpellPicker({
  availableSpells,
  selectedSpellIds,
  onSelectionChange,
  maxSelectable,
  title = 'Select Spells',
  showLevelTabs = true,
  minLevel = 0,
  maxLevel = 9,
}: SpellPickerProps) {
  // State
  const [search, setSearch] = useState('')
  const [selectedSchools, setSelectedSchools] = useState<SpellSchool[]>([])
  const [showConcentrationOnly, setShowConcentrationOnly] = useState(false)
  const [showRitualOnly, setShowRitualOnly] = useState(false)
  const [activeTab, setActiveTab] = useState<SpellLevel>(minLevel)
  const [detailSpell, setDetailSpell] = useState<Spell | null>(null)

  // Get unique spell levels from available spells
  const availableLevels = useMemo(() => {
    const levels = new Set(availableSpells.map(s => s.level))
    return Array.from(levels).sort((a, b) => a - b).filter(l => l >= minLevel && l <= maxLevel) as SpellLevel[]
  }, [availableSpells, minLevel, maxLevel])

  // Filter spells
  const filteredSpells = useMemo(() => {
    return availableSpells.filter((spell) => {
      // Level filter (tab)
      if (showLevelTabs && spell.level !== activeTab) return false

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesName = spell.name.toLowerCase().includes(searchLower)
        const matchesDescription = spell.description.toLowerCase().includes(searchLower)
        if (!matchesName && !matchesDescription) return false
      }

      // School filter
      if (selectedSchools.length > 0 && !selectedSchools.includes(spell.school)) {
        return false
      }

      // Concentration filter
      if (showConcentrationOnly && !spell.concentration) return false

      // Ritual filter
      if (showRitualOnly && !spell.ritual) return false

      return true
    })
  }, [availableSpells, activeTab, search, selectedSchools, showConcentrationOnly, showRitualOnly, showLevelTabs])

  // Get selected spell objects
  const selectedSpells = useMemo(() => {
    return getSpellsByIds(selectedSpellIds)
  }, [selectedSpellIds])

  // Handlers
  const handleToggleSpell = (spellId: string) => {
    if (selectedSpellIds.includes(spellId)) {
      onSelectionChange(selectedSpellIds.filter((id) => id !== spellId))
    } else if (selectedSpellIds.length < maxSelectable) {
      onSelectionChange([...selectedSpellIds, spellId])
    }
  }

  const handleSchoolToggle = (school: SpellSchool) => {
    if (selectedSchools.includes(school)) {
      setSelectedSchools(selectedSchools.filter((s) => s !== school))
    } else {
      setSelectedSchools([...selectedSchools, school])
    }
  }

  const getLevelLabel = (level: SpellLevel): string => {
    return level === 0 ? 'Cantrips' : `Level ${level}`
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-amber-400">{title}</h2>
          <p className="text-sm text-stone-400">
            Select up to {maxSelectable} spell{maxSelectable !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filters */}
        <SpellFilters
          search={search}
          onSearchChange={setSearch}
          selectedSchools={selectedSchools}
          onSchoolToggle={handleSchoolToggle}
          showConcentrationOnly={showConcentrationOnly}
          onConcentrationToggle={() => setShowConcentrationOnly(!showConcentrationOnly)}
          showRitualOnly={showRitualOnly}
          onRitualToggle={() => setShowRitualOnly(!showRitualOnly)}
        />

        {/* Level tabs */}
        {showLevelTabs && availableLevels.length > 1 && (
          <div className="mt-4 flex gap-1 overflow-x-auto pb-2">
            {availableLevels.map((level) => {
              const count = availableSpells.filter(s => s.level === level).length
              const selectedCount = selectedSpellIds.filter(id =>
                availableSpells.find(s => s.id === id && s.level === level)
              ).length
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setActiveTab(level)}
                  className={`
                    px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors
                    ${activeTab === level
                      ? 'bg-amber-600 text-stone-900'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }
                  `}
                >
                  {getLevelLabel(level)}
                  <span className="ml-1.5 text-xs opacity-75">
                    ({selectedCount}/{count})
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Spell list */}
        <div className="mt-4 bg-stone-800/30 rounded-lg border border-stone-700 min-h-[300px]">
          <SpellList
            spells={filteredSpells}
            selectedSpellIds={selectedSpellIds}
            onToggleSpell={handleToggleSpell}
            onViewDetails={setDetailSpell}
            maxSelectable={maxSelectable}
            emptyMessage={
              search || selectedSchools.length > 0 || showConcentrationOnly || showRitualOnly
                ? 'No spells match your filters'
                : 'No spells available at this level'
            }
          />
        </div>
      </div>

      {/* Sidebar - Selected spells summary */}
      <div className="w-full lg:w-72 lg:sticky lg:top-4 lg:self-start">
        <SelectedSpellsSummary
          title="Selected Spells"
          selectedSpells={selectedSpells}
          maxCount={maxSelectable}
          onRemove={handleToggleSpell}
          onViewDetails={setDetailSpell}
        />
      </div>

      {/* Detail modal */}
      {detailSpell && (
        <SpellDetail
          spell={detailSpell}
          onClose={() => setDetailSpell(null)}
          selected={selectedSpellIds.includes(detailSpell.id)}
          onToggle={handleToggleSpell}
          disabled={
            !selectedSpellIds.includes(detailSpell.id) &&
            selectedSpellIds.length >= maxSelectable
          }
        />
      )}
    </div>
  )
}
