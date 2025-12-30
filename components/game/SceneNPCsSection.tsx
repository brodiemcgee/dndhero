'use client'

import { PixelPanel } from '@/components/ui/PixelPanel'
import Image from 'next/image'

interface Entity {
  id: string
  name: string
  type: 'npc' | 'monster' | 'player'
  portrait_url?: string | null
  portrait_generation_status?: 'pending' | 'generating' | 'completed' | 'failed' | null
  entity_state: {
    current_hp: number
    max_hp: number
    conditions: string[]
  }[]
}

interface SceneNPCsSectionProps {
  npcs: Entity[]
}

/**
 * Get fallback icon based on entity type
 */
function getEntityIcon(type: 'npc' | 'monster' | 'player'): string {
  switch (type) {
    case 'monster':
      return '👹'
    case 'player':
      return '⚔️'
    case 'npc':
    default:
      return '👤'
  }
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
            const hasPortrait = npc.portrait_url && npc.portrait_generation_status === 'completed'
            const isGenerating = npc.portrait_generation_status === 'generating'

            return (
              <div
                key={npc.id}
                className={`p-2 bg-gray-800 border border-blue-700 rounded ${
                  isDead ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Portrait Circle */}
                  <div className="w-10 h-10 rounded-full border-2 border-blue-600 bg-gray-900 overflow-hidden flex-shrink-0">
                    {hasPortrait ? (
                      <Image
                        src={npc.portrait_url!}
                        alt={npc.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : isGenerating ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <span className="text-lg flex items-center justify-center h-full">
                        {getEntityIcon(npc.type)}
                      </span>
                    )}
                  </div>

                  {/* NPC Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-white text-sm font-medium truncate">{npc.name}</div>
                      {isDead && (
                        <span className="text-xs text-red-400 ml-2 flex-shrink-0">Unconscious</span>
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
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </PixelPanel>
  )
}
