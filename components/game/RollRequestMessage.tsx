'use client'

import { useState } from 'react'

interface RollRequestMetadata {
  pending: boolean
  character_id: string
  character_user_id: string
  roll_type: string
  roll_label: string
  notation: string
  ability?: string
  skill?: string
  dc?: number
  advantage: boolean
  disadvantage: boolean
  reason?: string
  // After roll is complete
  result_total?: number
  result_breakdown?: string
  result_critical?: boolean
  result_fumble?: boolean
  result_success?: boolean
}

interface ChatMessage {
  id: string
  campaign_id: string
  scene_id?: string
  character_id?: string
  character_name?: string
  content: string
  message_type: string
  metadata: RollRequestMetadata
  created_at: string
}

interface RollRequestMessageProps {
  message: ChatMessage
  currentUserId?: string
  currentCharacterId?: string
  formatTime: (date: string) => string
  onRollComplete?: () => void
}

export default function RollRequestMessage({
  message,
  currentUserId,
  currentCharacterId,
  formatTime,
  onRollComplete,
}: RollRequestMessageProps) {
  const [isRolling, setIsRolling] = useState(false)
  const [localResult, setLocalResult] = useState<{
    total: number
    breakdown: string
    critical: boolean
    fumble: boolean
    success?: boolean
  } | null>(null)

  const metadata = message.metadata
  const isPending = metadata.pending && !localResult
  const canRoll = currentUserId === metadata.character_user_id

  const handleRoll = async () => {
    if (!canRoll || isRolling || !isPending) return

    setIsRolling(true)

    try {
      const response = await fetch('/api/dice/public-roll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: message.campaign_id,
          sceneId: message.scene_id,
          characterId: metadata.character_id,
          notation: metadata.notation,
          rollType: metadata.roll_type,
          rollLabel: metadata.roll_label,
          dc: metadata.dc,
          advantage: metadata.advantage,
          disadvantage: metadata.disadvantage,
          reason: metadata.reason,
          rollRequestId: message.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setLocalResult({
          total: data.roll.total,
          breakdown: data.roll.breakdown,
          critical: data.roll.critical,
          fumble: data.roll.fumble,
          success: data.roll.rollSuccess,
        })
        onRollComplete?.()
      }
    } catch (error) {
      console.error('Failed to execute roll:', error)
    } finally {
      setIsRolling(false)
    }
  }

  // Use local result if available, otherwise use metadata from completed roll
  const result = localResult || (
    !metadata.pending && metadata.result_total !== undefined
      ? {
          total: metadata.result_total,
          breakdown: metadata.result_breakdown || '',
          critical: metadata.result_critical || false,
          fumble: metadata.result_fumble || false,
          success: metadata.result_success,
        }
      : null
  )

  // Determine background color based on state
  const bgClass = result
    ? result.critical
      ? 'bg-yellow-900/30 border-yellow-500'
      : result.fumble
        ? 'bg-red-900/40 border-red-600'
        : result.success === true
          ? 'bg-green-900/30 border-green-500'
          : result.success === false
            ? 'bg-red-900/30 border-red-500'
            : 'bg-purple-900/30 border-purple-500'
    : 'bg-amber-900/20 border-amber-500'

  return (
    <div className={`p-4 rounded border-l-4 ${bgClass}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{isPending ? '🎯' : '🎲'}</span>
        <span className="text-amber-300 text-xs font-bold">
          {metadata.roll_label}
        </span>
        <span className="text-gray-500 text-xs">{formatTime(message.created_at)}</span>
      </div>

      <div className="mb-3">
        <span className="text-white">
          <span className="font-semibold text-amber-200">{message.character_name}</span>
          {' '}must roll {metadata.roll_label.toLowerCase()}
          {metadata.reason && (
            <span className="text-gray-300"> {metadata.reason}</span>
          )}
        </span>
      </div>

      {isPending ? (
        <div className="flex items-center gap-4">
          <div className="text-gray-400 text-sm">
            <span className="font-mono bg-gray-800 px-2 py-1 rounded">
              {metadata.notation}
            </span>
            {metadata.advantage && (
              <span className="ml-2 text-green-400 text-xs">Advantage</span>
            )}
            {metadata.disadvantage && (
              <span className="ml-2 text-red-400 text-xs">Disadvantage</span>
            )}
            {metadata.dc && (
              <span className="ml-2 text-gray-500 text-xs">DC {metadata.dc}</span>
            )}
          </div>

          {canRoll ? (
            <button
              onClick={handleRoll}
              disabled={isRolling}
              className={`px-4 py-2 rounded font-bold text-sm transition-all ${
                isRolling
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-500 text-white hover:scale-105 active:scale-95'
              }`}
            >
              {isRolling ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">🎲</span>
                  Rolling...
                </span>
              ) : (
                'Roll'
              )}
            </button>
          ) : (
            <span className="text-gray-500 text-sm italic">
              Waiting for {message.character_name}...
            </span>
          )}
        </div>
      ) : result ? (
        <div className="flex items-center gap-4">
          <div
            className={`text-3xl font-bold ${
              result.critical
                ? 'text-yellow-400'
                : result.fumble
                  ? 'text-red-400'
                  : result.success === true
                    ? 'text-green-400'
                    : result.success === false
                      ? 'text-red-400'
                      : 'text-white'
            }`}
          >
            {result.total}
          </div>
          <div className="flex-1">
            <div className="text-gray-400 text-sm">{result.breakdown}</div>
            {metadata.dc !== undefined && metadata.dc !== null && (
              <div
                className={`text-sm font-semibold ${
                  result.success ? 'text-green-400' : 'text-red-400'
                }`}
              >
                DC {metadata.dc}: {result.success ? 'Success!' : 'Failure'}
              </div>
            )}
            {result.critical && (
              <div className="text-yellow-400 text-sm font-bold">CRITICAL!</div>
            )}
            {result.fumble && (
              <div className="text-red-400 text-sm font-bold">FUMBLE!</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
