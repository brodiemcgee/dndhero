'use client'

import { useState } from 'react'
import { PixelButton } from '@/components/ui/PixelButton'
import { PixelPanel } from '@/components/ui/PixelPanel'

interface DiceRollerProps {
  campaignId: string
  characterId?: string
}

const COMMON_ROLLS = [
  { label: 'd20', notation: '1d20', description: 'Ability check' },
  { label: 'd20 + Mod', notation: '1d20', description: 'With modifier', hasModifier: true },
  { label: '2d6', notation: '2d6', description: 'Greatsword' },
  { label: '1d8', notation: '1d8', description: 'Longsword' },
  { label: '1d6', notation: '1d6', description: 'Shortsword' },
  { label: '1d4', notation: '1d4', description: 'Dagger' },
]

export default function DiceRoller({ campaignId, characterId }: DiceRollerProps) {
  const [notation, setNotation] = useState('1d20')
  const [modifier, setModifier] = useState(0)
  const [advantage, setAdvantage] = useState(false)
  const [disadvantage, setDisadvantage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showCustom, setShowCustom] = useState(false)

  const handleRoll = async (rollNotation?: string, useModifier?: boolean) => {
    setLoading(true)
    setResult(null)

    const finalNotation = rollNotation || notation
    const notationWithMod =
      useModifier && modifier !== 0
        ? `${finalNotation}${modifier >= 0 ? '+' : ''}${modifier}`
        : finalNotation

    try {
      const response = await fetch('/api/dice/roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notation: notationWithMod,
          advantage,
          disadvantage,
          characterId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to roll dice')
      }

      setResult(data.roll)
    } catch (err: any) {
      console.error('Roll error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PixelPanel>
      <div className="p-4">
        <h3 className="font-['Press_Start_2P'] text-sm text-amber-300 mb-4">Dice Roller</h3>

        {/* Quick roll buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {COMMON_ROLLS.map((roll) => (
            <button
              key={roll.label}
              onClick={() => handleRoll(roll.notation, roll.hasModifier)}
              disabled={loading}
              className="p-2 bg-gray-800 border-2 border-amber-700 rounded hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm"
              title={roll.description}
            >
              <div className="text-white font-bold">{roll.label}</div>
              <div className="text-xs text-gray-400">{roll.description}</div>
            </button>
          ))}
        </div>

        {/* Custom roll */}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="w-full text-sm text-amber-400 hover:text-amber-300 mb-3"
        >
          {showCustom ? '− Hide' : '+ Custom Roll'}
        </button>

        {showCustom && (
          <div className="space-y-3 mb-4 p-3 bg-gray-800 rounded">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Notation (e.g., 2d6, 1d20+5)</label>
              <input
                type="text"
                value={notation}
                onChange={(e) => setNotation(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-amber-700 rounded text-white text-sm"
                placeholder="1d20"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Modifier</label>
              <input
                type="number"
                value={modifier}
                onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-900 border border-amber-700 rounded text-white text-sm"
                placeholder="0"
              />
            </div>

            <div className="flex gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={advantage}
                  onChange={(e) => {
                    setAdvantage(e.target.checked)
                    if (e.target.checked) setDisadvantage(false)
                  }}
                  className="rounded"
                />
                <span className="text-gray-300">Advantage</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={disadvantage}
                  onChange={(e) => {
                    setDisadvantage(e.target.checked)
                    if (e.target.checked) setAdvantage(false)
                  }}
                  className="rounded"
                />
                <span className="text-gray-300">Disadvantage</span>
              </label>
            </div>

            <PixelButton onClick={() => handleRoll()} disabled={loading} className="w-full">
              Roll
            </PixelButton>
          </div>
        )}

        {/* Result display */}
        {result && (
          <div className="p-4 bg-gradient-to-br from-amber-900/30 to-amber-800/20 border-2 border-amber-600 rounded">
            <div className="text-center">
              <div className="text-amber-400 text-sm mb-2">{result.notation}</div>
              <div className="text-5xl font-bold text-white mb-2">{result.total}</div>
              {result.breakdown && (
                <div className="text-sm text-gray-400 mb-2">{result.breakdown}</div>
              )}
              {result.critical && (
                <div className="text-amber-400 font-bold animate-pulse">CRITICAL HIT!</div>
              )}
              {result.fumble && (
                <div className="text-red-400 font-bold animate-pulse">FUMBLE!</div>
              )}
              {result.advantage && <div className="text-green-400 text-xs">With Advantage</div>}
              {result.disadvantage && (
                <div className="text-red-400 text-xs">With Disadvantage</div>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-amber-400 border-t-transparent rounded-full"></div>
            <div className="text-gray-400 text-sm mt-2">Rolling...</div>
          </div>
        )}
      </div>
    </PixelPanel>
  )
}
