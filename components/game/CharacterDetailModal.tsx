'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import CharacterPanel from './CharacterPanel'

interface CharacterDetailModalProps {
  characterId: string
  onClose: () => void
}

export default function CharacterDetailModal({
  characterId,
  onClose,
}: CharacterDetailModalProps) {
  const supabase = createClient()
  const [character, setCharacter] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Fetch character data
  useEffect(() => {
    const fetchCharacter = async () => {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', characterId)
        .single()

      if (fetchError) {
        setError('Failed to load character')
        console.error('Error fetching character:', fetchError)
      } else {
        setCharacter(data)
      }
      setLoading(false)
    }

    fetchCharacter()
  }, [characterId, supabase])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    // Handle escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md h-[80vh] bg-gray-900 border-2 border-amber-700 rounded-lg shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-amber-700 bg-gray-900">
          <h2 className="font-['Press_Start_2P'] text-sm text-amber-300">
            {loading ? 'Loading...' : character?.name || 'Character'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl leading-none px-2"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-amber-400 animate-pulse">Loading character...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-400">{error}</div>
            </div>
          )}

          {!loading && !error && character && (
            <CharacterPanel character={character} />
          )}
        </div>
      </div>
    </div>
  )
}
