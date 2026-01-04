'use client'

/**
 * PersonalityPanel Component
 * Displays Personality Traits, Ideals, Bonds, and Flaws
 * Styled like the official D&D character sheet
 */

import { Character } from './types'
import { useEditMode } from '../EditModeContext'

interface PersonalityPanelProps {
  character: Character
}

export function PersonalityPanel({ character }: PersonalityPanelProps) {
  const { isEditMode, pendingChanges, setPendingChange } = useEditMode()

  return (
    <div className="bg-fantasy-brown border-4 border-fantasy-tan rounded-lg p-4 space-y-4">
      <PersonalitySection
        title="Personality Traits"
        field="personality_traits"
        items={(pendingChanges.personality_traits as string[]) ?? character.personality_traits}
        emptyText="No personality traits defined"
        isEditMode={isEditMode}
        onChange={(value) => setPendingChange('personality_traits', value)}
      />

      <PersonalitySection
        title="Ideals"
        field="ideals"
        items={(pendingChanges.ideals as string[]) ?? character.ideals}
        emptyText="No ideals defined"
        isEditMode={isEditMode}
        onChange={(value) => setPendingChange('ideals', value)}
      />

      <PersonalitySection
        title="Bonds"
        field="bonds"
        items={(pendingChanges.bonds as string[]) ?? character.bonds}
        emptyText="No bonds defined"
        isEditMode={isEditMode}
        onChange={(value) => setPendingChange('bonds', value)}
      />

      <PersonalitySection
        title="Flaws"
        field="flaws"
        items={(pendingChanges.flaws as string[]) ?? character.flaws}
        emptyText="No flaws defined"
        isEditMode={isEditMode}
        onChange={(value) => setPendingChange('flaws', value)}
      />
    </div>
  )
}

interface PersonalitySectionProps {
  title: string
  field: string
  items: string[] | null | undefined
  emptyText: string
  isEditMode: boolean
  onChange: (value: string[]) => void
}

function PersonalitySection({ title, field, items, emptyText, isEditMode, onChange }: PersonalitySectionProps) {
  const hasContent = items && items.length > 0
  const textValue = items?.join('\n') || ''

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Split by newlines and filter empty lines
    const lines = e.target.value.split('\n').filter(line => line.trim())
    onChange(lines.length > 0 ? lines : [e.target.value])
  }

  return (
    <div>
      <h4 className="text-xs font-bold text-fantasy-gold uppercase tracking-wider mb-2 border-b border-fantasy-stone/30 pb-1">
        {title}
      </h4>
      <div className="min-h-[2.5rem] bg-fantasy-dark/30 rounded p-2">
        {isEditMode ? (
          <textarea
            value={textValue}
            onChange={handleChange}
            placeholder={emptyText}
            rows={2}
            className="w-full bg-fantasy-dark/50 border border-fantasy-gold rounded px-2 py-1 text-sm text-fantasy-tan font-fantasy focus:outline-none resize-none"
          />
        ) : hasContent ? (
          <ul className="space-y-1">
            {items.map((item, index) => (
              <li key={index} className="text-sm text-fantasy-tan">
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-fantasy-stone italic">{emptyText}</p>
        )}
      </div>
    </div>
  )
}
