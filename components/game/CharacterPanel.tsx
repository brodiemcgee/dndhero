'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSpellsByIds } from '@/data/spells'

interface Attack {
  name: string
  bonus: number
  damage: string
  damage_type?: string
}

interface Currency {
  cp?: number
  sp?: number
  ep?: number
  gp?: number
  pp?: number
}

interface InventoryItem {
  name: string
  quantity?: number
  weight?: number
  description?: string
}

interface SpellSlots {
  [level: string]: number
}

interface Character {
  id: string
  name: string
  race: string
  class: string
  level: number
  background?: string
  alignment?: string
  current_hp: number
  max_hp: number
  temp_hp: number
  armor_class: number
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  proficiency_bonus: number
  skill_proficiencies: string[]
  saving_throw_proficiencies?: string[]
  conditions?: string[]
  inspiration?: boolean
  passive_perception?: number
  hit_dice_remaining?: number
  death_save_successes?: number
  death_save_failures?: number
  // Spellcasting
  spellcasting_ability?: string
  spellcasting_class?: string
  spell_save_dc?: number
  spell_attack_bonus?: number
  spell_slots?: SpellSlots
  spell_slots_used?: SpellSlots
  known_spells?: string[]
  // Combat
  attacks?: Attack[]
  // Inventory
  equipment?: InventoryItem[]
  inventory?: InventoryItem[]
  currency?: Currency
  treasure?: any[]
  // Character details
  personality_traits?: string[]
  ideals?: string[]
  bonds?: string[]
  flaws?: string[]
  backstory?: string
  // Appearance
  portrait_url?: string
  gender?: string
  age?: string
  height?: string
  weight?: string
}

interface CharacterPanelProps {
  character: Character
}

// Collapsible section component
function Section({
  title,
  icon,
  children,
  defaultOpen = false,
  badge
}: {
  title: string
  icon: string
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-t border-gray-700">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="text-amber-300 text-sm font-semibold">{title}</span>
          {badge}
        </div>
        <span className="text-gray-500 text-xs">{open ? '▼' : '▶'}</span>
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  )
}

