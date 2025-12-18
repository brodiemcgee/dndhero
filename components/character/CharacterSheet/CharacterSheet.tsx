'use client'

/**
 * CharacterSheet Component
 * Main container with tabbed interface for the full D&D 5E character sheet
 * Inspired by the official Wizards of the Coast character sheet
 */

import { useState } from 'react'
import { Character } from './types'
import { CharacterSheetHeader } from './CharacterSheetHeader'
import { AbilityScoresRow } from './AbilityScoresRow'
import { SavingThrowsPanel } from './SavingThrowsPanel'
import { SkillsPanel } from './SkillsPanel'
import { CombatStatsPanel } from './CombatStatsPanel'
import { PersonalityPanel } from './PersonalityPanel'
import { EquipmentPanel } from './EquipmentPanel'
import { AttacksPanel } from './AttacksPanel'
import { ProficienciesPanel } from './ProficienciesPanel'
import { SpellcastingTab } from './SpellcastingTab'
import { BackgroundTab } from './BackgroundTab'

type TabId = 'stats' | 'background' | 'spells'

interface CharacterSheetProps {
  character: Character
  onPortraitClick?: () => void
}

export function CharacterSheet({ character, onPortraitClick }: CharacterSheetProps) {
  const [activeTab, setActiveTab] = useState<TabId>('stats')

  // Check if character is a spellcaster
  const isSpellcaster = character.spellcasting_ability ||
    (character.cantrips && character.cantrips.length > 0) ||
    (character.known_spells && character.known_spells.length > 0)

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'stats', label: 'Stats', icon: '&#9876;' }, // Crossed swords
    { id: 'background', label: 'Background', icon: '&#128214;' }, // Book
    ...(isSpellcaster ? [{ id: 'spells' as TabId, label: 'Spells', icon: '&#10024;' }] : []), // Sparkles
  ]

  return (
    <div className="character-sheet">
      {/* Header - Always visible */}
      <CharacterSheetHeader
        character={character}
        onPortraitClick={onPortraitClick}
      />

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b-4 border-fantasy-stone pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-2 rounded-t-lg font-bold text-sm transition-colors
              flex items-center gap-2
              ${activeTab === tab.id
                ? 'bg-fantasy-brown border-2 border-b-0 border-fantasy-tan text-fantasy-gold'
                : 'bg-fantasy-dark/50 border-2 border-transparent text-fantasy-stone hover:text-fantasy-tan hover:bg-fantasy-dark'
              }
            `}
          >
            <span dangerouslySetInnerHTML={{ __html: tab.icon }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'stats' && (
          <StatsTab character={character} />
        )}

        {activeTab === 'background' && (
          <BackgroundTab
            character={character}
            onPortraitClick={onPortraitClick}
          />
        )}

        {activeTab === 'spells' && (
          <SpellcastingTab character={character} />
        )}
      </div>
    </div>
  )
}

/**
 * StatsTab - The main stats page (Page 1 of official sheet)
 */
function StatsTab({ character }: { character: Character }) {
  return (
    <div className="space-y-6">
      {/* Ability Scores Row */}
      <AbilityScoresRow character={character} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Saves & Skills */}
        <div className="lg:col-span-3 space-y-6">
          <SavingThrowsPanel character={character} />
          <SkillsPanel character={character} />
        </div>

        {/* Center Column - Combat & Attacks */}
        <div className="lg:col-span-5 space-y-6">
          <CombatStatsPanel character={character} />
          <AttacksPanel character={character} />
          <ProficienciesPanel character={character} />
        </div>

        {/* Right Column - Personality & Equipment */}
        <div className="lg:col-span-4 space-y-6">
          <PersonalityPanel character={character} />
          <EquipmentPanel character={character} />
        </div>
      </div>
    </div>
  )
}
