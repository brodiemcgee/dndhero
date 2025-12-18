'use client'

/**
 * EquipmentPanel Component
 * Displays equipment, inventory, and currency breakdown
 * Styled like the official D&D character sheet
 */

import { Character, Currency } from './types'

interface EquipmentPanelProps {
  character: Character
}

export function EquipmentPanel({ character }: EquipmentPanelProps) {
  const currency = character.currency || { cp: 0, sp: 0, ep: 0, gp: character.gold || 0, pp: 0 }

  return (
    <div className="bg-fantasy-brown border-4 border-fantasy-tan rounded-lg p-4">
      {/* Currency Section */}
      <div className="mb-4">
        <h4 className="text-xs font-bold text-fantasy-gold uppercase tracking-wider mb-2 text-center border-b-2 border-fantasy-tan pb-2">
          Currency
        </h4>
        <div className="grid grid-cols-5 gap-1">
          <CurrencyBox label="CP" value={currency.cp} color="amber-700" />
          <CurrencyBox label="SP" value={currency.sp} color="gray-400" />
          <CurrencyBox label="EP" value={currency.ep} color="blue-400" />
          <CurrencyBox label="GP" value={currency.gp} color="yellow-500" />
          <CurrencyBox label="PP" value={currency.pp} color="purple-300" />
        </div>
      </div>

      {/* Equipment Section */}
      <div>
        <h4 className="text-xs font-bold text-fantasy-gold uppercase tracking-wider mb-2 text-center border-b-2 border-fantasy-tan pb-2">
          Equipment
        </h4>
        <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
          {/* Equipped Items */}
          {character.equipment && Object.keys(character.equipment).length > 0 ? (
            Object.entries(character.equipment).map(([slot, item]: [string, any], index) => (
              <EquipmentItem
                key={`equip-${index}`}
                name={typeof item === 'string' ? item : item?.name || slot}
                equipped
              />
            ))
          ) : null}

          {/* Inventory Items */}
          {character.inventory && character.inventory.length > 0 ? (
            character.inventory.map((item: any, index: number) => (
              <EquipmentItem
                key={`inv-${index}`}
                name={typeof item === 'string' ? item : item?.name || 'Unknown Item'}
                quantity={item?.quantity}
              />
            ))
          ) : null}

          {/* Empty State */}
          {(!character.equipment || Object.keys(character.equipment).length === 0) &&
           (!character.inventory || character.inventory.length === 0) && (
            <p className="text-sm text-fantasy-stone italic text-center py-4">
              No equipment
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

interface CurrencyBoxProps {
  label: string
  value: number
  color: string
}

function CurrencyBox({ label, value, color }: CurrencyBoxProps) {
  return (
    <div className="bg-fantasy-dark border border-fantasy-stone rounded p-1 text-center">
      <div className={`text-lg font-bold text-${color}`}>{value}</div>
      <div className="text-xs text-fantasy-stone">{label}</div>
    </div>
  )
}

interface EquipmentItemProps {
  name: string
  equipped?: boolean
  quantity?: number
}

function EquipmentItem({ name, equipped, quantity }: EquipmentItemProps) {
  return (
    <div className={`
      flex items-center justify-between px-2 py-1 rounded text-sm
      ${equipped ? 'bg-purple-900/30 border border-purple-700/50' : 'bg-fantasy-dark/30'}
    `}>
      <span className={equipped ? 'text-purple-300' : 'text-fantasy-tan'}>
        {name}
      </span>
      <span className="text-fantasy-stone text-xs">
        {equipped && '(E)'}
        {quantity && quantity > 1 && `x${quantity}`}
      </span>
    </div>
  )
}
