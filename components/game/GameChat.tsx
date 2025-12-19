'use client'

import { useRef, useCallback } from 'react'
import ChatDisplay, { ChatDisplayHandle } from './ChatDisplay'
import ChatInput from './ChatInput'

interface GameChatProps {
  campaignId: string
  sceneId?: string
  characterName?: string
  userId?: string
}

export default function GameChat({ campaignId, sceneId, characterName, userId }: GameChatProps) {
  const chatDisplayRef = useRef<ChatDisplayHandle>(null)

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
