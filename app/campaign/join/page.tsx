'use client'

/**
 * Join Campaign Page
 * Join a campaign via invite code
 */

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { UserMenu } from '@/components/auth/UserMenu'
import { PixelButton } from '@/components/ui/PixelButton'
import { PixelPanel } from '@/components/ui/PixelPanel'

export const dynamic = 'force-dynamic'

function JoinForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [inviteCode, setInviteCode] = useState(searchParams.get('code') || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/campaign/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: inviteCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to join campaign')
        setLoading(false)
        return
      }

      // Redirect to campaign lobby
      router.push(`/campaign/${data.campaign_id}/lobby`)
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-fantasy-dark">
        <header className="border-b-4 border-fantasy-stone bg-fantasy-brown p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/dashboard" className="text-2xl font-bold text-fantasy-gold">
              DND HERO
            </Link>
            <UserMenu />
          </div>
        </header>

        <main className="max-w-2xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-fantasy-gold mb-2">Join Campaign</h1>
            <p className="text-fantasy-tan">Enter an invite code to join an existing campaign</p>
          </div>

          {error && (
            <div className="bg-fantasy-red/20 border-2 border-fantasy-red text-fantasy-red p-4 rounded mb-6">
              {error}
            </div>
          )}

          <PixelPanel className="p-6">
            <form onSubmit={handleJoin} className="space-y-6">
              <div>
                <label className="block text-fantasy-tan mb-2 font-bold">Invite Code</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-3 rounded focus:outline-none focus:border-fantasy-gold font-mono text-lg"
                  placeholder="ABCD-1234-EFGH"
                  required
                />
                <p className="text-xs text-fantasy-stone mt-1">
                  Ask your DM for the invite code
                </p>
              </div>

              <div className="flex gap-4">
                <Link href="/dashboard" className="flex-1">
                  <PixelButton variant="secondary" className="w-full">
                    CANCEL
                  </PixelButton>
                </Link>
                <PixelButton
                  type="submit"
                  variant="primary"
                  disabled={loading || !inviteCode}
                  className="flex-1"
                >
                  {loading ? 'JOINING...' : 'JOIN CAMPAIGN'}
                </PixelButton>
              </div>
            </form>
          </PixelPanel>

          <div className="text-center mt-6 text-fantasy-tan">
            <p className="mb-2">Don't have an invite code?</p>
            <Link href="/campaign/create" className="text-fantasy-gold hover:text-fantasy-light">
              Create your own campaign →
            </Link>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}

export default function JoinCampaignPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-fantasy-dark">
        <div className="text-fantasy-gold">Loading...</div>
      </div>
    }>
      <JoinForm />
    </Suspense>
  )
}
