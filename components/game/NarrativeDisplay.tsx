'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Event {
  id: string
  type: string
  content: any
  created_at: string
  player_id?: string
}

interface NarrativeDisplayProps {
  sceneId: string
  events: Event[]
  turnContract: any
}

export default function NarrativeDisplay({ sceneId, events: initialEvents, turnContract }: NarrativeDisplayProps) {
  const supabase = createClient()
  const [events, setEvents] = useState(initialEvents)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Subscribe to new events via Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`scene:${sceneId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_log',
          filter: `scene_id=eq.${sceneId}`,
        },
        (payload) => {
          setEvents((prev) => [payload.new as Event, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sceneId, supabase])

  // Auto-scroll to bottom on new events
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events])

  const renderEvent = (event: Event) => {
    const content = event.content || {}

    switch (event.type) {
      case 'narrative':
        return (
          <div className="p-4 bg-gray-800 border-l-4 border-amber-500 rounded">
            <div className="text-amber-300 text-xs mb-2">DM</div>
            <div className="text-white whitespace-pre-wrap">{content.text || content.narrative}</div>
          </div>
        )

      case 'player_action':
        return (
          <div className="p-4 bg-gray-800 border-l-4 border-blue-500 rounded">
            <div className="text-blue-300 text-xs mb-2">
              {content.character_name || 'Player'}
            </div>
            <div className="text-white">{content.action || content.text}</div>
          </div>
        )

      case 'dice_roll':
        return (
          <div className="p-3 bg-gray-800 border-l-4 border-purple-500 rounded">
            <div className="text-purple-300 text-xs mb-1">
              {content.character_name || 'Player'} rolled {content.notation}
            </div>
            <div className="text-white">
              <span className="font-bold text-2xl">{content.total}</span>
              {content.breakdown && (
                <span className="text-sm text-gray-400 ml-2">({content.breakdown})</span>
              )}
              {content.critical && <span className="text-amber-400 ml-2">Critical!</span>}
              {content.fumble && <span className="text-red-400 ml-2">Fumble!</span>}
            </div>
          </div>
        )

      case 'combat_start':
        return (
          <div className="p-4 bg-red-900/30 border-l-4 border-red-500 rounded">
            <div className="text-red-300 font-bold">⚔️ Combat Started!</div>
            <div className="text-white text-sm mt-1">Roll for initiative!</div>
          </div>
        )

      case 'entity_damage':
        return (
          <div className="p-3 bg-gray-800 border-l-4 border-red-400 rounded">
            <div className="text-red-300 text-sm">
              {content.entity_name} took {content.damage} {content.damage_type || ''} damage
            </div>
            {content.current_hp !== undefined && (
              <div className="text-gray-400 text-xs">HP: {content.current_hp}/{content.max_hp}</div>
            )}
          </div>
        )

      case 'entity_healing':
        return (
          <div className="p-3 bg-gray-800 border-l-4 border-green-400 rounded">
            <div className="text-green-300 text-sm">
              {content.entity_name} healed {content.healing} HP
            </div>
            {content.current_hp !== undefined && (
              <div className="text-gray-400 text-xs">HP: {content.current_hp}/{content.max_hp}</div>
            )}
          </div>
        )

      case 'condition_applied':
        return (
          <div className="p-3 bg-gray-800 border-l-4 border-yellow-400 rounded">
            <div className="text-yellow-300 text-sm">
              {content.entity_name} is now {content.condition}
            </div>
          </div>
        )

      case 'condition_removed':
        return (
          <div className="p-3 bg-gray-800 border-l-4 border-green-400 rounded">
            <div className="text-green-300 text-sm">
              {content.entity_name} is no longer {content.condition}
            </div>
          </div>
        )

      case 'turn_complete':
        return (
          <div className="p-3 bg-gray-700 border-l-4 border-gray-500 rounded text-center">
            <div className="text-gray-300 text-sm">Turn {content.turn_number} Complete</div>
          </div>
        )

      default:
        return (
          <div className="p-3 bg-gray-800 border-l-4 border-gray-600 rounded">
            <div className="text-gray-400 text-sm">{JSON.stringify(content)}</div>
          </div>
        )
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="p-4 border-b-2 border-amber-700">
        <h2 className="font-['Press_Start_2P'] text-lg text-amber-300">Story</h2>
        {turnContract && (
          <div className="text-sm text-gray-400 mt-1">
            Phase: <span className="capitalize">{turnContract.phase.replace('_', ' ')}</span>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {events.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="mb-2">The adventure begins...</p>
            <p className="text-sm">Submit an action to start the story</p>
          </div>
        ) : (
          [...events].reverse().map((event) => (
            <div key={event.id} className="relative">
              <div className="absolute -left-1 top-0 text-[10px] text-gray-600">
                {formatTime(event.created_at)}
              </div>
              <div className="pl-12">{renderEvent(event)}</div>
            </div>
          ))
        )}
      </div>

      {turnContract?.phase === 'resolving' && (
        <div className="p-4 bg-amber-900/30 border-t-2 border-amber-700">
          <div className="flex items-center gap-2 text-amber-300">
            <div className="animate-spin h-4 w-4 border-2 border-amber-400 border-t-transparent rounded-full"></div>
            <span className="text-sm">DM is thinking...</span>
          </div>
        </div>
      )}
    </div>
  )
}
