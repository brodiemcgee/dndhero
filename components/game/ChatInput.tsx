'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface ChatInputProps {
  campaignId: string
  sceneId?: string
  disabled?: boolean
  onMessageSent?: () => void
}

// Debounce timer reference (module level to persist across renders)
let debounceTimer: NodeJS.Timeout | null = null
let lastTimestamp: string | null = null

export default function ChatInput({ campaignId, sceneId, disabled = false, onMessageSent }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Trigger DM response after debounce
  const triggerDM = useCallback(async (timestamp: string) => {
    try {
      await fetch('/api/chat/trigger-dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, timestamp }),
      })
    } catch (err) {
      console.error('Failed to trigger DM:', err)
    }
  }, [campaignId])

  // Schedule DM trigger with debounce
  const scheduleDMTrigger = useCallback((timestamp: string) => {
    // Clear any existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Store latest timestamp
    lastTimestamp = timestamp

    // Schedule new trigger after 3 seconds
    debounceTimer = setTimeout(() => {
      if (lastTimestamp === timestamp) {
        triggerDM(timestamp)
      }
    }, 3000)
  }, [triggerDM])

  // Auto-focus input
  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus()
    }
  }, [disabled])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmed = input.trim()
    if (!trimmed || loading || disabled) return

    setLoading(true)
    setError('')

    // Optimistically clear input
    setInput('')

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          sceneId,
          content: trimmed,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      // Schedule DM trigger with debounce
      if (data.timestamp) {
        scheduleDMTrigger(data.timestamp)
      }

      onMessageSent?.()

    } catch (err: any) {
      setError(err.message)
      // Restore input on error
      setInput(trimmed)
    } finally {
      setLoading(false)
      // Refocus input
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="border-t-2 border-amber-700 bg-gray-900">
      {error && (
        <div className="px-4 py-2 bg-red-900/50 text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? 'Chat disabled...' : 'What do you do? (Enter to send)'}
            disabled={disabled || loading}
            maxLength={5000}
            rows={2}
            className="flex-1 bg-gray-800 text-white border-2 border-gray-700 rounded-lg px-4 py-2
                       focus:outline-none focus:border-amber-500 resize-none
                       disabled:opacity-50 disabled:cursor-not-allowed
                       placeholder:text-gray-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || disabled}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              </span>
            ) : (
              'Send'
            )}
          </button>
        </div>

        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{input.length}/5000</span>
        </div>
      </form>
    </div>
  )
}
