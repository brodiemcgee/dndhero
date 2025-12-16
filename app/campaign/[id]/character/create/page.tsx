'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PixelButton } from '@/components/ui/PixelButton'
import { PixelPanel } from '@/components/ui/PixelPanel'

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

const SAVING_THROWS = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']

const ABILITY_GENERATION_METHODS = [
  { id: 'standard', name: 'Standard Array', description: '15, 14, 13, 12, 10, 8' },
  { id: 'point_buy', name: 'Point Buy', description: '27 points to distribute' },
  { id: 'manual', name: 'Manual Entry', description: 'Enter your own scores' },
]

// Class skill proficiencies (simplified)
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
  race: string
  class: string
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
  known_spells: string[]

  personality_traits: string
  ideals: string
  bonds: string
  flaws: string
}

export default function CharacterCreatePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [abilityMethod, setAbilityMethod] = useState('standard')

  const [character, setCharacter] = useState<CharacterData>({
    name: '',
    race: 'Human',
    class: 'Fighter',
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
    known_spells: [],
    personality_traits: '',
    ideals: '',
    bonds: '',
    flaws: '',
  })

  // Calculate ability modifier
  const getModifier = (score: number): number => {
    return Math.floor((score - 10) / 2)
  }

  // Calculate HP based on class and CON
  useEffect(() => {
    const hitDice: Record<string, number> = {
      Barbarian: 12, Bard: 8, Cleric: 8, Druid: 8, Fighter: 10, Monk: 8,
      Paladin: 10, Ranger: 10, Rogue: 8, Sorcerer: 6, Warlock: 8, Wizard: 6,
    }
    const baseHP = hitDice[character.class] || 8
    const conMod = getModifier(character.constitution)
    setCharacter(prev => ({ ...prev, max_hp: baseHP + conMod }))
  }, [character.class, character.constitution])

  // Calculate AC based on DEX
  useEffect(() => {
    const dexMod = getModifier(character.dexterity)
    setCharacter(prev => ({ ...prev, armor_class: 10 + dexMod }))
  }, [character.dexterity])

  // Auto-assign saving throw proficiencies based on class
  useEffect(() => {
    if (character.class) {
      setCharacter(prev => ({
        ...prev,
        saving_throw_proficiencies: CLASS_SAVES[character.class] || [],
      }))
    }
  }, [character.class])

  // Auto-assign spellcasting ability
  useEffect(() => {
    const ability = SPELLCASTING_ABILITY[character.class]
    setCharacter(prev => ({
      ...prev,
      spellcasting_ability: ability || undefined,
    }))
  }, [character.class])

  const handleAbilityMethodChange = (method: string) => {
    setAbilityMethod(method)
    if (method === 'standard') {
      setCharacter(prev => ({
        ...prev,
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8,
      }))
    } else if (method === 'point_buy') {
      setCharacter(prev => ({
        ...prev,
        strength: 8,
        dexterity: 8,
        constitution: 8,
        intelligence: 8,
        wisdom: 8,
        charisma: 8,
      }))
    }
  }

  const toggleSkill = (skill: string) => {
    const maxSkills = CLASS_SKILLS[character.class]?.count || 2
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
      const response = await fetch('/api/character/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: params.id,
          ...character,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create character')
      }

      // Redirect to campaign lobby
      router.push(`/campaign/${params.id}/lobby`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const availableSkills = CLASS_SKILLS[character.class]?.options || SKILLS
  const maxSkills = CLASS_SKILLS[character.class]?.count || 2
  const isSpellcaster = SPELLCASTING_ABILITY[character.class] !== null

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <PixelPanel>
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-['Press_Start_2P'] text-3xl text-amber-400 mb-2">
                Create Character
              </h1>
              <p className="text-gray-400">Step {step} of 5</p>
            </div>

            {/* Progress bar */}
            <div className="mb-8 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-900/50 border-2 border-red-500 rounded text-red-200">
                {error}
              </div>
            )}

            {/* Step 1: Basics */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
                  The Basics
                </h2>

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

                <div>
                  <label className="block text-amber-300 mb-2">Race</label>
                  <select
                    value={character.race}
                    onChange={(e) => setCharacter(prev => ({ ...prev, race: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-800 border-2 border-amber-700 rounded text-white"
                  >
                    {RACES.map(race => (
                      <option key={race} value={race}>{race}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-amber-300 mb-2">Class</label>
                  <select
                    value={character.class}
                    onChange={(e) => setCharacter(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-800 border-2 border-amber-700 rounded text-white"
                  >
                    {CLASSES.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

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
            )}

            {/* Step 2: Ability Scores */}
            {step === 2 && (
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
                        value={character[ability as keyof CharacterData]}
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

            {/* Step 3: Skills */}
            {step === 3 && (
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
                    const isAvailable = availableSkills.includes(skill)
                    return (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        disabled={!isAvailable && !isSelected}
                        className={`p-3 border-2 rounded text-left transition-colors ${
                          isSelected
                            ? 'border-amber-500 bg-amber-900/30'
                            : isAvailable
                            ? 'border-gray-700 bg-gray-800 hover:border-amber-700'
                            : 'border-gray-800 bg-gray-900 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{skill}</span>
                          {isSelected && <span className="text-amber-500">✓</span>}
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

            {/* Step 4: Personality */}
            {step === 4 && (
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

            {/* Step 5: Review */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
                  Review Character
                </h2>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-amber-300 mb-2">Basic Info</h3>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-gray-400">Name:</span> {character.name}</div>
                      <div><span className="text-gray-400">Race:</span> {character.race}</div>
                      <div><span className="text-gray-400">Class:</span> {character.class}</div>
                      <div><span className="text-gray-400">Background:</span> {character.background}</div>
                      <div><span className="text-gray-400">Level:</span> {character.level}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-amber-300 mb-2">Stats</h3>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-gray-400">HP:</span> {character.max_hp}</div>
                      <div><span className="text-gray-400">AC:</span> {character.armor_class}</div>
                      <div><span className="text-gray-400">STR:</span> {character.strength} ({getModifier(character.strength) >= 0 ? '+' : ''}{getModifier(character.strength)})</div>
                      <div><span className="text-gray-400">DEX:</span> {character.dexterity} ({getModifier(character.dexterity) >= 0 ? '+' : ''}{getModifier(character.dexterity)})</div>
                      <div><span className="text-gray-400">CON:</span> {character.constitution} ({getModifier(character.constitution) >= 0 ? '+' : ''}{getModifier(character.constitution)})</div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <h3 className="text-amber-300 mb-2">Skill Proficiencies</h3>
                    <div className="flex flex-wrap gap-2">
                      {character.skill_proficiencies.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-amber-900/30 border border-amber-700 rounded text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
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

              {step < 5 ? (
                <PixelButton
                  onClick={() => setStep(s => s + 1)}
                  disabled={step === 1 && !character.name}
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
  )
}
