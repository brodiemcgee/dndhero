'use client'

import { useMemo } from 'react'
import type { DndClass, SpellLevel } from '@/types/spells'
import { SpellPicker } from './SpellPicker/SpellPicker'
import {
  CLASS_CASTER_CONFIGS,
  getCantripsKnown,
  getSpellsKnownCount,
  getHighestSpellLevel,
  canCastSpells,
  calculateMaxPreparedSpells,
  usesKnownSpells,
  usesPreparedSpells,
} from '@/lib/engine/spells/caster-types'
import {
  getCantripsForClass,
  getSpellsByClassAndLevel,
} from '@/data/spells'

interface SpellSelectionStepProps {
  characterClass: string
  characterLevel: number
  abilityScores: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
  selectedCantrips: string[]
  selectedSpells: string[]
  onCantripChange: (cantrips: string[]) => void
  onSpellChange: (spells: string[]) => void
}

export function SpellSelectionStep({
  characterClass,
  characterLevel,
  abilityScores,
  selectedCantrips,
  selectedSpells,
  onCantripChange,
  onSpellChange,
}: SpellSelectionStepProps) {
  const dndClass = characterClass as DndClass
  const config = CLASS_CASTER_CONFIGS[dndClass]

  // Get spellcasting ability modifier
  const spellcastingMod = useMemo(() => {
    if (!config.spellcastingAbility) return 0
    const abilityMap: Record<string, keyof typeof abilityScores> = {
      STR: 'strength',
      DEX: 'dexterity',
      CON: 'constitution',
      INT: 'intelligence',
      WIS: 'wisdom',
      CHA: 'charisma',
    }
    const ability = abilityMap[config.spellcastingAbility]
    return Math.floor((abilityScores[ability] - 10) / 2)
  }, [config.spellcastingAbility, abilityScores])

  // Calculate spell limits
  const maxCantrips = getCantripsKnown(dndClass, characterLevel)
  const highestSpellLevel = getHighestSpellLevel(dndClass, characterLevel)

  // For known casters (Bard, Sorcerer, Ranger, Warlock)
  const spellsKnownCount = getSpellsKnownCount(dndClass, characterLevel)

  // For prepared casters (Cleric, Druid, Wizard, Paladin)
  const maxPreparedSpells = usesPreparedSpells(dndClass)
    ? calculateMaxPreparedSpells(spellcastingMod, characterLevel)
    : 0

  const maxSpells = usesKnownSpells(dndClass) ? spellsKnownCount : maxPreparedSpells

  // Get available spells for this class
  const availableCantrips = useMemo(() => {
    return getCantripsForClass(characterClass)
  }, [characterClass])

  const availableSpells = useMemo(() => {
    if (highestSpellLevel < 1) return []
    return getSpellsByClassAndLevel(characterClass, highestSpellLevel)
      .filter(spell => spell.level >= 1) // Exclude cantrips
  }, [characterClass, highestSpellLevel])

  // Non-caster classes
  if (config.casterType === 'none') {
    return (
      <div className="space-y-6">
        <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
          Spellcasting
        </h2>
        <div className="p-8 bg-stone-800/50 rounded-lg border border-stone-700 text-center">
          <div className="text-4xl mb-4">&#9876;</div>
          <p className="text-stone-300 text-lg mb-2">No Spellcasting</p>
          <p className="text-stone-500">
            {characterClass}s do not have innate spellcasting abilities.
            Your strength lies in martial prowess and skill!
          </p>
        </div>
      </div>
    )
  }

  // Half-casters at level 1 (Paladin, Ranger)
  if (characterLevel < config.startsAtLevel) {
    return (
      <div className="space-y-6">
        <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
          Spellcasting
        </h2>
        <div className="p-8 bg-stone-800/50 rounded-lg border border-stone-700 text-center">
          <div className="text-4xl mb-4">&#10024;</div>
          <p className="text-stone-300 text-lg mb-2">Spellcasting Begins at Level {config.startsAtLevel}</p>
          <p className="text-stone-500">
            {characterClass}s gain their spellcasting abilities at level {config.startsAtLevel}.
            Focus on your other abilities for now!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
        Spellcasting
      </h2>

      {/* Spellcasting summary */}
      <div className="p-4 bg-stone-800/50 rounded-lg border border-stone-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-stone-500">Spellcasting Ability:</span>
            <span className="ml-2 text-amber-400">{config.spellcastingAbility}</span>
          </div>
          <div>
            <span className="text-stone-500">Spell Save DC:</span>
            <span className="ml-2 text-amber-400">{8 + 2 + spellcastingMod}</span>
          </div>
          <div>
            <span className="text-stone-500">Spell Attack:</span>
            <span className="ml-2 text-amber-400">+{2 + spellcastingMod}</span>
          </div>
          <div>
            <span className="text-stone-500">Highest Spell Level:</span>
            <span className="ml-2 text-amber-400">{highestSpellLevel}</span>
          </div>
        </div>
        {config.ritualCasting && (
          <p className="mt-2 text-xs text-purple-400">
            Ritual Casting: You can cast ritual spells without using a spell slot if you have them prepared.
          </p>
        )}
      </div>

      {/* Caster type description */}
      <div className="p-3 bg-amber-900/20 rounded border border-amber-800/50 text-sm">
        {usesKnownSpells(dndClass) ? (
          <p className="text-amber-200">
            <strong>Known Spells:</strong> As a {characterClass}, you learn specific spells that you always have access to.
            You can select {spellsKnownCount} spell{spellsKnownCount !== 1 ? 's' : ''} from the {characterClass} spell list
            (maximum spell level: {highestSpellLevel}).
          </p>
        ) : (
          <p className="text-amber-200">
            <strong>Prepared Spells:</strong> As a {characterClass}, you have access to your entire class spell list.
            Each day, you can prepare up to {maxPreparedSpells} spell{maxPreparedSpells !== 1 ? 's' : ''} from the list
            ({config.spellcastingAbility} modifier + level).
            Select your initial prepared spells below.
          </p>
        )}
      </div>

      {/* Cantrip selection */}
      {maxCantrips > 0 && (
        <div className="mb-8">
          <SpellPicker
            availableSpells={availableCantrips}
            selectedSpellIds={selectedCantrips}
            onSelectionChange={onCantripChange}
            maxSelectable={maxCantrips}
            title="Select Cantrips"
            showLevelTabs={false}
            minLevel={0 as SpellLevel}
            maxLevel={0 as SpellLevel}
          />
        </div>
      )}

      {/* Spell selection */}
      {maxSpells > 0 && highestSpellLevel >= 1 && (
        <SpellPicker
          availableSpells={availableSpells}
          selectedSpellIds={selectedSpells}
          onSelectionChange={onSpellChange}
          maxSelectable={maxSpells}
          title={usesKnownSpells(dndClass) ? 'Select Known Spells' : 'Select Prepared Spells'}
          showLevelTabs={true}
          minLevel={1 as SpellLevel}
          maxLevel={highestSpellLevel}
        />
      )}
    </div>
  )
}
