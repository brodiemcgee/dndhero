'use client'

import { useEffect } from 'react'
import { useTextReveal } from '@/hooks/useTextReveal'
import { useTTSPlayback } from '@/hooks/useTTSPlayback'

interface TTSState {
  isPlaying: boolean
  autoplayBlocked: boolean
  manualPlay: () => void
}

interface TextRevealProps {
  content: string
  speedMs?: number
  showCursor?: boolean
  onComplete?: () => void
  className?: string
  enabled?: boolean
  audioUrl?: string | null
  audioDuration?: number | null
  ttsEnabled?: boolean
  onTTSStateChange?: (state: TTSState) => void
  hidePlayButton?: boolean
}

export default function TextReveal({
  content,
  speedMs = 50,
  showCursor = true,
  onComplete,
  className = '',
  enabled = true,
  audioUrl,
  audioDuration,
  ttsEnabled = false,
  onTTSStateChange,
  hidePlayButton = false,
}: TextRevealProps) {
  const { displayText, isComplete, isRevealing } = useTextReveal({
    text: content,
    speedMs,
    onComplete,
    enabled,
  })

  // TTS playback synced with text reveal
  const { isPlaying, audioError, autoplayBlocked, manualPlay } = useTTSPlayback({
    audioUrl,
    enabled: ttsEnabled && enabled && !!audioUrl,
    textLength: content.length,
    revealedLength: displayText.length,
    audioDuration,
  })

  // Notify parent of TTS state changes
  useEffect(() => {
    if (onTTSStateChange) {
      onTTSStateChange({ isPlaying, autoplayBlocked, manualPlay })
    }
  }, [isPlaying, autoplayBlocked, manualPlay, onTTSStateChange])

  return (
    <div className={`text-white whitespace-pre-wrap ${className}`}>
      {displayText}
      {showCursor && isRevealing && !isComplete && (
        <span className="text-reveal-cursor" aria-hidden="true" />
      )}
      {isPlaying && (
        <span className="ml-2 text-amber-400 text-xs animate-pulse" aria-label="Audio playing">
          &#x1f50a;
        </span>
      )}
      {!hidePlayButton && autoplayBlocked && !isPlaying && (
        <button
          onClick={manualPlay}
          className="ml-2 px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded transition-colors"
          aria-label="Play audio"
        >
          &#x1f50a; Play Voice
        </button>
      )}
    </div>
  )
}
