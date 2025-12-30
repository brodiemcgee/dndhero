'use client'

import { PixelPanel } from '@/components/ui/PixelPanel'

interface Entity {
  id: string
  name: string
  type: 'npc' | 'monster' | 'player'
  entity_state: {
    current_hp: number
    max_hp: number
    conditions: string[]
  }[]
}

interface SceneNPCsSectionProps {
  npcs: Entity[]
}

export default function SceneNPCsSection({ npcs }: SceneNPCsSectionProps) {
  // Don't render if no NPCs
  if (npcs.length === 0) {
    return null
  }

  return (
    <PixelPanel>
      <div className="p-4">
        <h3 className="font-['Press_Start_2P'] text-sm text-amber-300 mb-3">
          NPCs Present
        </h3>
        <div className="space-y-2">
          {npcs.map((npc) => {
            const state = npc.entity_state[0]
            const isDead = state?.current_hp <= 0

            return (
              <div
                key={npc.id}
                className={`p-2 bg-gray-800 border border-blue-700 rounded ${
                  isDead ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-white text-sm font-medium">{npc.name}</div>
                  {isDead && (
                    <span className="text-xs text-red-400">Unconscious</span>
                  )}
                </div>
                {state?.conditions && state.conditions.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {state.conditions.map((condition, i) => (
                      <span
                        key={i}
                        className="px-1 py-0.5 bg-yellow-900/30 border border-yellow-700 rounded text-xs text-yellow-300 capitalize"
                      >
                        {condition.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </PixelPanel>
  )
}
