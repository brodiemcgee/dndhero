'use client'

/**
 * PersonalityPanel Component
 * Displays Personality Traits, Ideals, Bonds, and Flaws
 * Styled like the official D&D character sheet
 */

import { Character } from './types'

interface PersonalityPanelProps {
  character: Character
}

export function PersonalityPanel({ character }: PersonalityPanelProps) {
  return (
    <div className="bg-fantasy-brown border-4 border-fantasy-tan rounded-lg p-4 space-y-4">
      <PersonalitySection
        title="Personality Traits"
        items={character.personality_traits}
        emptyText="No personality traits defined"
      />

      <PersonalitySection
        title="Ideals"
        items={character.ideals}
        emptyText="No ideals defined"
      />

      <PersonalitySection
        title="Bonds"
        items={character.bonds}
        emptyText="No bonds defined"
      />

      <PersonalitySection
        title="Flaws"
        items={character.flaws}
        emptyText="No flaws defined"
      />
    </div>
  )
}

interface PersonalitySectionProps {
  title: string
  items: string[] | null | undefined
  emptyText: string
}

function PersonalitySection({ title, items, emptyText }: PersonalitySectionProps) {
  const hasContent = items && items.length > 0

  return (
    <div>
      <h4 className="text-xs font-bold text-fantasy-gold uppercase tracking-wider mb-2 border-b border-fantasy-stone/30 pb-1">
        {title}
      </h4>
      <div className="min-h-[2.5rem] bg-fantasy-dark/30 rounded p-2">
        {hasContent ? (
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
