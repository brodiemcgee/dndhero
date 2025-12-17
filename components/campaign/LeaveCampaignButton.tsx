'use client'

/**
 * LeaveCampaignButton Component
 * Allows a player to remove their character from the current campaign
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PixelButton } from '@/components/ui/PixelButton'

interface LeaveCampaignButtonProps {
  characterId: string
  characterName: string
}

export function LeaveCampaignButton({ characterId, characterName }: LeaveCampaignButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLeave = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/characters/${characterId}/leave`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to leave campaign')
        setLoading(false)
        return
      }

      // Refresh the page to show character selection
      router.refresh()
    } catch (err) {
      console.error('Error leaving campaign:', err)
      setError('An error occurred while leaving the campaign')
      setLoading(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="mt-4 p-4 bg-gray-800 border border-amber-700 rounded">
        <p className="text-gray-300 text-sm mb-3">
          Remove <span className="text-white font-bold">{characterName}</span> from this campaign?
        </p>
        <p className="text-gray-500 text-xs mb-4">
          Your character will keep all progression and be available for other campaigns.
        </p>
        {error && (
          <div className="mb-3 p-2 bg-red-900/50 border border-red-700 rounded text-red-400 text-xs">
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <PixelButton
            variant="secondary"
            size="small"
            onClick={() => setShowConfirm(false)}
            disabled={loading}
          >
            Cancel
          </PixelButton>
          <PixelButton
            variant="primary"
            size="small"
            onClick={handleLeave}
            disabled={loading}
          >
            {loading ? 'Leaving...' : 'Confirm Leave'}
          </PixelButton>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-sm text-gray-500 hover:text-amber-400 transition-colors mt-4"
    >
      Leave Campaign
    </button>
  )
}
