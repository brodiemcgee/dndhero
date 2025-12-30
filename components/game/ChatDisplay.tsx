'use client'

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { createClient } from '@/lib/supabase/client'
import TextReveal from './TextReveal'

// Separate component for DM messages to manage TTS state
interface DMMessageProps {
  message: ChatMessage
  isLatest: boolean
  ttsEnabled: boolean
  formatTime: (timestamp: string) => string
}

function DMMessage({ message, isLatest, ttsEnabled, formatTime }: DMMessageProps) {
  const [ttsState, setTtsState] = useState<{
    isPlaying: boolean
    autoplayBlocked: boolean
    manualPlay: () => void
  } | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const [isManualPlaying, setIsManualPlaying] = useState(false)

  const isStillStreaming = message.metadata?.streaming === true
  const shouldReveal = isLatest && !isStillStreaming
  const audioUrl = message.metadata?.audio_url || null
  const audioDuration = message.metadata?.audio_duration || null

  // Show play button whenever audio is available and not currently playing
  const isPlaying = ttsState?.isPlaying || isManualPlaying
  const showPlayButton = audioUrl && ttsEnabled && !isPlaying

  // Manual play for any DM message with audio
  const handleManualPlay = () => {
    if (ttsState?.manualPlay) {
      // Use the TTS hook's play function if available (for latest message)
      ttsState.manualPlay()
    } else if (audioUrl) {
      // Create audio element for older messages
      if (audioElement) {
        audioElement.pause()
        audioElement.currentTime = 0
      }
      const audio = new Audio(audioUrl)
      setAudioElement(audio)
      setIsManualPlaying(true)
      audio.play().catch(err => console.error('Failed to play audio:', err))
      audio.onended = () => setIsManualPlaying(false)
      audio.onerror = () => setIsManualPlaying(false)
    }
  }

  return (
    <div className="p-4 bg-gray-800 border-l-4 border-amber-500 rounded">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-amber-300 text-xs font-bold">Dungeon Master</span>
        <span className="text-gray-500 text-xs">{formatTime(message.created_at)}</span>
        {isPlaying && (
          <span className="text-amber-400 text-xs animate-pulse" title="Playing">&#x1f50a;</span>
        )}
        {showPlayButton && (
          <button
            onClick={handleManualPlay}
            className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded transition-colors"
            aria-label="Play audio"
          >
            &#x1f50a; Play Voice
          </button>
        )}
      </div>
      <TextReveal
        content={message.content}
        speedMs={50}
        showCursor={shouldReveal}
        enabled={shouldReveal}
        audioUrl={audioUrl}
        audioDuration={audioDuration}
        ttsEnabled={ttsEnabled && shouldReveal}
        onTTSStateChange={setTtsState}
        hidePlayButton={true}
      />
    </div>
  )
}

interface ChatMessage {
  id: string
  sender_type: 'player' | 'dm' | 'system'
  sender_id: string | null
  character_name: string | null
  content: string
  message_type: string
  metadata: Record<string, any>
  created_at: string
}

interface ChatDisplayProps {
  campaignId: string
  sceneId?: string
  initialMessages?: ChatMessage[]
  ttsEnabled?: boolean
}

export interface ChatDisplayHandle {
  addOptimisticMessage: (message: ChatMessage) => void
}

