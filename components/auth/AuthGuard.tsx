'use client'

/**
 * Auth Guard Component
 * Protects routes and redirects unauthenticated users
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function AuthGuard({ children, fallback, redirectTo = '/auth/login' }: AuthGuardProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Check current session
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push(redirectTo)
      } else {
        setUser(user)
      }

      setLoading(false)
    }

    checkUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push(redirectTo)
      } else {
        setUser(session.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, redirectTo])

  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-fantasy-dark">
          <div className="text-fantasy-gold text-xl">Loading...</div>
        </div>
      )
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
