'use client'

/**
 * AttacksPanel Component
 * Displays attacks and spellcasting table
 * Styled like the official D&D character sheet
 */

import { Character, Attack, getModifier, formatModifier } from './types'

interface AttacksPanelProps {
  character: Character
}

export function AttacksPanel({ character }: AttacksPanelProps) {
  // Get attacks from character or generate defaults from equipment
  const attacks = character.attacks || generateDefaultAttacks(character)

  return (
    <div className="bg-fantasy-brown border-4 border-fantasy-tan rounded-lg p-4">
      <h4 className="text-xs font-bold text-fantasy-gold uppercase tracking-wider mb-3 text-center border-b-2 border-fantasy-tan pb-2">
        Attacks & Spellcasting
      </h4>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-fantasy-stone text-xs uppercase">
              <th className="text-left pb-2 pr-2">Name</th>
              <th className="text-center pb-2 px-2">ATK</th>
              <th className="text-left pb-2 pl-2">Damage/Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-fantasy-stone/20">
            {attacks.length > 0 ? (
              attacks.slice(0, 5).map((attack, index) => (
                <tr key={index} className="hover:bg-fantasy-dark/30">
                  <td className="py-2 pr-2 text-white font-medium">{attack.name}</td>
                  <td className="py-2 px-2 text-center">
                    <span className={attack.attack_bonus >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {formatModifier(attack.attack_bonus)}
                    </span>
                  </td>
                  <td className="py-2 pl-2 text-fantasy-tan">
                    {attack.damage} {attack.damage_type && (
                      <span className="text-fantasy-stone text-xs">({attack.damage_type})</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-4 text-center text-fantasy-stone italic">
                  No attacks configured
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Spellcasting Quick Info (if applicable) */}
      {character.spellcasting_ability && (
        <div className="mt-4 pt-3 border-t border-fantasy-stone/30">
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <div className="text-xs text-fantasy-stone uppercase">Spell Ability</div>
              <div className="text-purple-400 font-bold capitalize">
                {character.spellcasting_ability?.slice(0, 3).toUpperCase()}
              </div>
            </div>
            <div>
              <div className="text-xs text-fantasy-stone uppercase">Save DC</div>
              <div className="text-purple-400 font-bold">
                {character.spell_save_dc || calculateSpellSaveDC(character)}
              </div>
            </div>
            <div>
              <div className="text-xs text-fantasy-stone uppercase">Attack</div>
              <div className="text-purple-400 font-bold">
                {formatModifier(character.spell_attack_bonus || calculateSpellAttackBonus(character))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Generate default attacks based on equipment
function generateDefaultAttacks(character: Character): Attack[] {
  const attacks: Attack[] = []
  const strMod = getModifier(character.strength)
  const dexMod = getModifier(character.dexterity)
  const profBonus = character.proficiency_bonus || 2

  // Check equipment for weapons
  if (character.equipment) {
    Object.values(character.equipment).forEach((item: any) => {
      const itemName = typeof item === 'string' ? item : item?.name || ''
      const lowerName = itemName.toLowerCase()

      // Simple weapon detection
      if (lowerName.includes('sword') || lowerName.includes('longsword')) {
        attacks.push({
          name: itemName,
          attack_bonus: strMod + profBonus,
          damage: `1d8${formatModifier(strMod)}`,
          damage_type: 'slashing'
        })
      } else if (lowerName.includes('dagger')) {
        attacks.push({
          name: itemName,
          attack_bonus: Math.max(strMod, dexMod) + profBonus,
          damage: `1d4${formatModifier(Math.max(strMod, dexMod))}`,
          damage_type: 'piercing'
        })
      } else if (lowerName.includes('bow') || lowerName.includes('crossbow')) {
        attacks.push({
          name: itemName,
          attack_bonus: dexMod + profBonus,
          damage: lowerName.includes('longbow') ? `1d8${formatModifier(dexMod)}` : `1d6${formatModifier(dexMod)}`,
          damage_type: 'piercing'
        })
      } else if (lowerName.includes('staff') || lowerName.includes('quarterstaff')) {
        attacks.push({
          name: itemName,
          attack_bonus: strMod + profBonus,
          damage: `1d6${formatModifier(strMod)}`,
          damage_type: 'bludgeoning'
        })
      } else if (lowerName.includes('mace') || lowerName.includes('hammer')) {
        attacks.push({
          name: itemName,
          attack_bonus: strMod + profBonus,
          damage: `1d6${formatModifier(strMod)}`,
          damage_type: 'bludgeoning'
        })
      } else if (lowerName.includes('axe')) {
        attacks.push({
          name: itemName,
          attack_bonus: strMod + profBonus,
          damage: lowerName.includes('great') ? `1d12${formatModifier(strMod)}` : `1d8${formatModifier(strMod)}`,
          damage_type: 'slashing'
        })
      }
    })
  }

  // Add unarmed strike as fallback
  if (attacks.length === 0) {
    attacks.push({
      name: 'Unarmed Strike',
      attack_bonus: strMod + profBonus,
      damage: `1${formatModifier(strMod)}`,
      damage_type: 'bludgeoning'
    })
  }

  return attacks
}

function calculateSpellSaveDC(character: Character): number {
  if (!character.spellcasting_ability) return 8
  const abilityScore = character[character.spellcasting_ability as keyof Character] as number || 10
  return 8 + getModifier(abilityScore) + (character.proficiency_bonus || 2)
}

function calculateSpellAttackBonus(character: Character): number {
  if (!character.spellcasting_ability) return 0
  const abilityScore = character[character.spellcasting_ability as keyof Character] as number || 10
  return getModifier(abilityScore) + (character.proficiency_bonus || 2)
}
