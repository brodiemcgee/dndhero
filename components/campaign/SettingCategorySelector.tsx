'use client'

import { SettingOptionChip } from './SettingOptionChip'
import type { SettingCategory } from '@/types/campaign-settings'

interface SettingCategorySelectorProps {
  category: SettingCategory
  selectedValues: string[]
  onSelectionChange: (values: string[]) => void
}

export function SettingCategorySelector({
  category,
  selectedValues,
  onSelectionChange,
}: SettingCategorySelectorProps) {
  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      // Remove if already selected
      onSelectionChange(selectedValues.filter(v => v !== value))
    } else {
      // Add if not selected
      onSelectionChange([...selectedValues, value])
    }
  }

  return (
    <div className="mb-6">
      <h3 className="text-fantasy-gold font-bold mb-1">{category.label}</h3>
      <p className="text-fantasy-stone text-sm mb-3">{category.description}</p>
      <div className="flex flex-wrap gap-2">
        {category.options.map((option) => (
          <SettingOptionChip
            key={option.value}
            label={option.label}
            selected={selectedValues.includes(option.value)}
            onToggle={() => handleToggle(option.value)}
          />
        ))}
      </div>
    </div>
  )
}
