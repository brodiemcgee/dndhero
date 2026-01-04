'use client'

import { useState, useEffect, useRef } from 'react'
import { PixelButton } from '@/components/ui/PixelButton'
import { LevelRangeSelector } from './LevelRangeSelector'
import { ART_STYLES, ART_STYLE_LABELS, ArtStyle } from '@/lib/ai-dm/art-styles'

type TurnMode = 'single_player' | 'vote' | 'first_response_wins' | 'freeform'
type Tone = 'serious' | 'balanced' | 'humorous'
type Difficulty = 'easy' | 'normal' | 'hard' | 'deadly'
type NarrativeStyle = 'concise' | 'descriptive' | 'epic'

interface Campaign {
  id: string
  name: string
  setting: string | null
  mode: TurnMode
  art_style: ArtStyle | null
  dm_config: {
    tone?: Tone
    difficulty?: Difficulty
    narrative_style?: NarrativeStyle
    house_rules?: string[]
  } | null
  strict_mode: boolean | null
  adult_content_enabled: boolean | null
  min_level: number
  max_level: number
}

interface EditCampaignModalProps {
  campaign: Campaign
  isOpen: boolean
  onClose: () => void
  onSave: (updatedCampaign: Campaign) => void
}

type Tab = 'basics' | 'game' | 'dm'

const MODE_OPTIONS: { value: TurnMode; label: string; description: string }[] = [
  { value: 'freeform', label: 'Freeform', description: 'All players contribute freely (recommended)' },
  { value: 'single_player', label: 'Single Player', description: 'Solo adventure with AI DM' },
  { value: 'first_response_wins', label: 'First Response', description: 'First player to respond controls the turn' },
  { value: 'vote', label: 'Vote', description: 'Players vote on actions' },
]

const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: 'serious', label: 'Serious' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'humorous', label: 'Humorous' },
]

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'normal', label: 'Normal' },
  { value: 'hard', label: 'Hard' },
  { value: 'deadly', label: 'Deadly' },
]

const NARRATIVE_OPTIONS: { value: NarrativeStyle; label: string; description: string }[] = [
  { value: 'concise', label: 'Concise', description: '1-2 paragraphs, quick and punchy' },
  { value: 'descriptive', label: 'Descriptive', description: '2-4 paragraphs, balanced' },
  { value: 'epic', label: 'Epic', description: '3-5 paragraphs, cinematic detail' },
]

