'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useVoiceInput } from '@/hooks/useVoiceInput'

interface ChatInputProps {
  campaignId: string
  sceneId?: string
  disabled?: boolean
  onMessageSent?: () => void
  onOptimisticMessage?: (content: string, messageId: string) => void
}

// Debounce timer reference (module level to persist across renders)
let debounceTimer: NodeJS.Timeout | null = null
let lastTimestamp: string | null = null

export default function ChatInput({ campaignId, sceneId, disabled = false, onMessageSent, onOptimisticMessage }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const interimTranscriptRef = useRef('')

  // Voice input hook
  const { isListening, isSupported, error: voiceError, startListening, stopListening } = useVoiceInput({
    onTranscript: (text, isFinal) => {
      if (isFinal) {
        // Final result - append to input and clear interim
        setInput(prev => {
          const base = prev.replace(interimTranscriptRef.current, '').trimEnd()
          return base ? `${base} ${text}` : text
        })
        interimTranscriptRef.current = ''
      } else {
        // Interim result - show as preview
        setInput(prev => {
          const base = prev.replace(interimTranscriptRef.current, '').trimEnd()
          interimTranscriptRef.current = text
          return base ? `${base} ${text}` : text
        })
      }
    },
    onEnd: () => {
      interimTranscriptRef.current = ''
      inputRef.current?.focus()
    }
  })

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

    // Generate a temporary ID for optimistic UI
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Add message optimistically (appears instantly)
    onOptimisticMessage?.(trimmed, tempId)

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
      {(error || voiceError) && (
        <div className="px-4 py-2 bg-red-900/50 text-red-300 text-sm">
          {error || voiceError}
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
          {/* Microphone button for voice input */}
          {isSupported && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={loading || disabled}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center
                         ${isListening
                           ? 'bg-red-600 hover:bg-red-500 animate-pulse'
                           : 'bg-gray-700 hover:bg-gray-600'
                         }
                         disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isListening ? 'Stop recording' : 'Start voice input'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-white"
              >
                <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
              </svg>
            </button>
          )}

          {/* Send button */}
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
