'use client'

import { SettingCategorySelector } from './SettingCategorySelector'
import { PixelButton } from '@/components/ui/PixelButton'
import { SETTING_CATEGORIES, validateSettingOptions, type SettingOptions } from '@/types/campaign-settings'

interface SettingOptionsStepProps {
  options: SettingOptions
  onChange: (options: SettingOptions) => void
  onBack: () => void
  onGenerate: () => void
  isGenerating: boolean
}

export function SettingOptionsStep({
  options,
  onChange,
  onBack,
  onGenerate,
  isGenerating,
}: SettingOptionsStepProps) {
  const handleCategoryChange = (categoryId: keyof SettingOptions, values: string[]) => {
    onChange({
      ...options,
      [categoryId]: values,
    })
  }

  const validation = validateSettingOptions(options)

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold text-fantasy-gold mb-2">Build Your Setting</h2>
      <p className="text-fantasy-tan text-sm mb-6">
        Select options from each category to shape your campaign world. You can select multiple options within each category.
      </p>

      {SETTING_CATEGORIES.map((category) => (
        <SettingCategorySelector
          key={category.id}
          category={category}
          selectedValues={options[category.id]}
          onSelectionChange={(values) => handleCategoryChange(category.id, values)}
        />
      ))}

      {!validation.valid && (
        <p className="text-fantasy-red text-sm mt-4">
          Please select at least one option from: {validation.missingCategories.join(', ')}
        </p>
      )}

      <div className="flex justify-between pt-4">
        <PixelButton onClick={onBack} variant="secondary">
          &larr; BACK
        </PixelButton>
        <PixelButton
          onClick={onGenerate}
          variant="primary"
          disabled={!validation.valid || isGenerating}
        >
          {isGenerating ? 'GENERATING...' : 'GENERATE DESCRIPTION →'}
        </PixelButton>
      </div>
    </div>
  )
}
