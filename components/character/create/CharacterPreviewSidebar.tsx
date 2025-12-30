'use client'

import { useState, useMemo } from 'react'
import type { Race, Subrace, DndClass, Background, AbilityName } from '@/types/character-options'
import {
  calculateCharacterStats,
  formatModifier,
  type AbilityScores,
  type CalculatedStats,
} from '@/lib/character/stats-calculator'
import { AbilityBonusBadge } from './shared/AbilityBonusBadge'

interface CharacterPreviewSidebarProps {
  name: string
  race: Race | null
  subrace: Subrace | null
  dndClass: DndClass | null
  background: Background | null
  level: number
  baseAbilities: AbilityScores
  selectedSkills: string[]
}

export function CharacterPreviewSidebar({
  name,
  race,
  subrace,
  dndClass,
  background,
  level,
  baseAbilities,
  selectedSkills,
}: CharacterPreviewSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['combat', 'abilities'])
  )

  const stats = useMemo(() => {
    return calculateCharacterStats({
      name,
      race,
      subrace,
      class: dndClass,
      background,
      level,
      baseAbilities,
      selectedSkills,
    })
  }, [name, race, subrace, dndClass, background, level, baseAbilities, selectedSkills])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  // Build character summary line
  const summaryParts: string[] = []
  if (race) {
    summaryParts.push(subrace ? `${subrace.name}` : race.name)
  }
  if (dndClass) {
    summaryParts.push(dndClass.name)
  }
  const summary = summaryParts.join(' ') || 'No selections yet'

  return (
    <div className="bg-stone-900 border-2 border-stone-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-stone-800 px-4 py-3 border-b border-stone-700">
        <h2 className="font-['Press_Start_2P'] text-sm text-amber-400">
          CHARACTER PREVIEW
        </h2>
      </div>

      {/* Character Identity */}
      <div className="px-4 py-3 border-b border-stone-700/50">
        <div className="text-lg font-bold text-fantasy-light">
          {name || 'Unnamed Hero'}
        </div>
        <div className="text-sm text-fantasy-stone">
          {summary} {level > 1 && `Lv${level}`}
        </div>
      </div>

      {/* Combat Stats Section */}
      <CollapsibleSection
        title="Combat Stats"
        isOpen={expandedSections.has('combat')}
        onToggle={() => toggleSection('combat')}
      >
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="HP" value={stats.hp} highlight />
          <StatBox label="AC" value={stats.ac} />
          <StatBox label="Initiative" value={formatModifier(stats.initiative)} />
          <StatBox label="Speed" value={`${stats.speed} ft`} />
        </div>
        <div className="mt-2 text-xs text-fantasy-stone">
          Proficiency Bonus: {formatModifier(stats.proficiencyBonus)}
        </div>
      </CollapsibleSection>

      {/* Ability Scores Section */}
      <CollapsibleSection
        title="Ability Scores"
        isOpen={expandedSections.has('abilities')}
        onToggle={() => toggleSection('abilities')}
      >
        <div className="space-y-1">
          {(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as AbilityName[]).map(ability => (
            <AbilityRow
              key={ability}
              ability={ability}
              base={stats.abilities[ability].base}
              racialBonus={stats.abilities[ability].racialBonus}
              total={stats.abilities[ability].total}
              modifier={stats.abilities[ability].modifier}
            />
          ))}
        </div>
      </CollapsibleSection>

      {/* Saving Throws Section */}
      <CollapsibleSection
        title="Saving Throws"
        isOpen={expandedSections.has('saves')}
        onToggle={() => toggleSection('saves')}
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {stats.savingThrows.map(save => (
            <div key={save.ability} className="flex items-center gap-2 text-sm">
              <span
                className={`w-2 h-2 rounded-full ${
                  save.proficient ? 'bg-amber-500' : 'bg-stone-600'
                }`}
              />
              <span className="text-fantasy-stone uppercase text-xs w-8">
                {save.ability.slice(0, 3)}
              </span>
              <span className={save.proficient ? 'text-amber-400' : 'text-fantasy-light'}>
                {formatModifier(save.modifier)}
              </span>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Proficiencies Section */}
      <CollapsibleSection
        title="Proficiencies"
        isOpen={expandedSections.has('proficiencies')}
        onToggle={() => toggleSection('proficiencies')}
      >
        {stats.armorProficiencies.length > 0 && (
          <div className="mb-2">
            <div className="text-xs text-fantasy-stone mb-1">Armor</div>
            <div className="text-sm text-fantasy-light">
              {stats.armorProficiencies.join(', ')}
            </div>
          </div>
        )}
        {stats.weaponProficiencies.length > 0 && (
          <div className="mb-2">
            <div className="text-xs text-fantasy-stone mb-1">Weapons</div>
            <div className="text-sm text-fantasy-light">
              {stats.weaponProficiencies.join(', ')}
            </div>
          </div>
        )}
        {stats.toolProficiencies.length > 0 && (
          <div className="mb-2">
            <div className="text-xs text-fantasy-stone mb-1">Tools</div>
            <div className="text-sm text-fantasy-light">
              {stats.toolProficiencies.join(', ')}
            </div>
          </div>
        )}
        {stats.languages.length > 0 && (
          <div>
            <div className="text-xs text-fantasy-stone mb-1">Languages</div>
            <div className="text-sm text-fantasy-light">
              {stats.languages.join(', ')}
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* Racial Traits Section */}
      {stats.traits.length > 0 && (
        <CollapsibleSection
          title="Racial Traits"
          isOpen={expandedSections.has('traits')}
          onToggle={() => toggleSection('traits')}
        >
          <div className="space-y-1">
            {stats.traits.map(trait => (
              <div key={trait.id} className="text-sm">
                <span className="text-amber-400">{trait.name}</span>
                {(trait as any).darkvision && (
                  <span className="text-blue-400 text-xs ml-1">
                    ({(trait as any).darkvision} ft)
                  </span>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  )
}

// Mobile toggle button for the sidebar
interface MobilePreviewButtonProps {
  onClick: () => void
  hasSelections: boolean
}

export function MobilePreviewButton({ onClick, hasSelections }: MobilePreviewButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        lg:hidden fixed bottom-4 right-4 z-50
        w-14 h-14 rounded-full shadow-lg
        flex items-center justify-center
        ${hasSelections
          ? 'bg-amber-500 text-stone-900'
          : 'bg-stone-700 text-stone-400'
        }
        hover:scale-105 transition-transform
      `}
      title="View character preview"
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    </button>
  )
}

// Collapsible section component
interface CollapsibleSectionProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

function CollapsibleSection({ title, isOpen, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="border-b border-stone-700/50">
      <button
        onClick={onToggle}
        className="w-full px-4 py-2 flex items-center justify-between text-left hover:bg-stone-800/50 transition-colors"
      >
        <span className="text-sm font-medium text-fantasy-gold">{title}</span>
        <span className="text-xs text-fantasy-stone">
          {isOpen ? '▼' : '▶'}
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-3">
          {children}
        </div>
      )}
    </div>
  )
}

// Stat box for combat stats
interface StatBoxProps {
  label: string
  value: string | number
  highlight?: boolean
}

function StatBox({ label, value, highlight }: StatBoxProps) {
  return (
    <div className={`
      p-2 rounded text-center
      ${highlight ? 'bg-red-900/30 border border-red-700/50' : 'bg-stone-800 border border-stone-700'}
    `}>
      <div className={`text-lg font-bold ${highlight ? 'text-red-400' : 'text-fantasy-light'}`}>
        {value}
      </div>
      <div className="text-xs text-fantasy-stone">{label}</div>
    </div>
  )
}

// Ability row for ability scores display
interface AbilityRowProps {
  ability: AbilityName
  base: number
  racialBonus: number
  total: number
  modifier: number
}

const ABILITY_LABELS: Record<AbilityName, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}

function AbilityRow({ ability, base, racialBonus, total, modifier }: AbilityRowProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8 text-fantasy-stone font-medium">{ABILITY_LABELS[ability]}</span>
      <span className="w-6 text-center text-fantasy-light font-bold">{total}</span>
      <span className={`w-8 text-center ${modifier >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        ({formatModifier(modifier)})
      </span>
      {racialBonus !== 0 && (
        <AbilityBonusBadge ability={ability} bonus={racialBonus} size="sm" />
      )}
    </div>
  )
}
