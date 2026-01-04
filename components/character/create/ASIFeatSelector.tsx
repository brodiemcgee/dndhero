'use client'

import { useMemo } from 'react'
import { ASI_LEVELS } from '@/lib/engine/progression/class-features'
import { FEATS, getAvailableFeats, type CharacterAbilities } from '@/data/character-options/feats'
import type { AbilityName } from '@/types/character-options'

export interface ASIChoice {
  level: number
  type: 'asi' | 'feat'
  asiAbility1?: AbilityName
  asiAbility2?: AbilityName
  asiMode?: 'plus2' | 'plus1x2'
  featId?: string
}

interface ASIFeatSelectorProps {
  characterClass: string
  characterLevel: number
  currentAbilities: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
  asiChoices: ASIChoice[]
  onChoicesChange: (choices: ASIChoice[]) => void
  hasSpellcasting?: boolean
  proficiencies?: string[]
}

const ABILITY_NAMES: AbilityName[] = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
]

const ABILITY_LABELS: Record<AbilityName, string> = {
  strength: 'Strength',
  dexterity: 'Dexterity',
  constitution: 'Constitution',
  intelligence: 'Intelligence',
  wisdom: 'Wisdom',
  charisma: 'Charisma',
}

const ABILITY_ABBREV: Record<AbilityName, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}

