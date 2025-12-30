'use client'

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { createClient } from '@/lib/supabase/client'
import TextReveal from './TextReveal'
import { PrivateMessage as PrivateMessageComponent } from './PrivateMessage'
import { PrivateMessage } from '@/lib/commands/types'

// Character change notification for displaying AI DM state changes
interface CharacterChange {
  character: string
  description: string
}

// NPC change notification for displaying AI DM NPC state changes
interface NpcChange {
  npc: string
  description: string
}

function CharacterChangeNotification({ changes }: { changes: CharacterChange[] }) {
  if (!changes || changes.length === 0) return null

  // Group changes by character
  const byCharacter = changes.reduce((acc, change) => {
    if (!acc[change.character]) {
      acc[change.character] = []
    }
    acc[change.character].push(change.description)
    return acc
  }, {} as Record<string, string[]>)

  return (
    <div className="mt-3 p-3 bg-gray-900/80 border border-amber-600/30 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-amber-400 text-xs font-bold">Character Updates</span>
      </div>
      <div className="space-y-1">
        {Object.entries(byCharacter).map(([character, descriptions]) => (
          <div key={character} className="text-sm">
            <span className="text-blue-300 font-semibold">{character}:</span>
            {descriptions.map((desc, idx) => (
              <span key={idx} className="text-gray-300 ml-1">
                {desc}{idx < descriptions.length - 1 ? ',' : ''}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function NpcChangeNotification({ changes }: { changes: NpcChange[] }) {
  if (!changes || changes.length === 0) return null

  // Group changes by NPC
  const byNpc = changes.reduce((acc, change) => {
    if (!acc[change.npc]) {
      acc[change.npc] = []
    }
    acc[change.npc].push(change.description)
    return acc
  }, {} as Record<string, string[]>)

  return (
    <div className="mt-3 p-3 bg-gray-900/80 border border-red-600/30 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-red-400 text-xs font-bold">NPC Updates</span>
      </div>
      <div className="space-y-1">
        {Object.entries(byNpc).map(([npc, descriptions]) => (
          <div key={npc} className="text-sm">
            <span className="text-red-300 font-semibold">{npc}:</span>
            {descriptions.map((desc, idx) => (
              <span key={idx} className="text-gray-300 ml-1">
                {desc}{idx < descriptions.length - 1 ? ',' : ''}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Separate component for DM messages with lazy-loading TTS
interface DMMessageProps {
  message: ChatMessage
  isLatest: boolean
  ttsEnabled: boolean
  formatTime: (timestamp: string) => string
}

function DMMessage({ message, isLatest, ttsEnabled, formatTime }: DMMessageProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(message.metadata?.audio_url || null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hasStartedGeneration = useRef(false)

  const isStillStreaming = message.metadata?.streaming === true
  const shouldReveal = isLatest && !isStillStreaming

  // Update audioUrl if message metadata changes (e.g., from realtime subscription)
  useEffect(() => {
    if (message.metadata?.audio_url && !audioUrl) {
      setAudioUrl(message.metadata.audio_url)
    }
  }, [message.metadata?.audio_url, audioUrl])

  // Eagerly generate TTS when message finishes streaming (but don't auto-play)
  useEffect(() => {
    // Only generate if: TTS enabled, no audio yet, not streaming, and haven't started generation
    if (!ttsEnabled || audioUrl || isStillStreaming || hasStartedGeneration.current || isGenerating) {
      return
    }

    // Mark that we've started generation to prevent duplicate calls
    hasStartedGeneration.current = true

    const generateAudio = async () => {
      setIsGenerating(true)
      try {
        const res = await fetch('/api/tts/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId: message.id })
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to generate audio')
        }

        if (data.audioUrl) {
          setAudioUrl(data.audioUrl)
        }
      } catch (err) {
        console.error('TTS generation error:', err)
        // Don't show error for eager generation - user didn't explicitly request it
      } finally {
        setIsGenerating(false)
      }
    }

    generateAudio()
  }, [ttsEnabled, audioUrl, isStillStreaming, message.id, isGenerating])

  // Cleanup audio element on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const playAudio = (url: string) => {
    // Stop any existing playback
    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(url)
    audioRef.current = audio
    setIsPlaying(true)

    audio.onended = () => setIsPlaying(false)
    audio.onerror = () => {
      setIsPlaying(false)
      setError('Failed to play audio')
    }

    audio.play().catch(err => {
      console.error('Failed to play audio:', err)
      setIsPlaying(false)
      setError('Failed to play audio')
    })
  }

  const handlePlayVoice = async () => {
    setError(null)

    // If we already have audio, just play it
    if (audioUrl) {
      playAudio(audioUrl)
      return
    }

    // Generate audio on-demand
    setIsGenerating(true)
    try {
      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: message.id })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate audio')
      }

      if (data.audioUrl) {
        setAudioUrl(data.audioUrl)
        playAudio(data.audioUrl)
      }
    } catch (err) {
      console.error('TTS generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate audio')
    } finally {
      setIsGenerating(false)
    }
  }

  // Show play button when TTS enabled and not currently playing/generating
  const showPlayButton = ttsEnabled && !isPlaying && !isGenerating
  const canPlay = !isStillStreaming

  return (
    <div className="p-4 bg-gray-800 border-l-4 border-amber-500 rounded">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-amber-300 text-xs font-bold">Dungeon Master</span>
        <span className="text-gray-500 text-xs">{formatTime(message.created_at)}</span>
        {isPlaying && (
          <span className="text-amber-400 text-xs animate-pulse" title="Playing">&#x1f50a;</span>
        )}
        {isGenerating && (
          <span className="text-amber-400 text-xs animate-pulse">Generating...</span>
        )}
        {showPlayButton && (
          <button
            onClick={handlePlayVoice}
            disabled={!canPlay}
            className={`p-1 rounded transition-all ${
              canPlay
                ? audioUrl
                  ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-900/30'
                  : 'text-gray-500 hover:text-gray-400'
                : 'text-gray-600 cursor-not-allowed opacity-50'
            }`}
            aria-label="Play audio"
            title={canPlay ? (audioUrl ? 'Play voice' : 'Voice loading...') : 'Waiting for response...'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
              <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
            </svg>
          </button>
        )}
        {error && (
          <span className="text-red-400 text-xs">{error}</span>
        )}
      </div>
      <TextReveal
        content={message.content}
        speedMs={50}
        showCursor={shouldReveal}
        enabled={shouldReveal}
      />
      {/* Show character state changes if any */}
      {message.metadata?.character_changes && !isStillStreaming && (
        <CharacterChangeNotification changes={message.metadata.character_changes as CharacterChange[]} />
      )}
      {/* Show NPC state changes if any */}
      {message.metadata?.npc_changes && !isStillStreaming && (
        <NpcChangeNotification changes={message.metadata.npc_changes as NpcChange[]} />
      )}
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
  privateMessages?: PrivateMessage[]
  onCommandAction?: (command: string) => void
}

export interface ChatDisplayHandle {
  addOptimisticMessage: (message: ChatMessage) => void
}

const ChatDisplay = forwardRef<ChatDisplayHandle, ChatDisplayProps>(({ campaignId, sceneId, initialMessages = [], ttsEnabled = false, privateMessages = [], onCommandAction }, ref) => {
  const supabase = createClient()
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<string | null>(null)
  // Track message IDs that were loaded on initial page load - these should NOT get typewriter effect
  const initialMessageIdsRef = useRef<Set<string>>(new Set(initialMessages.map(m => m.id)))
  const hasInitializedRef = useRef(false)

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
      // On first fetch, mark all messages as "initial" so they don't get typewriter effect
      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true
        data.forEach(m => initialMessageIdsRef.current.add(m.id))
      }

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

  // Auto-scroll to bottom on new messages (including private)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping, privateMessages])

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

  // Find the DM message that should get typewriter effect:
  // 1. Must be a DM message
  // 2. Must be the LAST message overall (no player/system messages after it)
  // 3. Must NOT be from initial page load (otherwise it replays on every reload)
  const lastMessage = messages[messages.length - 1]
  const typewriterMessageId = (
    lastMessage?.sender_type === 'dm' &&
    !initialMessageIdsRef.current.has(lastMessage.id)
  ) ? lastMessage.id : null

  const renderMessage = (message: ChatMessage) => {
    switch (message.sender_type) {
      case 'dm':
        return (
          <DMMessage
            message={message}
            isLatest={message.id === typewriterMessageId}
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

        {/* Private messages (command responses) */}
        {privateMessages.map((pm) => (
          <div key={pm.id}>
            <PrivateMessageComponent message={pm} onAction={onCommandAction} />
          </div>
        ))}
      </div>
    </div>
  )
})

ChatDisplay.displayName = 'ChatDisplay'

export default ChatDisplay
