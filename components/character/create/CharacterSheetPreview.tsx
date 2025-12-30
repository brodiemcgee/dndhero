'use client'

/**
 * CharacterSheetPreview Component
 * Displays a D&D-style character sheet preview during character creation
 * Shows all selected options before final submission
 */

import { useMemo } from 'react'
import type { Race, Subrace, DndClass } from '@/types/character-options'

// Character data from the creation wizard
interface CharacterPreviewData {
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
  cantrips: string[]
  known_spells: string[]
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

interface CharacterSheetPreviewProps {
  character: CharacterPreviewData
  campaignId?: string | null
  portraitUrl?: string | null
  generatingPortrait?: boolean
}

export function CharacterSheetPreview({ character, campaignId, portraitUrl, generatingPortrait }: CharacterSheetPreviewProps) {
  const getModifier = (score: number): number => Math.floor((score - 10) / 2)
  const formatModifier = (mod: number): string => mod >= 0 ? `+${mod}` : `${mod}`

  // Get hit die from class
  const hitDie = character.dndClass?.hitDie || 'd8'

  // Get speed from race
  const speed = character.race?.speed || 30

  // Check if spellcaster
  const isSpellcaster = character.dndClass?.spellcasting !== undefined

  // Calculate proficiency bonus (always +2 at level 1)
  const proficiencyBonus = 2

  // Calculate passive perception
  const passivePerception = useMemo(() => {
    const wisdomMod = getModifier(character.wisdom)
    const hasProficiency = character.skill_proficiencies.includes('Perception')
    return 10 + wisdomMod + (hasProficiency ? proficiencyBonus : 0)
  }, [character.wisdom, character.skill_proficiencies, proficiencyBonus])

  // Combine race name with subrace
  const fullRaceName = character.subrace
    ? `${character.subrace.name} ${character.race?.name}`
    : character.race?.name || 'Unknown'

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-amber-900/80 to-amber-800/60 border-4 border-amber-600 rounded-lg p-4">
        <div className="flex gap-6">
          {/* Portrait */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 border-4 border-amber-500 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
              {generatingPortrait ? (
                <div className="text-center p-2">
                  <div className="text-4xl animate-spin mb-1">&#9881;</div>
                  <div className="text-xs text-purple-400">Generating<br/>portrait...</div>
                </div>
              ) : portraitUrl ? (
                <img
                  src={portraitUrl}
                  alt={`${character.name || 'Character'} portrait`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2">
                  <div className="text-5xl text-amber-500/50 mb-1">&#128100;</div>
                  <div className="text-xs text-amber-400/70">No portrait</div>
                </div>
              )}
            </div>
          </div>

          {/* Character Info */}
          <div className="flex-1 min-w-0">
            <div className="mb-3">
              <h1 className="text-3xl md:text-4xl font-bold text-amber-300 truncate">
                {character.name || 'Unnamed Hero'}
              </h1>
              <p className="text-amber-100/80 text-lg">
                Level {character.level} {fullRaceName} {character.dndClass?.name || 'Unknown Class'}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <InfoBox label="Background" value={character.background} />
              <InfoBox label="Alignment" value={character.alignment} />
              <InfoBox label="Hit Dice" value={`${character.level}${hitDie}`} />
              <InfoBox label="Proficiency" value={`+${proficiencyBonus}`} highlight />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Ability Scores */}
          <SectionPanel title="Ability Scores">
            <div className="grid grid-cols-3 gap-2">
              {(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const).map(ability => (
                <AbilityScoreBox
                  key={ability}
                  ability={ability}
                  score={character[ability]}
                  modifier={getModifier(character[ability])}
                />
              ))}
            </div>
          </SectionPanel>

          {/* Combat Stats */}
          <SectionPanel title="Combat">
            <div className="grid grid-cols-4 gap-3">
              <StatBox label="HP" value={character.max_hp} color="red" />
              <StatBox label="AC" value={character.armor_class} color="blue" />
              <StatBox label="Speed" value={`${speed}ft`} color="green" />
              <StatBox label="Initiative" value={formatModifier(getModifier(character.dexterity))} color="amber" />
            </div>
          </SectionPanel>

          {/* Saving Throws */}
          <SectionPanel title="Saving Throws">
            <div className="flex flex-wrap gap-2">
              {character.saving_throw_proficiencies.map(save => (
                <span
                  key={save}
                  className="px-2 py-1 bg-green-900/40 text-green-400 border border-green-700 rounded text-sm capitalize"
                >
                  {save}
                </span>
              ))}
            </div>
          </SectionPanel>

          {/* Skills */}
          <SectionPanel title={`Skill Proficiencies (${character.skill_proficiencies.length})`}>
            <div className="flex flex-wrap gap-2">
              {character.skill_proficiencies.length > 0 ? (
                character.skill_proficiencies.map(skill => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-amber-900/40 text-amber-300 border border-amber-700 rounded text-sm"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">No skills selected</span>
              )}
            </div>
          </SectionPanel>

          {/* Passive Perception */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded">
            <span className="text-gray-400 text-sm">Passive Perception:</span>
            <span className="font-bold text-white">{passivePerception}</span>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Appearance */}
          <SectionPanel title="Appearance">
            {character.gender || character.age || character.height || character.build || character.skin_tone || character.hair_color ? (
              <div className="space-y-2 text-sm">
                <div className="flex flex-wrap gap-2">
                  {character.gender && <AppearanceTag label="Gender" value={character.gender} />}
                  {character.age && <AppearanceTag label="Age" value={character.age} />}
                  {character.height && <AppearanceTag label="Height" value={character.height} />}
                  {character.build && <AppearanceTag label="Build" value={character.build} />}
                </div>
                <div className="flex flex-wrap gap-2">
                  {character.skin_tone && <AppearanceTag label="Skin" value={character.skin_tone} />}
                  {character.hair_color && <AppearanceTag label="Hair" value={`${character.hair_color}${character.hair_style ? ` (${character.hair_style})` : ''}`} />}
                  {character.eye_color && <AppearanceTag label="Eyes" value={character.eye_color} />}
                </div>
                {character.distinguishing_features && (
                  <div className="mt-2 text-gray-300">
                    <span className="text-gray-500">Notable: </span>
                    {character.distinguishing_features}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-gray-500 text-sm">No appearance details set</span>
            )}
          </SectionPanel>

          {/* Personality */}
          <SectionPanel title="Personality">
            {character.personality_traits || character.ideals || character.bonds || character.flaws ? (
              <div className="space-y-3 text-sm">
                {character.personality_traits && (
                  <PersonalityField label="Traits" value={character.personality_traits} />
                )}
                {character.ideals && (
                  <PersonalityField label="Ideals" value={character.ideals} />
                )}
                {character.bonds && (
                  <PersonalityField label="Bonds" value={character.bonds} />
                )}
                {character.flaws && (
                  <PersonalityField label="Flaws" value={character.flaws} />
                )}
              </div>
            ) : (
              <span className="text-gray-500 text-sm">No personality details set</span>
            )}
          </SectionPanel>

          {/* Spells */}
          {isSpellcaster && (character.cantrips.length > 0 || character.known_spells.length > 0) && (
            <SectionPanel title="Spells" color="purple">
              <div className="space-y-3">
                {character.cantrips.length > 0 && (
                  <div>
                    <h4 className="text-xs text-purple-400 uppercase mb-1">Cantrips ({character.cantrips.length})</h4>
                    <div className="flex flex-wrap gap-1">
                      {character.cantrips.map(spell => (
                        <span key={spell} className="px-2 py-0.5 bg-purple-900/40 text-purple-300 border border-purple-700 rounded text-xs">
                          {spell}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {character.known_spells.length > 0 && (
                  <div>
                    <h4 className="text-xs text-purple-400 uppercase mb-1">Spells ({character.known_spells.length})</h4>
                    <div className="flex flex-wrap gap-1">
                      {character.known_spells.map(spell => (
                        <span key={spell} className="px-2 py-0.5 bg-purple-900/40 text-purple-300 border border-purple-700 rounded text-xs">
                          {spell}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SectionPanel>
          )}

          {/* Class Features Preview */}
          {character.dndClass && (
            <SectionPanel title="Level 1 Features">
              <div className="space-y-2">
                {character.dndClass.features
                  .filter(f => f.level === 1)
                  .map(feature => (
                    <div key={feature.id} className="border-l-2 border-amber-700/50 pl-2">
                      <div className="font-medium text-amber-300 text-sm">{feature.name}</div>
                      <div className="text-xs text-gray-400 line-clamp-2">{feature.description}</div>
                    </div>
                  ))}
              </div>
            </SectionPanel>
          )}

          {/* Racial Traits */}
          {character.race && (
            <SectionPanel title="Racial Traits">
              <div className="space-y-2">
                {character.race.traits.map(trait => (
                  <div key={trait.id} className="border-l-2 border-blue-700/50 pl-2">
                    <div className="font-medium text-blue-300 text-sm">
                      {trait.name}
                      {trait.darkvision && <span className="text-xs text-gray-500 ml-1">({trait.darkvision}ft)</span>}
                    </div>
                    <div className="text-xs text-gray-400 line-clamp-2">{trait.description}</div>
                  </div>
                ))}
                {/* Include subrace traits */}
                {character.subrace?.traits.map(trait => (
                  <div key={trait.id} className="border-l-2 border-purple-700/50 pl-2">
                    <div className="font-medium text-purple-300 text-sm">{trait.name}</div>
                    <div className="text-xs text-gray-400 line-clamp-2">{trait.description}</div>
                  </div>
                ))}
              </div>
            </SectionPanel>
          )}
        </div>
      </div>

      {/* Info Messages */}
      <div className="space-y-3">
        {portraitUrl ? (
          <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg flex items-start gap-3">
            <span className="text-2xl">&#10024;</span>
            <div>
              <h4 className="font-bold text-green-300">Portrait Ready!</h4>
              <p className="text-green-200/80 text-sm">
                Your AI-generated portrait is complete. You can regenerate or upload a custom image after creating your character.
              </p>
            </div>
          </div>
        ) : generatingPortrait ? (
          <div className="p-4 bg-purple-900/30 border border-purple-700 rounded-lg flex items-start gap-3">
            <div className="text-2xl animate-spin">&#9881;</div>
            <div>
              <h4 className="font-bold text-purple-300">Generating Portrait...</h4>
              <p className="text-purple-200/80 text-sm">
                Your AI portrait is being generated based on your appearance details. This may take a few seconds.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-900/30 border border-amber-700 rounded-lg flex items-start gap-3">
            <span className="text-2xl">&#127912;</span>
            <div>
              <h4 className="font-bold text-amber-300">Portrait Generation</h4>
              <p className="text-amber-200/80 text-sm">
                A portrait will be generated based on your appearance details. You can also upload a custom image after creating your character.
              </p>
            </div>
          </div>
        )}

        {!campaignId && (
          <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg flex items-start gap-3">
            <span className="text-2xl">&#9989;</span>
            <div>
              <h4 className="font-bold text-green-300">Standalone Character</h4>
              <p className="text-green-200/80 text-sm">
                This character will be created as a standalone hero. You can assign them to any campaign from the campaign lobby, and they&apos;ll keep their progression when leaving campaigns.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper Components

function InfoBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`px-3 py-2 rounded border ${
      highlight
        ? 'bg-purple-900/40 border-purple-700'
        : 'bg-gray-800/50 border-gray-700'
    }`}>
      <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
      <div className={`font-bold truncate ${highlight ? 'text-purple-300' : 'text-white'}`}>
        {value}
      </div>
    </div>
  )
}

function SectionPanel({
  title,
  children,
  color = 'amber'
}: {
  title: string
  children: React.ReactNode
  color?: 'amber' | 'purple' | 'blue' | 'green'
}) {
  const colorClasses = {
    amber: 'border-amber-700/50 text-amber-400',
    purple: 'border-purple-700/50 text-purple-400',
    blue: 'border-blue-700/50 text-blue-400',
    green: 'border-green-700/50 text-green-400',
  }

  return (
    <div className="bg-gray-800/50 border-2 border-gray-700 rounded-lg overflow-hidden">
      <div className={`px-3 py-2 border-b ${colorClasses[color]} border-gray-700 bg-gray-800/80`}>
        <h3 className="font-bold text-sm uppercase tracking-wide">{title}</h3>
      </div>
      <div className="p-3">
        {children}
      </div>
    </div>
  )
}

function AbilityScoreBox({
  ability,
  score,
  modifier
}: {
  ability: string
  score: number
  modifier: number
}) {
  const abbrev = {
    strength: 'STR',
    dexterity: 'DEX',
    constitution: 'CON',
    intelligence: 'INT',
    wisdom: 'WIS',
    charisma: 'CHA',
  }[ability] || ability.slice(0, 3).toUpperCase()

  return (
    <div className="bg-gray-900 border-2 border-gray-600 rounded-lg p-2 text-center">
      <div className="text-xs text-gray-400 uppercase">{abbrev}</div>
      <div className="text-2xl font-bold text-white">{score}</div>
      <div className="text-sm text-amber-400 font-bold">
        {modifier >= 0 ? '+' : ''}{modifier}
      </div>
    </div>
  )
}

function StatBox({
  label,
  value,
  color
}: {
  label: string
  value: string | number
  color: 'red' | 'blue' | 'green' | 'amber'
}) {
  const colorClasses = {
    red: 'bg-red-900/40 border-red-700 text-red-300',
    blue: 'bg-blue-900/40 border-blue-700 text-blue-300',
    green: 'bg-green-900/40 border-green-700 text-green-300',
    amber: 'bg-amber-900/40 border-amber-700 text-amber-300',
  }

  return (
    <div className={`${colorClasses[color]} border-2 rounded-lg p-2 text-center`}>
      <div className="text-xs opacity-70 uppercase">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  )
}

function AppearanceTag({ label, value }: { label: string; value: string }) {
  return (
    <span className="px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-xs">
      <span className="text-gray-500">{label}: </span>
      <span className="text-gray-200">{value}</span>
    </span>
  )
}

function PersonalityField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-amber-400 uppercase mb-0.5">{label}</div>
      <div className="text-gray-300 text-sm line-clamp-3">{value}</div>
    </div>
  )
}
