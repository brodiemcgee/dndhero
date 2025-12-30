'use client'

import CombatTracker from './CombatTracker'

interface Entity {
  id: string
  name: string
  type: 'npc' | 'monster' | 'player'
  entity_state: {
    id: string
    current_hp: number
    max_hp: number
    temp_hp: number
    armor_class: number
    initiative: number | null
    conditions: string[]
    position_x: number | null
    position_y: number | null
  }[]
}

interface Character {
  id: string
  name: string
  current_hp: number
  max_hp: number
  armor_class: number
  profiles: { username: string }
}

interface CombatPanelProps {
  entities: Entity[]
  characters: Character[]
}

export default function CombatPanel({ entities, characters }: CombatPanelProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <CombatTracker entities={entities} characters={characters} />
    </div>
  )
}
