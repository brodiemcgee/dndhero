'use client'

import { useState } from 'react'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { PartyMemberCard } from './PartyMemberCard'
import CharacterDetailModal from '@/components/game/CharacterDetailModal'

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
}

export function PartyMembersSection({ members, currentUserId }: PartyMembersSectionProps) {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null)

  return (
    <>
      <PixelPanel>
        <div className="p-6">
          <h2 className="font-['Press_Start_2P'] text-lg text-amber-300 mb-4">
            Party Members
          </h2>

          <div className="space-y-3">
            {members.map((member) => (
              <PartyMemberCard
                key={member.user_id}
                member={member}
                isCurrentUser={member.user_id === currentUserId}
                onClick={() => member.character && setSelectedCharacterId(member.character.id)}
              />
            ))}
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
