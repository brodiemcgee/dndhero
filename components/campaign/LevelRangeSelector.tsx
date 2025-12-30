'use client'

import { useState } from 'react'

interface LevelRangeSelectorProps {
  minLevel: number
  maxLevel: number
  onChange: (min: number, max: number) => void
}

const LEVEL_PRESETS = [
  { label: 'Level 1-4', description: 'Tier 1: Local Heroes', min: 1, max: 4 },
  { label: 'Level 5-10', description: 'Tier 2: Heroes of the Realm', min: 5, max: 10 },
  { label: 'Level 11-16', description: 'Tier 3: Masters of the Realm', min: 11, max: 16 },
  { label: 'Level 17-20', description: 'Tier 4: Masters of the World', min: 17, max: 20 },
  { label: 'Any Level', description: 'All characters welcome (1-20)', min: 1, max: 20 },
]

export function LevelRangeSelector({ minLevel, maxLevel, onChange }: LevelRangeSelectorProps) {
  const [useCustom, setUseCustom] = useState(false)

  // Check if current values match a preset
  const matchingPreset = LEVEL_PRESETS.find(p => p.min === minLevel && p.max === maxLevel)
  const isPresetSelected = matchingPreset && !useCustom

  const handlePresetClick = (min: number, max: number) => {
    setUseCustom(false)
    onChange(min, max)
  }

  const handleCustomClick = () => {
    setUseCustom(true)
  }

  const handleMinChange = (value: number) => {
    const newMin = Math.max(1, Math.min(20, value))
    const newMax = Math.max(newMin, maxLevel)
    onChange(newMin, newMax)
  }

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(1, Math.min(20, value))
    const newMin = Math.min(minLevel, newMax)
    onChange(newMin, newMax)
  }

  return (
    <div className="space-y-4">
      <label className="block text-fantasy-gold font-pixel text-sm mb-2">
        Character Level Range
      </label>

      {/* Preset buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {LEVEL_PRESETS.map((preset) => {
          const isSelected = !useCustom && preset.min === minLevel && preset.max === maxLevel
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePresetClick(preset.min, preset.max)}
              className={`p-3 rounded border-2 text-left transition-all ${
                isSelected
                  ? 'bg-fantasy-gold/20 border-fantasy-gold text-fantasy-gold'
                  : 'bg-fantasy-dark/50 border-fantasy-brown hover:border-fantasy-tan text-fantasy-light'
              }`}
            >
              <div className="font-bold text-sm">{preset.label}</div>
              <div className="text-xs opacity-75">{preset.description}</div>
            </button>
          )
        })}

        {/* Custom option */}
        <button
          type="button"
          onClick={handleCustomClick}
          className={`p-3 rounded border-2 text-left transition-all ${
            useCustom
              ? 'bg-fantasy-gold/20 border-fantasy-gold text-fantasy-gold'
              : 'bg-fantasy-dark/50 border-fantasy-brown hover:border-fantasy-tan text-fantasy-light'
          }`}
        >
          <div className="font-bold text-sm">Custom Range</div>
          <div className="text-xs opacity-75">Set your own level range</div>
        </button>
      </div>

      {/* Custom range inputs */}
      {useCustom && (
        <div className="flex items-center gap-4 p-4 bg-fantasy-dark/30 rounded border border-fantasy-brown">
          <div className="flex-1">
            <label className="block text-xs text-fantasy-tan mb-1">Min Level</label>
            <input
              type="number"
              min={1}
              max={20}
              value={minLevel}
              onChange={(e) => handleMinChange(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-fantasy-dark border-2 border-fantasy-brown rounded text-fantasy-light focus:border-fantasy-gold focus:outline-none"
            />
          </div>
          <div className="text-fantasy-tan text-2xl pt-5">—</div>
          <div className="flex-1">
            <label className="block text-xs text-fantasy-tan mb-1">Max Level</label>
            <input
              type="number"
              min={1}
              max={20}
              value={maxLevel}
              onChange={(e) => handleMaxChange(parseInt(e.target.value) || 20)}
              className="w-full px-3 py-2 bg-fantasy-dark border-2 border-fantasy-brown rounded text-fantasy-light focus:border-fantasy-gold focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Current selection display */}
      <div className="text-sm text-fantasy-tan">
        Characters must be <span className="text-fantasy-gold font-bold">Level {minLevel}</span>
        {minLevel !== maxLevel && (
          <> to <span className="text-fantasy-gold font-bold">Level {maxLevel}</span></>
        )} to join this campaign.
      </div>
    </div>
  )
}
