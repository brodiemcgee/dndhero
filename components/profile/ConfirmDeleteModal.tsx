'use client'

import { useState } from 'react'
import { PixelButton } from '@/components/ui/PixelButton'

interface ConfirmDeleteModalProps {
  onClose: () => void
  onConfirm: () => Promise<void>
}

export default function ConfirmDeleteModal({
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValid = confirmText === 'DELETE MY ACCOUNT'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    setError(null)

    try {
      await onConfirm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-fantasy-brown border-4 border-fantasy-red rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-fantasy-red mb-4">
          Delete Account
        </h2>

        <div className="space-y-4 text-fantasy-light">
          <p>
            <strong className="text-fantasy-red">Warning:</strong> This action is permanent and cannot be undone.
          </p>

          <p>
            Deleting your account will permanently remove:
          </p>

          <ul className="list-disc list-inside space-y-1 text-fantasy-tan">
            <li>Your profile and all personal data</li>
            <li>All your characters and their progression</li>
            <li>Any campaigns you host</li>
            <li>Your subscription and credit balance</li>
            <li>All uploaded images and assets</li>
          </ul>

          <p className="text-sm text-fantasy-stone">
            You will be removed from any campaigns you are a member of.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className="block text-fantasy-tan mb-2 font-bold">
                Type &quot;DELETE MY ACCOUNT&quot; to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full bg-fantasy-dark border-2 border-fantasy-red text-fantasy-light p-3 rounded focus:outline-none focus:border-fantasy-red"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-fantasy-red/20 border-2 border-fantasy-red text-fantasy-red p-3 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <PixelButton
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </PixelButton>
              <PixelButton
                type="submit"
                variant="danger"
                disabled={!isValid || loading}
                className="flex-1"
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </PixelButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
