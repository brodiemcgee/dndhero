'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PixelButton } from '@/components/ui/PixelButton'

export function StartGameButton({ campaignId }: { campaignId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleStart = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/campaign/${campaignId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start game')
      }

      // Redirect to game page
      router.push(`/campaign/${campaignId}/game`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
          {error}
        </div>
      )}
      <PixelButton
        onClick={handleStart}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Starting...' : 'Start Game'}
      </PixelButton>
    </div>
  )
}
