'use client'

/**
 * CharacterSelector Component
 * Allows players to select an existing character or create a new one for a campaign
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PixelButton } from '@/components/ui/PixelButton'

interface AvailableCharacter {
  id: string
  name: string
  race: string
  class: string
  level: number
  max_hp: number
  current_hp: number
  armor_class: number
}

interface CharacterSelectorProps {
  campaignId: string
  availableCharacters: AvailableCharacter[]
  minLevel?: number
  maxLevel?: number
}

export function CharacterSelector({ campaignId, availableCharacters, minLevel = 1, maxLevel = 20 }: CharacterSelectorProps) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if a character meets the level requirements
  const isEligible = (character: AvailableCharacter) => {
    const level = character.level || 1
    return level >= minLevel && level <= maxLevel
  }

  // Sort characters: eligible first, then ineligible
  const sortedCharacters = [...availableCharacters].sort((a, b) => {
    const aEligible = isEligible(a)
    const bEligible = isEligible(b)
    if (aEligible && !bEligible) return -1
    if (!aEligible && bEligible) return 1
    return 0
  })

  const handleSelect = async (characterId: string) => {
    setSelectedId(characterId)
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/characters/${characterId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaignId }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to assign character')
        setLoading(false)
        setSelectedId(null)
        return
      }

      // Refresh the page to show the assigned character
      router.refresh()
    } catch (err) {
      console.error('Error assigning character:', err)
      setError('An error occurred while assigning the character')
      setLoading(false)
      setSelectedId(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-900/50 border border-red-700 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {availableCharacters.length > 0 ? (
        <>
          <p className="text-gray-400 text-sm">
            Select a character to join this campaign:
            {(minLevel > 1 || maxLevel < 20) && (
              <span className="text-amber-400 ml-2">
                (Requires Level {minLevel}{minLevel !== maxLevel ? `-${maxLevel}` : ''})
              </span>
            )}
          </p>
          <div className="space-y-3">
            {sortedCharacters.map((character) => {
              const eligible = isEligible(character)
              return (
                <div
                  key={character.id}
                  className={`p-4 bg-gray-800 border rounded transition-colors ${
                    !eligible
                      ? 'opacity-50 border-gray-700'
                      : selectedId === character.id
                        ? 'border-amber-400'
                        : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`text-lg font-bold ${eligible ? 'text-white' : 'text-gray-400'}`}>
                          {character.name}
                        </div>
                        <span className={`text-sm ${eligible ? 'text-amber-400' : 'text-gray-500'}`}>
                          Lv. {character.level}
                        </span>
                      </div>
                      <div className="text-gray-400 text-sm">
                        {character.race} {character.class}
                      </div>
                      <div className="flex gap-4 mt-1 text-xs">
                        <span className="text-gray-500">
                          HP: <span className={eligible ? 'text-white' : 'text-gray-400'}>{character.current_hp}/{character.max_hp}</span>
                        </span>
                        <span className="text-gray-500">
                          AC: <span className={eligible ? 'text-white' : 'text-gray-400'}>{character.armor_class}</span>
                        </span>
                      </div>
                      {!eligible && (
                        <div className="text-red-400 text-xs mt-2">
                          Level {character.level} — Requires Level {minLevel}{minLevel !== maxLevel ? `-${maxLevel}` : ''}
                        </div>
                      )}
                    </div>
                    <PixelButton
                      variant="secondary"
                      onClick={() => handleSelect(character.id)}
                      disabled={loading || !eligible}
                    >
                      {loading && selectedId === character.id ? 'Joining...' : eligible ? 'Select' : 'Ineligible'}
                    </PixelButton>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="pt-4 border-t border-gray-700">
            <p className="text-gray-500 text-sm mb-3">Or create a new character:</p>
            <Link href={`/character/create?campaign=${campaignId}`}>
              <PixelButton variant="primary" disabled={loading}>
                Create New Character
              </PixelButton>
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-400 mb-4">
            You don't have any available characters.
          </p>
          <Link href={`/character/create?campaign=${campaignId}`}>
            <PixelButton variant="primary">
              Create Character
            </PixelButton>
          </Link>
        </div>
      )}
    </div>
  )
}
