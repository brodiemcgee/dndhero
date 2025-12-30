'use client'

import { useState } from 'react'
import {
  LinesVeilsSettings,
  SafetyLevel,
  TopicId,
  getPredefinedTopicsArray,
  getDefaultLinesVeils,
} from '@/lib/safety'

interface LinesVeilsEditorProps {
  settings: LinesVeilsSettings | null
  onChange: (settings: LinesVeilsSettings) => void
}

export default function LinesVeilsEditor({
  settings,
  onChange,
}: LinesVeilsEditorProps) {
  const currentSettings = settings || getDefaultLinesVeils()
  const topics = getPredefinedTopicsArray()

  const [newCustomLine, setNewCustomLine] = useState('')
  const [newCustomVeil, setNewCustomVeil] = useState('')

  const getTopicLevel = (topicId: string): SafetyLevel => {
    return currentSettings.topics[topicId as TopicId] || 'ok'
  }

  const setTopicLevel = (topicId: string, level: SafetyLevel) => {
    const newTopics = { ...currentSettings.topics }
    if (level === 'ok') {
      // Remove from topics if set to OK (default)
      delete newTopics[topicId as TopicId]
    } else {
      newTopics[topicId as TopicId] = level
    }
    onChange({
      ...currentSettings,
      topics: newTopics,
    })
  }

  const addCustomLine = () => {
    const trimmed = newCustomLine.trim()
    if (!trimmed) return
    if (currentSettings.custom_lines.length >= 20) return
    if (currentSettings.custom_lines.some(l => l.toLowerCase() === trimmed.toLowerCase())) return

    onChange({
      ...currentSettings,
      custom_lines: [...currentSettings.custom_lines, trimmed],
    })
    setNewCustomLine('')
  }

  const removeCustomLine = (index: number) => {
    onChange({
      ...currentSettings,
      custom_lines: currentSettings.custom_lines.filter((_, i) => i !== index),
    })
  }

  const addCustomVeil = () => {
    const trimmed = newCustomVeil.trim()
    if (!trimmed) return
    if (currentSettings.custom_veils.length >= 20) return
    if (currentSettings.custom_veils.some(v => v.toLowerCase() === trimmed.toLowerCase())) return

    onChange({
      ...currentSettings,
      custom_veils: [...currentSettings.custom_veils, trimmed],
    })
    setNewCustomVeil('')
  }

  const removeCustomVeil = (index: number) => {
    onChange({
      ...currentSettings,
      custom_veils: currentSettings.custom_veils.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-6">
      {/* Help text */}
      <div className="bg-fantasy-dark/50 border border-fantasy-stone rounded p-4">
        <h4 className="text-fantasy-gold font-bold mb-2">What are Lines and Veils?</h4>
        <ul className="text-sm text-fantasy-tan space-y-1">
          <li>
            <span className="text-red-400 font-semibold">Lines</span> = Hard limits.
            Content that should <strong>never</strong> appear in the game.
          </li>
          <li>
            <span className="text-yellow-400 font-semibold">Veils</span> = Soft limits.
            Content that can happen but should be &quot;fade to black&quot; (not described in detail).
          </li>
          <li>
            <span className="text-green-400 font-semibold">OK</span> = No restriction.
            You&apos;re comfortable with this content.
          </li>
        </ul>
        <p className="text-xs text-fantasy-stone mt-2">
          Your settings apply to all campaigns you join. The strictest setting among all players is used.
        </p>
      </div>

      {/* Predefined topics */}
      <div>
        <h4 className="text-fantasy-tan font-bold mb-3">Common Topics</h4>
        <div className="space-y-3">
          {topics.map((topic) => {
            const level = getTopicLevel(topic.id)
            return (
              <div
                key={topic.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-fantasy-dark/30 rounded border border-fantasy-stone/50"
              >
                <div className="flex-1">
                  <span className="text-fantasy-light font-medium">{topic.name}</span>
                  <p className="text-xs text-fantasy-stone">{topic.description}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setTopicLevel(topic.id, 'line')}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      level === 'line'
                        ? 'bg-red-600 text-white'
                        : 'bg-fantasy-brown border border-fantasy-stone text-fantasy-tan hover:border-red-500'
                    }`}
                  >
                    Line
                  </button>
                  <button
                    type="button"
                    onClick={() => setTopicLevel(topic.id, 'veil')}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      level === 'veil'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-fantasy-brown border border-fantasy-stone text-fantasy-tan hover:border-yellow-500'
                    }`}
                  >
                    Veil
                  </button>
                  <button
                    type="button"
                    onClick={() => setTopicLevel(topic.id, 'ok')}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      level === 'ok'
                        ? 'bg-green-600 text-white'
                        : 'bg-fantasy-brown border border-fantasy-stone text-fantasy-tan hover:border-green-500'
                    }`}
                  >
                    OK
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Custom Lines */}
      <div>
        <h4 className="text-fantasy-tan font-bold mb-2">Custom Lines (Hard Limits)</h4>
        <p className="text-xs text-fantasy-stone mb-3">
          Add personal topics that should never appear in your games.
        </p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newCustomLine}
            onChange={(e) => setNewCustomLine(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomLine())}
            placeholder="e.g., spiders, heights, drowning..."
            maxLength={100}
            className="flex-1 bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-2 rounded text-sm focus:outline-none focus:border-red-500"
          />
          <button
            type="button"
            onClick={addCustomLine}
            disabled={!newCustomLine.trim() || currentSettings.custom_lines.length >= 20}
            className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
          >
            Add Line
          </button>
        </div>
        {currentSettings.custom_lines.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {currentSettings.custom_lines.map((line, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-red-900/50 border border-red-600 text-red-300 rounded text-sm"
              >
                {line}
                <button
                  type="button"
                  onClick={() => removeCustomLine(index)}
                  className="ml-1 text-red-400 hover:text-red-200"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-fantasy-stone mt-1">
          {currentSettings.custom_lines.length}/20 custom lines
        </p>
      </div>

      {/* Custom Veils */}
      <div>
        <h4 className="text-fantasy-tan font-bold mb-2">Custom Veils (Soft Limits)</h4>
        <p className="text-xs text-fantasy-stone mb-3">
          Add topics that can happen off-screen but shouldn&apos;t be described in detail.
        </p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newCustomVeil}
            onChange={(e) => setNewCustomVeil(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomVeil())}
            placeholder="e.g., romance scenes, detailed surgery..."
            maxLength={100}
            className="flex-1 bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-2 rounded text-sm focus:outline-none focus:border-yellow-500"
          />
          <button
            type="button"
            onClick={addCustomVeil}
            disabled={!newCustomVeil.trim() || currentSettings.custom_veils.length >= 20}
            className="px-4 py-2 bg-yellow-600 text-white rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-700 transition-colors"
          >
            Add Veil
          </button>
        </div>
        {currentSettings.custom_veils.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {currentSettings.custom_veils.map((veil, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-900/50 border border-yellow-600 text-yellow-300 rounded text-sm"
              >
                {veil}
                <button
                  type="button"
                  onClick={() => removeCustomVeil(index)}
                  className="ml-1 text-yellow-400 hover:text-yellow-200"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-fantasy-stone mt-1">
          {currentSettings.custom_veils.length}/20 custom veils
        </p>
      </div>
    </div>
  )
}
