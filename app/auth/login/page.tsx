'use client'

/**
 * Login Page
 * User authentication with email and password
 */

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PixelButton } from '@/components/ui/PixelButton'
import { PixelPanel } from '@/components/ui/PixelPanel'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(searchParams.get('error') || '')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      // Use window.location for full page refresh to ensure cookies are sent to server
      window.location.href = '/dashboard'
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-fantasy-dark p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-fantasy-gold mb-2" style={{ imageRendering: 'pixelated' }}>
            DND HERO
          </h1>
          <p className="text-fantasy-tan">Your AI-Powered D&D Adventure</p>
        </div>

        <PixelPanel title="Login" className="p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-fantasy-red/20 border-2 border-fantasy-red text-fantasy-red p-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-fantasy-tan mb-2 font-bold">
                Email
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
            </div>

            <div>
              <label htmlFor="password" className="block text-fantasy-tan mb-2 font-bold">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-3 rounded focus:outline-none focus:border-fantasy-gold"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link
                href="/auth/forgot-password"
                className="text-fantasy-blue hover:text-fantasy-gold transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <PixelButton
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </PixelButton>

            <div className="text-center text-fantasy-tan">
              Don't have an account?{' '}
              <Link
                href="/auth/signup"
                className="text-fantasy-gold hover:text-fantasy-light transition-colors font-bold"
              >
                Sign Up
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-fantasy-dark">
        <div className="text-fantasy-gold">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
