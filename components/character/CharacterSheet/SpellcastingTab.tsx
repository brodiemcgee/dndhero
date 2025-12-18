'use client'

/**
 * SpellcastingTab Component
 * Full spellcasting page with spell slots and spell lists by level
 * Styled like page 3 of the official D&D character sheet
 */

import { Character, getModifier, formatModifier } from './types'

interface SpellcastingTabProps {
  character: Character
}

export function SpellcastingTab({ character }: SpellcastingTabProps) {
  // Check if character is a spellcaster
  const isSpellcaster = character.spellcasting_ability ||
    (character.cantrips && character.cantrips.length > 0) ||
    (character.known_spells && character.known_spells.length > 0)

  if (!isSpellcaster) {
    return (
      <div className="bg-fantasy-brown border-4 border-fantasy-tan rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">&#9734;</div>
        <h3 className="text-xl font-bold text-fantasy-gold mb-2">No Spellcasting</h3>
        <p className="text-fantasy-tan">
          This character does not have spellcasting abilities.
        </p>
      </div>
    )
  }

  const spellAbility = character.spellcasting_ability
  const spellAbilityMod = spellAbility
    ? getModifier(character[spellAbility as keyof Character] as number || 10)
    : 0
  const profBonus = character.proficiency_bonus || 2
  const spellSaveDC = character.spell_save_dc || (8 + spellAbilityMod + profBonus)
  const spellAttackBonus = character.spell_attack_bonus || (spellAbilityMod + profBonus)

  // Get spell slots from character
  const spellSlots = character.spell_slots || {}
  const spellSlotsUsed = character.spell_slots_used || {}

  return (
    <div className="space-y-6">
      {/* Spellcasting Header */}
      <div className="bg-fantasy-brown border-4 border-fantasy-tan rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-fantasy-dark rounded-lg p-3 border border-fantasy-stone">
            <div className="text-xs text-fantasy-stone uppercase mb-1">Spellcasting Class</div>
            <div className="text-lg font-bold text-purple-400">
              {character.spellcasting_class || character.class}
            </div>
          </div>
          <div className="bg-fantasy-dark rounded-lg p-3 border border-fantasy-stone">
            <div className="text-xs text-fantasy-stone uppercase mb-1">Spellcasting Ability</div>
            <div className="text-lg font-bold text-purple-400 capitalize">
              {spellAbility?.slice(0, 3).toUpperCase() || 'N/A'}
            </div>
          </div>
          <div className="bg-fantasy-dark rounded-lg p-3 border border-fantasy-stone">
            <div className="text-xs text-fantasy-stone uppercase mb-1">Spell Save DC</div>
            <div className="text-lg font-bold text-purple-400">{spellSaveDC}</div>
          </div>
          <div className="bg-fantasy-dark rounded-lg p-3 border border-fantasy-stone">
            <div className="text-xs text-fantasy-stone uppercase mb-1">Spell Attack Bonus</div>
            <div className="text-lg font-bold text-purple-400">
              {formatModifier(spellAttackBonus)}
            </div>
          </div>
        </div>
      </div>

      {/* Cantrips */}
      <SpellLevelSection
        level={0}
        title="Cantrips"
        spells={character.cantrips || []}
        preparedSpells={character.prepared_spells || []}
        slotsMax={null}
        slotsUsed={null}
      />

      {/* Spell Levels 1-9 */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
        const levelSlots = spellSlots[level]
        const hasSlots = levelSlots && levelSlots.max > 0
        const levelSpells = (character.known_spells || []).filter((spell: string) => {
          // This is a simple filter - in reality you'd need spell data to know the level
          // For now, just distribute spells across levels
          return true
        })

        // Only show spell levels that have slots or spells
        if (!hasSlots && levelSpells.length === 0) return null

        return (
          <SpellLevelSection
            key={level}
            level={level}
            title={`Level ${level}`}
            spells={levelSpells}
            preparedSpells={character.prepared_spells || []}
            slotsMax={levelSlots?.max || 0}
            slotsUsed={spellSlotsUsed[level] || 0}
          />
        )
      })}

      {/* Show all known spells if no spell slots are configured */}
      {Object.keys(spellSlots).length === 0 && (character.known_spells?.length || 0) > 0 && (
        <div className="bg-fantasy-brown border-4 border-fantasy-tan rounded-lg p-4">
          <h4 className="text-sm font-bold text-fantasy-gold uppercase tracking-wider mb-3 border-b-2 border-fantasy-tan pb-2">
            Known Spells
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {(character.known_spells || []).map((spell: string, index: number) => {
              const isPrepared = character.prepared_spells?.includes(spell)
              return (
                <SpellItem key={index} name={spell} isPrepared={isPrepared} />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

interface SpellLevelSectionProps {
  level: number
  title: string
  spells: string[]
  preparedSpells: string[]
  slotsMax: number | null
  slotsUsed: number | null
}

function SpellLevelSection({ level, title, spells, preparedSpells, slotsMax, slotsUsed }: SpellLevelSectionProps) {
  const isCantrip = level === 0

  return (
    <div className="bg-fantasy-brown border-4 border-fantasy-tan rounded-lg p-4">
      <div className="flex items-center justify-between mb-3 border-b-2 border-fantasy-tan pb-2">
        <div className="flex items-center gap-3">
          {/* Level Badge */}
          <div className="w-8 h-8 bg-purple-900 border-2 border-purple-600 rounded flex items-center justify-center">
            <span className="text-purple-300 font-bold">{level}</span>
          </div>
          <h4 className="text-sm font-bold text-fantasy-gold uppercase tracking-wider">
            {title}
          </h4>
        </div>

        {/* Spell Slots */}
        {!isCantrip && slotsMax !== null && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-fantasy-stone">Slots:</span>
            <div className="flex gap-1">
              {Array.from({ length: slotsMax }).map((_, i) => (
                <div
                  key={i}
                  className={`w-5 h-5 rounded border-2 ${
                    i < (slotsUsed || 0)
                      ? 'bg-purple-600 border-purple-400'
                      : 'bg-transparent border-fantasy-stone'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-fantasy-stone">
              ({(slotsUsed || 0)}/{slotsMax})
            </span>
          </div>
        )}
      </div>

      {/* Spell List */}
      {spells.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {spells.map((spell, index) => {
            const isPrepared = preparedSpells.includes(spell)
            return <SpellItem key={index} name={spell} isPrepared={isPrepared} />
          })}
        </div>
      ) : (
        <p className="text-fantasy-stone text-sm italic text-center py-2">
          No {isCantrip ? 'cantrips' : `level ${level} spells`} known
        </p>
      )}

      {/* Empty slots for writing in spells */}
      {spells.length < 8 && (
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-1">
          {Array.from({ length: Math.max(0, 4 - spells.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="h-8 border-b border-fantasy-stone/30 border-dashed"
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface SpellItemProps {
  name: string
  isPrepared?: boolean
}

function SpellItem({ name, isPrepared }: SpellItemProps) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-fantasy-dark/30 rounded">
      {/* Prepared Checkbox */}
      <div className={`
        w-4 h-4 rounded border-2 flex-shrink-0
        ${isPrepared
          ? 'bg-purple-600 border-purple-400'
          : 'bg-transparent border-fantasy-stone'
        }
      `} />

      {/* Spell Name */}
      <span className={`text-sm truncate ${isPrepared ? 'text-purple-300' : 'text-fantasy-tan'}`}>
        {name}
      </span>
    </div>
  )
}
