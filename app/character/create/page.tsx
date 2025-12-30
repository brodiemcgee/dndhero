'use client'

/**
 * Standalone Character Creation Page
 * Creates a character that can be used across multiple campaigns
 * Optional ?campaign= param to auto-assign to a campaign after creation
 */

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { PixelButton } from '@/components/ui/PixelButton'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { AppearanceStep } from '@/components/character/AppearanceStep'
import { SpellSelectionStep } from '@/components/character/SpellSelectionStep'
import { RaceSelector } from '@/components/character/create/RaceSelector'
import { ClassSelector } from '@/components/character/create/ClassSelector'
import { CharacterSheetPreview } from '@/components/character/create/CharacterSheetPreview'
import { HUMAN } from '@/data/character-options/races'
import { FIGHTER } from '@/data/character-options/classes'
import type { Race, Subrace, DndClass } from '@/types/character-options'
import { hasSubraces } from '@/lib/character/stats-calculator'

// D&D 5e data
const RACES = [
  'Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn', 'Gnome',
  'Half-Elf', 'Half-Orc', 'Tiefling'
]

const CLASSES = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk',
  'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'
]

const BACKGROUNDS = [
  'Acolyte', 'Charlatan', 'Criminal', 'Entertainer', 'Folk Hero',
  'Guild Artisan', 'Hermit', 'Noble', 'Outlander', 'Sage',
  'Sailor', 'Soldier', 'Urchin'
]

const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
]

const SKILLS = [
  'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception',
  'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine',
  'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion',
  'Sleight of Hand', 'Stealth', 'Survival'
]

const ABILITY_GENERATION_METHODS = [
  { id: 'standard', name: 'Standard Array', description: '15, 14, 13, 12, 10, 8' },
  { id: 'point_buy', name: 'Point Buy', description: '27 points to distribute' },
  { id: 'manual', name: 'Manual Entry', description: 'Enter your own scores' },
]

