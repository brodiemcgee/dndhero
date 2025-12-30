'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PixelPanel } from '@/components/ui/PixelPanel'

interface QuestObjective {
  id: string
  description: string
  is_completed: boolean
  sort_order: number
}

interface Quest {
  id: string
  title: string
  description: string | null
  quest_giver: string | null
  status: string
  priority: number
  quest_objectives: QuestObjective[]
}

interface QuestTrackerProps {
  campaignId: string
}

export default function QuestTracker({ campaignId }: QuestTrackerProps) {
  const supabase = createClient()
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // Fetch active quests
  const fetchQuests = async () => {
    const { data, error } = await supabase
      .from('quests')
      .select('*, quest_objectives(*)')
      .eq('campaign_id', campaignId)
      .eq('status', 'active')
      .order('priority', { ascending: false })

    if (!error && data) {
      // Sort objectives by sort_order
      const sortedQuests = data.map((quest) => ({
        ...quest,
        quest_objectives: (quest.quest_objectives || []).sort(
          (a: QuestObjective, b: QuestObjective) => a.sort_order - b.sort_order
        ),
      }))
      setQuests(sortedQuests)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchQuests()

    // Subscribe to quest changes
    const questChannel = supabase
      .channel(`quests:${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quests',
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => {
          fetchQuests()
        }
      )
      .subscribe()

    // Subscribe to objective changes
    const objectiveChannel = supabase
      .channel(`quest-objectives:${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quest_objectives',
        },
        () => {
          fetchQuests()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(questChannel)
      supabase.removeChannel(objectiveChannel)
    }
  }, [campaignId, supabase])

  const toggleExpanded = (questId: string) => {
    setExpanded((prev) => ({
      ...prev,
      [questId]: !prev[questId],
    }))
  }

  if (loading) {
    return (
      <PixelPanel>
        <div className="p-4">
          <h3 className="font-['Press_Start_2P'] text-sm text-amber-300 mb-3">
            Active Quests
          </h3>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </PixelPanel>
    )
  }

  if (quests.length === 0) {
    return (
      <PixelPanel>
        <div className="p-4">
          <h3 className="font-['Press_Start_2P'] text-sm text-amber-300 mb-3">
            Active Quests
          </h3>
          <p className="text-gray-500 text-sm italic">No active quests</p>
        </div>
      </PixelPanel>
    )
  }

  return (
    <PixelPanel>
      <div className="p-4">
        <h3 className="font-['Press_Start_2P'] text-sm text-amber-300 mb-3">
          Active Quests
        </h3>
        <div className="space-y-2">
          {quests.map((quest) => {
            const isExpanded = expanded[quest.id]
            const completedCount = quest.quest_objectives.filter(
              (obj) => obj.is_completed
            ).length
            const totalCount = quest.quest_objectives.length

            return (
              <div
                key={quest.id}
                className="p-2 bg-gray-800 border border-amber-700 rounded"
              >
                <button
                  onClick={() => toggleExpanded(quest.id)}
                  className="w-full text-left flex items-start justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-amber-400 font-semibold text-sm truncate">
                      {quest.title}
                    </div>
                    {quest.quest_giver && (
                      <div className="text-xs text-gray-500">
                        From: {quest.quest_giver}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {totalCount > 0 && (
                      <span className="text-xs text-gray-400">
                        {completedCount}/{totalCount}
                      </span>
                    )}
                    <span className="text-gray-500 text-xs">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    {quest.description && (
                      <p className="text-xs text-gray-400 mb-2 italic">
                        {quest.description}
                      </p>
                    )}
                    {quest.quest_objectives.length > 0 && (
                      <div className="space-y-1">
                        {quest.quest_objectives.map((obj) => (
                          <div
                            key={obj.id}
                            className="flex items-start gap-2 text-xs"
                          >
                            <span
                              className={
                                obj.is_completed
                                  ? 'text-green-400'
                                  : 'text-gray-500'
                              }
                            >
                              {obj.is_completed ? '✓' : '○'}
                            </span>
                            <span
                              className={
                                obj.is_completed
                                  ? 'text-gray-500 line-through'
                                  : 'text-gray-300'
                              }
                            >
                              {obj.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
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
