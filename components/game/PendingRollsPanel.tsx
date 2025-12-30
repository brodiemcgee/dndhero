'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import DiceRollPrompt from './DiceRollPrompt'

interface RollRequest {
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
  roll_order: number
  is_own_character: boolean
  can_roll: boolean
  resolved: boolean
  result_total?: number
  result_breakdown?: string
  result_critical?: boolean
  result_fumble?: boolean
  success?: boolean | null
}

interface PendingRollsPanelProps {
  turnContractId: string
  onAllRollsComplete?: () => void
}

export default function PendingRollsPanel({
  turnContractId,
  onAllRollsComplete,
}: PendingRollsPanelProps) {
  const supabase = createClient()
  const [pendingRolls, setPendingRolls] = useState<RollRequest[]>([])
  const [completedRolls, setCompletedRolls] = useState<RollRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isHost, setIsHost] = useState(false)

  // Fetch pending rolls
  const fetchRolls = useCallback(async () => {
    try {
      const response = await fetch(`/api/dice/pending?turnContractId=${turnContractId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch rolls')
      }

      setPendingRolls(data.pendingRolls || [])
      setCompletedRolls(data.completedRolls || [])
      setIsHost(data.isHost || false)

      if (data.allComplete && onAllRollsComplete) {
        onAllRollsComplete()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [turnContractId, onAllRollsComplete])

  // Initial fetch
  useEffect(() => {
    fetchRolls()
  }, [fetchRolls])

  // Real-time subscription for roll updates
  useEffect(() => {
    const channel = supabase
      .channel(`rolls:${turnContractId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dice_roll_requests',
          filter: `turn_contract_id=eq.${turnContractId}`,
        },
        () => {
          // Refetch on any change
          fetchRolls()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [turnContractId, supabase, fetchRolls])

  // Polling fallback
  useEffect(() => {
    const interval = setInterval(fetchRolls, 2000)
    return () => clearInterval(interval)
  }, [fetchRolls])

  // Handle roll execution
  const handleRoll = async (rollRequestId: string) => {
    try {
      const response = await fetch('/api/dice/execute-roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollRequestId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute roll')
      }

      // Optimistically update the UI
      setPendingRolls((prev) =>
        prev.map((r) =>
          r.id === rollRequestId
            ? {
                ...r,
                resolved: true,
                result_total: data.roll.total,
                result_breakdown: data.roll.breakdown,
                result_critical: data.roll.critical,
                result_fumble: data.roll.fumble,
                success: data.roll.rollSuccess,
              }
            : r
        )
      )

      // Refetch to get accurate state
      await fetchRolls()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="p-4 bg-gray-900 rounded-lg">
        <div className="flex items-center gap-2 text-purple-300">
          <span className="animate-spin">🎲</span>
          Loading dice rolls...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg">
        <div className="text-red-300">Error: {error}</div>
      </div>
    )
  }

  const allRolls = [...pendingRolls, ...completedRolls].sort(
    (a, b) => a.roll_order - b.roll_order
  )

  const pendingCount = pendingRolls.length
  const totalCount = allRolls.length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-amber-300 font-bold flex items-center gap-2">
          🎲 Dice Rolls Required
        </h3>
        <span className="text-gray-400 text-sm">
          {totalCount - pendingCount} of {totalCount} complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-500 transition-all duration-500"
          style={{ width: `${((totalCount - pendingCount) / totalCount) * 100}%` }}
        />
      </div>

      {/* Roll requests */}
      <div className="space-y-3">
        {allRolls.map((roll) => (
          <DiceRollPrompt
            key={roll.id}
            rollRequest={roll}
            onRoll={handleRoll}
          />
        ))}
      </div>

      {/* Completion message */}
      {pendingCount === 0 && totalCount > 0 && (
        <div className="p-4 bg-green-900/30 border border-green-500 rounded-lg text-center">
          <div className="text-green-300 font-bold">
            All rolls complete! DM is narrating...
          </div>
        </div>
      )}

      {/* Empty state */}
      {totalCount === 0 && (
        <div className="p-4 bg-gray-800 rounded-lg text-center text-gray-400">
          No dice rolls required for this turn.
        </div>
      )}
    </div>
  )
}
