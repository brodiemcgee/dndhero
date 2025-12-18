'use client'

/**
 * ProficienciesPanel Component
 * Displays other proficiencies (languages, tools, weapons, armor) and features/traits
 */

import { Character } from './types'

interface ProficienciesPanelProps {
  character: Character
}

export function ProficienciesPanel({ character }: ProficienciesPanelProps) {
  const languages = character.language_proficiencies || []
  const tools = character.tool_proficiencies || []
  const weapons = character.weapon_proficiencies || []
  const armor = character.armor_proficiencies || []

  return (
    <div className="bg-fantasy-brown border-4 border-fantasy-tan rounded-lg p-4 space-y-4">
      {/* Other Proficiencies & Languages */}
      <div>
        <h4 className="text-xs font-bold text-fantasy-gold uppercase tracking-wider mb-2 border-b-2 border-fantasy-tan pb-2">
          Other Proficiencies & Languages
        </h4>

        <div className="space-y-3 text-sm">
          {/* Languages */}
          {languages.length > 0 && (
            <div>
              <span className="text-fantasy-stone text-xs uppercase">Languages: </span>
              <span className="text-fantasy-tan">{languages.join(', ')}</span>
            </div>
          )}

          {/* Armor */}
          {armor.length > 0 && (
            <div>
              <span className="text-fantasy-stone text-xs uppercase">Armor: </span>
              <span className="text-fantasy-tan">{armor.join(', ')}</span>
            </div>
          )}

          {/* Weapons */}
          {weapons.length > 0 && (
            <div>
              <span className="text-fantasy-stone text-xs uppercase">Weapons: </span>
              <span className="text-fantasy-tan">{weapons.join(', ')}</span>
            </div>
          )}

          {/* Tools */}
          {tools.length > 0 && (
            <div>
              <span className="text-fantasy-stone text-xs uppercase">Tools: </span>
              <span className="text-fantasy-tan">{tools.join(', ')}</span>
            </div>
          )}

          {/* Empty State */}
          {languages.length === 0 && tools.length === 0 && weapons.length === 0 && armor.length === 0 && (
            <p className="text-fantasy-stone italic">No additional proficiencies</p>
          )}
        </div>
      </div>

      {/* Features & Traits */}
      <div>
        <h4 className="text-xs font-bold text-fantasy-gold uppercase tracking-wider mb-2 border-b-2 border-fantasy-tan pb-2">
          Features & Traits
        </h4>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {/* Class Features */}
          {character.features && character.features.length > 0 ? (
            character.features.map((feature: any, index: number) => (
              <FeatureItem
                key={`feature-${index}`}
                name={typeof feature === 'string' ? feature : feature?.name || 'Feature'}
                description={typeof feature === 'object' ? feature?.description : undefined}
              />
            ))
          ) : null}

          {/* Racial Traits */}
          {character.traits && character.traits.length > 0 ? (
            character.traits.map((trait: any, index: number) => (
              <FeatureItem
                key={`trait-${index}`}
                name={typeof trait === 'string' ? trait : trait?.name || 'Trait'}
                description={typeof trait === 'object' ? trait?.description : undefined}
                isRacial
              />
            ))
          ) : null}

          {/* Additional Features Text */}
          {character.additional_features && (
            <div className="text-sm text-fantasy-tan whitespace-pre-wrap">
              {character.additional_features}
            </div>
          )}

          {/* Empty State */}
          {(!character.features || character.features.length === 0) &&
           (!character.traits || character.traits.length === 0) &&
           !character.additional_features && (
            <p className="text-fantasy-stone italic text-sm">No features or traits</p>
          )}
        </div>
      </div>
    </div>
  )
}

interface FeatureItemProps {
  name: string
  description?: string
  isRacial?: boolean
}

function FeatureItem({ name, description, isRacial }: FeatureItemProps) {
  return (
    <div className={`
      p-2 rounded text-sm
      ${isRacial ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-fantasy-dark/30'}
    `}>
      <div className={`font-bold ${isRacial ? 'text-blue-300' : 'text-white'}`}>
        {name}
        {isRacial && <span className="text-xs text-blue-500 ml-2">(Racial)</span>}
      </div>
      {description && (
        <div className="text-fantasy-stone text-xs mt-1">{description}</div>
      )}
    </div>
  )
}
