'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PixelButton } from '@/components/ui/PixelButton'

interface DeleteCampaignButtonProps {
  campaignId: string
  campaignName: string
}

export function DeleteCampaignButton({ campaignId, campaignName }: DeleteCampaignButtonProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/campaign/${campaignId}/delete`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to delete campaign')
        setLoading(false)
        return
      }

      // Redirect to dashboard after successful deletion
      router.push('/dashboard')
    } catch (err) {
      console.error('Error deleting campaign:', err)
      setError('An error occurred while deleting the campaign')
      setLoading(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="p-4 bg-red-900/30 border border-red-700 rounded">
        <p className="text-red-400 font-bold mb-2">Delete Campaign?</p>
        <p className="text-gray-300 text-sm mb-4">
          This will permanently delete &quot;{campaignName}&quot; and all associated data
          including characters, scenes, and game history. This cannot be undone.
        </p>
        {error && (
          <p className="text-red-400 text-sm mb-3">{error}</p>
        )}
        <div className="flex gap-3">
          <PixelButton
            variant="secondary"
            onClick={() => setShowConfirm(false)}
            disabled={loading}
          >
            Cancel
          </PixelButton>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white border-2 border-red-900 rounded font-bold text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Yes, Delete Campaign'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-red-400 hover:text-red-300 text-sm underline"
    >
      Delete Campaign
    </button>
  )
}
