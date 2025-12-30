'use client'

import { useMemo } from 'react'
import { determineBestTopic, type GameContext } from '@/lib/wiki/context-mapping'
import type { SuggestedWikiTopic } from '@/types/rules'

interface Entity {
  id: string
  entity_state: Array<{
    initiative: number | null
    conditions?: string[]
  }>
}

interface PendingRoll {
  roll_type: string
  skill?: string
  ability?: string
}

interface UseGameContextProps {
  entities?: Entity[]
  pendingRolls?: PendingRoll[]
  characterConditions?: string[]
  recentEventTypes?: string[]
  turnPhase?: string
}

interface UseGameContextResult {
  context: GameContext
  suggestedTopic: SuggestedWikiTopic | null
}

/**
 * Hook to detect current game context and suggest relevant wiki topics
 */
export function useGameContext({
  entities = [],
  pendingRolls = [],
  characterConditions = [],
  recentEventTypes = [],
  turnPhase,
}: UseGameContextProps): UseGameContextResult {
  // Detect if in combat (any entity has initiative set)
  const isInCombat = useMemo(() => {
    return entities.some((e) => e.entity_state?.[0]?.initiative !== null)
  }, [entities])

  // Get the first pending roll (most relevant)
  const firstPendingRoll = pendingRolls[0]

  // Build context object
  const context: GameContext = useMemo(
    () => ({
      pendingRollType: firstPendingRoll?.roll_type,
      pendingRollSkill: firstPendingRoll?.skill,
      pendingRollAbility: firstPendingRoll?.ability,
      isInCombat,
      characterConditions,
      recentEventTypes,
      turnPhase,
    }),
    [firstPendingRoll, isInCombat, characterConditions, recentEventTypes, turnPhase]
  )

  // Determine best topic based on context
  const suggestedTopic = useMemo(() => determineBestTopic(context), [context])

  return { context, suggestedTopic }
}
