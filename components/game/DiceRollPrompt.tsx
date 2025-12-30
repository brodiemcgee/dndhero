'use client'

import { useState } from 'react'
import { PixelButton } from '@/components/ui/PixelButton'

interface DiceRollPromptProps {
  rollRequest: {
    id: string
    character_id: string | null
    character_name: string | null
    roll_type: string
    notation: string
    ability?: string | null
    skill?: string | null
    dc?: number | null
    advantage: boolean
    disadvantage: boolean
    description: string
    reason?: string | null
    is_own_character: boolean
    can_roll: boolean
    resolved?: boolean
    result_total?: number
    result_breakdown?: string
    result_critical?: boolean
    result_fumble?: boolean
    success?: boolean | null
  }
  onRoll: (rollRequestId: string) => Promise<void>
}

export default function DiceRollPrompt({ rollRequest, onRoll }: DiceRollPromptProps) {
  const [isRolling, setIsRolling] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const handleRoll = async () => {
    if (!rollRequest.can_roll || rollRequest.resolved) return

    setIsRolling(true)
    try {
      await onRoll(rollRequest.id)
      setShowResult(true)
    } finally {
      setIsRolling(false)
    }
  }

  const getRollTypeLabel = (rollType: string) => {
    const labels: Record<string, string> = {
      ability_check: 'Ability Check',
      skill_check: 'Skill Check',
      saving_throw: 'Saving Throw',
      attack_roll: 'Attack Roll',
      damage_roll: 'Damage Roll',
      initiative: 'Initiative',
      death_save: 'Death Saving Throw',
    }
    return labels[rollType] || rollType
  }

  const getAbilityLabel = (ability: string) => {
    return ability.charAt(0).toUpperCase() + ability.slice(1)
  }

  const getSkillLabel = (skill: string) => {
    return skill.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  const isComplete = rollRequest.resolved

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all ${
        isComplete
          ? rollRequest.success
            ? 'bg-green-900/30 border-green-600'
            : rollRequest.success === false
            ? 'bg-red-900/30 border-red-600'
            : 'bg-gray-800 border-gray-600'
          : rollRequest.can_roll
          ? 'bg-purple-900/30 border-purple-500 animate-pulse'
          : 'bg-gray-800 border-gray-600'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎲</span>
          <span className="text-purple-300 font-bold">
            {rollRequest.character_name || 'Unknown'}
          </span>
        </div>
        {rollRequest.advantage && (
          <span className="text-xs bg-green-600 px-2 py-1 rounded text-white">
            Advantage
          </span>
        )}
        {rollRequest.disadvantage && (
          <span className="text-xs bg-red-600 px-2 py-1 rounded text-white">
            Disadvantage
          </span>
        )}
      </div>

      {/* Roll Description */}
      <div className="mb-3">
        <div className="text-white font-semibold">
          {rollRequest.description}
        </div>
        <div className="text-gray-400 text-sm">
          {getRollTypeLabel(rollRequest.roll_type)}
          {rollRequest.skill && ` (${getSkillLabel(rollRequest.skill)})`}
          {rollRequest.ability && !rollRequest.skill && ` (${getAbilityLabel(rollRequest.ability)})`}
          {rollRequest.dc && ` - DC ${rollRequest.dc}`}
        </div>
        {rollRequest.reason && (
          <div className="text-gray-500 text-xs mt-1 italic">
            {rollRequest.reason}
          </div>
        )}
      </div>

      {/* Roll Button or Result */}
      {isComplete ? (
        <div className="flex items-center gap-4">
          <div
            className={`text-4xl font-bold ${
              rollRequest.result_critical
                ? 'text-yellow-400'
                : rollRequest.result_fumble
                ? 'text-red-400'
                : rollRequest.success
                ? 'text-green-400'
                : rollRequest.success === false
                ? 'text-red-400'
                : 'text-white'
            }`}
          >
            {rollRequest.result_total}
          </div>
          <div className="flex-1">
            <div className="text-gray-400 text-sm">
              {rollRequest.result_breakdown}
            </div>
            {rollRequest.dc && (
              <div
                className={`text-sm font-semibold ${
                  rollRequest.success ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {rollRequest.success ? 'Success!' : 'Failure'}
              </div>
            )}
            {rollRequest.result_critical && (
              <div className="text-yellow-400 text-sm font-bold animate-pulse">
                CRITICAL HIT!
              </div>
            )}
            {rollRequest.result_fumble && (
              <div className="text-red-400 text-sm font-bold animate-pulse">
                CRITICAL FUMBLE!
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {rollRequest.can_roll ? (
            <PixelButton
              onClick={handleRoll}
              disabled={isRolling}
              className="flex-1"
            >
              {isRolling ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">🎲</span>
                  Rolling...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  🎲 Roll {rollRequest.notation}
                </span>
              )}
            </PixelButton>
          ) : (
            <div className="flex-1 text-center text-gray-400 py-2">
              Waiting for {rollRequest.character_name}...
            </div>
          )}
        </div>
      )}
    </div>
  )
}
