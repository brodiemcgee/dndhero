'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import GameGuideModal from './GameGuideModal'

interface GameGuideButtonProps {
  campaignId: string
}

export default function GameGuideButton({ campaignId }: GameGuideButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasNewEntries, setHasNewEntries] = useState(false)
  const [lastSeenCount, setLastSeenCount] = useState(0)

  const supabase = createClient()

  // Check for new entries
  useEffect(() => {
    async function checkForNewEntries() {
      const { count: npcCount } = await supabase
        .from('journal_npcs')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)

      const { count: locationCount } = await supabase
        .from('journal_locations')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)

      const totalCount = (npcCount || 0) + (locationCount || 0)

      // Check if there are new entries since last time we opened the modal
      const savedCount = localStorage.getItem(`journal-seen-${campaignId}`)
      const previousCount = savedCount ? parseInt(savedCount, 10) : 0

      if (totalCount > previousCount) {
        setHasNewEntries(true)
      }
      setLastSeenCount(totalCount)
    }

    checkForNewEntries()

    // Subscribe to new entries
    const channel = supabase
      .channel('journal-badge')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'journal_npcs', filter: `campaign_id=eq.${campaignId}` }, () => {
        setHasNewEntries(true)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'journal_locations', filter: `campaign_id=eq.${campaignId}` }, () => {
        setHasNewEntries(true)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [campaignId, supabase])

  const handleOpen = () => {
    setIsOpen(true)
    setHasNewEntries(false)
    // Save current count when opening
    localStorage.setItem(`journal-seen-${campaignId}`, lastSeenCount.toString())
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="relative px-3 py-2 bg-gray-800 border-2 border-amber-700 rounded hover:bg-gray-700 hover:border-amber-500 transition-colors"
        title="Adventure Journal"
      >
        <span className="text-xl">📖</span>
        {hasNewEntries && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
        )}
      </button>

      <GameGuideModal
        campaignId={campaignId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
