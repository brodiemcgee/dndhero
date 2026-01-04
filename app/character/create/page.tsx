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
import { StartingLevelSelector } from '@/components/character/create/StartingLevelSelector'
import { SubclassSelector } from '@/components/character/create/SubclassSelector'
import { ASIFeatSelector, type ASIChoice } from '@/components/character/create/ASIFeatSelector'
import { HPCalculator, type HPChoice } from '@/components/character/create/HPCalculator'
import { getSubclassLevel } from '@/data/character-options/subclasses'
import { ASI_LEVELS } from '@/lib/engine/progression/class-features'
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
  subclass: string | null
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
  // Higher level features
  asiChoices: ASIChoice[]
  hpChoices: HPChoice[]
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

  // Portrait generation state
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null)
  const [generatingPortrait, setGeneratingPortrait] = useState(false)
  const [portraitGenerated, setPortraitGenerated] = useState(false)

  const [character, setCharacter] = useState<CharacterData>({
    name: '',
    race: HUMAN,
    subrace: null,
    dndClass: FIGHTER,
    background: 'Folk Hero',
    alignment: 'Neutral Good',
    level: 1,
    subclass: null,
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
    // Higher level features
    asiChoices: [],
    hpChoices: [],
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

  // Determine which conditional steps should be shown
  const stepConfig = useMemo(() => {
    const className = character.dndClass?.name || 'Fighter'
    const level = character.level

    // Check if subclass selection is needed
    const subclassLevel = getSubclassLevel(className)
    const needsSubclass = level >= subclassLevel

    // Check if ASI selection is needed
    const asiLevels = ASI_LEVELS[className] || [4, 8, 12, 16, 19]
    const needsASI = level >= asiLevels[0]

    // Check if HP calculator should be shown (for levels > 1)
    const needsHPCalculator = level > 1

    // Build dynamic step list
    // Base steps: 1. Name/Race, 2. Class, [3. Subclass?], 4. Abilities, [5. ASI?], [6. HP?], 7. Skills, 8. Appearance, 9. Personality, 10. Spells, 11. Review
    const steps: { id: string; title: string }[] = [
      { id: 'name-race', title: 'Name & Race' },
      { id: 'class', title: 'Class' },
    ]

    if (needsSubclass) {
      steps.push({ id: 'subclass', title: 'Subclass' })
    }

    steps.push({ id: 'abilities', title: 'Ability Scores' })

    if (needsASI) {
      steps.push({ id: 'asi', title: 'ASI & Feats' })
    }

    if (needsHPCalculator) {
      steps.push({ id: 'hp', title: 'Hit Points' })
    }

    steps.push(
      { id: 'skills', title: 'Skills' },
      { id: 'appearance', title: 'Appearance' },
      { id: 'personality', title: 'Personality' },
      { id: 'spells', title: 'Spells' },
      { id: 'review', title: 'Review' }
    )

    return { steps, needsSubclass, needsASI, needsHPCalculator }
  }, [character.dndClass, character.level])

  const totalSteps = stepConfig.steps.length
  const currentStepId = stepConfig.steps[step - 1]?.id || 'name-race'

  // Calculate HP based on class, CON, level, and hpChoices
  // Level 1: Max hit die + CON mod
  // Levels 2+: Use hpChoices if available, otherwise average hit die (rounded up) + CON mod per level
  useEffect(() => {
    const hitDice: Record<string, number> = {
      Barbarian: 12, Bard: 8, Cleric: 8, Druid: 8, Fighter: 10, Monk: 8,
      Paladin: 10, Ranger: 10, Rogue: 8, Sorcerer: 6, Warlock: 8, Wizard: 6,
    }
    const className = character.dndClass?.name ?? ''
    const hitDie = hitDice[className] || 8
    const conMod = getModifier(character.constitution)
    const avgHitDie = Math.ceil((hitDie / 2) + 0.5)

    let totalHP = 0

    for (let level = 1; level <= character.level; level++) {
      const hpChoice = character.hpChoices.find(c => c.level === level)

      if (level === 1) {
        // Level 1: Always max hit die + CON mod
        totalHP += Math.max(1, hitDie + conMod)
      } else if (hpChoice && hpChoice.method === 'roll' && hpChoice.rolledValue !== undefined) {
        // Use rolled value
        totalHP += Math.max(1, hpChoice.rolledValue + conMod)
      } else {
        // Default to average
        totalHP += Math.max(1, avgHitDie + conMod)
      }
    }

    // HP can't go below 1 per level
    totalHP = Math.max(totalHP, character.level)

    setCharacter(prev => ({ ...prev, max_hp: totalHP }))
  }, [character.dndClass, character.constitution, character.level, character.hpChoices])

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

  // Generate portrait when leaving the Appearance step (step 5)
  const generatePortrait = async () => {
    // Don't regenerate if already generated or generating
    if (portraitGenerated || generatingPortrait) return

    // Check if we have enough appearance data
    if (!character.race || !character.dndClass) return

    setGeneratingPortrait(true)

    try {
      const response = await fetch('/api/portrait/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: character.name,
          race: character.subrace ? `${character.subrace.name} ${character.race.name}` : character.race.name,
          class: character.dndClass.name,
          background: character.background,
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
        }),
      })

      const data = await response.json()

      if (response.ok && data.portrait_data) {
        setPortraitUrl(data.portrait_data)
        setPortraitGenerated(true)
      } else {
        // Silently fail - portrait is optional
        console.error('Portrait generation failed:', data.error)
      }
    } catch (err) {
      console.error('Portrait generation error:', err)
    } finally {
      setGeneratingPortrait(false)
    }
  }

  // Trigger portrait generation when moving forward from Appearance step
  const handleStepChange = (newStep: number) => {
    // If moving forward from Appearance step, trigger portrait generation
    if (currentStepId === 'appearance' && newStep > step && !portraitGenerated && !generatingPortrait) {
      generatePortrait()
    }
    setStep(newStep)
  }

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

      const characterId = data.character?.id || data.id

      // If we have a generated portrait, upload it to the character
      if (characterId && portraitUrl && portraitUrl.startsWith('data:')) {
        try {
          // Convert base64 data URL to blob
          const base64Data = portraitUrl.split(',')[1]
          const mimeType = portraitUrl.split(';')[0].split(':')[1]
          const byteCharacters = atob(base64Data)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], { type: mimeType })

          // Upload the portrait
          const formData = new FormData()
          formData.append('file', blob, 'portrait.png')

          await fetch(`/api/characters/${characterId}/portrait/upload`, {
            method: 'POST',
            body: formData,
          })
          // Portrait upload is best-effort, don't fail if it doesn't work
        } catch (uploadErr) {
          console.error('Portrait upload error:', uploadErr)
        }
      }

      // Redirect to character detail page
      // Only pass new=true if we don't have a portrait yet (to trigger auto-generation)
      const needsPortrait = !portraitUrl
      if (characterId) {
        window.location.href = `/character/${characterId}?new=true${needsPortrait ? '' : '&hasPortrait=true'}${campaignId ? `&campaign=${campaignId}` : ''}`
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
                  Step {step} of {totalSteps}: {stepConfig.steps[step - 1]?.title}
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
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-900/50 border-2 border-red-500 rounded text-red-200">
                  {error}
                </div>
              )}

              {/* Step: Name & Race */}
              {currentStepId === 'name-race' && (
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

              {/* Step: Class */}
              {currentStepId === 'class' && (
                <div className="space-y-6">
                  <ClassSelector
                    selectedClass={character.dndClass}
                    onClassSelect={(dndClass) => setCharacter(prev => ({ ...prev, dndClass }))}
                  />

                  {/* Starting Level Selection */}
                  <div className="border-t border-amber-700 pt-4">
                    <StartingLevelSelector
                      level={character.level}
                      characterClass={character.dndClass?.name || 'Fighter'}
                      onChange={(level) => setCharacter(prev => ({ ...prev, level }))}
                    />
                  </div>

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

              {/* Step: Subclass (conditional) */}
              {currentStepId === 'subclass' && (
                <SubclassSelector
                  characterClass={character.dndClass?.name || 'Fighter'}
                  selectedSubclass={character.subclass}
                  onSubclassSelect={(subclass) => setCharacter(prev => ({ ...prev, subclass }))}
                  characterLevel={character.level}
                />
              )}

              {/* Step: Ability Scores */}
              {currentStepId === 'abilities' && (
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

              {/* Step: ASI & Feats (conditional) */}
              {currentStepId === 'asi' && (
                <ASIFeatSelector
                  characterClass={character.dndClass?.name || 'Fighter'}
                  characterLevel={character.level}
                  currentAbilities={{
                    strength: character.strength,
                    dexterity: character.dexterity,
                    constitution: character.constitution,
                    intelligence: character.intelligence,
                    wisdom: character.wisdom,
                    charisma: character.charisma,
                  }}
                  asiChoices={character.asiChoices}
                  onChoicesChange={(asiChoices) => setCharacter(prev => ({ ...prev, asiChoices }))}
                  hasSpellcasting={!!character.spellcasting_ability}
                  proficiencies={character.skill_proficiencies}
                />
              )}

              {/* Step: Hit Points (conditional for level > 1) */}
              {currentStepId === 'hp' && (
                <HPCalculator
                  characterClass={character.dndClass?.name || 'Fighter'}
                  characterLevel={character.level}
                  constitutionModifier={getModifier(character.constitution)}
                  hpChoices={character.hpChoices}
                  onChoicesChange={(hpChoices) => setCharacter(prev => ({ ...prev, hpChoices }))}
                />
              )}

              {/* Step: Skills */}
              {currentStepId === 'skills' && (
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

              {/* Step: Appearance */}
              {currentStepId === 'appearance' && (
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

              {/* Step: Personality */}
              {currentStepId === 'personality' && (
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

              {/* Step: Spells */}
              {currentStepId === 'spells' && (
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

              {/* Step: Review - Character Sheet Preview */}
              {currentStepId === 'review' && (
                <CharacterSheetPreview
                  character={character}
                  campaignId={campaignId}
                  portraitUrl={portraitUrl}
                  generatingPortrait={generatingPortrait}
                />
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between mt-8">
                <PixelButton
                  onClick={() => handleStepChange(Math.max(1, step - 1))}
                  disabled={step === 1}
                  variant="secondary"
                >
                  Back
                </PixelButton>

                {step < totalSteps ? (
                  <PixelButton
                    onClick={() => handleStepChange(step + 1)}
                    disabled={
                      (currentStepId === 'name-race' && !character.name) ||
                      (currentStepId === 'name-race' && character.race !== null && hasSubraces(character.race) && character.subrace === null) ||
                      (currentStepId === 'subclass' && stepConfig.needsSubclass && !character.subclass)
                    }
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
