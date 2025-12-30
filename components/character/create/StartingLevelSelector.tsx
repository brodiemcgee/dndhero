'use client'

import { useMemo } from 'react'
import {
  getTierForLevel,
  getStartingWealthDescription,
} from '@/lib/engine/progression/starting-level'
import { ASI_LEVELS, SUBCLASS_LEVELS } from '@/lib/engine/progression/class-features'
import { getHighestSpellLevel, getCantripsKnown, CLASS_CASTER_CONFIGS } from '@/lib/engine/spells/caster-types'
import type { DndClass } from '@/types/character-options'

interface StartingLevelSelectorProps {
  level: number
  characterClass: string
  onChange: (level: number) => void
}

export function StartingLevelSelector({
  level,
  characterClass,
  onChange,
}: StartingLevelSelectorProps) {
  const tier = useMemo(() => getTierForLevel(level), [level])

  // Calculate what features are available at the selected level
  const levelInfo = useMemo(() => {
    const dndClass = characterClass as DndClass
    const asiLevels = ASI_LEVELS[characterClass] || [4, 8, 12, 16, 19]
    const subclassLevel = SUBCLASS_LEVELS[characterClass] || 3

    // Count ASIs earned by this level
    const asiCount = asiLevels.filter(l => l <= level).length

    // Check if subclass is required
    const requiresSubclass = level >= subclassLevel

    // Spellcasting info
    const casterConfig = CLASS_CASTER_CONFIGS[dndClass]
    const isCaster = casterConfig?.casterType !== 'none'
    const highestSpellLevel = isCaster ? getHighestSpellLevel(dndClass, level) : 0
    const cantripsKnown = isCaster ? getCantripsKnown(dndClass, level) : 0
    const startsSpellcasting = casterConfig?.startsAtLevel || 1
    const hasSpellcasting = level >= startsSpellcasting

    return {
      asiCount,
      requiresSubclass,
      subclassLevel,
      isCaster,
      hasSpellcasting,
      highestSpellLevel,
      cantripsKnown,
    }
  }, [level, characterClass])

  const wealthDescription = useMemo(
    () => getStartingWealthDescription(level),
    [level]
  )

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-fantasy-gold font-pixel text-sm mb-2">
          Starting Level
        </label>
        <select
          value={level}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-3 rounded focus:outline-none focus:border-fantasy-gold"
        >
          {Array.from({ length: 20 }, (_, i) => i + 1).map((l) => (
            <option key={l} value={l}>
              Level {l}
            </option>
          ))}
        </select>
      </div>

      {/* Tier info */}
      <div className="p-4 bg-fantasy-dark/50 rounded border border-fantasy-brown">
        <div className="text-fantasy-gold font-bold mb-2">{tier.name}</div>
        <div className="text-sm text-fantasy-tan mb-3">{tier.description}</div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* ASI Count */}
          <div>
            <span className="text-gray-400">ASIs/Feats:</span>{' '}
            <span className="text-white font-bold">{levelInfo.asiCount}</span>
          </div>

          {/* Subclass */}
          <div>
            <span className="text-gray-400">Subclass:</span>{' '}
            {levelInfo.requiresSubclass ? (
              <span className="text-amber-400">Required (Lv. {levelInfo.subclassLevel})</span>
            ) : (
              <span className="text-gray-500">Not yet</span>
            )}
          </div>

          {/* Spellcasting */}
          {levelInfo.isCaster && (
            <>
              <div>
                <span className="text-gray-400">Highest Spell:</span>{' '}
                {levelInfo.hasSpellcasting ? (
                  <span className="text-blue-400">
                    {levelInfo.highestSpellLevel === 0
                      ? 'Cantrips only'
                      : `Level ${levelInfo.highestSpellLevel}`}
                  </span>
                ) : (
                  <span className="text-gray-500">Not yet</span>
                )}
              </div>
              <div>
                <span className="text-gray-400">Cantrips:</span>{' '}
                <span className="text-white">{levelInfo.cantripsKnown}</span>
              </div>
            </>
          )}

          {/* Proficiency Bonus */}
          <div>
            <span className="text-gray-400">Proficiency:</span>{' '}
            <span className="text-white">+{Math.ceil(level / 4) + 1}</span>
          </div>
        </div>

        {/* Starting Wealth */}
        <div className="mt-3 pt-3 border-t border-fantasy-brown">
          <span className="text-gray-400 text-sm">Starting Wealth:</span>
          <div className="text-fantasy-gold text-sm mt-1">{wealthDescription}</div>
        </div>
      </div>

      {/* Warnings for high levels */}
      {level >= 5 && (
        <div className="p-3 bg-amber-900/30 border border-amber-700 rounded text-sm">
          <span className="text-amber-400 font-bold">Note:</span>{' '}
          <span className="text-amber-200">
            Starting at level {level} requires selecting{' '}
            {levelInfo.asiCount > 0 && `${levelInfo.asiCount} ASI/Feat choice${levelInfo.asiCount !== 1 ? 's' : ''}`}
            {levelInfo.asiCount > 0 && levelInfo.requiresSubclass && ' and '}
            {levelInfo.requiresSubclass && 'a subclass'}
            {levelInfo.isCaster && levelInfo.hasSpellcasting && `, plus ${levelInfo.highestSpellLevel > 0 ? 'spells' : 'cantrips'}`}
            .
          </span>
        </div>
      )}
    </div>
  )
}
