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

  // Check if current user needs to select a character
  const currentUserNeedsCharacter = currentUserMember && !currentUserMember.character

  return (
    <>
      <PixelPanel>
        <div className="p-6">
          <h2 className="font-['Press_Start_2P'] text-lg text-amber-300 mb-4">
            Party
          </h2>

          {/* Character selector for current user if needed */}
          {currentUserNeedsCharacter && (
            <div className="mb-6 p-4 bg-gray-800/50 border-2 border-dashed border-amber-600 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-amber-400 font-medium">
                  {currentUserMember.profiles.username}
                </span>
                <span className="text-gray-500 text-sm">(You)</span>
                {currentUserMember.role === 'host' && (
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
          )}

          {/* Party member cards in a grid - larger cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedMembers
              .filter(member => member.character || member.user_id !== currentUserId)
              .map((member) => {
                const isCurrentUser = member.user_id === currentUserId

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

          {/* Empty state when no one has a character yet */}
          {sortedMembers.filter(m => m.character).length === 0 && !currentUserNeedsCharacter && (
            <div className="text-center py-8 text-gray-500">
              No characters in the party yet
            </div>
          )}
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
