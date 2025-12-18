'use client'

/**
 * CombatStatsPanel Component
 * Displays AC, Initiative, Speed, HP, Temp HP, Hit Dice, and Death Saves
 * Styled with iconic D&D visual elements (shield for AC, etc.)
 */

import { Character, CLASS_HIT_DICE, getModifier, formatModifier } from './types'

interface CombatStatsPanelProps {
  character: Character
}

export function CombatStatsPanel({ character }: CombatStatsPanelProps) {
  const hitDiceType = CLASS_HIT_DICE[character.class] || 'd8'

  return (
    <div className="bg-fantasy-brown border-4 border-fantasy-tan rounded-lg p-4">
      {/* Top Row: AC, Initiative, Speed */}
      <div className="flex justify-center gap-4 mb-4">
        {/* Armor Class (Shield Shape) */}
        <div className="relative">
          <div className="w-20 h-24 flex flex-col items-center justify-center">
            {/* Shield SVG */}
            <svg viewBox="0 0 100 120" className="w-full h-full absolute">
              <path
                d="M50 5 L95 20 L95 60 Q95 100 50 115 Q5 100 5 60 L5 20 Z"
                fill="#1a1a2e"
                stroke="#d4a574"
                strokeWidth="4"
              />
            </svg>
            <div className="relative z-10 text-center pt-2">
              <div className="text-3xl font-bold text-white">{character.armor_class}</div>
              <div className="text-xs text-fantasy-stone uppercase">AC</div>
            </div>
          </div>
        </div>

        {/* Initiative */}
        <StatBox
          label="Initiative"
          value={formatModifier(character.initiative_bonus || getModifier(character.dexterity))}
          size="medium"
        />

        {/* Speed */}
        <StatBox
          label="Speed"
          value={`${character.speed || 30}`}
          suffix="ft"
          size="medium"
        />
      </div>

      {/* HP Section */}
      <div className="mb-4">
        <div className="text-xs text-fantasy-stone uppercase tracking-wide mb-1 text-center">
          Hit Points
        </div>
        <div className="bg-fantasy-dark border-2 border-fantasy-stone rounded-lg p-3">
          {/* HP Max */}
          <div className="text-center mb-2">
            <span className="text-xs text-fantasy-stone">Maximum </span>
            <span className="text-fantasy-tan font-bold">{character.max_hp}</span>
          </div>

          {/* Current HP */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <input
              type="number"
              value={character.current_hp}
              readOnly
              className="w-20 text-center text-2xl font-bold bg-transparent border-b-2 border-red-600 text-white focus:outline-none"
            />
            <span className="text-fantasy-stone text-2xl">/</span>
            <span className="text-2xl font-bold text-fantasy-tan">{character.max_hp}</span>
          </div>

          {/* HP Bar */}
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-fantasy-stone">
            <div
              className={`h-full transition-all ${
                character.current_hp / character.max_hp > 0.5
                  ? 'bg-green-600'
                  : character.current_hp / character.max_hp > 0.25
                  ? 'bg-yellow-600'
                  : 'bg-red-600'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, (character.current_hp / character.max_hp) * 100))}%` }}
            />
          </div>

          {/* Temp HP */}
          <div className="mt-2 pt-2 border-t border-fantasy-stone/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-fantasy-stone">Temporary HP</span>
              <span className="text-blue-400 font-bold">{character.temp_hp || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hit Dice & Death Saves Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Hit Dice */}
        <div className="bg-fantasy-dark border-2 border-fantasy-stone rounded-lg p-3">
          <div className="text-xs text-fantasy-stone uppercase tracking-wide mb-2 text-center">
            Hit Dice
          </div>
          <div className="text-center">
            <span className="text-lg font-bold text-white">
              {character.hit_dice_remaining ?? character.level}
            </span>
            <span className="text-fantasy-stone"> / </span>
            <span className="text-fantasy-tan">{character.level}</span>
          </div>
          <div className="text-center text-sm text-purple-400 font-bold">
            {hitDiceType}
          </div>
        </div>

        {/* Death Saves */}
        <div className="bg-fantasy-dark border-2 border-fantasy-stone rounded-lg p-3">
          <div className="text-xs text-fantasy-stone uppercase tracking-wide mb-2 text-center">
            Death Saves
          </div>

          {/* Successes */}
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-xs text-green-400 mr-2">S</span>
            {[0, 1, 2].map((i) => (
              <div
                key={`success-${i}`}
                className={`w-4 h-4 rounded-full border-2 ${
                  i < (character.death_save_successes || 0)
                    ? 'bg-green-600 border-green-400'
                    : 'bg-transparent border-fantasy-stone'
                }`}
              />
            ))}
          </div>

          {/* Failures */}
          <div className="flex items-center justify-center gap-1">
            <span className="text-xs text-red-400 mr-2">F</span>
            {[0, 1, 2].map((i) => (
              <div
                key={`failure-${i}`}
                className={`w-4 h-4 rounded-full border-2 ${
                  i < (character.death_save_failures || 0)
                    ? 'bg-red-600 border-red-400'
                    : 'bg-transparent border-fantasy-stone'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Inspiration */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <div className={`
          w-5 h-5 rounded border-2 flex items-center justify-center
          ${character.inspiration
            ? 'bg-yellow-500 border-yellow-400'
            : 'bg-transparent border-fantasy-stone'
          }
        `}>
          {character.inspiration && <span className="text-black text-xs">&#10003;</span>}
        </div>
        <span className="text-sm text-fantasy-tan">Inspiration</span>
      </div>
    </div>
  )
}

interface StatBoxProps {
  label: string
  value: string
  suffix?: string
  size?: 'small' | 'medium' | 'large'
}

function StatBox({ label, value, suffix, size = 'medium' }: StatBoxProps) {
  const sizeClasses = {
    small: 'w-14 h-14',
    medium: 'w-16 h-16',
    large: 'w-20 h-20',
  }

  return (
    <div className={`${sizeClasses[size]} flex flex-col items-center justify-center bg-fantasy-dark border-2 border-fantasy-stone rounded-lg`}>
      <div className="text-xl font-bold text-white">
        {value}
        {suffix && <span className="text-xs text-fantasy-stone">{suffix}</span>}
      </div>
      <div className="text-xs text-fantasy-stone uppercase">{label}</div>
    </div>
  )
}
