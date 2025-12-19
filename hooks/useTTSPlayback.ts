'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseTTSPlaybackOptions {
  audioUrl: string | null | undefined
  enabled: boolean
  textLength: number
  revealedLength: number
  audioDuration?: number | null
  onEnd?: () => void
}

interface UseTTSPlaybackReturn {
  isPlaying: boolean
  currentTime: number
  duration: number
  isMuted: boolean
  toggleMute: () => void
  audioError: string | null
}

/**
 * Hook to synchronize TTS audio playback with text reveal animation
 * Audio position is synced to text reveal progress
 */
export function useTTSPlayback({
  audioUrl,
  enabled,
  textLength,
  revealedLength,
  audioDuration,
  onEnd,
}: UseTTSPlaybackOptions): UseTTSPlaybackReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(audioDuration || 0)
  const [isMuted, setIsMuted] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const lastSyncRef = useRef(0)

  // Create audio element when URL changes
  useEffect(() => {
    if (!audioUrl || !enabled) {
      // Clean up existing audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      setIsPlaying(false)
      setCurrentTime(0)
      setAudioError(null)
      return
    }

    // Create new audio element
    const audio = new Audio(audioUrl)
    audio.preload = 'auto'
    audioRef.current = audio

    // Event handlers
    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onEnd?.()
    }

    const handleError = () => {
      setAudioError('Failed to load audio')
      setIsPlaying(false)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    // Set initial muted state
    audio.muted = isMuted

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.pause()
      audioRef.current = null
    }
  }, [audioUrl, enabled])

  // Sync audio playback with text reveal progress
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !enabled || textLength === 0 || duration === 0) return

    // Calculate expected audio position based on text reveal progress
    const progress = revealedLength / textLength
    const expectedTime = progress * duration

    // Only sync if there's a significant drift (> 0.5 seconds)
    const drift = Math.abs(audio.currentTime - expectedTime)
    const now = Date.now()

    // Don't sync too frequently (wait at least 500ms between syncs)
    if (drift > 0.5 && now - lastSyncRef.current > 500) {
      audio.currentTime = Math.min(expectedTime, duration)
      lastSyncRef.current = now
    }

    // Start playing if text is revealing and audio hasn't started
    if (revealedLength > 0 && revealedLength < textLength && audio.paused) {
      audio.play().catch((err) => {
        // Browser might block autoplay - this is expected
        console.log('Audio autoplay blocked:', err.message)
      })
    }

    // Pause if text reveal is complete
    if (revealedLength >= textLength && !audio.ended) {
      // Let audio finish naturally if within 1 second of end
      if (audio.duration - audio.currentTime > 1) {
        // Don't pause - let it finish
      }
    }
  }, [revealedLength, textLength, duration, enabled])

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev
      if (audioRef.current) {
        audioRef.current.muted = newMuted
      }
      return newMuted
    })
  }, [])

  // Update muted state on audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted
    }
  }, [isMuted])

  return {
    isPlaying,
    currentTime,
    duration,
    isMuted,
    toggleMute,
    audioError,
  }
}