export function ASIFeatSelector({
  characterClass,
  characterLevel,
  currentAbilities,
  asiChoices,
  onChoicesChange,
  hasSpellcasting = false,
  proficiencies = [],
}: ASIFeatSelectorProps) {
  // Get ASI levels for this class
  const classASILevels = useMemo(() => {
    return ASI_LEVELS[characterClass] || [4, 8, 12, 16, 19]
  }, [characterClass])

  // Filter to only ASI levels the character has reached
  const availableASILevels = useMemo(() => {
    return classASILevels.filter((level) => level <= characterLevel)
  }, [classASILevels, characterLevel])

  // Calculate running totals after each ASI
  const abilityTotals = useMemo(() => {
    const totals: Record<number, Record<AbilityName, number>> = {}
    let runningAbilities = { ...currentAbilities }

    for (const asiLevel of classASILevels) {
      const choice = asiChoices.find((c) => c.level === asiLevel)

      if (choice && choice.type === 'asi') {
        if (choice.asiMode === 'plus2' && choice.asiAbility1) {
          runningAbilities = {
            ...runningAbilities,
            [choice.asiAbility1]: Math.min(20, runningAbilities[choice.asiAbility1] + 2),
          }
        } else if (choice.asiMode === 'plus1x2') {
          if (choice.asiAbility1) {
            runningAbilities = {
              ...runningAbilities,
              [choice.asiAbility1]: Math.min(20, runningAbilities[choice.asiAbility1] + 1),
            }
          }
          if (choice.asiAbility2 && choice.asiAbility2 !== choice.asiAbility1) {
            runningAbilities = {
              ...runningAbilities,
              [choice.asiAbility2]: Math.min(20, runningAbilities[choice.asiAbility2] + 1),
            }
          }
        }
      }

      totals[asiLevel] = { ...runningAbilities }
    }

    return totals
  }, [currentAbilities, asiChoices, classASILevels])

  // Get final ability scores after all ASIs
  const finalAbilities = useMemo(() => {
    const lastASILevel = availableASILevels[availableASILevels.length - 1]
    return lastASILevel ? abilityTotals[lastASILevel] : currentAbilities
  }, [abilityTotals, availableASILevels, currentAbilities])

  // Get available feats
  const availableFeats = useMemo(() => {
    try {
      const characterAbilities: CharacterAbilities = {
        ...finalAbilities,
        proficiencies,
        canCastSpells: hasSpellcasting,
        level: characterLevel,
      }
      return getAvailableFeats(characterAbilities)
    } catch {
      // If feats module doesn't exist yet, return empty array
      return FEATS || []
    }
  }, [finalAbilities, characterLevel, hasSpellcasting, proficiencies])

  const handleChoiceChange = (level: number, updates: Partial<ASIChoice>) => {
    const existingIndex = asiChoices.findIndex((c) => c.level === level)
    const newChoices = [...asiChoices]

    if (existingIndex >= 0) {
      newChoices[existingIndex] = { ...newChoices[existingIndex], ...updates }
    } else {
      newChoices.push({ level, type: 'asi', ...updates } as ASIChoice)
    }

    // Sort by level
    newChoices.sort((a, b) => a.level - b.level)
    onChoicesChange(newChoices)
  }

  const getChoiceForLevel = (level: number): ASIChoice => {
    return (
      asiChoices.find((c) => c.level === level) || {
        level,
        type: 'asi',
        asiMode: 'plus2',
      }
    )
  }

  // Check if an ability can receive a bonus (not already at 20)
  const canIncreaseAbility = (
    ability: AbilityName,
    asiLevel: number,
    amount: number
  ): boolean => {
    // Get abilities before this ASI level
    const prevLevel = classASILevels[classASILevels.indexOf(asiLevel) - 1]
    const baseAbilities = prevLevel ? abilityTotals[prevLevel] : currentAbilities
    return baseAbilities[ability] + amount <= 20
  }

  if (availableASILevels.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-fantasy-gold font-pixel text-sm mb-2">
          Ability Score Improvements
        </label>
        <p className="text-sm text-fantasy-stone mb-4">
          At certain levels, you can increase your ability scores or take a feat.
          {characterClass === 'Fighter' && ' Fighters get more ASIs than other classes.'}
          {characterClass === 'Rogue' && ' Rogues get an extra ASI at level 10.'}
        </p>
      </div>

      {/* ASI Selectors for each available level */}
      <div className="space-y-4">
        {availableASILevels.map((asiLevel) => {
          const choice = getChoiceForLevel(asiLevel)
          const prevLevel = classASILevels[classASILevels.indexOf(asiLevel) - 1]
          const baseAbilitiesForLevel = prevLevel
            ? abilityTotals[prevLevel]
            : currentAbilities

          return (
            <div
              key={asiLevel}
              className="p-4 bg-fantasy-dark/50 rounded border border-fantasy-brown"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-fantasy-gold font-bold">
                  Level {asiLevel} ASI/Feat
                </span>
                <span className="text-xs text-fantasy-stone">
                  {asiLevel === availableASILevels[availableASILevels.length - 1]
                    ? 'Most Recent'
                    : ''}
                </span>
              </div>

              {/* Type selector */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() =>
                    handleChoiceChange(asiLevel, {
                      type: 'asi',
                      asiMode: 'plus2',
                      featId: undefined,
                    })
                  }
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    choice.type === 'asi'
                      ? 'bg-amber-600 text-white'
                      : 'bg-fantasy-brown text-fantasy-light hover:bg-fantasy-brown/80'
                  }`}
                >
                  Ability Score
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleChoiceChange(asiLevel, {
                      type: 'feat',
                      asiAbility1: undefined,
                      asiAbility2: undefined,
                      asiMode: undefined,
                    })
                  }
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    choice.type === 'feat'
                      ? 'bg-purple-600 text-white'
                      : 'bg-fantasy-brown text-fantasy-light hover:bg-fantasy-brown/80'
                  }`}
                >
                  Feat
                </button>
              </div>

              {/* ASI Options */}
              {choice.type === 'asi' && (
                <div className="space-y-3">
                  {/* ASI Mode */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleChoiceChange(asiLevel, {
                          asiMode: 'plus2',
                          asiAbility2: undefined,
                        })
                      }
                      className={`flex-1 px-3 py-2 rounded text-xs transition-colors ${
                        choice.asiMode === 'plus2' || !choice.asiMode
                          ? 'bg-stone-600 text-white'
                          : 'bg-stone-800 text-fantasy-stone hover:bg-stone-700'
                      }`}
                    >
                      +2 to one ability
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChoiceChange(asiLevel, { asiMode: 'plus1x2' })}
                      className={`flex-1 px-3 py-2 rounded text-xs transition-colors ${
                        choice.asiMode === 'plus1x2'
                          ? 'bg-stone-600 text-white'
                          : 'bg-stone-800 text-fantasy-stone hover:bg-stone-700'
                      }`}
                    >
                      +1 to two abilities
                    </button>
                  </div>

                  {/* Ability Dropdowns */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-fantasy-stone mb-1">
                        {choice.asiMode === 'plus1x2' ? 'First Ability (+1)' : 'Ability (+2)'}
                      </label>
                      <select
                        value={choice.asiAbility1 || ''}
                        onChange={(e) =>
                          handleChoiceChange(asiLevel, {
                            asiAbility1: e.target.value as AbilityName,
                          })
                        }
                        className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-2 rounded focus:outline-none focus:border-fantasy-gold text-sm"
                      >
                        <option value="">Select...</option>
                        {ABILITY_NAMES.map((ability) => {
                          const amount = choice.asiMode === 'plus1x2' ? 1 : 2
                          const canIncrease = canIncreaseAbility(ability, asiLevel, amount)
                          const currentValue = baseAbilitiesForLevel[ability]
                          return (
                            <option
                              key={ability}
                              value={ability}
                              disabled={!canIncrease}
                            >
                              {ABILITY_LABELS[ability]} ({currentValue}
                              {canIncrease
                                ? ` -> ${currentValue + amount}`
                                : ' - MAX'}
                              )
                            </option>
                          )
                        })}
                      </select>
                    </div>

                    {choice.asiMode === 'plus1x2' && (
                      <div>
                        <label className="block text-xs text-fantasy-stone mb-1">
                          Second Ability (+1)
                        </label>
                        <select
                          value={choice.asiAbility2 || ''}
                          onChange={(e) =>
                            handleChoiceChange(asiLevel, {
                              asiAbility2: e.target.value as AbilityName,
                            })
                          }
                          className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-2 rounded focus:outline-none focus:border-fantasy-gold text-sm"
                        >
                          <option value="">Select...</option>
                          {ABILITY_NAMES.filter((a) => a !== choice.asiAbility1).map(
                            (ability) => {
                              const canIncrease = canIncreaseAbility(ability, asiLevel, 1)
                              const currentValue = baseAbilitiesForLevel[ability]
                              return (
                                <option
                                  key={ability}
                                  value={ability}
                                  disabled={!canIncrease}
                                >
                                  {ABILITY_LABELS[ability]} ({currentValue}
                                  {canIncrease ? ` -> ${currentValue + 1}` : ' - MAX'})
                                </option>
                              )
                            }
                          )}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Feat Selection */}
              {choice.type === 'feat' && (
                <div>
                  <label className="block text-xs text-fantasy-stone mb-1">
                    Select Feat
                  </label>
                  <select
                    value={choice.featId || ''}
                    onChange={(e) =>
                      handleChoiceChange(asiLevel, { featId: e.target.value })
                    }
                    className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-2 rounded focus:outline-none focus:border-fantasy-gold text-sm"
                  >
                    <option value="">Select a feat...</option>
                    {availableFeats.map((feat) => (
                      <option key={feat.id} value={feat.id}>
                        {feat.name}
                      </option>
                    ))}
                  </select>

                  {/* Feat Description & Benefits */}
                  {choice.featId && (() => {
                    const selectedFeat = availableFeats.find((f) => f.id === choice.featId)
                    if (!selectedFeat) return null
                    return (
                      <div className="mt-2 p-3 bg-stone-800 rounded text-sm">
                        <p className="text-fantasy-tan mb-2">{selectedFeat.description}</p>
                        {selectedFeat.benefits && selectedFeat.benefits.length > 0 && (
                          <ul className="list-disc list-inside space-y-1 text-fantasy-light">
                            {selectedFeat.benefits.map((benefit, idx) => (
                              <li key={idx} className="text-xs">{benefit}</li>
                            ))}
                          </ul>
                        )}
                        {selectedFeat.abilityScoreIncrease && (
                          <p className="mt-2 text-xs text-amber-400">
                            +{selectedFeat.abilityScoreIncrease.amount} to {selectedFeat.abilityScoreIncrease.options.join(' or ')}
                          </p>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Running Total Display */}
      <div className="p-4 bg-stone-800 rounded border border-stone-700">
        <div className="text-fantasy-gold font-bold mb-3">
          Final Ability Scores (After ASIs)
        </div>
        <div className="grid grid-cols-3 gap-3">
          {ABILITY_NAMES.map((ability) => {
            const base = currentAbilities[ability]
            const final = finalAbilities[ability]
            const increased = final > base

            return (
              <div
                key={ability}
                className={`p-2 rounded text-center ${
                  increased
                    ? 'bg-green-900/30 border border-green-700/50'
                    : 'bg-stone-700/50'
                }`}
              >
                <div className="text-xs text-fantasy-stone mb-1">
                  {ABILITY_ABBREV[ability]}
                </div>
                <div
                  className={`text-lg font-bold ${
                    increased ? 'text-green-400' : 'text-fantasy-light'
                  }`}
                >
                  {final}
                </div>
                {increased && (
                  <div className="text-xs text-green-400">
                    (+{final - base})
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming ASI levels info */}
      {characterLevel < 20 && (
        <div className="text-xs text-fantasy-stone">
          <span className="text-amber-400">Next ASI:</span>{' '}
          {classASILevels.find((l) => l > characterLevel)
            ? `Level ${classASILevels.find((l) => l > characterLevel)}`
            : 'None remaining'}
          {characterClass !== 'Fighter' &&
            characterClass !== 'Rogue' &&
            ' (Most classes: 4, 8, 12, 16, 19)'}
        </div>
      )}
    </div>
  )
}
