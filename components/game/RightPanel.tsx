'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import ExplorationPanel from './ExplorationPanel'
import CombatPanel from './CombatPanel'

interface Entity {
  id: string
  name: string
  type: 'npc' | 'monster' | 'player'
  entity_state: EntityState[]
}

interface EntityState {
  id: string
  scene_id: string
  current_hp: number
  max_hp: number
  temp_hp: number
  armor_class: number
  initiative: number | null
  conditions: string[]
  position_x: number | null
  position_y: number | null
}

interface Character {
  id: string
  name: string
  class: string
  level: number
  current_hp: number
  max_hp: number
  armor_class: number
  portrait_url?: string
  profiles: { username: string }
}

interface Scene {
  id: string
  name: string
  location: string
}

interface RightPanelProps {
  campaignId: string
  sceneId: string
  scene: Scene
  entities: Entity[]
  characters: Character[]
}

export default function RightPanel({
  campaignId,
  sceneId,
  scene,
  entities: initialEntities,
  characters: initialCharacters,
}: RightPanelProps) {
  const supabase = createClient()
  const [entities, setEntities] = useState(initialEntities)
  const [characters, setCharacters] = useState(initialCharacters)

  // Detect combat state - combat is active when any entity has initiative
  const isInCombat = useMemo(() => {
    return entities.some((e) => e.entity_state[0]?.initiative !== null)
  }, [entities])

  // Subscribe to entity state changes for real-time combat detection
  useEffect(() => {
    if (!sceneId) return

    const channel = supabase
      .channel(`right-panel-entities:${sceneId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'entity_state',
          filter: `scene_id=eq.${sceneId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setEntities((prev) =>
              prev.map((entity) => {
                if (entity.entity_state[0]?.id === payload.new.id) {
                  return {
                    ...entity,
                    entity_state: [payload.new as EntityState],
                  }
                }
                return entity
              })
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sceneId, supabase])

  // Subscribe to character updates for real-time HP changes
  useEffect(() => {
    if (characters.length === 0) return

    const channels = characters.map((char) =>
      supabase
        .channel(`right-panel-char:${char.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'characters',
            filter: `id=eq.${char.id}`,
          },
          (payload) => {
            setCharacters((prev) =>
              prev.map((c) =>
                c.id === payload.new.id
                  ? { ...c, ...(payload.new as Partial<Character>) }
                  : c
              )
            )
          }
        )
        .subscribe()
    )

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel))
    }
  }, [characters.length, supabase])

  return (
    <div className="w-80 border-l-2 border-amber-700 flex flex-col overflow-hidden">
      {isInCombat ? (
        <CombatPanel entities={entities} characters={characters} />
      ) : (
        <ExplorationPanel
          campaignId={campaignId}
          scene={scene}
          entities={entities}
          characters={characters}
        />
      )}
    </div>
  )
}
