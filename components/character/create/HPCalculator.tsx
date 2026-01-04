'use client'

import { useMemo, useCallback } from 'react'

// Hit die configuration by class
const HIT_DICE: Record<string, number> = {
  Barbarian: 12,
  Fighter: 10,
  Paladin: 10,
  Ranger: 10,
  Bard: 8,
  Cleric: 8,
  Druid: 8,
  Monk: 8,
  Rogue: 8,
  Warlock: 8,
  Sorcerer: 6,
  Wizard: 6,
}

// Group classes by hit die for display
const HIT_DIE_GROUPS: Record<string, string[]> = {
  'd12': ['Barbarian'],
  'd10': ['Fighter', 'Paladin', 'Ranger'],
  'd8': ['Bard', 'Cleric', 'Druid', 'Monk', 'Rogue', 'Warlock'],
  'd6': ['Sorcerer', 'Wizard'],
}

export interface HPChoice {
  level: number
  method: 'max' | 'average' | 'roll'
  rolledValue?: number
}

interface HPCalculatorProps {
  characterClass: string
  characterLevel: number
  constitutionModifier: number
  hpChoices: HPChoice[]
  onChoicesChange: (choices: HPChoice[]) => void
}

export function HPCalculator({
  characterClass,
  characterLevel,
  constitutionModifier,
  hpChoices,
  onChoicesChange,
}: HPCalculatorProps) {
  const hitDie = HIT_DICE[characterClass] || 8
  const averageRoll = Math.ceil((hitDie / 2) + 0.5) // Average rounded up (e.g., d8 = 5, d10 = 6, d12 = 7)

  // Get hit die display string
  const hitDieDisplay = useMemo(() => {
    for (const [die, classes] of Object.entries(HIT_DIE_GROUPS)) {
      if (classes.includes(characterClass)) {
        return die
      }
    }
    return 'd8'
  }, [characterClass])

  // Ensure we have choices for all levels
  const normalizedChoices = useMemo(() => {
    const choices: HPChoice[] = []
    for (let level = 1; level <= characterLevel; level++) {
      const existing = hpChoices.find(c => c.level === level)
      if (level === 1) {
        // Level 1 is always max
        choices.push({ level: 1, method: 'max' })
      } else if (existing) {
        choices.push(existing)
      } else {
        // Default to average for new levels
        choices.push({ level, method: 'average' })
      }
    }
    return choices
  }, [hpChoices, characterLevel])

  // Calculate HP for a given choice
  const getHPForChoice = useCallback((choice: HPChoice): number => {
    const conMod = constitutionModifier

    if (choice.level === 1) {
      // Level 1: Max hit die + CON mod (minimum 1)
      return Math.max(1, hitDie + conMod)
    }

    if (choice.method === 'max') {
      return Math.max(1, hitDie + conMod)
    } else if (choice.method === 'roll' && choice.rolledValue !== undefined) {
      return Math.max(1, choice.rolledValue + conMod)
    } else {
      // Average (rounded up)
      return Math.max(1, averageRoll + conMod)
    }
  }, [hitDie, averageRoll, constitutionModifier])

  // Calculate total HP
  const totalHP = useMemo(() => {
    return normalizedChoices.reduce((sum, choice) => sum + getHPForChoice(choice), 0)
  }, [normalizedChoices, getHPForChoice])

  // Roll a hit die
  const rollHitDie = (): number => {
    return Math.floor(Math.random() * hitDie) + 1
  }

  // Update a choice for a specific level
  const updateChoice = (level: number, method: 'average' | 'roll', rolledValue?: number) => {
    const newChoices = normalizedChoices.map(choice => {
      if (choice.level === level) {
        return { level, method, rolledValue }
      }
      return choice
    })
    onChoicesChange(newChoices)
  }

  // Handle roll button click
  const handleRoll = (level: number) => {
    const rolled = rollHitDie()
    updateChoice(level, 'roll', rolled)
  }

  // Take average for all levels
  const takeAverageForAll = () => {
    const newChoices: HPChoice[] = normalizedChoices.map(choice => {
      if (choice.level === 1) {
        return { level: 1, method: 'max' as const }
      }
      return { level: choice.level, method: 'average' as const }
    })
    onChoicesChange(newChoices)
  }

  return (
    <div className="space-y-4">
      {/* Header with hit die info */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-fantasy-gold font-pixel text-sm mb-1">
            Hit Points
          </label>
          <div className="text-sm text-fantasy-tan">
            Hit Die: <span className="text-white font-bold">{hitDieDisplay}</span>
            <span className="text-gray-400 ml-2">
              ({characterClass})
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-fantasy-gold">{totalHP}</div>
          <div className="text-xs text-gray-400">Total HP</div>
        </div>
      </div>

      {/* Quick action */}
      {characterLevel > 1 && (
        <button
          onClick={takeAverageForAll}
          className="w-full p-2 text-sm bg-fantasy-brown/50 hover:bg-fantasy-brown border border-fantasy-stone rounded transition-colors text-fantasy-tan hover:text-white"
        >
          Take average for all levels
        </button>
      )}

      {/* Level-by-level breakdown */}
      <div className="p-4 bg-fantasy-dark/50 rounded border border-fantasy-brown">
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {normalizedChoices.map((choice) => {
            const hpGained = getHPForChoice(choice)
            const isLevelOne = choice.level === 1

            return (
              <div
                key={choice.level}
                className="flex items-center gap-3 p-2 bg-fantasy-dark/30 rounded border border-fantasy-brown/50"
              >
                {/* Level indicator */}
                <div className="w-12 text-center">
                  <div className="text-xs text-gray-400">Lv.</div>
                  <div className="text-fantasy-gold font-bold">{choice.level}</div>
                </div>

                {/* HP method selection / display */}
                <div className="flex-1">
                  {isLevelOne ? (
                    <div className="text-sm text-gray-400">
                      Max hit die ({hitDie}) + CON ({constitutionModifier >= 0 ? '+' : ''}{constitutionModifier})
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateChoice(choice.level, 'average')}
                        className={`flex-1 px-3 py-1.5 text-sm rounded border transition-colors ${
                          choice.method === 'average'
                            ? 'bg-amber-900/50 border-amber-500 text-amber-200'
                            : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        Average ({averageRoll})
                      </button>
                      <button
                        onClick={() => handleRoll(choice.level)}
                        className={`flex-1 px-3 py-1.5 text-sm rounded border transition-colors ${
                          choice.method === 'roll'
                            ? 'bg-amber-900/50 border-amber-500 text-amber-200'
                            : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        {choice.method === 'roll' && choice.rolledValue !== undefined
                          ? `Rolled: ${choice.rolledValue}`
                          : 'Roll'}
                      </button>
                    </div>
                  )}
                </div>

                {/* HP gained */}
                <div className="w-16 text-right">
                  <div className="text-xs text-gray-400">HP</div>
                  <div className="text-white font-bold">+{hpGained}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-3 border-t border-fantasy-brown flex justify-between items-center">
          <div className="text-sm text-gray-400">
            CON Modifier: <span className="text-white">{constitutionModifier >= 0 ? '+' : ''}{constitutionModifier}</span>
            <span className="text-gray-500 ml-1">(per level)</span>
          </div>
          <div className="text-lg font-bold text-fantasy-gold">
            Total: {totalHP} HP
          </div>
        </div>
      </div>

      {/* Hit die reference */}
      <div className="text-xs text-gray-500 space-y-1">
        <div className="font-medium text-gray-400">Hit Dice by Class:</div>
        <div className="grid grid-cols-2 gap-x-4">
          {Object.entries(HIT_DIE_GROUPS).map(([die, classes]) => (
            <div key={die}>
              <span className="text-amber-400">{die}:</span>{' '}
              <span>{classes.join(', ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
