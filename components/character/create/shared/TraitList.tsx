'use client'

import { useState } from 'react'
import type { RacialTrait, ClassFeature } from '@/types/character-options'

interface TraitListProps {
  traits: (RacialTrait | ClassFeature)[]
  maxVisible?: number
  showExpand?: boolean
  compact?: boolean
}

export function TraitList({
  traits,
  maxVisible = 3,
  showExpand = true,
  compact = false,
}: TraitListProps) {
  const [expanded, setExpanded] = useState(false)

  if (traits.length === 0) return null

  const visibleTraits = expanded ? traits : traits.slice(0, maxVisible)
  const hasMore = traits.length > maxVisible

  if (compact) {
    // Just show trait names inline
    const names = traits.map(t => t.name)
    const displayNames = expanded ? names : names.slice(0, maxVisible)
    const remaining = names.length - maxVisible

    return (
      <div className="text-sm">
        <span className="text-fantasy-stone">Traits: </span>
        <span className="text-fantasy-light">
          {displayNames.join(', ')}
          {!expanded && remaining > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setExpanded(true)
              }}
              className="ml-1 text-amber-400 hover:text-amber-300"
            >
              +{remaining} more
            </button>
          )}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {visibleTraits.map((trait) => (
        <TraitItem key={trait.id} trait={trait} />
      ))}

      {showExpand && hasMore && !expanded && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setExpanded(true)
          }}
          className="text-sm text-amber-400 hover:text-amber-300"
        >
          Show {traits.length - maxVisible} more traits...
        </button>
      )}

      {showExpand && expanded && hasMore && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setExpanded(false)
          }}
          className="text-sm text-amber-400 hover:text-amber-300"
        >
          Show less
        </button>
      )}
    </div>
  )
}

interface TraitItemProps {
  trait: RacialTrait | ClassFeature
  showDescription?: boolean
}

export function TraitItem({ trait, showDescription = true }: TraitItemProps) {
  const [showDetails, setShowDetails] = useState(false)

  // Check for special indicators
  const racialTrait = trait as RacialTrait
  const hasDarkvision = racialTrait.darkvision
  const hasResistances = racialTrait.resistances?.length
  const hasProficiencies = racialTrait.proficiencies

  return (
    <div className="border-l-2 border-fantasy-tan/30 pl-3">
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowDetails(!showDetails)
          }}
          className="font-medium text-fantasy-gold hover:text-amber-300 text-left"
        >
          {trait.name}
          {hasDarkvision && (
            <span className="ml-1 text-xs text-blue-400">({racialTrait.darkvision} ft)</span>
          )}
        </button>

        {/* Indicator icons */}
        <div className="flex gap-1">
          {hasResistances && (
            <span className="text-xs px-1.5 py-0.5 bg-red-900/30 text-red-400 rounded" title="Resistance">
              R
            </span>
          )}
          {hasProficiencies && (
            <span className="text-xs px-1.5 py-0.5 bg-green-900/30 text-green-400 rounded" title="Proficiency">
              P
            </span>
          )}
        </div>
      </div>

      {showDescription && showDetails && (
        <p className="mt-1 text-sm text-fantasy-light/80">{trait.description}</p>
      )}
    </div>
  )
}

interface FeatureListProps {
  features: ClassFeature[]
  level?: number
  compact?: boolean
}

export function FeatureList({ features, level = 1, compact = false }: FeatureListProps) {
  const levelFeatures = features.filter(f => f.level <= level)

  if (levelFeatures.length === 0) return null

  if (compact) {
    return (
      <div className="text-sm">
        <span className="text-fantasy-stone">Features: </span>
        <span className="text-fantasy-light">
          {levelFeatures.map(f => f.name).join(', ')}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {levelFeatures.map((feature) => (
        <TraitItem key={feature.id} trait={feature} />
      ))}
    </div>
  )
}
