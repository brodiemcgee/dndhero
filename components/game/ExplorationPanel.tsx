'use client'

import PartySection from './PartySection'
import SceneNPCsSection from './SceneNPCsSection'
import SceneInfoSection from './SceneInfoSection'
import QuestTracker from './QuestTracker'

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
  }[]
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

interface ExplorationPanelProps {
  campaignId: string
  scene: Scene
  entities: Entity[]
  characters: Character[]
}

export default function ExplorationPanel({
  campaignId,
  scene,
  entities,
  characters,
}: ExplorationPanelProps) {
  // Filter to only NPCs (not monsters) for the NPCs section
  const sceneNPCs = entities.filter((e) => e.type === 'npc')

  return (
    <div className="flex-1 overflow-y-auto">
      <PartySection characters={characters} />
      <SceneNPCsSection npcs={sceneNPCs} />
      <SceneInfoSection scene={scene} />
      <QuestTracker campaignId={campaignId} />
    </div>
  )
}
