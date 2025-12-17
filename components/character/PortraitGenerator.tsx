'use client'

/**
 * PortraitGenerator Component
 * Allows users to generate AI portraits or upload their own images
 */

import { useState, useRef, useEffect } from 'react'
import { PixelButton } from '@/components/ui/PixelButton'

interface PortraitUsage {
  used: number
  limit: number
  remaining: number
  canGenerate: boolean
  tier: string
}

interface PortraitGeneratorProps {
  characterId: string
  characterName: string
  currentPortraitUrl?: string | null
  onPortraitUpdated?: (url: string) => void
}

export function PortraitGenerator({
  characterId,
  characterName,
  currentPortraitUrl,
  onPortraitUpdated,
}: PortraitGeneratorProps) {
  const [portraitUrl, setPortraitUrl] = useState(currentPortraitUrl || null)
  const [usage, setUsage] = useState<PortraitUsage | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingUsage, setLoadingUsage] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch usage on mount
  useEffect(() => {
    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/user/portrait-usage')
      if (response.ok) {
        const data = await response.json()
        setUsage(data.usage)
      }
    } catch (err) {
      console.error('Error fetching usage:', err)
    } finally {
      setLoadingUsage(false)
    }
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/characters/${characterId}/portrait/generate`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate portrait')
      }

      setPortraitUrl(data.portrait_url)
      if (data.usage) {
        setUsage({
          used: data.usage.used,
          limit: data.usage.limit,
          remaining: data.usage.remaining,
          canGenerate: data.usage.remaining > 0,
          tier: data.usage.tier,
        })
      }
      onPortraitUpdated?.(data.portrait_url)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Please select a PNG, JPEG, or WebP image')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/characters/${characterId}/portrait/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload portrait')
      }

      setPortraitUrl(data.portrait_url)
      onPortraitUpdated?.(data.portrait_url)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const isLimitReached = usage && !usage.canGenerate
  const isUnlimited = usage && usage.limit === -1

  return (
    <div className="space-y-4">
      {/* Portrait Preview */}
      <div className="flex justify-center">
        <div className="w-48 h-48 bg-gray-800 border-4 border-amber-700 rounded-lg overflow-hidden">
          {portraitUrl ? (
            <img
              src={portraitUrl}
              alt={`${characterName} portrait`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">&#128100;</div>
                <div className="text-xs">No portrait</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Usage Stats */}
      {!loadingUsage && usage && (
        <div className="text-center text-sm">
          {isUnlimited ? (
            <span className="text-gray-400">
              Unlimited portrait generations
            </span>
          ) : (
            <span className={isLimitReached ? 'text-red-400' : 'text-gray-400'}>
              {usage.used} / {usage.limit} generations used this month
            </span>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-900/50 border border-red-700 rounded text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        {/* Generate Button */}
        <PixelButton
          onClick={handleGenerate}
          disabled={loading || uploading || isLimitReached}
          variant="primary"
          className="w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">&#9881;</span>
              Generating...
            </span>
          ) : isLimitReached ? (
            'Generation Limit Reached'
          ) : (
            <>Generate AI Portrait {usage && !isUnlimited && `(${usage.remaining} left)`}</>
          )}
        </PixelButton>

        {/* Upload Button */}
        <PixelButton
          onClick={handleFileSelect}
          disabled={loading || uploading}
          variant="secondary"
          className="w-full"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">&#9881;</span>
              Uploading...
            </span>
          ) : (
            'Upload Custom Image'
          )}
        </PixelButton>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Help text */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>AI portraits are generated based on your character&apos;s appearance details.</p>
        <p>You can also upload your own PNG, JPEG, or WebP image (max 5MB).</p>
        {isLimitReached && (
          <p className="text-amber-400">
            Upgrade your plan for more portrait generations, or upload your own image.
          </p>
        )}
      </div>
    </div>
  )
}
