'use client'

import { useState } from 'react'
import { PixelButton } from '@/components/ui/PixelButton'

interface ActionInputProps {
  campaignId: string
  sceneId: string
  turnContractId?: string
  characterId?: string
  mode: string
  turnPhase?: string
  isHost: boolean
}

export default function ActionInput({
  campaignId,
  sceneId,
  turnContractId,
  characterId,
  mode,
  turnPhase,
  isHost,
}: ActionInputProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = turnContractId && turnPhase === 'awaiting_input'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || !turnContractId) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/turn/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turnContractId,
          characterId,
          content: input.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit action')
      }

      // Clear input on success
      setInput('')

      // If turn should advance and we're ready, trigger resolution
      if (data.shouldAdvance && isHost) {
        setTimeout(() => {
          triggerResolution()
        }, 500)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const triggerResolution = async () => {
    if (!turnContractId) return

    try {
      const response = await fetch('/api/turn/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turnContractId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to resolve turn')
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const getModeHint = () => {
    switch (mode) {
      case 'single_player':
        return 'Single player mode - DM controls all NPCs'
      case 'vote':
        return 'Vote mode - Players vote on actions'
      case 'first_response_wins':
        return 'First response wins - First player to submit controls the turn'
      case 'freeform':
        return 'Freeform mode - All players contribute, AI synthesizes'
      default:
        return ''
    }
  }

  const getPhaseStatus = () => {
    if (!turnPhase) return 'No active turn'

    switch (turnPhase) {
      case 'awaiting_input':
        return 'Awaiting player input'
      case 'awaiting_rolls':
        return 'Awaiting dice rolls'
      case 'resolving':
        return 'DM is resolving...'
      case 'complete':
        return 'Turn complete'
      default:
        return turnPhase
    }
  }

  return (
    <div className="p-4 bg-gray-900">
      {error && (
        <div className="mb-3 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-gray-400">{getModeHint()}</span>
        <span className="text-amber-400 capitalize">{getPhaseStatus()}</span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!canSubmit || loading}
          placeholder={
            canSubmit
              ? 'Describe your action...'
              : turnPhase === 'resolving'
              ? 'DM is resolving...'
              : 'Waiting for turn...'
          }
          className="flex-1 px-4 py-3 bg-gray-800 border-2 border-amber-700 rounded text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          maxLength={5000}
        />

        <PixelButton
          type="submit"
          disabled={!input.trim() || !canSubmit || loading}
        >
          {loading ? 'Sending...' : 'Submit'}
        </PixelButton>
      </form>

      {isHost && turnPhase === 'awaiting_input' && (
        <div className="mt-3">
          <button
            onClick={triggerResolution}
            className="text-sm text-amber-400 hover:text-amber-300 underline"
          >
            Force resolve turn (Host)
          </button>
        </div>
      )}
    </div>
  )
}
