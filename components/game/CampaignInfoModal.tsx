'use client'

import { useEffect, useRef } from 'react'
import { ART_STYLE_LABELS, ArtStyle } from '@/lib/ai-dm/art-styles'

type TurnMode = 'single_player' | 'vote' | 'first_response_wins' | 'freeform'
type Tone = 'serious' | 'balanced' | 'humorous'
type Difficulty = 'easy' | 'normal' | 'hard' | 'deadly'
type NarrativeStyle = 'concise' | 'descriptive' | 'epic'

interface Campaign {
  id: string
  name: string
  description: string | null
  setting: string | null
  mode: TurnMode
  art_style: ArtStyle | null
  dm_config: {
    tone?: Tone
    difficulty?: Difficulty
    narrative_style?: NarrativeStyle
  } | null
  strict_mode: boolean | null
  adult_content_enabled: boolean | null
  min_level: number
  max_level: number
}

interface CampaignInfoModalProps {
  campaign: Campaign
  isOpen: boolean
  onClose: () => void
}

const MODE_LABELS: Record<TurnMode, string> = {
  freeform: 'Freeform',
  single_player: 'Single Player',
  first_response_wins: 'First Response',
  vote: 'Vote',
}

const TONE_LABELS: Record<Tone, string> = {
  serious: 'Serious',
  balanced: 'Balanced',
  humorous: 'Humorous',
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard',
  deadly: 'Deadly',
}

const NARRATIVE_LABELS: Record<NarrativeStyle, string> = {
  concise: 'Concise',
  descriptive: 'Descriptive',
  epic: 'Epic',
}

export default function CampaignInfoModal({ campaign, isOpen, onClose }: CampaignInfoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

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

  const dmConfig = campaign.dm_config || {}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" />

      <div
        ref={modalRef}
        className="relative w-full max-w-lg max-h-[85vh] bg-gray-900 border-4 border-amber-700 rounded-lg flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-amber-700 bg-gray-800">
          <h2 className="font-['Press_Start_2P'] text-lg text-amber-300">
            Campaign Info
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none px-2"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Campaign Name */}
          <div>
            <h3 className="text-amber-400 font-medium mb-1">Name</h3>
            <p className="text-white">{campaign.name}</p>
          </div>

          {/* Description */}
          {campaign.description && (
            <div>
              <h3 className="text-amber-400 font-medium mb-1">Description</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{campaign.description}</p>
            </div>
          )}

          {/* Setting */}
          {campaign.setting && (
            <div>
              <h3 className="text-amber-400 font-medium mb-1">Setting</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{campaign.setting}</p>
            </div>
          )}

          {/* Game Settings Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Turn Mode */}
            <div>
              <h3 className="text-amber-400 font-medium mb-1 text-sm">Turn Mode</h3>
              <p className="text-gray-300">{MODE_LABELS[campaign.mode]}</p>
            </div>

            {/* Art Style */}
            <div>
              <h3 className="text-amber-400 font-medium mb-1 text-sm">Art Style</h3>
              <p className="text-gray-300">
                {campaign.art_style ? ART_STYLE_LABELS[campaign.art_style] : 'Pixel Art'}
              </p>
            </div>

            {/* Level Range */}
            <div>
              <h3 className="text-amber-400 font-medium mb-1 text-sm">Level Range</h3>
              <p className="text-gray-300">{campaign.min_level} - {campaign.max_level}</p>
            </div>

            {/* Difficulty */}
            <div>
              <h3 className="text-amber-400 font-medium mb-1 text-sm">Difficulty</h3>
              <p className="text-gray-300">
                {DIFFICULTY_LABELS[dmConfig.difficulty || 'normal']}
              </p>
            </div>

            {/* Tone */}
            <div>
              <h3 className="text-amber-400 font-medium mb-1 text-sm">Tone</h3>
              <p className="text-gray-300">
                {TONE_LABELS[dmConfig.tone || 'balanced']}
              </p>
            </div>

            {/* Narrative Style */}
            <div>
              <h3 className="text-amber-400 font-medium mb-1 text-sm">Narrative Style</h3>
              <p className="text-gray-300">
                {NARRATIVE_LABELS[dmConfig.narrative_style || 'descriptive']}
              </p>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-4">
            <div className={`px-3 py-1 rounded-full text-sm ${campaign.strict_mode ? 'bg-amber-700/30 text-amber-400' : 'bg-gray-700 text-gray-400'}`}>
              Strict Mode: {campaign.strict_mode ? 'On' : 'Off'}
            </div>
            <div className={`px-3 py-1 rounded-full text-sm ${campaign.adult_content_enabled ? 'bg-red-700/30 text-red-400' : 'bg-gray-700 text-gray-400'}`}>
              Adult Content: {campaign.adult_content_enabled ? 'On' : 'Off'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
