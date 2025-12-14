'use client'

/**
 * Forgot Password Page
 * Request password reset email
 */

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PixelButton } from '@/components/ui/PixelButton'
import { PixelPanel } from '@/components/ui/PixelPanel'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (resetError) {
        setError(resetError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fantasy-dark p-4">
        <div className="w-full max-w-md">
          <PixelPanel title="Check Your Email" className="p-6">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">✉️</div>
              <h2 className="text-xl font-bold text-fantasy-gold">Reset Email Sent!</h2>
              <p className="text-fantasy-tan">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-fantasy-stone text-sm">
                Please check your email and click the link to reset your password.
              </p>
              <div className="pt-4">
                <Link href="/auth/login">
                  <PixelButton variant="primary" className="w-full">
                    BACK TO LOGIN
                  </PixelButton>
                </Link>
              </div>
            </div>
          </PixelPanel>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-fantasy-dark p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-fantasy-gold mb-2" style={{ imageRendering: 'pixelated' }}>
            DND HERO
          </h1>
          <p className="text-fantasy-tan">Reset Your Password</p>
        </div>

        <PixelPanel title="Forgot Password" className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-fantasy-red/20 border-2 border-fantasy-red text-fantasy-red p-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-fantasy-tan mb-2 font-bold">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-3 rounded focus:outline-none focus:border-fantasy-gold"
                placeholder="adventurer@tavern.com"
              />
              <p className="text-xs text-fantasy-stone mt-1">
                We'll send you a link to reset your password
              </p>
            </div>

            <PixelButton
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'SENDING...' : 'SEND RESET LINK'}
            </PixelButton>

            <div className="text-center text-fantasy-tan text-sm">
              Remember your password?{' '}
              <Link
                href="/auth/login"
                className="text-fantasy-gold hover:text-fantasy-light transition-colors font-bold"
              >
                Login
              </Link>
            </div>
          </form>
        </PixelPanel>

        <div className="text-center mt-6 text-sm text-fantasy-stone">
          <Link href="/" className="hover:text-fantasy-light transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
