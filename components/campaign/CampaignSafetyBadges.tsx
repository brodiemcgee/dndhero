'use client'

import { useState, useEffect } from 'react'
import {
  AggregatedSafetySettings,
  getTopicById,
  getSafetySettingsSummary,
  hasActiveRestrictions,
} from '@/lib/safety'

interface CampaignSafetyBadgesProps {
  campaignId: string
  className?: string
}

export default function CampaignSafetyBadges({
  campaignId,
  className = '',
}: CampaignSafetyBadgesProps) {
  const [settings, setSettings] = useState<AggregatedSafetySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`/api/campaign/${campaignId}/safety-settings`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch safety settings')
        }

        setSettings(data.settings)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [campaignId])

  if (loading) {
    return (
      <div className={`text-fantasy-stone text-sm ${className}`}>
        Loading safety settings...
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-fantasy-red text-sm ${className}`}>
        {error}
      </div>
    )
  }

  if (!settings || !hasActiveRestrictions(settings)) {
    return (
      <div className={`text-fantasy-stone text-sm ${className}`}>
        No content restrictions set by party members
      </div>
    )
  }

  const summary = getSafetySettingsSummary(settings)
  const allLines = [...settings.lines, ...settings.custom_lines]
  const allVeils = [...settings.veils, ...settings.custom_veils]

  return (
    <div className={className}>
      {/* Summary badge - clickable to expand */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-1.5 bg-fantasy-dark/50 border border-fantasy-stone rounded hover:border-fantasy-tan transition-colors"
      >
        <span className="text-sm text-fantasy-tan">{summary}</span>
        <span className="text-fantasy-stone text-xs">
          {expanded ? '(hide)' : '(show)'}
        </span>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 p-4 bg-fantasy-dark/30 border border-fantasy-stone rounded">
          <p className="text-xs text-fantasy-stone mb-3">
            These restrictions are set by party members. The AI DM will respect these boundaries.
          </p>

          {/* Lines */}
          {allLines.length > 0 && (
            <div className="mb-4">
              <h4 className="text-red-400 font-bold text-sm mb-2">
                Lines (Hard Limits)
              </h4>
              <p className="text-xs text-fantasy-stone mb-2">
                This content will never appear in the game.
              </p>
              <div className="flex flex-wrap gap-2">
                {settings.lines.map((topicId) => {
                  const topic = getTopicById(topicId)
                  return (
                    <span
                      key={topicId}
                      className="px-2 py-1 bg-red-900/50 border border-red-600 text-red-300 rounded text-xs"
                      title={topic?.description}
                    >
                      {topic?.name || topicId}
                    </span>
                  )
                })}
                {settings.custom_lines.map((custom, index) => (
                  <span
                    key={`custom-line-${index}`}
                    className="px-2 py-1 bg-red-900/50 border border-red-600 text-red-300 rounded text-xs"
                  >
                    {custom}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Veils */}
          {allVeils.length > 0 && (
            <div>
              <h4 className="text-yellow-400 font-bold text-sm mb-2">
                Veils (Soft Limits)
              </h4>
              <p className="text-xs text-fantasy-stone mb-2">
                This content will be handled &quot;off-screen&quot; (fade to black).
              </p>
              <div className="flex flex-wrap gap-2">
                {settings.veils.map((topicId) => {
                  const topic = getTopicById(topicId)
                  return (
                    <span
                      key={topicId}
                      className="px-2 py-1 bg-yellow-900/50 border border-yellow-600 text-yellow-300 rounded text-xs"
                      title={topic?.description}
                    >
                      {topic?.name || topicId}
                    </span>
                  )
                })}
                {settings.custom_veils.map((custom, index) => (
                  <span
                    key={`custom-veil-${index}`}
                    className="px-2 py-1 bg-yellow-900/50 border border-yellow-600 text-yellow-300 rounded text-xs"
                  >
                    {custom}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
