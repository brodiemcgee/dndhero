'use client'

import { useState } from 'react'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { PartyMemberCard } from './PartyMemberCard'
import { CharacterSelector } from './CharacterSelector'
import { LeaveCampaignButton } from './LeaveCampaignButton'
import CharacterDetailModal from '@/components/game/CharacterDetailModal'

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

interface PartyMembersSectionProps {
  members: Array<{
    user_id: string
    role: 'host' | 'player'
    profiles: {
      username: string
      avatar_url?: string | null
    }
    character: {
      id: string
      name: string
      race: string
      class: string
      level: number
      current_hp: number
      max_hp: number
      armor_class: number
      portrait_url?: string | null
    } | null
  }>
  currentUserId: string
  campaignId: string
  availableCharacters: AvailableCharacter[]
  minLevel: number
  maxLevel: number
  campaignState: string
}

export function PartyMembersSection({
  members,
  currentUserId,
  campaignId,
  availableCharacters,
  minLevel,
  maxLevel,
  campaignState,
}: PartyMembersSectionProps) {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null)

  // Find current user's member entry and character
  const currentUserMember = members.find(m => m.user_id === currentUserId)
  const currentUserCharacter = currentUserMember?.character

  // Sort members: current user first, then others
  const sortedMembers = [...members].sort((a, b) => {
    if (a.user_id === currentUserId) return -1
    if (b.user_id === currentUserId) return 1
    return 0
  })

  return (
    <>
      <PixelPanel>
        <div className="p-6">
          <h2 className="font-['Press_Start_2P'] text-lg text-amber-300 mb-4">
            Party
          </h2>

          <div className="space-y-3">
            {sortedMembers.map((member) => {
              const isCurrentUser = member.user_id === currentUserId

              // If current user has no character, show the selector instead of a card
              if (isCurrentUser && !member.character) {
                return (
                  <div key={member.user_id} className="space-y-3">
                    <div className="p-3 bg-gray-800/50 border-2 border-dashed border-amber-600 rounded">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-amber-400 font-medium">
                          {member.profiles.username}
                        </span>
                        <span className="text-gray-500 text-sm">(You)</span>
                        {member.role === 'host' && (
                          <span className="px-1.5 py-0.5 bg-amber-700/30 text-amber-400 rounded text-[10px]">
                            DM
                          </span>
                        )}
                      </div>
                      <CharacterSelector
                        campaignId={campaignId}
                        availableCharacters={availableCharacters}
                        minLevel={minLevel}
                        maxLevel={maxLevel}
                      />
                    </div>
                  </div>
                )
              }

              return (
                <div key={member.user_id}>
                  <PartyMemberCard
                    member={member}
                    isCurrentUser={isCurrentUser}
                    onClick={() => member.character && setSelectedCharacterId(member.character.id)}
                  />
                  {/* Show Leave Campaign button for current user during setup */}
                  {isCurrentUser && member.character && campaignState === 'setup' && (
                    <div className="mt-2">
                      <LeaveCampaignButton
                        characterId={member.character.id}
                        characterName={member.character.name}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </PixelPanel>

      {/* Character Sheet Modal */}
      {selectedCharacterId && (
        <CharacterDetailModal
          characterId={selectedCharacterId}
          onClose={() => setSelectedCharacterId(null)}
        />
      )}
    </>
  )
}
