'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRulesWiki } from '@/components/rules-wiki'
import CampaignSafetyBadges from '@/components/campaign/CampaignSafetyBadges'

interface GameMenuProps {
  campaignId: string
  isHost: boolean
  userId?: string
}

export default function GameMenu({ campaignId, isHost, userId }: GameMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const [ttsLoading, setTtsLoading] = useState(false)
  const [showSafetySettings, setShowSafetySettings] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()
  const { openSidebar: openRulesWiki } = useRulesWiki()

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Fetch user's TTS preference
  useEffect(() => {
    if (!userId) return

    const fetchTTSPreference = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('tts_enabled')
        .eq('id', userId)
        .single()

      if (data?.tts_enabled) {
        setTtsEnabled(true)
      }
    }

    fetchTTSPreference()
  }, [userId, supabase])

  // Toggle TTS preference
  const handleToggleTTS = async () => {
    if (!userId || ttsLoading) return

    setTtsLoading(true)
    const newValue = !ttsEnabled

    const { error } = await supabase
      .from('profiles')
      .update({ tts_enabled: newValue })
      .eq('id', userId)

    if (!error) {
      setTtsEnabled(newValue)
    } else {
      console.error('Failed to update TTS preference:', error)
    }

    setTtsLoading(false)
  }

  const handleExitToLobby = () => {
    router.push(`/campaign/${campaignId}/lobby`)
  }

  const handleExitToDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white border-2 border-amber-900 rounded font-['Press_Start_2P'] text-xs transition-colors"
        aria-label="Game Menu"
      >
        MENU
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-900 border-2 border-amber-700 rounded shadow-lg z-50">
          <div className="py-2">
            {/* Exit to Lobby */}
            <button
              onClick={handleExitToLobby}
              className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-amber-900/30 transition-colors border-b border-gray-700"
            >
              <span className="block font-semibold">Return to Lobby</span>
              <span className="block text-xs text-gray-400 mt-1">
                Leave the game session
              </span>
            </button>

            {/* Exit to Dashboard */}
            <button
              onClick={handleExitToDashboard}
              className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-amber-900/30 transition-colors border-b border-gray-700"
            >
              <span className="block font-semibold">Exit to Dashboard</span>
              <span className="block text-xs text-gray-400 mt-1">
                Leave this campaign
              </span>
            </button>

            {/* TTS Toggle */}
            {userId && (
              <button
                onClick={handleToggleTTS}
                disabled={ttsLoading}
                className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-amber-900/30 transition-colors border-b border-gray-700 flex items-center justify-between"
              >
                <div>
                  <span className="block font-semibold">DM Voice</span>
                  <span className="block text-xs text-gray-400 mt-1">
                    Text-to-speech narration
                  </span>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors ${ttsEnabled ? 'bg-amber-600' : 'bg-gray-600'} relative`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${ttsEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </button>
            )}

            {/* Future menu items can be added here */}
            {isHost && (
              <>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    // TODO: Add settings functionality
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-400 hover:bg-amber-900/30 transition-colors cursor-not-allowed"
                  disabled
                >
                  <span className="block font-semibold">Game Settings</span>
                  <span className="block text-xs text-gray-500 mt-1">
                    Coming soon
                  </span>
                </button>
              </>
            )}

            {/* Safety Settings (Lines & Veils) */}
            <button
              onClick={() => {
                setIsOpen(false)
                setShowSafetySettings(true)
              }}
              className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-amber-900/30 transition-colors border-b border-gray-700"
            >
              <span className="block font-semibold">Safety Settings</span>
              <span className="block text-xs text-gray-400 mt-1">
                View Lines & Veils
              </span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false)
                openRulesWiki()
              }}
              className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-amber-900/30 transition-colors"
            >
              <span className="block font-semibold">Help & Rules</span>
              <span className="block text-xs text-gray-400 mt-1">
                D&D 5e quick reference
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Safety Settings Modal */}
      {showSafetySettings && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border-2 border-amber-700 rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-amber-400">
                Safety Settings
              </h2>
              <button
                onClick={() => setShowSafetySettings(false)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-400 mb-4">
                Lines and Veils are safety boundaries set by players in this campaign.
                The AI DM will respect these restrictions.
              </p>
              <CampaignSafetyBadges campaignId={campaignId} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
