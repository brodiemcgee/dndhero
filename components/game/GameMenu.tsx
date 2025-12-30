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
  const [ttsAutoPlay, setTtsAutoPlay] = useState(false)
  const [ttsSpeed, setTtsSpeed] = useState(1.0)
  const [ttsLoading, setTtsLoading] = useState(false)
  const [typewriterSpeed, setTypewriterSpeed] = useState(50)
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

  // Fetch user's preferences
  useEffect(() => {
    if (!userId) return

    const fetchPreferences = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('tts_enabled, tts_auto_play, tts_speed, typewriter_speed')
        .eq('id', userId)
        .single()

      if (data?.tts_enabled) {
        setTtsEnabled(true)
      }
      if (data?.tts_auto_play) {
        setTtsAutoPlay(true)
      }
      if (data?.tts_speed !== null && data?.tts_speed !== undefined) {
        setTtsSpeed(data.tts_speed)
      }
      if (data?.typewriter_speed !== null && data?.typewriter_speed !== undefined) {
        setTypewriterSpeed(data.typewriter_speed)
      }
    }

    fetchPreferences()
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
      // Also turn off auto-play when TTS is disabled
      if (!newValue && ttsAutoPlay) {
        setTtsAutoPlay(false)
        await supabase
          .from('profiles')
          .update({ tts_auto_play: false })
          .eq('id', userId)
      }
    } else {
      console.error('Failed to update TTS preference:', error)
    }

    setTtsLoading(false)
  }

  // Toggle TTS auto-play preference
  const handleToggleAutoPlay = async () => {
    if (!userId || ttsLoading) return

    setTtsLoading(true)
    const newValue = !ttsAutoPlay

    const { error } = await supabase
      .from('profiles')
      .update({ tts_auto_play: newValue })
      .eq('id', userId)

    if (!error) {
      setTtsAutoPlay(newValue)
    } else {
      console.error('Failed to update TTS auto-play preference:', error)
    }

    setTtsLoading(false)
  }

  // Update TTS speed preference
  const handleTtsSpeedChange = async (value: number) => {
    if (!userId) return

    setTtsSpeed(value)

    const { error } = await supabase
      .from('profiles')
      .update({ tts_speed: value })
      .eq('id', userId)

    if (error) {
      console.error('Failed to update TTS speed:', error)
    }
  }

  // Update typewriter speed preference
  const handleTypewriterSpeedChange = async (value: number) => {
    if (!userId) return

    setTypewriterSpeed(value)

    const { error } = await supabase
      .from('profiles')
      .update({ typewriter_speed: value })
      .eq('id', userId)

    if (error) {
      console.error('Failed to update typewriter speed:', error)
    }
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
                className={`w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-amber-900/30 transition-colors ${ttsEnabled ? '' : 'border-b border-gray-700'} flex items-center justify-between`}
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

            {/* Auto-play Toggle (nested under DM Voice) */}
            {userId && ttsEnabled && (
              <button
                onClick={handleToggleAutoPlay}
                disabled={ttsLoading}
                className="w-full text-left pl-8 pr-4 py-2 text-sm text-gray-300 hover:bg-amber-900/30 transition-colors flex items-center justify-between bg-gray-800/50"
              >
                <div>
                  <span className="block text-xs font-medium">Auto-play</span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    Play automatically
                  </span>
                </div>
                <div className={`w-8 h-5 rounded-full transition-colors ${ttsAutoPlay ? 'bg-amber-600' : 'bg-gray-600'} relative`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${ttsAutoPlay ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                </div>
              </button>
            )}

            {/* TTS Speed Slider (nested under DM Voice) */}
            {userId && ttsEnabled && (
              <div className="w-full pl-8 pr-4 py-2 text-sm text-gray-300 bg-gray-800/50 border-b border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">Speed</span>
                  <span className="text-xs text-amber-400">{ttsSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={ttsSpeed}
                  onChange={(e) => handleTtsSpeedChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                  <span>0.5x</span>
                  <span>1.5x</span>
                </div>
              </div>
            )}

            {/* Typewriter Speed Slider */}
            {userId && (
              <div className="w-full text-left px-4 py-3 text-sm text-gray-200 border-b border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="block font-semibold">Text Speed</span>
                    <span className="block text-xs text-gray-400 mt-1">
                      {typewriterSpeed === 100 ? 'Instant' : 'Typewriter effect'}
                    </span>
                  </div>
                  <span className="text-amber-400 text-xs font-mono">
                    {typewriterSpeed}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={typewriterSpeed}
                  onChange={(e) => handleTypewriterSpeedChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Slow</span>
                  <span>Instant</span>
                </div>
              </div>
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
