'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getCompletions, getBestCompletion } from '@/lib/commands/registry'
import { isCommand, getPartialCommandName, isTypingCommandName } from '@/lib/commands/parser'

interface UseCommandModeReturn {
  /** Whether the input is in command mode (starts with /) */
  isCommandMode: boolean
  /** Whether user is still typing the command name (no space yet) */
  isTypingCommandName: boolean
  /** List of matching command suggestions */
  suggestions: string[]
  /** Index of currently selected suggestion */
  selectedIndex: number
  /** Set the selected suggestion index */
  setSelectedIndex: (index: number) => void
  /** Ghost text to show after user input (the completion portion) */
  ghostText: string
  /** Accept the current suggestion and return the completed input */
  acceptSuggestion: () => string
  /** Move selection up */
  selectPrevious: () => void
  /** Move selection down */
  selectNext: () => void
}

/**
 * Hook for managing command mode in chat input
 *
 * Tracks whether user is typing a command, provides autocomplete suggestions,
 * and handles tab completion.
 */
export function useCommandMode(input: string): UseCommandModeReturn {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Check if we're in command mode
  const commandMode = useMemo(() => isCommand(input), [input])

  // Check if still typing command name
  const typingName = useMemo(() => isTypingCommandName(input), [input])

  // Get the partial command being typed
  const partial = useMemo(() => getPartialCommandName(input), [input])

  // Get matching suggestions
  const suggestions = useMemo(() => {
    if (!commandMode || !typingName || partial === null) {
      return []
    }
    return getCompletions(partial)
  }, [commandMode, typingName, partial])

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedIndex(0)
  }, [suggestions.length])

  // Calculate ghost text (the part to show after user input)
  const ghostText = useMemo(() => {
    if (!commandMode || !typingName || partial === null) {
      return ''
    }

    const bestMatch = suggestions[selectedIndex] || getBestCompletion(partial)
    if (!bestMatch || !bestMatch.startsWith(partial)) {
      return ''
    }

    // Return only the portion that should appear as ghost text
    return bestMatch.slice(partial.length)
  }, [commandMode, typingName, partial, suggestions, selectedIndex])

  // Accept the current suggestion
  const acceptSuggestion = useCallback((): string => {
    if (!commandMode || !typingName || suggestions.length === 0) {
      return input
    }

    const suggestion = suggestions[selectedIndex] || suggestions[0]
    return '/' + suggestion + ' '
  }, [input, commandMode, typingName, suggestions, selectedIndex])

  // Move selection up
  const selectPrevious = useCallback(() => {
    setSelectedIndex(prev => Math.max(0, prev - 1))
  }, [])

  // Move selection down
  const selectNext = useCallback(() => {
    setSelectedIndex(prev => Math.min(suggestions.length - 1, prev + 1))
  }, [suggestions.length])

  return {
    isCommandMode: commandMode,
    isTypingCommandName: typingName,
    suggestions,
    selectedIndex,
    setSelectedIndex,
    ghostText,
    acceptSuggestion,
    selectPrevious,
    selectNext
  }
}
