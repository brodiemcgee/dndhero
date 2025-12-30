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
  const { displayText, isComplete, isRevealing, skip } = useTextReveal({
    text: content,
    speedMs,
    onComplete,
    enabled,
  })

  const handleClick = () => {
    if (isRevealing && !isComplete) {
      skip()
    }
  }

  return (
    <div
      className={`text-white whitespace-pre-wrap ${className} ${isRevealing && !isComplete ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
      title={isRevealing && !isComplete ? 'Click to skip' : undefined}
    >
      {displayText}
      {showCursor && isRevealing && !isComplete && (
        <span className="text-reveal-cursor" aria-hidden="true" />
      )}
    </div>
  )
}
