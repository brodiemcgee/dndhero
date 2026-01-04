'use client'

import { useState } from 'react'
import CampaignInfoModal from './CampaignInfoModal'
import { ArtStyle } from '@/lib/ai-dm/art-styles'

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

interface CampaignInfoButtonProps {
  campaign: Campaign
}

export default function CampaignInfoButton({ campaign }: CampaignInfoButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="ml-3 px-2 py-1 text-gray-400 hover:text-amber-400 hover:bg-gray-800 rounded transition-colors"
        title="Campaign Info"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <CampaignInfoModal
        campaign={campaign}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
