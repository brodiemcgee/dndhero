'use client'

import { useState, useMemo, useEffect } from 'react'
import type { Spell, SpellSchool, SpellLevel } from '@/types/spells'
import { SpellFilters } from './SpellFilters'

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
  const [viewingSpell, setViewingSpell] = useState<Spell | null>(null)

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

  // Auto-select first spell when list changes
  useEffect(() => {
    if (filteredSpells.length > 0 && (!viewingSpell || !filteredSpells.find(s => s.id === viewingSpell.id))) {
      setViewingSpell(filteredSpells[0])
    }
  }, [filteredSpells, viewingSpell])

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

  const atLimit = selectedSpellIds.length >= maxSelectable

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-amber-400">{title}</h3>
        <p className="text-sm text-stone-400">
          Selected: {selectedSpellIds.length}/{maxSelectable}
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
        <div className="flex gap-1 overflow-x-auto pb-2">
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

      {/* List + Detail Panel Layout */}
      <div className="flex gap-4">
        {/* Left: Spell List */}
        <div className="w-56 flex-shrink-0">
          <div className="bg-stone-800/30 rounded-lg border border-stone-700 max-h-[400px] overflow-y-auto">
            {filteredSpells.length === 0 ? (
              <div className="p-4 text-center text-stone-500 text-sm">
                {search || selectedSchools.length > 0 || showConcentrationOnly || showRitualOnly
                  ? 'No spells match your filters'
                  : 'No spells available'}
              </div>
            ) : (
              <div className="py-1">
                {filteredSpells.map(spell => {
                  const isSelected = selectedSpellIds.includes(spell.id)
                  const isViewing = viewingSpell?.id === spell.id
                  return (
                    <SpellListItem
                      key={spell.id}
                      spell={spell}
                      isSelected={isSelected}
                      isViewing={isViewing}
                      onView={() => setViewingSpell(spell)}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div className="flex-1 min-w-0">
          {viewingSpell ? (
            <SpellDetailPanel
              spell={viewingSpell}
              isSelected={selectedSpellIds.includes(viewingSpell.id)}
              onToggle={handleToggleSpell}
              disabled={!selectedSpellIds.includes(viewingSpell.id) && atLimit}
            />
          ) : (
            <div className="h-full flex items-center justify-center p-8 bg-stone-800/30 border-2 border-stone-700 border-dashed rounded-lg">
              <p className="text-stone-500 text-center">
                Select a spell from the list to see details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Spell list item component
interface SpellListItemProps {
  spell: Spell
  isSelected: boolean
  isViewing: boolean
  onView: () => void
}

function SpellListItem({ spell, isSelected, isViewing, onView }: SpellListItemProps) {
  const schoolColor = SCHOOL_COLORS[spell.school] || 'text-gray-400 bg-gray-900/30'

  return (
    <button
      onClick={onView}
      className={`w-full text-left px-3 py-2 transition-colors ${
        isViewing
          ? 'bg-amber-900/50 border-l-2 border-amber-500'
          : 'hover:bg-stone-800 border-l-2 border-transparent'
      }`}
    >
      <div className="flex items-center gap-2">
        {/* Selection indicator */}
        {isSelected && (
          <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
        )}
        <span className={`text-sm truncate ${isViewing ? 'text-amber-300 font-medium' : 'text-stone-200'}`}>
          {spell.name}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mt-0.5 ml-4">
        <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${schoolColor}`}>
          {spell.school.slice(0, 4)}
        </span>
        {spell.concentration && (
          <span className="text-[10px] text-yellow-500" title="Concentration">C</span>
        )}
        {spell.ritual && (
          <span className="text-[10px] text-purple-400" title="Ritual">R</span>
        )}
      </div>
    </button>
  )
}

// Spell detail panel component
interface SpellDetailPanelProps {
  spell: Spell
  isSelected: boolean
  onToggle: (spellId: string) => void
  disabled: boolean
}

function SpellDetailPanel({ spell, isSelected, onToggle, disabled }: SpellDetailPanelProps) {
  const schoolColor = SCHOOL_COLORS[spell.school]?.split(' ')[0] || 'text-gray-400'

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

  const getOrdinal = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return s[(v - 20) % 10] || s[v] || s[0]
  }

  return (
    <div className="bg-stone-800/50 border-2 border-stone-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-700 bg-stone-800/50 flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-fantasy-gold">{spell.name}</h3>
          <p className={`text-sm ${schoolColor} capitalize`}>
            {spell.level === 0
              ? `${spell.school} cantrip`
              : `${spell.level}${getOrdinal(spell.level)}-level ${spell.school}`}
          </p>
        </div>
        {/* Select/Remove button */}
        <button
          type="button"
          onClick={() => onToggle(spell.id)}
          disabled={disabled}
          className={`
            px-4 py-2 rounded font-medium text-sm transition-colors flex-shrink-0
            ${isSelected
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-amber-600 hover:bg-amber-700 text-stone-900'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isSelected ? 'Remove' : 'Select'}
        </button>
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-4 max-h-[320px] overflow-y-auto">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
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
            </span>
          </div>
          <div>
            <span className="text-stone-500">Duration:</span>
            <span className="ml-2 text-stone-200">{formatDuration(spell.duration)}</span>
          </div>
        </div>

        {/* Material component */}
        {spell.materialComponent && (
          <p className="text-xs text-stone-400 italic">
            Material: {spell.materialComponent}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
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
              {spell.damageType}
            </span>
          )}
          {spell.healingDice && (
            <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-xs rounded">
              Healing
            </span>
          )}
        </div>

        {/* Description */}
        <div>
          <h4 className="text-sm font-semibold text-amber-400 mb-2">Description</h4>
          <p className="text-stone-200 text-sm leading-relaxed whitespace-pre-wrap">
            {spell.description}
          </p>
        </div>

        {/* Higher levels */}
        {spell.higherLevels && (
          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-2">At Higher Levels</h4>
            <p className="text-stone-200 text-sm leading-relaxed">
              {spell.higherLevels}
            </p>
          </div>
        )}

        {/* Classes */}
        <div>
          <h4 className="text-sm font-semibold text-amber-400 mb-1">Classes</h4>
          <p className="text-stone-300 text-sm">{spell.classes.join(', ')}</p>
        </div>
      </div>
    </div>
  )
}