const ChatDisplay = forwardRef<ChatDisplayHandle, ChatDisplayProps>(({ campaignId, sceneId, initialMessages = [], ttsEnabled = false }, ref) => {
  const supabase = createClient()
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<string | null>(null)

  // Expose method to add optimistic messages
  useImperativeHandle(ref, () => ({
    addOptimisticMessage: (message: ChatMessage) => {
      setMessages(prev => {
        // Don't add if already exists
        if (prev.some(m => m.id === message.id)) return prev
        return [...prev, message]
      })
    }
  }))

  // Fetch messages function
  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true })
      .limit(100)

    if (!error && data) {
      setMessages(prev => {
        // Get optimistic messages (those with temp IDs)
        const optimisticMessages = prev.filter(m => m.id.startsWith('temp-'))

        // Check if anything changed in server data
        const serverMessages = prev.filter(m => !m.id.startsWith('temp-'))
        const hasChanges =
          data.length !== serverMessages.length ||
          data.some((msg, idx) => {
            const prevMsg = serverMessages[idx]
            if (!prevMsg) return true
            return msg.id !== prevMsg.id || msg.content !== prevMsg.content
          })

        if (hasChanges) {
          // Check if the last message is a completed DM response - always turn off typing
          const lastMsg = data[data.length - 1]
          if (lastMsg?.sender_type === 'dm' && !lastMsg.metadata?.streaming) {
            setIsTyping(false)
          }

          // Filter out optimistic messages that now have server equivalents
          // (same content from same sender within last few seconds)
          const remainingOptimistic = optimisticMessages.filter(opt => {
            const hasServerEquivalent = data.some(serverMsg =>
              serverMsg.sender_type === 'player' &&
              serverMsg.content === opt.content &&
              Math.abs(new Date(serverMsg.created_at).getTime() - new Date(opt.created_at).getTime()) < 10000
            )
            return !hasServerEquivalent
          })

          // Return server data plus any remaining optimistic messages
          return [...data, ...remainingOptimistic]
        }

        // No server changes - but still check if typing should be off
        const lastMsg = data[data.length - 1]
        if (lastMsg?.sender_type === 'dm' && !lastMsg.metadata?.streaming) {
          setIsTyping(false)
        }

        return prev
      })
    }
  }, [campaignId, supabase])

  // Initial fetch and polling fallback (in case Realtime fails)
  useEffect(() => {
    // Fetch initial messages
    fetchMessages()

    // Set up polling as fallback (every 1 second to catch streaming updates)
    const pollInterval = setInterval(fetchMessages, 1000)

    // Set up realtime subscription
    const channel = supabase
      .channel(`chat:${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `campaign_id=eq.${campaignId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage
          setMessages((prev) => {
            // Prevent duplicates
            if (prev.some(m => m.id === newMessage.id)) {
              return prev
            }
            return [...prev, newMessage]
          })

          // If DM message arrives, stop typing indicator
          if (newMessage.sender_type === 'dm') {
            setIsTyping(false)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `campaign_id=eq.${campaignId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as ChatMessage
          setMessages((prev) => {
            return prev.map(m =>
              m.id === updatedMessage.id ? updatedMessage : m
            )
          })

          // If DM message finished streaming, stop typing indicator
          if (updatedMessage.sender_type === 'dm' && !updatedMessage.metadata?.streaming) {
            setIsTyping(false)
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Chat realtime subscribed')
        } else if (err) {
          console.error('Chat subscription error:', err)
        }
      })

    return () => {
      clearInterval(pollInterval)
      supabase.removeChannel(channel)
    }
  }, [campaignId, supabase, fetchMessages])

  // Subscribe to debounce state for "typing" indicator
  useEffect(() => {
    const channel = supabase
      .channel(`debounce:${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dm_debounce_state',
          filter: `campaign_id=eq.${campaignId}`,
        },
        (payload) => {
          const state = payload.new as any
          // Show typing if there are pending messages and not already processing
          if (state.pending_message_count > 0 && !state.is_processing) {
            setIsTyping(true)
          } else if (state.is_processing) {
            setIsTyping(true) // Still show typing while processing
          } else {
            setIsTyping(false)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [campaignId, supabase])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // Track last message for typing detection
  useEffect(() => {
    const lastPlayerMessage = [...messages]
      .reverse()
      .find(m => m.sender_type === 'player')

    if (lastPlayerMessage && lastPlayerMessage.id !== lastMessageRef.current) {
      lastMessageRef.current = lastPlayerMessage.id
      // Show typing indicator when a new player message arrives
      setIsTyping(true)
    }
  }, [messages])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  // Find the most recent DM message for typewriter effect
  const lastDmMessageId = [...messages].reverse().find(m => m.sender_type === 'dm')?.id

  const renderMessage = (message: ChatMessage) => {
    switch (message.sender_type) {
      case 'dm':
        return (
          <DMMessage
            message={message}
            isLatest={message.id === lastDmMessageId}
            ttsEnabled={ttsEnabled}
            formatTime={formatTime}
          />
        )

      case 'player':
        return (
          <div className="p-4 bg-gray-800 border-l-4 border-blue-500 rounded">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-300 text-xs font-bold">
                {message.character_name || 'Player'}
              </span>
              <span className="text-gray-500 text-xs">{formatTime(message.created_at)}</span>
            </div>
            <div className="text-white">{message.content}</div>
          </div>
        )

      case 'system':
        // Check if it's a dice roll message
        if (message.message_type === 'dice_roll' && message.metadata) {
          const { total, breakdown, dc, success, critical, fumble } = message.metadata
          return (
            <div className={`p-4 rounded border-l-4 ${
              critical ? 'bg-yellow-900/30 border-yellow-500' :
              fumble ? 'bg-red-900/40 border-red-600' :
              success === true ? 'bg-green-900/30 border-green-500' :
              success === false ? 'bg-red-900/30 border-red-500' :
              'bg-purple-900/30 border-purple-500'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎲</span>
                <span className="text-purple-300 text-xs font-bold">
                  {message.character_name || 'Dice Roll'}
                </span>
                <span className="text-gray-500 text-xs">{formatTime(message.created_at)}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-3xl font-bold ${
                  critical ? 'text-yellow-400' :
                  fumble ? 'text-red-400' :
                  success === true ? 'text-green-400' :
                  success === false ? 'text-red-400' :
                  'text-white'
                }`}>
                  {total}
                </div>
                <div className="flex-1">
                  <div className="text-gray-400 text-sm">{breakdown}</div>
                  {dc !== undefined && dc !== null && (
                    <div className={`text-sm font-semibold ${
                      success ? 'text-green-400' : 'text-red-400'
                    }`}>
                      DC {dc}: {success ? 'Success!' : 'Failure'}
                    </div>
                  )}
                  {critical && (
                    <div className="text-yellow-400 text-sm font-bold">CRITICAL!</div>
                  )}
                  {fumble && (
                    <div className="text-red-400 text-sm font-bold">FUMBLE!</div>
                  )}
                </div>
              </div>
            </div>
          )
        }
        // Regular system message
        return (
          <div className="p-3 bg-gray-700 border-l-4 border-gray-500 rounded text-center">
            <div className="text-gray-300 text-sm">{message.content}</div>
          </div>
        )

      default:
        return (
          <div className="p-3 bg-gray-800 border-l-4 border-gray-600 rounded">
            <div className="text-gray-400 text-sm">{message.content}</div>
          </div>
        )
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="p-4 border-b-2 border-amber-700">
        <h2 className="font-['Press_Start_2P'] text-lg text-amber-300">Story</h2>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="mb-2">The adventure begins...</p>
            <p className="text-sm">Send a message to start the story</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id}>
              {renderMessage(message)}
            </div>
          ))
        )}

        {isTyping && (
          <div className="p-4 bg-amber-900/30 rounded">
            <div className="flex items-center gap-2 text-amber-300">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="text-sm">DM is typing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

ChatDisplay.displayName = 'ChatDisplay'

export default ChatDisplay
