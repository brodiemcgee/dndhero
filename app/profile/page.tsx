'use client'

/**
 * Profile Settings Page
 * Manage user profile, preferences, and account settings
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { UserMenu } from '@/components/auth/UserMenu'
import { PixelButton } from '@/components/ui/PixelButton'
import { PixelPanel } from '@/components/ui/PixelPanel'
import AvatarUpload from '@/components/profile/AvatarUpload'
import InterestsInput from '@/components/profile/InterestsInput'
import ConfirmDeleteModal from '@/components/profile/ConfirmDeleteModal'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

interface Profile {
  id: string
  email: string
  name: string
  username: string | null
  avatar_url: string | null
  bio: string | null
  birthdate: string
  interests: string[] | null
  adult_content_opt_in: boolean
  created_at: string
}

interface Entitlements {
  tier: string
  subscription_status: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Form state
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [adultContent, setAdultContent] = useState(false)

  // Calculate age for adult content toggle
  const [userAge, setUserAge] = useState<number | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile')
      }

      const p = data.profile
      setProfile(p)
      setUsername(p.username || '')
      setName(p.name || '')
      setBio(p.bio || '')
      setInterests(p.interests || [])
      setAdultContent(p.adult_content_opt_in || false)

      // Calculate age
      if (p.birthdate) {
        const birthDate = new Date(p.birthdate)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        setUserAge(age)
      }

      // Fetch entitlements
      const supabase = createClient()
      const { data: ent } = await supabase
        .from('entitlements')
        .select('tier, subscription_status')
        .eq('user_id', p.id)
        .single()

      if (ent) {
        setEntitlements(ent)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username || undefined,
          name,
          bio: bio || null,
          interests,
          adult_content_opt_in: adultContent,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile')
      }

      setProfile(data.profile)
      setSuccess('Profile saved successfully!')

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpdated = (url: string) => {
    setProfile((prev) => (prev ? { ...prev, avatar_url: url } : prev))
  }

  const handleDeleteAccount = async () => {
    const response = await fetch('/api/user/profile', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: 'DELETE MY ACCOUNT' }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete account')
    }

    // Sign out and redirect to home
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-fantasy-dark">
        {/* Header */}
        <header className="border-b-4 border-fantasy-stone bg-fantasy-brown p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link
              href="/dashboard"
              className="text-fantasy-gold hover:text-fantasy-tan transition-colors"
            >
              &larr; Back to Dashboard
            </Link>
            <UserMenu />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-3xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-fantasy-gold mb-8">
            Profile Settings
          </h1>

          {loading ? (
            <div className="text-center py-12 text-fantasy-tan">
              Loading profile...
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-8">
              {/* Error/Success Messages */}
              {error && (
                <div className="bg-fantasy-red/20 border-2 border-fantasy-red text-fantasy-red p-4 rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-900/20 border-2 border-green-600 text-green-400 p-4 rounded">
                  {success}
                </div>
              )}

              {/* Account Information */}
              <PixelPanel title="Account Information">
                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="flex justify-center">
                    <AvatarUpload
                      currentAvatarUrl={profile?.avatar_url || null}
                      username={profile?.username || profile?.name || null}
                      onAvatarUpdated={handleAvatarUpdated}
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-fantasy-tan mb-2 font-bold">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      minLength={3}
                      maxLength={20}
                      pattern="^[a-zA-Z0-9_]+$"
                      className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-3 rounded focus:outline-none focus:border-fantasy-gold"
                    />
                    <p className="text-xs text-fantasy-stone mt-1">
                      3-20 characters, letters, numbers, and underscores only
                    </p>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="block text-fantasy-tan mb-2 font-bold">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      maxLength={100}
                      className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-3 rounded focus:outline-none focus:border-fantasy-gold"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-fantasy-tan mb-2 font-bold">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                      rows={4}
                      className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-3 rounded focus:outline-none focus:border-fantasy-gold resize-none"
                    />
                    <p className="text-xs text-fantasy-stone mt-1 text-right">
                      {bio.length}/500 characters
                    </p>
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-fantasy-tan mb-2 font-bold">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full bg-fantasy-dark border-2 border-fantasy-stone text-fantasy-stone p-3 rounded cursor-not-allowed"
                    />
                    <p className="text-xs text-fantasy-stone mt-1">
                      Email cannot be changed
                    </p>
                  </div>
                </div>
              </PixelPanel>

              {/* Content Preferences */}
              <PixelPanel title="Content Preferences">
                <div className="space-y-6">
                  {/* Interests */}
                  <div>
                    <label className="block text-fantasy-tan mb-2 font-bold">
                      Interests
                    </label>
                    <p className="text-sm text-fantasy-stone mb-3">
                      Select the types of content you enjoy
                    </p>
                    <InterestsInput
                      selected={interests}
                      onChange={setInterests}
                    />
                  </div>

                  {/* Adult Content Toggle */}
                  <div className="border-t border-fantasy-stone pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-fantasy-tan font-bold">
                          Adult Content
                        </label>
                        <p className="text-sm text-fantasy-stone">
                          Enable mature themes and content in campaigns
                        </p>
                      </div>

                      {userAge !== null && userAge < 18 ? (
                        <span className="text-fantasy-stone text-sm">
                          Available at 18+
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAdultContent(!adultContent)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            adultContent ? 'bg-fantasy-gold' : 'bg-fantasy-stone'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              adultContent ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      )}
                    </div>
                    {userAge !== null && userAge < 18 && (
                      <p className="text-xs text-fantasy-red mt-2">
                        You must be 18 or older to enable adult content
                      </p>
                    )}
                  </div>
                </div>
              </PixelPanel>

              {/* Account Details */}
              <PixelPanel title="Account Details">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-fantasy-tan font-bold">Member Since</span>
                    <span className="text-fantasy-light">
                      {profile?.created_at ? formatDate(profile.created_at) : '-'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-fantasy-tan font-bold">Subscription</span>
                    <div className="flex items-center gap-3">
                      <span className="text-fantasy-light capitalize">
                        {entitlements?.tier || 'Free'} Tier
                      </span>
                      <Link href="/billing">
                        <PixelButton type="button" variant="secondary">
                          Manage
                        </PixelButton>
                      </Link>
                    </div>
                  </div>
                </div>
              </PixelPanel>

              {/* Save Button */}
              <div className="flex justify-end">
                <PixelButton type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </PixelButton>
              </div>

              {/* Danger Zone */}
              <PixelPanel title="Danger Zone" className="border-fantasy-red">
                <div className="space-y-4">
                  <p className="text-fantasy-light">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <PixelButton
                    type="button"
                    variant="danger"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete Account
                  </PixelButton>
                </div>
              </PixelPanel>
            </form>
          )}
        </main>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <ConfirmDeleteModal
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteAccount}
          />
        )}
      </div>
    </AuthGuard>
  )
}
