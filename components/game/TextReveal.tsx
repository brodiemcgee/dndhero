'use client'

import { useTextReveal } from '@/hooks/useTextReveal'

interface TextRevealProps {
  content: string
  speedMs?: number
  showCursor?: boolean
  onComplete?: () => void
  className?: string
  enabled?: boolean
}

export default function TextReveal({
  content,
  speedMs = 50,
  showCursor = true,
  onComplete,
  className = '',
  enabled = true,
}: TextRevealProps) {
  const { displayText, isComplete, isRevealing } = useTextReveal({
    text: content,
    speedMs,
    onComplete,
    enabled,
  })

  return (
    <div className={`text-white whitespace-pre-wrap ${className}`}>
      {displayText}
      {showCursor && isRevealing && !isComplete && (
        <span className="text-reveal-cursor" aria-hidden="true" />
      )}
    </div>
  )
}
