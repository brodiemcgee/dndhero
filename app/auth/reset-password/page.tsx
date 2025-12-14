'use client'

/**
 * Reset Password Page
 * Actually reset the password after clicking email link
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PixelButton } from '@/components/ui/PixelButton'
import { PixelPanel } from '@/components/ui/PixelPanel'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [validSession, setValidSession] = useState(false)

  useEffect(() => {
    // Check if user has a valid session from the reset link
    const checkSession = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setValidSession(true)
      } else {
        setError('Invalid or expired reset link. Please request a new one.')
      }
    }

    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      setSuccess(true)

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  if (!validSession && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fantasy-dark p-4">
        <div className="w-full max-w-md">
          <PixelPanel title="Invalid Link" className="p-6">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-xl font-bold text-fantasy-red">Reset Link Invalid</h2>
              <p className="text-fantasy-tan">{error}</p>
              <div className="pt-4">
                <Link href="/auth/forgot-password">
                  <PixelButton variant="primary" className="w-full">
                    REQUEST NEW LINK
                  </PixelButton>
                </Link>
              </div>
            </div>
          </PixelPanel>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fantasy-dark p-4">
        <div className="w-full max-w-md">
          <PixelPanel title="Password Reset" className="p-6">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-fantasy-gold">Password Reset Successful!</h2>
              <p className="text-fantasy-tan">
                Your password has been updated. Redirecting to dashboard...
              </p>
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
          <p className="text-fantasy-tan">Set Your New Password</p>
        </div>

        <PixelPanel title="Reset Password" className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-fantasy-red/20 border-2 border-fantasy-red text-fantasy-red p-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-fantasy-tan mb-2 font-bold">
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-3 rounded focus:outline-none focus:border-fantasy-gold"
                placeholder="••••••••"
              />
              <p className="text-xs text-fantasy-stone mt-1">At least 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-fantasy-tan mb-2 font-bold">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-3 rounded focus:outline-none focus:border-fantasy-gold"
                placeholder="••••••••"
              />
            </div>

            <PixelButton
              type="submit"
              variant="primary"
              disabled={loading || !validSession}
              className="w-full"
            >
              {loading ? 'RESETTING...' : 'RESET PASSWORD'}
            </PixelButton>
          </form>
        </PixelPanel>

        <div className="text-center mt-6 text-sm text-fantasy-stone">
          <Link href="/auth/login" className="hover:text-fantasy-light transition-colors">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
