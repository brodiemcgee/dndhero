'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ChatDisplay, { ChatDisplayHandle } from './ChatDisplay'
import ChatInput from './ChatInput'

interface GameChatProps {
  campaignId: string
  sceneId?: string
  characterName?: string
  userId?: string
}

export default function GameChat({ campaignId, sceneId, characterName, userId }: GameChatProps) {
  const supabase = createClient()
  const chatDisplayRef = useRef<ChatDisplayHandle>(null)
  const [ttsEnabled, setTtsEnabled] = useState(false)

  // Fetch user's TTS preference
  useEffect(() => {
    if (!userId) return

    const fetchTTSPreference = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('tts_enabled')
        .eq('id', userId)
        .single()

      if (data?.tts_enabled) {
        setTtsEnabled(true)
      }
    }

    fetchTTSPreference()

    // Subscribe to TTS preference changes
    const channel = supabase
      .channel(`tts-pref:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const newTtsEnabled = (payload.new as any)?.tts_enabled ?? false
          setTtsEnabled(newTtsEnabled)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const handleOptimisticMessage = useCallback((content: string, messageId: string) => {
    if (chatDisplayRef.current) {
      chatDisplayRef.current.addOptimisticMessage({
        id: messageId,
        sender_type: 'player',
        sender_id: userId || null,
        character_name: characterName || 'Player',
        content,
        message_type: 'chat',
        metadata: { optimistic: true },
        created_at: new Date().toISOString(),
      })
    }
  }, [characterName, userId])

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <ChatDisplay
          ref={chatDisplayRef}
          campaignId={campaignId}
          sceneId={sceneId}
          ttsEnabled={ttsEnabled}
        />
      </div>
      <ChatInput
        campaignId={campaignId}
        sceneId={sceneId}
        onOptimisticMessage={handleOptimisticMessage}
      />
    </>
  )
}
