'use client'

import { PixelButton } from '@/components/ui/PixelButton'
import { getSelectedLabels, type SettingOptions } from '@/types/campaign-settings'

interface SettingDescriptionStepProps {
  options: SettingOptions
  description: string
  onDescriptionChange: (description: string) => void
  onRegenerate: () => void
  isRegenerating: boolean
  onBack: () => void
  onNext: () => void
}

export function SettingDescriptionStep({
  options,
  description,
  onDescriptionChange,
  onRegenerate,
  isRegenerating,
  onBack,
  onNext,
}: SettingDescriptionStepProps) {
  const selectedLabels = getSelectedLabels(options)
  const charCount = description.length
  const isValidLength = charCount >= 10 && charCount <= 500

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-fantasy-gold mb-2">Your Setting Description</h2>

      {/* Selected options display */}
      <div className="mb-4">
        <p className="text-fantasy-stone text-sm mb-2">Based on your selections:</p>
        <div className="flex flex-wrap gap-2">
          {selectedLabels.map((label, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-fantasy-gold/10 border border-fantasy-gold/30 rounded text-fantasy-tan text-xs"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Editable description */}
      <div>
        <label className="block text-fantasy-tan mb-2 font-bold">
          Setting Description *
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={10}
          className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-3 rounded focus:outline-none focus:border-fantasy-gold"
          placeholder="Your AI-generated setting description..."
        />
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs ${isValidLength ? 'text-fantasy-stone' : 'text-fantasy-red'}`}>
            {charCount}/500 characters {charCount < 10 && '(minimum 10)'}
          </span>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="text-fantasy-gold hover:text-fantasy-tan text-sm underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <PixelButton onClick={onBack} variant="secondary">
          &larr; BACK
        </PixelButton>
        <PixelButton
          onClick={onNext}
          variant="primary"
          disabled={!isValidLength}
        >
          NEXT &rarr;
        </PixelButton>
      </div>
    </div>
  )
}
