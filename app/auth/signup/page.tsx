'use client'

/**
 * Sign Up Page
 * New user registration with email verification
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PixelButton } from '@/components/ui/PixelButton'
import { PixelPanel } from '@/components/ui/PixelPanel'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    birthdate: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateForm = () => {
    if (!formData.email || !formData.username || !formData.password || !formData.birthdate) {
      setError('All fields are required')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }

    if (formData.username.length < 3 || formData.username.length > 20) {
      setError('Username must be between 3 and 20 characters')
      return false
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores')
      return false
    }

    // Check age (must be 13+)
    const birthDate = new Date(formData.birthdate)
    const age = new Date().getFullYear() - birthDate.getFullYear()

    if (age < 13) {
      setError('You must be at least 13 years old to sign up')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          birthdate: formData.birthdate,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Sign up failed')
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
              <h2 className="text-xl font-bold text-fantasy-gold">Verification Email Sent!</h2>
              <p className="text-fantasy-tan">
                We've sent a verification link to <strong>{formData.email}</strong>
              </p>
              <p className="text-fantasy-stone text-sm">
                Please check your email and click the verification link to activate your account.
              </p>
              <div className="pt-4">
                <Link href="/auth/login">
                  <PixelButton variant="primary" className="w-full">
                    GO TO LOGIN
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
          <p className="text-fantasy-tan">Join Your Next Adventure</p>
        </div>

        <PixelPanel title="Create Account" className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-3 rounded focus:outline-none focus:border-fantasy-gold"
                placeholder="adventurer@tavern.com"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-fantasy-tan mb-2 font-bold">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={20}
                className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-3 rounded focus:outline-none focus:border-fantasy-gold"
                placeholder="brave_warrior"
              />
              <p className="text-xs text-fantasy-stone mt-1">3-20 characters, letters, numbers, and underscores only</p>
            </div>

            <div>
              <label htmlFor="birthdate" className="block text-fantasy-tan mb-2 font-bold">
                Birthdate
              </label>
              <input
                type="date"
                id="birthdate"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                required
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-3 rounded focus:outline-none focus:border-fantasy-gold"
              />
              <p className="text-xs text-fantasy-stone mt-1">You must be at least 13 years old</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-fantasy-tan mb-2 font-bold">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-3 rounded focus:outline-none focus:border-fantasy-gold"
                placeholder="••••••••"
              />
              <p className="text-xs text-fantasy-stone mt-1">At least 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-fantasy-tan mb-2 font-bold">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-3 rounded focus:outline-none focus:border-fantasy-gold"
                placeholder="••••••••"
              />
            </div>

            <PixelButton
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </PixelButton>

            <div className="text-center text-fantasy-tan text-sm">
              Already have an account?{' '}
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
