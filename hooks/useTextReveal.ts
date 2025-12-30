'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseTextRevealOptions {
  text: string
  speedMs?: number
  startDelay?: number
  onComplete?: () => void
  enabled?: boolean
}

interface UseTextRevealReturn {
  displayText: string
  isComplete: boolean
  isRevealing: boolean
  progress: number
  skip: () => void
}

export function useTextReveal({
  text,
  speedMs = 50,
  startDelay = 0,
  onComplete,
  enabled = true,
}: UseTextRevealOptions): UseTextRevealReturn {
  const [revealedLength, setRevealedLength] = useState(enabled ? 0 : text.length)
  const [isRevealing, setIsRevealing] = useState(enabled && text.length > 0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const onCompleteRef = useRef(onComplete)

  // Keep onComplete ref updated
  onCompleteRef.current = onComplete

  // Handle text changes - if text grows (streaming), keep revealing
  const prevTextRef = useRef(text)
  useEffect(() => {
    if (text !== prevTextRef.current) {
      // Text changed - if we were complete and text grew, continue revealing
      if (revealedLength >= prevTextRef.current.length && text.length > prevTextRef.current.length) {
        setIsRevealing(true)
      }
      prevTextRef.current = text
    }
  }, [text, revealedLength])

  // Main reveal logic
  useEffect(() => {
    if (!enabled) {
      setRevealedLength(text.length)
      setIsRevealing(false)
      return
    }

    if (revealedLength >= text.length) {
      setIsRevealing(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (revealedLength === text.length && text.length > 0) {
        onCompleteRef.current?.()
      }
      return
    }

    // Start revealing after delay
    const startTimeout = setTimeout(() => {
      setIsRevealing(true)
      intervalRef.current = setInterval(() => {
        setRevealedLength(prev => {
          const next = prev + 1
          return next
        })
      }, speedMs)
    }, startDelay)

    return () => {
      clearTimeout(startTimeout)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, speedMs, startDelay, text.length, revealedLength])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Skip function to instantly reveal all text
  const skip = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setRevealedLength(text.length)
    setIsRevealing(false)
  }, [text.length])

  const displayText = text.slice(0, revealedLength)
  const isComplete = revealedLength >= text.length
  const progress = text.length > 0 ? Math.round((revealedLength / text.length) * 100) : 100

  return {
    displayText,
    isComplete,
    isRevealing,
    progress,
    skip,
  }
}
