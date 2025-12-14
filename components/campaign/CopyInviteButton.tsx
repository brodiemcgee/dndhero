'use client'

import { useState } from 'react'

export function CopyInviteButton({ inviteUrl }: { inviteUrl: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded transition-colors"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}
