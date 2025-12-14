'use client'

/**
 * Email Verification Landing Page
 * Shows verification status after clicking email link
 */

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PixelButton } from '@/components/ui/PixelButton'
import { PixelPanel } from '@/components/ui/PixelPanel'

function VerifyContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (error) {
      setStatus('error')
      setMessage(errorDescription || 'Verification failed. Please try again.')
    } else {
      // Success - email verified via callback
      setStatus('success')
      setMessage('Your email has been verified successfully!')
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-fantasy-dark p-4">
      <div className="w-full max-w-md">
        <PixelPanel title="Email Verification" className="p-6">
          <div className="text-center space-y-4">
            {status === 'verifying' && (
              <>
                <div className="text-6xl mb-4">⏳</div>
                <p className="text-fantasy-tan">{message}</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-xl font-bold text-fantasy-gold">Email Verified!</h2>
                <p className="text-fantasy-tan">{message}</p>
                <p className="text-fantasy-stone text-sm">
                  You can now log in and start your adventure.
                </p>
                <div className="pt-4">
                  <Link href="/auth/login">
                    <PixelButton variant="primary" className="w-full">
                      GO TO LOGIN
                    </PixelButton>
                  </Link>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-xl font-bold text-fantasy-red">Verification Failed</h2>
                <p className="text-fantasy-tan">{message}</p>
                <div className="pt-4 space-y-2">
                  <Link href="/auth/signup">
                    <PixelButton variant="primary" className="w-full">
                      TRY SIGNING UP AGAIN
                    </PixelButton>
                  </Link>
                  <Link href="/auth/login">
                    <PixelButton variant="secondary" className="w-full">
                      GO TO LOGIN
                    </PixelButton>
                  </Link>
                </div>
              </>
            )}
          </div>
        </PixelPanel>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-fantasy-dark">
        <div className="text-fantasy-gold">Loading...</div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
