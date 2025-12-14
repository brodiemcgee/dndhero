'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PixelPanel } from '@/components/ui/PixelPanel'

interface Character {
  id: string
  name: string
  race: string
  class: string
  level: number
  current_hp: number
  max_hp: number
  temp_hp: number
  armor_class: number
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  proficiency_bonus: number
  skill_proficiencies: string[]
  conditions?: string[]
}

interface CharacterPanelProps {
  character: Character
}

export default function CharacterPanel({ character: initialCharacter }: CharacterPanelProps) {
  const supabase = createClient()
  const [character, setCharacter] = useState(initialCharacter)
  const [expanded, setExpanded] = useState(false)

  // Subscribe to character updates
  useEffect(() => {
    const channel = supabase
      .channel(`character:${character.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'characters',
          filter: `id=eq.${character.id}`,
        },
        (payload) => {
          setCharacter(payload.new as Character)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [character.id, supabase])

  const getModifier = (score: number): number => {
    return Math.floor((score - 10) / 2)
  }

  const formatModifier = (score: number): string => {
    const mod = getModifier(score)
    return mod >= 0 ? `+${mod}` : `${mod}`
  }

  const getHealthPercent = () => {
    return Math.min(100, Math.max(0, (character.current_hp / character.max_hp) * 100))
  }

  const getHealthColor = () => {
    const percent = getHealthPercent()
    if (percent > 50) return 'bg-green-500'
    if (percent > 25) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const abilities = [
    { name: 'STR', key: 'strength' as const },
    { name: 'DEX', key: 'dexterity' as const },
    { name: 'CON', key: 'constitution' as const },
    { name: 'INT', key: 'intelligence' as const },
    { name: 'WIS', key: 'wisdom' as const },
    { name: 'CHA', key: 'charisma' as const },
  ]

  return (
    <PixelPanel>
      <div className="p-4">
        {/* Character name & basic info */}
        <div className="mb-4">
          <h3 className="font-['Press_Start_2P'] text-sm text-amber-300 mb-1">
            {character.name}
          </h3>
          <p className="text-xs text-gray-400">
            Level {character.level} {character.race} {character.class}
          </p>
        </div>

        {/* HP display */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-400">Hit Points</span>
            <span className="text-white font-bold">
              {character.current_hp}/{character.max_hp}
              {character.temp_hp > 0 && (
                <span className="text-blue-400 ml-1">+{character.temp_hp}</span>
              )}
            </span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${getHealthColor()}`}
              style={{ width: `${getHealthPercent()}%` }}
            />
          </div>
        </div>

        {/* AC & Proficiency Bonus */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-2 bg-gray-800 border border-amber-700 rounded text-center">
            <div className="text-amber-400 text-xs">AC</div>
            <div className="text-white font-bold text-xl">{character.armor_class}</div>
          </div>
          <div className="p-2 bg-gray-800 border border-amber-700 rounded text-center">
            <div className="text-amber-400 text-xs">Prof</div>
            <div className="text-white font-bold text-xl">+{character.proficiency_bonus}</div>
          </div>
        </div>

        {/* Ability scores */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {abilities.map(({ name, key }) => {
            const score = character[key]
            return (
              <div key={name} className="p-2 bg-gray-800 border border-amber-700 rounded text-center">
                <div className="text-amber-400 text-xs">{name}</div>
                <div className="text-white font-bold">{score}</div>
                <div className="text-gray-400 text-xs">{formatModifier(score)}</div>
              </div>
            )
          })}
        </div>

        {/* Conditions */}
        {character.conditions && character.conditions.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-400 mb-1">Conditions:</div>
            <div className="flex flex-wrap gap-1">
              {character.conditions.map((condition, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-yellow-900/30 border border-yellow-700 rounded text-xs text-yellow-300 capitalize"
                >
                  {condition.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expandable skills section */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-xs text-amber-400 hover:text-amber-300 text-left"
        >
          {expanded ? '− Hide' : '+ Show'} Skills
        </button>

        {expanded && (
          <div className="mt-2 space-y-1">
            {character.skill_proficiencies.map((skill) => (
              <div
                key={skill}
                className="flex items-center justify-between text-xs p-1 bg-gray-800 rounded"
              >
                <span className="text-gray-300">{skill}</span>
                <span className="text-amber-400">Prof</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PixelPanel>
  )
}
