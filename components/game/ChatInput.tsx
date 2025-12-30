'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { useCommandMode } from '@/hooks/useCommandMode'
import { CommandAutocomplete } from './CommandAutocomplete'
import { parseCommand, isCommand } from '@/lib/commands/parser'
import { getCommand } from '@/lib/commands/registry'
import { CommandResult, CommandContext } from '@/lib/commands/types'
import { createClient } from '@/lib/supabase/client'

// Import commands to register them
import '@/lib/commands/commands'

interface ChatInputProps {
  campaignId: string
  sceneId?: string
  characterId?: string
  userId?: string
  disabled?: boolean
  onMessageSent?: () => void
  onOptimisticMessage?: (content: string, messageId: string) => void
  onCommandResponse?: (result: CommandResult) => void
}

// Debounce timer reference (module level to persist across renders)
let debounceTimer: NodeJS.Timeout | null = null
let lastTimestamp: string | null = null

export default function ChatInput({
  campaignId,
  sceneId,
  characterId,
  userId,
  disabled = false,
  onMessageSent,
  onOptimisticMessage,
  onCommandResponse
}: ChatInputProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const interimTranscriptRef = useRef('')

  // Command mode hook
  const {
    isCommandMode,
    isTypingCommandName,
    ghostText,
    acceptSuggestion,
    selectPrevious,
    selectNext,
  } = useCommandMode(input)

  // Voice input hook
  const { isListening, isSupported, error: voiceError, startListening, stopListening } = useVoiceInput({
    onTranscript: (text, isFinal) => {
      if (isFinal) {
        setInput(prev => {
          const base = prev.replace(interimTranscriptRef.current, '').trimEnd()
          return base ? `${base} ${text}` : text
        })
        interimTranscriptRef.current = ''
      } else {
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
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    lastTimestamp = timestamp
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

  // Execute a command
  const executeCommand = useCallback(async (commandText: string) => {
    const parsed = parseCommand(commandText)
    if (!parsed) {
      onCommandResponse?.({
        type: 'error',
        content: 'Invalid command format.',
      })
      return
    }

    const command = getCommand(parsed.name)
    if (!command) {
      onCommandResponse?.({
        type: 'error',
        content: `Unknown command: /${parsed.name}. Type /help for available commands.`,
      })
      return
    }

    // Build context
    const supabase = createClient()
    const context: CommandContext = {
      userId: userId || '',
      characterId: characterId || '',
      campaignId,
      sceneId,
      supabase,
    }

    try {
      const result = await command.execute(parsed.args, context)
      onCommandResponse?.(result)
    } catch (err) {
      console.error('Command execution error:', err)
      onCommandResponse?.({
        type: 'error',
        content: `Command failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      })
    }
  }, [campaignId, sceneId, characterId, userId, onCommandResponse])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmed = input.trim()
    if (!trimmed || loading || disabled) return

    // Check if this is a command
    if (isCommand(trimmed)) {
      setLoading(true)
      setError('')
      setInput('')

      try {
        await executeCommand(trimmed)
      } finally {
        setLoading(false)
        inputRef.current?.focus()
      }
      return
    }

    // Regular message flow
    setLoading(true)
    setError('')
    setInput('')

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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

      if (data.timestamp) {
        scheduleDMTrigger(data.timestamp)
      }

      onMessageSent?.()

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setInput(trimmed)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab to accept autocomplete
    if (e.key === 'Tab' && isCommandMode && isTypingCommandName && ghostText) {
      e.preventDefault()
      setInput(acceptSuggestion())
      return
    }

    // Arrow keys for suggestion navigation (when in command mode)
    if (isCommandMode && isTypingCommandName) {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        selectPrevious()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        selectNext()
        return
      }
    }

    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Placeholder text changes in command mode
  const placeholder = disabled
    ? 'Chat disabled...'
    : isCommandMode
      ? 'Type a command...'
      : 'What do you do? (/ for commands)'

  // Help text changes in command mode
  const helpText = isCommandMode && isTypingCommandName && ghostText
    ? 'Tab to complete, Enter to execute'
    : 'Enter to send, Shift+Enter for new line'

  return (
    <div className="border-t-2 border-amber-700 bg-gray-900">
      {(error || voiceError) && (
        <div className="px-4 py-2 bg-red-900/50 text-red-300 text-sm">
          {error || voiceError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex gap-2">
          {/* Textarea container with autocomplete overlay */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || loading}
              maxLength={5000}
              rows={2}
              className="w-full bg-gray-800 text-white border-2 border-gray-700 rounded-lg px-4 py-2
                         focus:outline-none focus:border-amber-500 resize-none
                         disabled:opacity-50 disabled:cursor-not-allowed
                         placeholder:text-gray-500"
            />
            {/* Ghost text autocomplete overlay */}
            <CommandAutocomplete
              input={input}
              ghostText={ghostText}
              isVisible={isCommandMode && isTypingCommandName}
            />
          </div>

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
          <span>{helpText}</span>
          <span>{input.length}/5000</span>
        </div>
      </form>
    </div>
  )
}
