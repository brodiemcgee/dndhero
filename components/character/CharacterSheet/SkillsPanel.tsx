'use client'

/**
 * SkillsPanel Component
 * Displays all 18 D&D 5E skills with proficiency indicators and modifiers
 */

import { Character, SKILLS, SkillName, getSkillModifier, formatModifier } from './types'

interface SkillsPanelProps {
  character: Character
}

export function SkillsPanel({ character }: SkillsPanelProps) {
  const skillNames = Object.keys(SKILLS) as SkillName[]

  return (
    <div className="bg-fantasy-brown border-4 border-fantasy-tan rounded-lg p-4">
      <h3 className="text-sm font-bold text-fantasy-gold uppercase tracking-wider mb-3 text-center border-b-2 border-fantasy-tan pb-2">
        Skills
      </h3>

      <div className="space-y-1.5">
        {skillNames.map((skill) => {
          const isProficient = character.skill_proficiencies?.includes(skill)
          const modifier = getSkillModifier(character, skill)
          const abilityAbbrev = SKILLS[skill].slice(0, 3).toUpperCase()

          return (
            <div key={skill} className="flex items-center gap-2 text-sm">
              {/* Proficiency Indicator */}
              <div className={`
                w-3 h-3 rounded-full border-2 flex-shrink-0
                ${isProficient
                  ? 'bg-fantasy-gold border-fantasy-gold'
                  : 'bg-transparent border-fantasy-stone'
                }
              `} />

              {/* Modifier */}
              <span className={`
                w-7 text-right font-bold text-xs
                ${modifier >= 0 ? 'text-green-400' : 'text-red-400'}
              `}>
                {formatModifier(modifier)}
              </span>

              {/* Skill Name */}
              <span className={`
                flex-1 truncate
                ${isProficient ? 'text-white font-medium' : 'text-fantasy-tan'}
              `}>
                {skill}
              </span>

              {/* Ability Abbreviation */}
              <span className="text-fantasy-stone text-xs w-8">
                ({abilityAbbrev})
              </span>
            </div>
          )
        })}
      </div>

      {/* Passive Perception */}
      <div className="mt-4 pt-3 border-t-2 border-fantasy-tan">
        <div className="flex items-center justify-between">
          <span className="text-xs text-fantasy-stone uppercase tracking-wide">
            Passive Perception
          </span>
          <span className="text-lg font-bold text-white bg-fantasy-dark px-3 py-1 rounded border border-fantasy-stone">
            {character.passive_perception || (10 + getSkillModifier(character, 'Perception'))}
          </span>
        </div>
      </div>
    </div>
  )
}