// Class skill proficiencies
const CLASS_SKILLS: Record<string, { count: number; options: string[] }> = {
  Barbarian: { count: 2, options: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'] },
  Bard: { count: 3, options: SKILLS },
  Cleric: { count: 2, options: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'] },
  Druid: { count: 2, options: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'] },
  Fighter: { count: 2, options: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'] },
  Monk: { count: 2, options: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'] },
  Paladin: { count: 2, options: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'] },
  Ranger: { count: 3, options: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'] },
  Rogue: { count: 4, options: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'] },
  Sorcerer: { count: 2, options: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'] },
  Warlock: { count: 2, options: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'] },
  Wizard: { count: 2, options: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'] },
}

// Class saving throw proficiencies
const CLASS_SAVES: Record<string, string[]> = {
  Barbarian: ['strength', 'constitution'],
  Bard: ['dexterity', 'charisma'],
  Cleric: ['wisdom', 'charisma'],
  Druid: ['intelligence', 'wisdom'],
  Fighter: ['strength', 'constitution'],
  Monk: ['strength', 'dexterity'],
  Paladin: ['wisdom', 'charisma'],
  Ranger: ['strength', 'dexterity'],
  Rogue: ['dexterity', 'intelligence'],
  Sorcerer: ['constitution', 'charisma'],
  Warlock: ['wisdom', 'charisma'],
  Wizard: ['intelligence', 'wisdom'],
}

// Spellcasting classes
const SPELLCASTING_ABILITY: Record<string, 'intelligence' | 'wisdom' | 'charisma' | null> = {
  Barbarian: null,
  Bard: 'charisma',
  Cleric: 'wisdom',
  Druid: 'wisdom',
  Fighter: null,
  Monk: null,
  Paladin: 'charisma',
  Ranger: 'wisdom',
  Rogue: null,
  Sorcerer: 'charisma',
  Warlock: 'charisma',
  Wizard: 'intelligence',
}

interface CharacterData {
  name: string
  race: Race | null
  subrace: Subrace | null
  dndClass: DndClass | null
  background: string
  alignment: string
  level: number
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  max_hp: number
  armor_class: number
  skill_proficiencies: string[]
  saving_throw_proficiencies: string[]
  spellcasting_ability?: 'intelligence' | 'wisdom' | 'charisma'
  cantrips: string[]
  known_spells: string[]
  prepared_spells: string[]
  // Appearance
  gender: string
  age: string
  height: string
  build: string
  skin_tone: string
  hair_color: string
  hair_style: string
  eye_color: string
  distinguishing_features: string
  clothing_style: string
  // Personality
  personality_traits: string
  ideals: string
  bonds: string
  flaws: string
}

function StandaloneCharacterCreateContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const campaignId = searchParams.get('campaign') // Optional campaign to assign to

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [abilityMethod, setAbilityMethod] = useState('standard')

  const [character, setCharacter] = useState<CharacterData>({
    name: '',
    race: HUMAN,
    subrace: null,
    dndClass: FIGHTER,
    background: 'Folk Hero',
    alignment: 'Neutral Good',
    level: 1,
    strength: 15,
    dexterity: 14,
    constitution: 13,
    intelligence: 12,
    wisdom: 10,
    charisma: 8,
    max_hp: 10,
    armor_class: 10,
    skill_proficiencies: [],
    saving_throw_proficiencies: [],
    cantrips: [],
    known_spells: [],
    prepared_spells: [],
    // Appearance
    gender: '',
    age: '',
    height: '',
    build: '',
    skin_tone: '',
    hair_color: '',
    hair_style: '',
    eye_color: '',
    distinguishing_features: '',
    clothing_style: '',
    // Personality
    personality_traits: '',
    ideals: '',
    bonds: '',
    flaws: '',
  })

  // Calculate ability modifier
  const getModifier = (score: number): number => Math.floor((score - 10) / 2)

  // Calculate HP based on class and CON
  useEffect(() => {
    const hitDice: Record<string, number> = {
      Barbarian: 12, Bard: 8, Cleric: 8, Druid: 8, Fighter: 10, Monk: 8,
      Paladin: 10, Ranger: 10, Rogue: 8, Sorcerer: 6, Warlock: 8, Wizard: 6,
    }
    const className = character.dndClass?.name ?? ''
    const baseHP = hitDice[className] || 8
    const conMod = getModifier(character.constitution)
    setCharacter(prev => ({ ...prev, max_hp: baseHP + conMod }))
  }, [character.dndClass, character.constitution])

  // Calculate AC based on DEX
  useEffect(() => {
    const dexMod = getModifier(character.dexterity)
    setCharacter(prev => ({ ...prev, armor_class: 10 + dexMod }))
  }, [character.dexterity])

  // Auto-assign saving throw proficiencies based on class
  useEffect(() => {
    if (character.dndClass) {
      const className = character.dndClass.name
      setCharacter(prev => ({
        ...prev,
        saving_throw_proficiencies: CLASS_SAVES[className] || [],
      }))
    }
  }, [character.dndClass])

  // Auto-assign spellcasting ability
  useEffect(() => {
    const className = character.dndClass?.name ?? ''
    const ability = SPELLCASTING_ABILITY[className]
    setCharacter(prev => ({
      ...prev,
      spellcasting_ability: ability || undefined,
    }))
  }, [character.dndClass])

  const handleAbilityMethodChange = (method: string) => {
    setAbilityMethod(method)
    if (method === 'standard') {
      setCharacter(prev => ({
        ...prev,
        strength: 15, dexterity: 14, constitution: 13,
        intelligence: 12, wisdom: 10, charisma: 8,
      }))
    } else if (method === 'point_buy') {
      setCharacter(prev => ({
        ...prev,
        strength: 8, dexterity: 8, constitution: 8,
        intelligence: 8, wisdom: 8, charisma: 8,
      }))
    }
  }

  const toggleSkill = (skill: string) => {
    const className = character.dndClass?.name ?? ''
    const maxSkills = CLASS_SKILLS[className]?.count || 2
    setCharacter(prev => {
      const current = prev.skill_proficiencies
      if (current.includes(skill)) {
        return { ...prev, skill_proficiencies: current.filter(s => s !== skill) }
      } else if (current.length < maxSkills) {
        return { ...prev, skill_proficiencies: [...current, skill] }
      }
      return prev
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      // Convert character data for API (objects to strings)
      const { race, subrace, dndClass, ...rest } = character
      const apiData = {
        ...rest,
        race: race?.name ?? '',
        class: dndClass?.name ?? '',
        // Include campaign_id if provided
        ...(campaignId ? { campaign_id: campaignId } : {}),
      }

      const response = await fetch('/api/character/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create character')
      }

      // Redirect to character detail page to see the full character sheet and auto-generate portrait
      // The ?new=true param triggers portrait generation on first load
      const characterId = data.character?.id || data.id
      if (characterId) {
        window.location.href = `/character/${characterId}?new=true${campaignId ? `&campaign=${campaignId}` : ''}`
      } else if (campaignId) {
        window.location.href = `/campaign/${campaignId}/lobby`
      } else {
        window.location.href = '/dashboard'
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const classNameForSkills = character.dndClass?.name ?? ''
  const availableSkills = CLASS_SKILLS[classNameForSkills]?.options || SKILLS
  const maxSkills = CLASS_SKILLS[classNameForSkills]?.count || 2

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back link */}
          <Link
            href={campaignId ? `/campaign/${campaignId}/lobby` : '/dashboard'}
            className="text-amber-400 hover:text-amber-300 mb-4 inline-block"
          >
            ← {campaignId ? 'Back to Campaign' : 'Back to Dashboard'}
          </Link>

          <PixelPanel>
            <div className="p-8">
              {/* Header */}
              <div className="mb-8">
                <h1 className="font-['Press_Start_2P'] text-3xl text-amber-400 mb-2">
                  Create Character
                </h1>
                <p className="text-gray-400">
                  Step {step} of 8
                  {campaignId && (
                    <span className="ml-2 text-amber-400">
                      (will be assigned to campaign)
                    </span>
                  )}
                </p>
              </div>

              {/* Progress bar */}
              <div className="mb-8 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${(step / 8) * 100}%` }}
                />
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-900/50 border-2 border-red-500 rounded text-red-200">
                  {error}
                </div>
              )}

              {/* Step 1: Name & Race */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-amber-300 mb-2">Character Name</label>
                    <input
                      type="text"
                      value={character.name}
                      onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-800 border-2 border-amber-700 rounded text-white"
                      placeholder="Enter name..."
                    />
                  </div>

                  <RaceSelector
                    selectedRace={character.race}
                    selectedSubrace={character.subrace}
                    onRaceSelect={(race) => setCharacter(prev => ({ ...prev, race, subrace: null }))}
                    onSubraceSelect={(subrace) => setCharacter(prev => ({ ...prev, subrace }))}
                  />
                </div>
              )}

              {/* Step 2: Class */}
              {step === 2 && (
                <div className="space-y-6">
                  <ClassSelector
                    selectedClass={character.dndClass}
                    onClassSelect={(dndClass) => setCharacter(prev => ({ ...prev, dndClass }))}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-amber-300 mb-2">Background</label>
                      <select
                        value={character.background}
                        onChange={(e) => setCharacter(prev => ({ ...prev, background: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-800 border-2 border-amber-700 rounded text-white"
                      >
                        {BACKGROUNDS.map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-amber-300 mb-2">Alignment</label>
                      <select
                        value={character.alignment}
                        onChange={(e) => setCharacter(prev => ({ ...prev, alignment: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-800 border-2 border-amber-700 rounded text-white"
                      >
                        {ALIGNMENTS.map(align => (
                          <option key={align} value={align}>{align}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Ability Scores */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
                    Ability Scores
                  </h2>

                  <div>
                    <label className="block text-amber-300 mb-2">Generation Method</label>
                    <div className="space-y-2">
                      {ABILITY_GENERATION_METHODS.map(method => (
                        <button
                          key={method.id}
                          onClick={() => handleAbilityMethodChange(method.id)}
                          className={`w-full p-4 border-2 rounded text-left transition-colors ${
                            abilityMethod === method.id
                              ? 'border-amber-500 bg-amber-900/30'
                              : 'border-gray-700 bg-gray-800 hover:border-amber-700'
                          }`}
                        >
                          <div className="font-bold text-amber-300">{method.name}</div>
                          <div className="text-sm text-gray-400">{method.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(ability => (
                      <div key={ability}>
                        <label className="block text-amber-300 mb-2 capitalize">
                          {ability} ({getModifier(character[ability as keyof CharacterData] as number) >= 0 ? '+' : ''}
                          {getModifier(character[ability as keyof CharacterData] as number)})
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={character[ability as keyof CharacterData] as number}
                          onChange={(e) => setCharacter(prev => ({
                            ...prev,
                            [ability]: parseInt(e.target.value) || 8
                          }))}
                          className="w-full px-4 py-2 bg-gray-800 border-2 border-amber-700 rounded text-white text-center text-2xl font-bold"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-gray-800 border-2 border-amber-700 rounded">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-amber-300">HP:</span> {character.max_hp}
                      </div>
                      <div>
                        <span className="text-amber-300">AC:</span> {character.armor_class}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Skills */}
              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
                    Skills & Proficiencies
                  </h2>

                  <p className="text-gray-400">
                    Choose {maxSkills} skill proficiencies ({character.skill_proficiencies.length} / {maxSkills} selected)
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {availableSkills.map(skill => {
                      const isSelected = character.skill_proficiencies.includes(skill)
                      return (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={`p-3 border-2 rounded text-left transition-colors ${
                            isSelected
                              ? 'border-amber-500 bg-amber-900/30'
                              : 'border-gray-700 bg-gray-800 hover:border-amber-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{skill}</span>
                            {isSelected && <span className="text-amber-500">&#10003;</span>}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-8">
                    <h3 className="text-amber-300 mb-2">Saving Throw Proficiencies</h3>
                    <div className="flex flex-wrap gap-2">
                      {character.saving_throw_proficiencies.map(save => (
                        <span key={save} className="px-3 py-1 bg-amber-900/30 border border-amber-700 rounded capitalize">
                          {save}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Appearance */}
              {step === 5 && (
                <AppearanceStep
                  data={{
                    gender: character.gender,
                    age: character.age,
                    height: character.height,
                    build: character.build,
                    skin_tone: character.skin_tone,
                    hair_color: character.hair_color,
                    hair_style: character.hair_style,
                    eye_color: character.eye_color,
                    distinguishing_features: character.distinguishing_features,
                    clothing_style: character.clothing_style,
                  }}
                  race={character.race?.name ?? ''}
                  onChange={(field, value) => setCharacter(prev => ({ ...prev, [field]: value }))}
                />
              )}

              {/* Step 6: Personality */}
              {step === 6 && (
                <div className="space-y-6">
                  <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
                    Personality
                  </h2>

                  <div>
                    <label className="block text-amber-300 mb-2">Personality Traits</label>
                    <textarea
                      value={character.personality_traits}
                      onChange={(e) => setCharacter(prev => ({ ...prev, personality_traits: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-800 border-2 border-amber-700 rounded text-white h-24"
                      placeholder="Describe your character's personality..."
                    />
                  </div>

                  <div>
                    <label className="block text-amber-300 mb-2">Ideals</label>
                    <textarea
                      value={character.ideals}
                      onChange={(e) => setCharacter(prev => ({ ...prev, ideals: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-800 border-2 border-amber-700 rounded text-white h-24"
                      placeholder="What does your character believe in?"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-300 mb-2">Bonds</label>
                    <textarea
                      value={character.bonds}
                      onChange={(e) => setCharacter(prev => ({ ...prev, bonds: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-800 border-2 border-amber-700 rounded text-white h-24"
                      placeholder="What ties your character to the world?"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-300 mb-2">Flaws</label>
                    <textarea
                      value={character.flaws}
                      onChange={(e) => setCharacter(prev => ({ ...prev, flaws: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-800 border-2 border-amber-700 rounded text-white h-24"
                      placeholder="What are your character's weaknesses?"
                    />
                  </div>
                </div>
              )}

              {/* Step 7: Spells */}
              {step === 7 && (
                <SpellSelectionStep
                  characterClass={character.dndClass?.name ?? ''}
                  characterLevel={character.level}
                  abilityScores={{
                    strength: character.strength,
                    dexterity: character.dexterity,
                    constitution: character.constitution,
                    intelligence: character.intelligence,
                    wisdom: character.wisdom,
                    charisma: character.charisma,
                  }}
                  selectedCantrips={character.cantrips}
                  selectedSpells={character.known_spells}
                  onCantripChange={(cantrips) => setCharacter(prev => ({ ...prev, cantrips }))}
                  onSpellChange={(spells) => setCharacter(prev => ({
                    ...prev,
                    known_spells: spells,
                    prepared_spells: spells, // For prepared casters, initial prepared = known
                  }))}
                />
              )}

              {/* Step 8: Review - Character Sheet Preview */}
              {step === 8 && (
                <CharacterSheetPreview character={character} campaignId={campaignId} />
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between mt-8">
                <PixelButton
                  onClick={() => setStep(s => Math.max(1, s - 1))}
                  disabled={step === 1}
                  variant="secondary"
                >
                  Back
                </PixelButton>

                {step < 8 ? (
                  <PixelButton
                    onClick={() => setStep(s => s + 1)}
                    disabled={(step === 1 && !character.name) || (step === 1 && character.race !== null && hasSubraces(character.race) && character.subrace === null)}
                  >
                    Next
                  </PixelButton>
                ) : (
                  <PixelButton
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Character'}
                  </PixelButton>
                )}
              </div>
            </div>
          </PixelPanel>
        </div>
      </div>
    </AuthGuard>
  )
}

// Wrapper component with Suspense boundary for useSearchParams
export default function StandaloneCharacterCreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-amber-400">Loading...</div>
      </div>
    }>
      <StandaloneCharacterCreateContent />
    </Suspense>
  )
}
