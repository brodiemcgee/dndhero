'use client'

/**
 * Character Detail Page
 * View full character sheet using the new D&D-style layout
 */

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { UserMenu } from '@/components/auth/UserMenu'
import { PixelButton } from '@/components/ui/PixelButton'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { CharacterSheet, Character } from '@/components/character/CharacterSheet'
import { PortraitGenerator } from '@/components/character/PortraitGenerator'
import { EditModeProvider } from '@/components/character/EditModeContext'
import { EditModeControls } from '@/components/character/EditModeControls'
import { createClient } from '@/lib/supabase/client'

function CharacterDetailContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const characterId = params.id as string
  const isNewCharacter = searchParams.get('new') === 'true'
  const hasPortraitAlready = searchParams.get('hasPortrait') === 'true'
  const fromCampaign = searchParams.get('campaign')

  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showPortraitModal, setShowPortraitModal] = useState(false)
  const [generatingPortrait, setGeneratingPortrait] = useState(false)
  const [portraitSuccess, setPortraitSuccess] = useState(false)
  const [portraitError, setPortraitError] = useState<string | null>(null)

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

      // Map database fields to Character type
      setCharacter({
        ...char,
        campaign_name: char.campaigns?.name || null,
        // Ensure arrays have defaults
        skill_proficiencies: char.skill_proficiencies || [],
        saving_throw_proficiencies: char.saving_throw_proficiencies || [],
        tool_proficiencies: char.tool_proficiencies || [],
        language_proficiencies: char.language_proficiencies || [],
        armor_proficiencies: char.armor_proficiencies || [],
        weapon_proficiencies: char.weapon_proficiencies || [],
        cantrips: char.cantrips || [],
        known_spells: char.known_spells || [],
        prepared_spells: char.prepared_spells || [],
        personality_traits: char.personality_traits || [],
        ideals: char.ideals || [],
        bonds: char.bonds || [],
        flaws: char.flaws || [],
        features: char.features || [],
        traits: char.traits || [],
        inventory: char.inventory || [],
        attacks: char.attacks || [],
        treasure: char.treasure || [],
        allies_and_organizations: char.allies_and_organizations || [],
        // Ensure objects have defaults
        equipment: char.equipment || {},
        currency: char.currency || { cp: 0, sp: 0, ep: 0, gp: char.gold || 0, pp: 0 },
        spell_slots: char.spell_slots || {},
        spell_slots_used: char.spell_slots_used || {},
        hit_dice: char.hit_dice || {},
        // Ensure numbers have defaults
        temp_hp: char.temp_hp || 0,
        speed: char.speed || 30,
        initiative_bonus: char.initiative_bonus || 0,
        proficiency_bonus: char.proficiency_bonus || 2,
        death_save_successes: char.death_save_successes || 0,
        death_save_failures: char.death_save_failures || 0,
        hit_dice_remaining: char.hit_dice_remaining || char.level,
        passive_perception: char.passive_perception || 10,
        experience: char.experience || 0,
        inspiration: char.inspiration || false,
      } as Character)
      setLoading(false)
    }

    fetchCharacter()
  }, [characterId, router])

  // Auto-generate portrait for new characters
  const generatePortrait = useCallback(async () => {
    if (!character || character.portrait_url || generatingPortrait) return

    setGeneratingPortrait(true)
    setPortraitError(null)

    try {
      const response = await fetch(`/api/characters/${characterId}/portrait/generate`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        // Don't show error for quota limits - just silently skip
        if (data.code !== 'PORTRAIT_LIMIT_REACHED') {
          setPortraitError(data.error || 'Failed to generate portrait')
        }
        return
      }

      setCharacter(prev => prev ? { ...prev, portrait_url: data.portrait_url } : null)
      setPortraitSuccess(true)

      // Clear success message after 5 seconds
      setTimeout(() => setPortraitSuccess(false), 5000)
    } catch (err) {
      console.error('Portrait generation error:', err)
      setPortraitError('Failed to generate portrait')
    } finally {
      setGeneratingPortrait(false)
    }
  }, [character, characterId, generatingPortrait])

  // Trigger auto-portrait generation for new characters (only if portrait wasn't already generated during creation)
  useEffect(() => {
    if (isNewCharacter && !hasPortraitAlready && character && !character.portrait_url && !generatingPortrait) {
      // Small delay to let the UI render first
      const timer = setTimeout(() => {
        generatePortrait()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isNewCharacter, hasPortraitAlready, character, generatingPortrait, generatePortrait])

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

      // Force a full page navigation to ensure fresh data
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('Error deleting character:', err)
      setError('An error occurred while deleting')
      setDeleting(false)
    }
  }

  const handlePortraitUpdated = (url: string) => {
    setCharacter(prev => prev ? { ...prev, portrait_url: url } : null)
    setShowPortraitModal(false)
  }

  const handleCharacterSaved = (updatedCharacter: Character) => {
    setCharacter(updatedCharacter)
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
          {/* Navigation & Actions Bar */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/dashboard"
              className="text-fantasy-gold hover:text-amber-300 inline-flex items-center gap-2"
            >
              <span>&#8592;</span> Back to Dashboard
            </Link>

            <div className="flex items-center gap-3">
              {/* Campaign Link */}
              {character.campaign_id && (
                <Link href={`/campaign/${character.campaign_id}/lobby`}>
                  <PixelButton variant="secondary" size="small">
                    View Campaign
                  </PixelButton>
                </Link>
              )}

              {/* Status Badge */}
              {isStandalone ? (
                <span className="px-3 py-1 bg-green-700/30 border border-green-600 text-green-400 text-sm font-bold rounded">
                  AVAILABLE
                </span>
              ) : (
                <span className="px-3 py-1 bg-amber-700/30 border border-amber-600 text-amber-400 text-sm font-bold rounded">
                  IN CAMPAIGN
                </span>
              )}
            </div>
          </div>

          {/* New Character Welcome Banner */}
          {isNewCharacter && (
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-900/50 to-amber-800/30 border-2 border-amber-600 rounded-lg">
              <div className="flex items-start gap-4">
                <span className="text-3xl">&#127881;</span>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-amber-300 mb-1">
                    Welcome, {character.name}!
                  </h2>
                  <p className="text-amber-100/80 text-sm">
                    Your character has been created successfully.
                    {generatingPortrait && ' Generating your portrait now...'}
                    {portraitSuccess && ' Your AI portrait is ready!'}
                    {hasPortraitAlready && character.portrait_url && ' Your portrait is ready!'}
                    {!generatingPortrait && !character.portrait_url && !portraitSuccess && !hasPortraitAlready && ' Click on the portrait to generate one.'}
                  </p>
                  {fromCampaign && (
                    <Link
                      href={`/campaign/${fromCampaign}/lobby`}
                      className="inline-block mt-2 text-amber-400 hover:text-amber-300 text-sm underline"
                    >
                      Return to campaign lobby &rarr;
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Portrait Generation Status */}
          {generatingPortrait && (
            <div className="mb-6 p-4 bg-purple-900/30 border border-purple-700 rounded-lg flex items-center gap-3">
              <div className="animate-spin text-2xl">&#9881;</div>
              <div>
                <div className="font-bold text-purple-300">Generating AI Portrait...</div>
                <div className="text-sm text-purple-200/70">This may take a few seconds</div>
              </div>
            </div>
          )}

          {/* Portrait Success Message */}
          {portraitSuccess && !generatingPortrait && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg flex items-center gap-3">
              <span className="text-2xl">&#10024;</span>
              <div className="text-green-300">Your AI portrait has been generated!</div>
            </div>
          )}

          {/* Portrait Error Message */}
          {portraitError && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">&#9888;</span>
                <div className="text-red-300">{portraitError}</div>
              </div>
              <button
                onClick={() => setPortraitError(null)}
                className="text-red-400 hover:text-red-300"
              >
                &times;
              </button>
            </div>
          )}

          {/* Character Sheet with Edit Mode */}
          <EditModeProvider character={character} onSave={handleCharacterSaved}>
            {/* Edit Controls */}
            <div className="flex justify-end mb-4">
              <EditModeControls />
            </div>

            <CharacterSheet
              character={character}
              onPortraitClick={() => setShowPortraitModal(true)}
            />
          </EditModeProvider>

          {/* Actions Panel (for standalone characters) */}
          {isStandalone && (
            <div className="mt-8 pt-6 border-t-4 border-fantasy-stone">
              <div className="flex items-center justify-between">
                <div className="text-fantasy-stone text-sm">
                  Created {new Date(character.created_at).toLocaleDateString()}
                </div>

                {showDeleteConfirm ? (
                  <div className="flex items-center gap-4">
                    <span className="text-fantasy-tan text-sm">
                      Delete <span className="text-white font-bold">{character.name}</span>?
                    </span>
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
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-400 hover:text-red-300 text-sm transition-colors"
                  >
                    Delete Character
                  </button>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Portrait Modal */}
        {showPortraitModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-fantasy-brown border-4 border-fantasy-tan rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-fantasy-gold">Character Portrait</h3>
                <button
                  onClick={() => setShowPortraitModal(false)}
                  className="text-fantasy-stone hover:text-white text-2xl"
                >
                  &times;
                </button>
              </div>

              <PortraitGenerator
                characterId={character.id}
                characterName={character.name}
                currentPortraitUrl={character.portrait_url}
                onPortraitUpdated={handlePortraitUpdated}
              />
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}

// Wrapper with Suspense for useSearchParams
export default function CharacterDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-fantasy-dark flex items-center justify-center">
        <div className="text-fantasy-tan">Loading character...</div>
      </div>
    }>
      <CharacterDetailContent />
    </Suspense>
  )
}
