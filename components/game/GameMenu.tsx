'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface GameMenuProps {
  campaignId: string
  isHost: boolean
}

export default function GameMenu({ campaignId, isHost }: GameMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

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

            <button
              onClick={() => {
                setIsOpen(false)
                // TODO: Add help functionality
              }}
              className="w-full text-left px-4 py-3 text-sm text-gray-400 hover:bg-amber-900/30 transition-colors cursor-not-allowed"
              disabled
            >
              <span className="block font-semibold">Help & Rules</span>
              <span className="block text-xs text-gray-500 mt-1">
                Coming soon
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
