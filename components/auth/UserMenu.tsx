'use client'

/**
 * User Menu Component
 * Profile dropdown with user actions
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface Profile {
  username: string
  avatar_url: string | null
}

export function UserMenu() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()

    // Get current user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Get profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single()

        if (profile) {
          setProfile(profile)
        }
      }
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded hover:bg-fantasy-brown transition-colors"
      >
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="w-8 h-8 rounded border-2 border-fantasy-stone"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div className="w-8 h-8 rounded border-2 border-fantasy-stone bg-fantasy-brown flex items-center justify-center text-fantasy-gold font-bold">
            {profile.username[0].toUpperCase()}
          </div>
        )}
        <span className="text-fantasy-light font-bold hidden md:inline">
          {profile.username}
        </span>
        <svg
          className={`w-4 h-4 text-fantasy-stone transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-fantasy-brown border-2 border-fantasy-stone rounded shadow-lg z-50">
          <div className="p-3 border-b-2 border-fantasy-stone">
            <div className="text-fantasy-light font-bold">{profile.username}</div>
            <div className="text-fantasy-stone text-sm truncate">{user.email}</div>
          </div>

          <div className="py-1">
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-fantasy-tan hover:bg-fantasy-dark hover:text-fantasy-gold transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="block px-4 py-2 text-fantasy-tan hover:bg-fantasy-dark hover:text-fantasy-gold transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Profile Settings
            </Link>
            <Link
              href="/billing"
              className="block px-4 py-2 text-fantasy-tan hover:bg-fantasy-dark hover:text-fantasy-gold transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Billing
            </Link>
          </div>

          <div className="border-t-2 border-fantasy-stone py-1">
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-fantasy-red hover:bg-fantasy-dark transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
