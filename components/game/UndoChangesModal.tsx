'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CharacterChange {
  id: string
  change_type: string
  field_name: string
  reason: string
  created_at: string
  is_reversed: boolean
  character_name?: string
  character_id?: string
}

interface UndoChangesModalProps {
  campaignId: string
  isOpen: boolean
  onClose: () => void
}

function formatChangeType(changeType: string): string {
  const typeLabels: Record<string, string> = {
    hp_change: 'HP Change',
    temp_hp: 'Temp HP',
    death_save: 'Death Save',
    death_saves: 'Death Saves',
    inventory_add: 'Item Added',
    inventory_remove: 'Item Removed',
    currency_change: 'Currency',
    condition_add: 'Condition Added',
    condition_remove: 'Condition Removed',
    spell_slot_use: 'Spell Slot Used',
    spell_slot_restore: 'Spell Slots Restored',
    xp_gain: 'XP Awarded',
    equip_item: 'Item Equipped',
    unequip_item: 'Item Unequipped',
    long_rest: 'Long Rest',
    short_rest: 'Short Rest',
  }
  return typeLabels[changeType] || changeType.replace(/_/g, ' ')
}

function getChangeIcon(changeType: string): string {
  const icons: Record<string, string> = {
    hp_change: '❤️',
    temp_hp: '💙',
    death_save: '💀',
    death_saves: '💀',
    inventory_add: '📦',
    inventory_remove: '📤',
    currency_change: '💰',
    condition_add: '⚠️',
    condition_remove: '✅',
    spell_slot_use: '✨',
    spell_slot_restore: '🔮',
    xp_gain: '⭐',
    equip_item: '⚔️',
    unequip_item: '🎒',
    long_rest: '🛏️',
    short_rest: '☕',
  }
  return icons[changeType] || '📝'
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function UndoChangesModal({ campaignId, isOpen, onClose }: UndoChangesModalProps) {
  const [changes, setChanges] = useState<CharacterChange[]>([])
  const [loading, setLoading] = useState(true)
  const [undoing, setUndoing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchChanges = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Get all characters in the campaign
      const { data: characters } = await supabase
        .from('characters')
        .select('id, name')
        .eq('campaign_id', campaignId)

      if (!characters || characters.length === 0) {
        setChanges([])
        setLoading(false)
        return
      }

      const characterMap = new Map(characters.map(c => [c.id, c.name]))

      // Get recent changes (last 24 hours)
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)

      const { data: changesData, error: changesError } = await supabase
        .from('character_state_changes')
        .select('id, character_id, change_type, field_name, reason, created_at, is_reversed')
        .eq('campaign_id', campaignId)
        .gte('created_at', oneDayAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(50)

      if (changesError) {
        console.error('Failed to fetch changes:', changesError)
        setError('Failed to load changes')
        setChanges([])
      } else {
        const changesWithNames = (changesData || []).map(change => ({
          ...change,
          character_name: characterMap.get(change.character_id) || 'Unknown',
        }))
        setChanges(changesWithNames)
      }
    } catch (err) {
      console.error('Error fetching changes:', err)
      setError('Failed to load changes')
    }

    setLoading(false)
  }, [campaignId, supabase])

  useEffect(() => {
    if (isOpen) {
      fetchChanges()
    }
  }, [isOpen, fetchChanges])

  const handleUndo = async (change: CharacterChange) => {
    if (!change.character_id || undoing) return

    setUndoing(change.id)
    setError(null)

    try {
      const response = await fetch(`/api/characters/${change.character_id}/undo-change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ change_id: change.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to undo change')
      } else {
        // Refresh the list
        await fetchChanges()
      }
    } catch (err) {
      console.error('Error undoing change:', err)
      setError('Failed to undo change')
    }

    setUndoing(null)
  }

  if (!isOpen) return null

  const unreversedChanges = changes.filter(c => !c.is_reversed)
  const reversedChanges = changes.filter(c => c.is_reversed)

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-lg max-h-[80vh] bg-gray-900 border-2 border-amber-700 rounded-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-amber-400">Undo AI Changes</h2>
            <p className="text-xs text-gray-400 mt-1">Reverse recent AI DM modifications (last 24h)</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-sm text-red-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-400">Loading changes...</div>
            </div>
          ) : unreversedChanges.length === 0 && reversedChanges.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-3xl mb-3">📜</p>
              <p>No AI changes in the last 24 hours</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Unreversed changes */}
              {unreversedChanges.length > 0 && (
                <div>
                  <h3 className="text-xs text-gray-500 uppercase mb-2">Available to Undo</h3>
                  <div className="space-y-2">
                    {unreversedChanges.map(change => (
                      <div
                        key={change.id}
                        className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-700 rounded-lg hover:border-amber-600 transition-colors"
                      >
                        <span className="text-xl">{getChangeIcon(change.change_type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white truncate">
                              {change.character_name}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded">
                              {formatChangeType(change.change_type)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {change.reason}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatTime(change.created_at)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleUndo(change)}
                          disabled={undoing === change.id}
                          className="px-3 py-1.5 text-xs bg-amber-700 hover:bg-amber-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded transition-colors flex-shrink-0"
                        >
                          {undoing === change.id ? 'Undoing...' : 'Undo'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reversed changes */}
              {reversedChanges.length > 0 && (
                <div>
                  <h3 className="text-xs text-gray-500 uppercase mb-2">Already Reversed</h3>
                  <div className="space-y-2">
                    {reversedChanges.map(change => (
                      <div
                        key={change.id}
                        className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg opacity-60"
                      >
                        <span className="text-xl grayscale">{getChangeIcon(change.change_type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-400 truncate line-through">
                              {change.character_name}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 bg-gray-700/50 text-gray-500 rounded">
                              {formatChangeType(change.change_type)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {change.reason}
                          </p>
                        </div>
                        <span className="text-xs text-green-500 flex-shrink-0">Undone</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
