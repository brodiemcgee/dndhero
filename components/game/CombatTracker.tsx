'use client'

import { PixelPanel } from '@/components/ui/PixelPanel'

interface Entity {
  id: string
  name: string
  type: 'npc' | 'monster' | 'player'
  entity_state: EntityState[]
}

interface EntityState {
  id: string
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
  current_hp: number
  max_hp: number
  armor_class: number
  profiles: { username: string }
}

interface CombatTrackerProps {
  entities: Entity[]
  characters: Character[]
}

// CombatTracker is now a pure display component.
// Combat state and real-time updates are managed by RightPanel.
export default function CombatTracker({ entities, characters }: CombatTrackerProps) {
  // Check if any entity has initiative (we're in combat mode)
  const inCombat = entities.some((e) => e.entity_state[0]?.initiative !== null)

  const getHealthColor = (current: number, max: number) => {
    const percent = (current / max) * 100
    if (percent > 50) return 'text-green-400'
    if (percent > 25) return 'text-amber-400'
    return 'text-red-400'
  }

  const getHealthBar = (current: number, max: number) => {
    const percent = Math.min(100, Math.max(0, (current / max) * 100))
    return (
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            percent > 50 ? 'bg-green-500' : percent > 25 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    )
  }

  const sortedEntities = [...entities].sort((a, b) => {
    const initA = a.entity_state[0]?.initiative ?? -1
    const initB = b.entity_state[0]?.initiative ?? -1
    return initB - initA
  })

  if (!inCombat && entities.length === 0) {
    return null
  }

  return (
    <PixelPanel>
      <div className="p-4">
        <h3 className="font-['Press_Start_2P'] text-sm text-amber-300 mb-4">
          {inCombat ? 'Combat' : 'Entities'}
        </h3>

        <div className="space-y-2">
          {sortedEntities.map((entity) => {
            const state = entity.entity_state[0]
            if (!state) return null

            const isDead = state.current_hp <= 0

            return (
              <div
                key={entity.id}
                className={`p-3 bg-gray-800 border-2 rounded transition-all ${
                  isDead
                    ? 'border-gray-700 opacity-50'
                    : entity.type === 'monster'
                    ? 'border-red-700'
                    : entity.type === 'npc'
                    ? 'border-blue-700'
                    : 'border-green-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {inCombat && state.initiative !== null && (
                        <div className="w-8 h-8 bg-amber-900/50 border border-amber-700 rounded-full flex items-center justify-center text-amber-400 font-bold text-sm">
                          {state.initiative}
                        </div>
                      )}
                      <div>
                        <div className="text-white font-semibold">{entity.name}</div>
                        <div className="text-xs text-gray-400 capitalize">{entity.type}</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-sm">
                    <div className="text-gray-400">AC: {state.armor_class}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">HP:</span>
                    <span className={getHealthColor(state.current_hp, state.max_hp)}>
                      {state.current_hp}/{state.max_hp}
                      {state.temp_hp > 0 && (
                        <span className="text-blue-400 ml-1">+{state.temp_hp}</span>
                      )}
                    </span>
                  </div>
                  {getHealthBar(state.current_hp, state.max_hp)}
                </div>

                {state.conditions && state.conditions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {state.conditions.map((condition, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-yellow-900/30 border border-yellow-700 rounded text-xs text-yellow-300 capitalize"
                      >
                        {condition.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                )}

                {isDead && (
                  <div className="mt-2 text-center text-red-400 font-bold text-sm">
                    UNCONSCIOUS
                  </div>
                )}
              </div>
            )
          })}

          {/* Player characters */}
          {characters.map((character) => (
            <div
              key={character.id}
              className="p-3 bg-gray-800 border-2 border-green-700 rounded"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-white font-semibold">{character.name}</div>
                  <div className="text-xs text-gray-400">{character.profiles.username}</div>
                </div>

                <div className="text-right text-sm">
                  <div className="text-gray-400">AC: {character.armor_class}</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">HP:</span>
                  <span className={getHealthColor(character.current_hp, character.max_hp)}>
                    {character.current_hp}/{character.max_hp}
                  </span>
                </div>
                {getHealthBar(character.current_hp, character.max_hp)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PixelPanel>
  )
}