export function EditCampaignModal({ campaign, isOpen, onClose, onSave }: EditCampaignModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<Tab>('basics')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState(campaign.name)
  const [setting, setSetting] = useState(campaign.setting || '')
  const [mode, setMode] = useState<TurnMode>(campaign.mode)
  const [artStyle, setArtStyle] = useState<ArtStyle>(campaign.art_style || 'Pixel Art')
  const [minLevel, setMinLevel] = useState(campaign.min_level || 1)
  const [maxLevel, setMaxLevel] = useState(campaign.max_level || 20)
  const [strictMode, setStrictMode] = useState(campaign.strict_mode || false)
  const [adultContent, setAdultContent] = useState(campaign.adult_content_enabled || false)
  const [tone, setTone] = useState<Tone>(campaign.dm_config?.tone || 'balanced')
  const [difficulty, setDifficulty] = useState<Difficulty>(campaign.dm_config?.difficulty || 'normal')
  const [narrativeStyle, setNarrativeStyle] = useState<NarrativeStyle>(campaign.dm_config?.narrative_style || 'descriptive')

  // Reset form when campaign changes
  useEffect(() => {
    setName(campaign.name)
    setSetting(campaign.setting || '')
    setMode(campaign.mode)
    setArtStyle(campaign.art_style || 'Pixel Art')
    setMinLevel(campaign.min_level || 1)
    setMaxLevel(campaign.max_level || 20)
    setStrictMode(campaign.strict_mode || false)
    setAdultContent(campaign.adult_content_enabled || false)
    setTone(campaign.dm_config?.tone || 'balanced')
    setDifficulty(campaign.dm_config?.difficulty || 'normal')
    setNarrativeStyle(campaign.dm_config?.narrative_style || 'descriptive')
    setError(null)
  }, [campaign])

  // Close on escape/outside click
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handleClickOutside)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const hasChanges =
    name !== campaign.name ||
    setting !== (campaign.setting || '') ||
    mode !== campaign.mode ||
    artStyle !== (campaign.art_style || 'Pixel Art') ||
    minLevel !== (campaign.min_level || 1) ||
    maxLevel !== (campaign.max_level || 20) ||
    strictMode !== (campaign.strict_mode || false) ||
    adultContent !== (campaign.adult_content_enabled || false) ||
    tone !== (campaign.dm_config?.tone || 'balanced') ||
    difficulty !== (campaign.dm_config?.difficulty || 'normal') ||
    narrativeStyle !== (campaign.dm_config?.narrative_style || 'descriptive')

  const handleSave = async () => {
    // Validation
    if (name.length < 3 || name.length > 100) {
      setError('Campaign name must be 3-100 characters')
      setActiveTab('basics')
      return
    }
    if (setting && (setting.length < 10 || setting.length > 500)) {
      setError('Setting description must be 10-500 characters')
      setActiveTab('basics')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/campaign/${campaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          setting: setting || undefined,
          mode,
          art_style: artStyle,
          min_level: minLevel,
          max_level: maxLevel,
          strict_mode: strictMode,
          adult_content_enabled: adultContent,
          dm_config: {
            tone,
            difficulty,
            narrative_style: narrativeStyle,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update campaign')
      }

      onSave(data.campaign)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setLoading(false)
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'basics', label: 'Basics' },
    { id: 'game', label: 'Game Rules' },
    { id: 'dm', label: 'DM Style' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" />

      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[90vh] bg-gray-900 border-4 border-amber-700 rounded-lg flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-amber-700 bg-gray-800">
          <h2 className="font-['Press_Start_2P'] text-lg text-amber-300">
            Edit Campaign
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none px-2"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-800 text-amber-400 border-b-2 border-amber-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Basics Tab */}
          {activeTab === 'basics' && (
            <div className="space-y-6">
              {/* Campaign Name */}
              <div>
                <label className="block text-amber-400 font-medium mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter campaign name..."
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded text-white focus:border-amber-600 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">3-100 characters</p>
              </div>

              {/* Turn Mode */}
              <div>
                <label className="block text-amber-400 font-medium mb-2">
                  Turn Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {MODE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setMode(option.value)}
                      className={`p-3 rounded border-2 text-left transition-all ${
                        mode === option.value
                          ? 'bg-amber-700/20 border-amber-600 text-amber-400'
                          : 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300'
                      }`}
                    >
                      <div className="font-bold text-sm">{option.label}</div>
                      <div className="text-xs opacity-75">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Setting Description */}
              <div>
                <label className="block text-amber-400 font-medium mb-2">
                  Setting Description
                </label>
                <textarea
                  value={setting}
                  onChange={(e) => setSetting(e.target.value)}
                  placeholder="Describe the world and setting of your campaign..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded text-white focus:border-amber-600 focus:outline-none resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {setting.length}/500 characters (10 minimum)
                </p>
              </div>
            </div>
          )}

          {/* Game Rules Tab */}
          {activeTab === 'game' && (
            <div className="space-y-6">
              {/* Art Style */}
              <div>
                <label className="block text-amber-400 font-medium mb-2">
                  Art Style
                </label>
                <select
                  value={artStyle}
                  onChange={(e) => setArtStyle(e.target.value as ArtStyle)}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded text-white focus:border-amber-600 focus:outline-none"
                >
                  {ART_STYLES.map((style) => (
                    <option key={style} value={style}>
                      {ART_STYLE_LABELS[style]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level Range */}
              <LevelRangeSelector
                minLevel={minLevel}
                maxLevel={maxLevel}
                onChange={(min, max) => {
                  setMinLevel(min)
                  setMaxLevel(max)
                }}
              />

              {/* Strict Mode */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="strictMode"
                  checked={strictMode}
                  onChange={(e) => setStrictMode(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-800 text-amber-600 focus:ring-amber-600"
                />
                <label htmlFor="strictMode" className="flex-1">
                  <span className="text-white font-medium">Strict Mode</span>
                  <p className="text-sm text-gray-400">
                    The DM will enforce D&D 5e rules precisely. Disable for more narrative flexibility.
                  </p>
                </label>
              </div>

              {/* Adult Content */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="adultContent"
                  checked={adultContent}
                  onChange={(e) => setAdultContent(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-800 text-amber-600 focus:ring-amber-600"
                />
                <label htmlFor="adultContent" className="flex-1">
                  <span className="text-white font-medium">Adult Content</span>
                  <p className="text-sm text-gray-400">
                    Allow mature themes. All players must also opt-in via their profile settings.
                  </p>
                </label>
              </div>
            </div>
          )}

          {/* DM Style Tab */}
          {activeTab === 'dm' && (
            <div className="space-y-6">
              {/* Tone */}
              <div>
                <label className="block text-amber-400 font-medium mb-2">
                  Tone
                </label>
                <div className="flex gap-2">
                  {TONE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTone(option.value)}
                      className={`flex-1 py-3 rounded border-2 transition-all ${
                        tone === option.value
                          ? 'bg-amber-700/20 border-amber-600 text-amber-400'
                          : 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-amber-400 font-medium mb-2">
                  Difficulty
                </label>
                <div className="flex gap-2">
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDifficulty(option.value)}
                      className={`flex-1 py-3 rounded border-2 transition-all ${
                        difficulty === option.value
                          ? 'bg-amber-700/20 border-amber-600 text-amber-400'
                          : 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Narrative Style */}
              <div>
                <label className="block text-amber-400 font-medium mb-2">
                  Narrative Style
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {NARRATIVE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setNarrativeStyle(option.value)}
                      className={`p-3 rounded border-2 text-left transition-all ${
                        narrativeStyle === option.value
                          ? 'bg-amber-700/20 border-amber-600 text-amber-400'
                          : 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300'
                      }`}
                    >
                      <div className="font-bold text-sm">{option.label}</div>
                      <div className="text-xs opacity-75">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-800 rounded border border-gray-700">
                <p className="text-sm text-gray-400">
                  Changes to DM settings take effect immediately. The AI DM will pick up your new preferences on the next response.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 bg-gray-800">
          {error && (
            <p className="text-red-400 text-sm mb-3">{error}</p>
          )}
          <div className="flex justify-end gap-3">
            <PixelButton variant="secondary" onClick={onClose}>
              Cancel
            </PixelButton>
            <PixelButton
              onClick={handleSave}
              disabled={loading || !hasChanges}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  )
}
