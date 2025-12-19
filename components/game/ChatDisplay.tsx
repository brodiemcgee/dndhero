'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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
}

export default function ChatDisplay({ campaignId, sceneId, initialMessages = [] }: ChatDisplayProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<string | null>(null)

  // Fetch messages function
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true })
      .limit(100)

    if (!error && data) {
      setMessages(prev => {
        // Only update if there are new messages
        if (data.length !== prev.length || (data.length > 0 && data[data.length - 1].id !== prev[prev.length - 1]?.id)) {
          // Check if DM message arrived
          const lastMsg = data[data.length - 1]
          if (lastMsg?.sender_type === 'dm' && !prev.some(m => m.id === lastMsg.id)) {
            setIsTyping(false)
          }
          return data
        }
        return prev
      })
    }
  }

  // Initial fetch and polling fallback (in case Realtime fails)
  useEffect(() => {
    // Fetch initial messages
    fetchMessages()

    // Set up polling as fallback (every 3 seconds)
    const pollInterval = setInterval(fetchMessages, 3000)

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
  }, [campaignId, supabase])

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

  const renderMessage = (message: ChatMessage) => {
    switch (message.sender_type) {
      case 'dm':
        return (
          <div className="p-4 bg-gray-800 border-l-4 border-amber-500 rounded">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-300 text-xs font-bold">Dungeon Master</span>
              <span className="text-gray-500 text-xs">{formatTime(message.created_at)}</span>
            </div>
            <div className="text-white whitespace-pre-wrap">{message.content}</div>
          </div>
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
}