export default function CharacterPanel({ character: initialCharacter }: CharacterPanelProps) {
  const supabase = createClient()
  const [character, setCharacter] = useState(initialCharacter)

  // Subscribe to character updates
  useEffect(() => {
    const channel = supabase
      .channel(`character:${character.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'characters',
          filter: `id=eq.${character.id}`,
        },
        (payload) => {
          setCharacter(payload.new as Character)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [character.id, supabase])

  const getModifier = (score: number): number => {
    return Math.floor((score - 10) / 2)
  }

  const formatModifier = (score: number): string => {
    const mod = getModifier(score)
    return mod >= 0 ? `+${mod}` : `${mod}`
  }

  const getHealthPercent = () => {
    return Math.min(100, Math.max(0, (character.current_hp / character.max_hp) * 100))
  }

  const getHealthColor = () => {
    const percent = getHealthPercent()
    if (percent > 50) return 'bg-green-500'
    if (percent > 25) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const abilities = [
    { name: 'STR', key: 'strength' as const },
    { name: 'DEX', key: 'dexterity' as const },
    { name: 'CON', key: 'constitution' as const },
    { name: 'INT', key: 'intelligence' as const },
    { name: 'WIS', key: 'wisdom' as const },
    { name: 'CHA', key: 'charisma' as const },
  ]

  const allSkills = [
    { name: 'Acrobatics', ability: 'dexterity' },
    { name: 'Animal Handling', ability: 'wisdom' },
    { name: 'Arcana', ability: 'intelligence' },
    { name: 'Athletics', ability: 'strength' },
    { name: 'Deception', ability: 'charisma' },
    { name: 'History', ability: 'intelligence' },
    { name: 'Insight', ability: 'wisdom' },
    { name: 'Intimidation', ability: 'charisma' },
    { name: 'Investigation', ability: 'intelligence' },
    { name: 'Medicine', ability: 'wisdom' },
    { name: 'Nature', ability: 'intelligence' },
    { name: 'Perception', ability: 'wisdom' },
    { name: 'Performance', ability: 'charisma' },
    { name: 'Persuasion', ability: 'charisma' },
    { name: 'Religion', ability: 'intelligence' },
    { name: 'Sleight of Hand', ability: 'dexterity' },
    { name: 'Stealth', ability: 'dexterity' },
    { name: 'Survival', ability: 'wisdom' },
  ]

  const getSkillBonus = (skill: { name: string; ability: string }) => {
    const abilityScore = character[skill.ability as keyof Character] as number
    const mod = getModifier(abilityScore)
    const isProficient = character.skill_proficiencies?.some(
      s => s.toLowerCase() === skill.name.toLowerCase() ||
           s.toLowerCase().replace(/_/g, ' ') === skill.name.toLowerCase()
    )
    return mod + (isProficient ? character.proficiency_bonus : 0)
  }

  const formatBonus = (bonus: number) => bonus >= 0 ? `+${bonus}` : `${bonus}`

  // Calculate total spell slots and used
  const getSpellSlotDisplay = (level: number) => {
    const total = character.spell_slots?.[level.toString()] || 0
    const used = character.spell_slots_used?.[level.toString()] || 0
    const remaining = total - used
    return { total, used, remaining }
  }

  const hasSpellcasting = character.known_spells && character.known_spells.length > 0

  // Get spell details for known spells
  const spellDetails = useMemo(() => {
    if (!character.known_spells || character.known_spells.length === 0) return []
    return getSpellsByIds(character.known_spells)
  }, [character.known_spells])

  // Separate cantrips from leveled spells
  const cantrips = useMemo(() => spellDetails.filter(s => s.level === 0), [spellDetails])
  const leveledSpells = useMemo(() => spellDetails.filter(s => s.level > 0), [spellDetails])

  // Calculate currency total in GP
  const getTotalGold = () => {
    if (!character.currency) return 0
    const { cp = 0, sp = 0, ep = 0, gp = 0, pp = 0 } = character.currency
    return pp * 10 + gp + ep * 0.5 + sp * 0.1 + cp * 0.01
  }

  const initiativeBonus = getModifier(character.dexterity)

  return (
    <div className="bg-gray-900 h-full flex flex-col">
      {/* Header with Portrait */}
      <div className="p-4 border-b border-amber-700">
        <div className="flex gap-3">
          {/* Portrait */}
          <div className="w-16 h-16 rounded border-2 border-amber-700 bg-gray-800 overflow-hidden flex-shrink-0">
            {character.portrait_url ? (
              <img
                src={character.portrait_url}
                alt={character.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                ⚔️
              </div>
            )}
          </div>

          {/* Name & Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-['Press_Start_2P'] text-sm text-amber-300 truncate">
              {character.name}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Level {character.level} {character.race} {character.class}
            </p>
            {(character.background || character.alignment) && (
              <p className="text-xs text-gray-500 mt-0.5">
                {[character.background, character.alignment].filter(Boolean).join(' • ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Combat Vitals */}
        <div className="p-4 space-y-3">
          {/* HP Bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-400">HP</span>
              <span className="text-white font-bold">
                {character.current_hp}/{character.max_hp}
                {character.temp_hp > 0 && (
                  <span className="text-blue-400 ml-1">+{character.temp_hp}</span>
                )}
              </span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${getHealthColor()}`}
                style={{ width: `${getHealthPercent()}%` }}
              />
            </div>
          </div>

          {/* Death Saves (only show if at 0 HP) */}
          {character.current_hp <= 0 && (
            <div className="p-2 bg-red-900/30 border border-red-700 rounded">
              <div className="text-xs text-red-300 mb-1">Death Saves</div>
              <div className="flex justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-green-400 text-xs">✓</span>
                  {[0, 1, 2].map(i => (
                    <span
                      key={`success-${i}`}
                      className={`w-3 h-3 rounded-full border ${
                        (character.death_save_successes || 0) > i
                          ? 'bg-green-500 border-green-400'
                          : 'border-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-red-400 text-xs">✗</span>
                  {[0, 1, 2].map(i => (
                    <span
                      key={`failure-${i}`}
                      className={`w-3 h-3 rounded-full border ${
                        (character.death_save_failures || 0) > i
                          ? 'bg-red-500 border-red-400'
                          : 'border-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats Row */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2 bg-gray-800 border border-amber-700 rounded text-center">
              <div className="text-amber-400 text-[10px]">AC</div>
              <div className="text-white font-bold text-lg">{character.armor_class}</div>
            </div>
            <div className="p-2 bg-gray-800 border border-amber-700 rounded text-center">
              <div className="text-amber-400 text-[10px]">INIT</div>
              <div className="text-white font-bold text-lg">{formatBonus(initiativeBonus)}</div>
            </div>
            <div className="p-2 bg-gray-800 border border-amber-700 rounded text-center">
              <div className="text-amber-400 text-[10px]">PROF</div>
              <div className="text-white font-bold text-lg">+{character.proficiency_bonus}</div>
            </div>
            <div className="p-2 bg-gray-800 border border-amber-700 rounded text-center">
              <div className="text-amber-400 text-[10px]">PERC</div>
              <div className="text-white font-bold text-lg">{character.passive_perception || 10 + getModifier(character.wisdom)}</div>
            </div>
          </div>

          {/* Inspiration & Hit Dice */}
          <div className="flex gap-2">
            <div className={`flex-1 p-2 rounded border text-center text-sm ${
              character.inspiration
                ? 'bg-yellow-900/30 border-yellow-600 text-yellow-300'
                : 'bg-gray-800 border-gray-700 text-gray-500'
            }`}>
              ✨ {character.inspiration ? 'Inspired!' : 'No Inspiration'}
            </div>
            <div className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded text-center text-sm text-gray-300">
              🎲 Hit Dice: {character.hit_dice_remaining ?? character.level}/{character.level}
            </div>
          </div>

          {/* Conditions */}
          {character.conditions && character.conditions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {character.conditions.map((condition, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-yellow-900/30 border border-yellow-700 rounded text-xs text-yellow-300 capitalize"
                >
                  {condition.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Ability Scores */}
        <Section title="Abilities" icon="📊" defaultOpen={true}>
          <div className="grid grid-cols-6 gap-1">
            {abilities.map(({ name, key }) => {
              const score = character[key]
              const isSaveProficient = character.saving_throw_proficiencies?.includes(key)
              return (
                <div key={name} className="p-1.5 bg-gray-800 border border-amber-700/50 rounded text-center">
                  <div className="text-amber-400 text-[10px]">{name}</div>
                  <div className="text-white font-bold text-sm">{score}</div>
                  <div className="text-gray-400 text-[10px]">{formatModifier(score)}</div>
                  {isSaveProficient && (
                    <div className="text-green-400 text-[8px]">★</div>
                  )}
                </div>
              )
            })}
          </div>
        </Section>

        {/* Attacks */}
        <Section
          title="Attacks"
          icon="⚔️"
          defaultOpen={true}
          badge={character.attacks?.length ? (
            <span className="text-xs text-gray-500">({character.attacks.length})</span>
          ) : null}
        >
          {character.attacks && character.attacks.length > 0 ? (
            <div className="space-y-2">
              {character.attacks.map((attack, i) => (
                <div key={i} className="p-2 bg-gray-800 rounded border border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm font-medium">{attack.name}</span>
                    <span className="text-amber-400 text-sm">{formatBonus(attack.bonus)}</span>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    {attack.damage} {attack.damage_type && `(${attack.damage_type})`}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No attacks configured</p>
          )}
        </Section>

        {/* Spells */}
        {hasSpellcasting && (
          <Section
            title="Spells"
            icon="✨"
            defaultOpen={true}
            badge={
              <span className="text-xs text-gray-500">
                DC {character.spell_save_dc} | {formatBonus(character.spell_attack_bonus || 0)}
              </span>
            }
          >
            {/* Spell Slots */}
            {character.spell_slots && Object.keys(character.spell_slots).length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-1">Spell Slots</div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => {
                    const { total, remaining } = getSpellSlotDisplay(level)
                    if (total === 0) return null
                    return (
                      <div key={level} className="text-center">
                        <div className="text-[10px] text-gray-500">{level}st</div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: total }).map((_, i) => (
                            <span
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < remaining ? 'bg-purple-500' : 'bg-gray-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Cantrips */}
            {cantrips.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-1">Cantrips</div>
                <div className="space-y-1">
                  {cantrips.map((spell) => (
                    <div
                      key={spell.id}
                      className="text-sm text-gray-300 py-1 px-2 bg-gray-800/50 rounded flex items-center justify-between"
                    >
                      <span>{spell.name}</span>
                      <span className="text-xs text-purple-400 capitalize">{spell.school.slice(0, 4)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leveled Spells */}
            {leveledSpells.length > 0 && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Spells</div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {leveledSpells.map((spell) => (
                    <div
                      key={spell.id}
                      className="text-sm text-gray-300 py-1 px-2 bg-gray-800/50 rounded flex items-center justify-between"
                    >
                      <span>{spell.name}</span>
                      <span className="text-xs text-purple-400">Lv.{spell.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* Inventory */}
        <Section
          title="Inventory"
          icon="🎒"
          badge={
            <span className="text-xs text-yellow-500">
              {getTotalGold().toFixed(0)} GP
            </span>
          }
        >
          {/* Currency */}
          {character.currency && (
            <div className="flex gap-2 mb-3 text-xs">
              {character.currency.pp ? <span className="text-gray-300">⬡ {character.currency.pp} PP</span> : null}
              {character.currency.gp ? <span className="text-yellow-400">● {character.currency.gp} GP</span> : null}
              {character.currency.ep ? <span className="text-gray-400">◐ {character.currency.ep} EP</span> : null}
              {character.currency.sp ? <span className="text-gray-300">○ {character.currency.sp} SP</span> : null}
              {character.currency.cp ? <span className="text-amber-700">○ {character.currency.cp} CP</span> : null}
            </div>
          )}

          {/* Equipment */}
          {character.equipment && character.equipment.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-gray-400 mb-1">Equipped</div>
              <div className="space-y-1">
                {character.equipment.map((item, i) => (
                  <div key={i} className="text-sm text-gray-300 flex justify-between">
                    <span>{item.name}</span>
                    {item.quantity && item.quantity > 1 && (
                      <span className="text-gray-500">x{item.quantity}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Items */}
          {character.inventory && character.inventory.length > 0 && (
            <div>
              <div className="text-xs text-gray-400 mb-1">Backpack</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {character.inventory.map((item, i) => (
                  <div key={i} className="text-sm text-gray-300 flex justify-between">
                    <span>{item.name}</span>
                    {item.quantity && item.quantity > 1 && (
                      <span className="text-gray-500">x{item.quantity}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!character.equipment || character.equipment.length === 0) &&
           (!character.inventory || character.inventory.length === 0) && (
            <p className="text-gray-500 text-sm italic">No items</p>
          )}
        </Section>

        {/* Skills & Saves */}
        <Section title="Skills" icon="📋">
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {allSkills.map(skill => {
              const bonus = getSkillBonus(skill)
              const isProficient = character.skill_proficiencies?.some(
                s => s.toLowerCase() === skill.name.toLowerCase() ||
                     s.toLowerCase().replace(/_/g, ' ') === skill.name.toLowerCase()
              )
              return (
                <div
                  key={skill.name}
                  className={`flex items-center justify-between text-xs py-1 px-2 rounded ${
                    isProficient ? 'bg-gray-800' : ''
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {isProficient && <span className="text-amber-400">●</span>}
                    <span className={isProficient ? 'text-white' : 'text-gray-400'}>
                      {skill.name}
                    </span>
                    <span className="text-gray-600 text-[10px]">
                      ({skill.ability.slice(0, 3).toUpperCase()})
                    </span>
                  </div>
                  <span className={isProficient ? 'text-amber-400' : 'text-gray-500'}>
                    {formatBonus(bonus)}
                  </span>
                </div>
              )
            })}
          </div>
        </Section>

        {/* Saving Throws */}
        <Section title="Saving Throws" icon="🛡️">
          <div className="grid grid-cols-2 gap-1">
            {abilities.map(({ name, key }) => {
              const mod = getModifier(character[key])
              const isProficient = character.saving_throw_proficiencies?.includes(key)
              const bonus = mod + (isProficient ? character.proficiency_bonus : 0)
              return (
                <div
                  key={key}
                  className={`flex items-center justify-between text-xs py-1 px-2 rounded ${
                    isProficient ? 'bg-gray-800' : ''
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {isProficient && <span className="text-green-400">●</span>}
                    <span className={isProficient ? 'text-white' : 'text-gray-400'}>
                      {name}
                    </span>
                  </div>
                  <span className={isProficient ? 'text-green-400' : 'text-gray-500'}>
                    {formatBonus(bonus)}
                  </span>
                </div>
              )
            })}
          </div>
        </Section>

        {/* Character Details */}
        <Section title="Character" icon="📜">
          {character.personality_traits && character.personality_traits.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-amber-400">Personality</div>
              <p className="text-xs text-gray-300">{character.personality_traits.join(', ')}</p>
            </div>
          )}
          {character.ideals && character.ideals.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-amber-400">Ideals</div>
              <p className="text-xs text-gray-300">{character.ideals.join(', ')}</p>
            </div>
          )}
          {character.bonds && character.bonds.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-amber-400">Bonds</div>
              <p className="text-xs text-gray-300">{character.bonds.join(', ')}</p>
            </div>
          )}
          {character.flaws && character.flaws.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-amber-400">Flaws</div>
              <p className="text-xs text-gray-300">{character.flaws.join(', ')}</p>
            </div>
          )}
          {character.backstory && (
            <div className="mb-2">
              <div className="text-xs text-amber-400">Backstory</div>
              <p className="text-xs text-gray-300 max-h-24 overflow-y-auto">{character.backstory}</p>
            </div>
          )}
          {!character.personality_traits?.length && !character.ideals?.length &&
           !character.bonds?.length && !character.flaws?.length && !character.backstory && (
            <p className="text-gray-500 text-sm italic">No character details</p>
          )}
        </Section>
      </div>
    </div>
  )
}
