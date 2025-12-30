'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ChatDisplay, { ChatDisplayHandle } from './ChatDisplay'
import ChatInput from './ChatInput'
import { CommandResult, PrivateMessage } from '@/lib/commands/types'
import { getCommand } from '@/lib/commands/registry'
import { parseCommand } from '@/lib/commands/parser'

interface GameChatProps {
  campaignId: string
  sceneId?: string
  characterId?: string
  characterName?: string
  userId?: string
}

export default function GameChat({ campaignId, sceneId, characterId, characterName, userId }: GameChatProps) {
  const supabase = createClient()
  const chatDisplayRef = useRef<ChatDisplayHandle>(null)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([])

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

  // Handle command responses (private messages)
  const handleCommandResponse = useCallback((result: CommandResult) => {
    // Check for clear command
    if (result.metadata?.clearPrivateMessages) {
      setPrivateMessages([])
      return
    }

    const privateMessage: PrivateMessage = {
      id: `private-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'command_response',
      result,
      created_at: new Date().toISOString(),
    }
    setPrivateMessages(prev => [...prev, privateMessage])
  }, [])

  // Handle command action button clicks
  const handleCommandAction = useCallback(async (commandString: string) => {
    const parsed = parseCommand(commandString)
    if (!parsed) return

    const command = getCommand(parsed.name)
    if (!command) return

    try {
      const result = await command.execute(parsed.args, {
        userId: userId || '',
        characterId: characterId || '',
        campaignId,
        sceneId,
        supabase,
      })
      handleCommandResponse(result)
    } catch (error) {
      handleCommandResponse({
        type: 'error',
        content: error instanceof Error ? error.message : 'Command failed',
      })
    }
  }, [userId, characterId, campaignId, sceneId, supabase, handleCommandResponse])

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <ChatDisplay
          ref={chatDisplayRef}
          campaignId={campaignId}
          sceneId={sceneId}
          ttsEnabled={ttsEnabled}
          privateMessages={privateMessages}
          onCommandAction={handleCommandAction}
        />
      </div>
      <ChatInput
        campaignId={campaignId}
        sceneId={sceneId}
        characterId={characterId}
        userId={userId}
        onOptimisticMessage={handleOptimisticMessage}
        onCommandResponse={handleCommandResponse}
      />
    </>
  )
}
