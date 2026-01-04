'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EditCampaignModal } from './EditCampaignModal'
import { ArtStyle } from '@/lib/ai-dm/art-styles'

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

interface EditCampaignButtonProps {
  campaign: Campaign
}

export function EditCampaignButton({ campaign }: EditCampaignButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [currentCampaign, setCurrentCampaign] = useState(campaign)

  const handleSave = (updatedCampaign: Campaign) => {
    setCurrentCampaign(updatedCampaign)
    // Refresh the page to show updated data
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-400 hover:text-amber-400 hover:bg-gray-800 rounded transition-colors"
        title="Edit Campaign Settings"
        aria-label="Edit Campaign Settings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      </button>

      <EditCampaignModal
        campaign={currentCampaign}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
      />
    </>
  )
}
