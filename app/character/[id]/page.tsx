'use client'

/**
 * Character Detail Page
 * View full character sheet and manage character
 */

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { UserMenu } from '@/components/auth/UserMenu'
import { PixelButton } from '@/components/ui/PixelButton'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { createClient } from '@/lib/supabase/client'

interface Character {
  id: string
  name: string
  race: string
  class: string
  level: number
  xp: number
  max_hp: number
  current_hp: number
  armor_class: number
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
  proficiency_bonus: number
  skills: string[]
  equipment: any[]
  inventory: any[]
  gold: number
  spells: any[]
  spell_slots: any
  background: string
  personality_traits: string
  ideals: string
  bonds: string
  flaws: string
  campaign_id: string | null
  campaign_name: string | null
  created_at: string
}

export default function CharacterDetailPage() {
  const router = useRouter()
  const params = useParams()
  const characterId = params.id as string

  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchCharacter = async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Fetch character with campaign info
      const { data: char, error: charError } = await supabase
        .from('characters')
        .select(`
          *,
          campaigns (
            id,
            name
          )
        `)
        .eq('id', characterId)
        .eq('user_id', user.id)
        .single()

      if (charError || !char) {
        setError('Character not found')
        setLoading(false)
        return
      }

      setCharacter({
        ...char,
        campaign_name: char.campaigns?.name || null,
      })
      setLoading(false)
    }

    fetchCharacter()
  }, [characterId, router])

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to delete character')
        setDeleting(false)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      console.error('Error deleting character:', err)
      setError('An error occurred while deleting')
      setDeleting(false)
    }
  }

  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2)
    return mod >= 0 ? `+${mod}` : `${mod}`
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-fantasy-dark flex items-center justify-center">
          <div className="text-fantasy-tan">Loading character...</div>
        </div>
      </AuthGuard>
    )
  }

  if (error || !character) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-fantasy-dark flex items-center justify-center">
          <PixelPanel className="p-8 text-center max-w-md">
            <div className="text-4xl mb-4">&#9888;</div>
            <h2 className="text-xl font-bold text-fantasy-gold mb-4">
              {error || 'Character Not Found'}
            </h2>
            <Link href="/dashboard">
              <PixelButton>Return to Dashboard</PixelButton>
            </Link>
          </PixelPanel>
        </div>
      </AuthGuard>
    )
  }

  const isStandalone = !character.campaign_id

  return (
    <AuthGuard>
      <div className="min-h-screen bg-fantasy-dark">
        {/* Header */}
        <header className="border-b-4 border-fantasy-stone bg-fantasy-brown p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/dashboard" className="text-2xl font-bold text-fantasy-gold">
              DND HERO
            </Link>
            <UserMenu />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto p-6">
          {/* Back link */}
          <Link
            href="/dashboard"
            className="text-fantasy-gold hover:text-amber-300 mb-4 inline-block"
          >
            &#8592; Back to Dashboard
          </Link>

          {/* Character Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-fantasy-gold mb-2">
                {character.name}
              </h1>
              <p className="text-fantasy-tan text-lg">
                Level {character.level} {character.race} {character.class}
              </p>
              {character.campaign_name && (
                <p className="text-fantasy-stone mt-1">
                  In campaign: <span className="text-amber-400">{character.campaign_name}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isStandalone ? (
                <span className="px-3 py-1 bg-green-700/30 border border-green-600 text-green-400 text-sm font-bold rounded">
                  AVAILABLE
                </span>
              ) : (
                <Link href={`/campaign/${character.campaign_id}/lobby`}>
                  <PixelButton variant="secondary" size="small">
                    View Campaign
                  </PixelButton>
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Combat Stats */}
              <PixelPanel title="Combat Stats" className="p-6">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-fantasy-dark border-2 border-red-700 rounded">
                    <div className="text-red-400 text-xs mb-1">HP</div>
                    <div className="text-2xl font-bold text-white">
                      {character.current_hp}/{character.max_hp}
                    </div>
                  </div>
                  <div className="p-4 bg-fantasy-dark border-2 border-blue-700 rounded">
                    <div className="text-blue-400 text-xs mb-1">AC</div>
                    <div className="text-2xl font-bold text-white">
                      {character.armor_class}
                    </div>
                  </div>
                  <div className="p-4 bg-fantasy-dark border-2 border-amber-700 rounded">
                    <div className="text-amber-400 text-xs mb-1">XP</div>
                    <div className="text-2xl font-bold text-white">
                      {character.xp || 0}
                    </div>
                  </div>
                  <div className="p-4 bg-fantasy-dark border-2 border-purple-700 rounded">
                    <div className="text-purple-400 text-xs mb-1">PROF</div>
                    <div className="text-2xl font-bold text-white">
                      +{character.proficiency_bonus || 2}
                    </div>
                  </div>
                </div>
              </PixelPanel>

              {/* Ability Scores */}
              <PixelPanel title="Ability Scores" className="p-6">
                <div className="grid grid-cols-6 gap-3 text-center">
                  {[
                    { name: 'STR', key: 'str' },
                    { name: 'DEX', key: 'dex' },
                    { name: 'CON', key: 'con' },
                    { name: 'INT', key: 'int' },
                    { name: 'WIS', key: 'wis' },
                    { name: 'CHA', key: 'cha' },
                  ].map((ability) => {
                    const score = character[ability.key as keyof Character] as number || 10
                    return (
                      <div
                        key={ability.key}
                        className="p-3 bg-fantasy-dark border-2 border-fantasy-stone rounded"
                      >
                        <div className="text-fantasy-gold text-xs font-bold mb-1">
                          {ability.name}
                        </div>
                        <div className="text-2xl font-bold text-white">{score}</div>
                        <div className="text-fantasy-tan text-sm">
                          {getModifier(score)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </PixelPanel>

              {/* Skills */}
              <PixelPanel title="Proficient Skills" className="p-6">
                {character.skills && character.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {character.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-fantasy-dark border border-fantasy-stone text-fantasy-tan text-sm rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-fantasy-stone">No proficient skills</p>
                )}
              </PixelPanel>

              {/* Equipment */}
              <PixelPanel title="Equipment" className="p-6">
                {character.equipment && character.equipment.length > 0 ? (
                  <div className="space-y-2">
                    {character.equipment.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-fantasy-dark border border-fantasy-stone rounded"
                      >
                        <span className="text-white">{typeof item === 'string' ? item : item.name || 'Unknown Item'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-fantasy-stone">No equipment</p>
                )}
              </PixelPanel>
            </div>

            {/* Right Column: Info & Actions */}
            <div className="space-y-6">
              {/* Gold */}
              <PixelPanel title="Wealth" className="p-6">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">&#9733;</span>
                  <span className="text-2xl font-bold text-fantasy-gold">
                    {character.gold || 0} GP
                  </span>
                </div>
              </PixelPanel>

              {/* Background */}
              {character.background && (
                <PixelPanel title="Background" className="p-6">
                  <p className="text-fantasy-tan">{character.background}</p>
                </PixelPanel>
              )}

              {/* Personality */}
              {(character.personality_traits || character.ideals || character.bonds || character.flaws) && (
                <PixelPanel title="Personality" className="p-6">
                  <div className="space-y-3 text-sm">
                    {character.personality_traits && (
                      <div>
                        <div className="text-fantasy-gold font-bold mb-1">Traits</div>
                        <p className="text-fantasy-tan">{character.personality_traits}</p>
                      </div>
                    )}
                    {character.ideals && (
                      <div>
                        <div className="text-fantasy-gold font-bold mb-1">Ideals</div>
                        <p className="text-fantasy-tan">{character.ideals}</p>
                      </div>
                    )}
                    {character.bonds && (
                      <div>
                        <div className="text-fantasy-gold font-bold mb-1">Bonds</div>
                        <p className="text-fantasy-tan">{character.bonds}</p>
                      </div>
                    )}
                    {character.flaws && (
                      <div>
                        <div className="text-fantasy-gold font-bold mb-1">Flaws</div>
                        <p className="text-fantasy-tan">{character.flaws}</p>
                      </div>
                    )}
                  </div>
                </PixelPanel>
              )}

              {/* Actions */}
              {isStandalone && (
                <PixelPanel title="Actions" className="p-6">
                  {showDeleteConfirm ? (
                    <div className="space-y-4">
                      <p className="text-fantasy-tan text-sm">
                        Are you sure you want to delete{' '}
                        <span className="text-white font-bold">{character.name}</span>?
                        This cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <PixelButton
                          variant="secondary"
                          size="small"
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={deleting}
                        >
                          Cancel
                        </PixelButton>
                        <PixelButton
                          variant="primary"
                          size="small"
                          onClick={handleDelete}
                          disabled={deleting}
                        >
                          {deleting ? 'Deleting...' : 'Delete Forever'}
                        </PixelButton>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-red-400 hover:text-red-300 text-sm transition-colors"
                    >
                      Delete Character
                    </button>
                  )}
                </PixelPanel>
              )}

              {/* Created */}
              <div className="text-fantasy-stone text-xs text-center">
                Created {new Date(character.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
