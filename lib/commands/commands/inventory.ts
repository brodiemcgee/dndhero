import { Command, CommandResult, TableData } from '../types'

interface InventoryItem {
  id?: string
  name: string
  quantity?: number
  description?: string
  type?: string
  weight?: number
  value?: string
}

interface Currency {
  cp?: number
  sp?: number
  ep?: number
  gp?: number
  pp?: number
}

interface Attack {
  name: string
  attack_bonus?: number
  damage?: string
  damage_type?: string
}

/**
 * Format currency for display
 */
function formatCurrency(currency: Currency): string {
  const parts: string[] = []

  if (currency.pp && currency.pp > 0) parts.push(`${currency.pp} pp`)
  if (currency.gp && currency.gp > 0) parts.push(`${currency.gp} gp`)
  if (currency.ep && currency.ep > 0) parts.push(`${currency.ep} ep`)
  if (currency.sp && currency.sp > 0) parts.push(`${currency.sp} sp`)
  if (currency.cp && currency.cp > 0) parts.push(`${currency.cp} cp`)

  return parts.length > 0 ? parts.join(', ') : 'None'
}

/**
 * Format equipment slot
 */
function formatEquipmentSlot(slot: string): string {
  const slotNames: Record<string, string> = {
    head: 'Head',
    body: 'Body',
    hands: 'Hands',
    feet: 'Feet',
    neck: 'Neck',
    ring1: 'Ring 1',
    ring2: 'Ring 2',
    mainHand: 'Main Hand',
    offHand: 'Off Hand',
    armor: 'Armor',
    shield: 'Shield',
  }
  return slotNames[slot] || slot
}

export const inventoryCommand: Command = {
  name: 'inventory',
  aliases: ['inv', 'items', 'equipment', 'eq'],
  description: 'Show your inventory, equipment, and currency',
  usage: '/inventory',
  examples: ['/inventory', '/inv'],

  execute: async (args, context): Promise<CommandResult> => {
    const { supabase, characterId } = context

    const { data: character, error } = await supabase
      .from('characters')
      .select(`
        name,
        inventory,
        equipment,
        currency,
        gold,
        attacks
      `)
      .eq('id', characterId)
      .single()

    if (error || !character) {
      return {
        type: 'error',
        content: 'Could not load character data.',
      }
    }

    const lines: string[] = []

    // Currency
    const currency = character.currency as Currency || {}
    // Support legacy gold field
    if (character.gold && !currency.gp) {
      currency.gp = character.gold
    }
    lines.push(`**Currency:** ${formatCurrency(currency)}`)
    lines.push('')

    // Equipment (equipped items)
    const equipment = character.equipment as Record<string, string | InventoryItem> || {}
    const equippedSlots = Object.entries(equipment).filter(([_, item]) => item)

    if (equippedSlots.length > 0) {
      lines.push('**Equipped:**')
      equippedSlots.forEach(([slot, item]) => {
        const itemName = typeof item === 'string' ? item : item.name
        lines.push(`  ${formatEquipmentSlot(slot)}: ${itemName}`)
      })
      lines.push('')
    }

    // Attacks
    const attacks = character.attacks as Attack[] || []
    if (attacks.length > 0) {
      lines.push('**Attacks:**')
      attacks.forEach(atk => {
        const bonus = atk.attack_bonus !== undefined
          ? (atk.attack_bonus >= 0 ? `+${atk.attack_bonus}` : `${atk.attack_bonus}`)
          : ''
        const damage = atk.damage || ''
        const damageType = atk.damage_type ? ` ${atk.damage_type}` : ''
        lines.push(`  ${atk.name}: ${bonus} to hit, ${damage}${damageType}`)
      })
      lines.push('')
    }

    // Inventory items
    const inventory = character.inventory as InventoryItem[] || []

    if (inventory.length === 0) {
      lines.push('**Inventory:** Empty')
    } else {
      lines.push('**Inventory:**')

      // Group by type if available
      const byType = new Map<string, InventoryItem[]>()
      inventory.forEach(item => {
        const type = item.type || 'Other'
        if (!byType.has(type)) {
          byType.set(type, [])
        }
        byType.get(type)!.push(item)
      })

      if (byType.size === 1 && byType.has('Other')) {
        // No types, just list items
        inventory.forEach(item => {
          const qty = item.quantity && item.quantity > 1 ? ` (x${item.quantity})` : ''
          lines.push(`  ${item.name}${qty}`)
        })
      } else {
        // Group by type
        byType.forEach((items, type) => {
          lines.push(`  *${type}:*`)
          items.forEach(item => {
            const qty = item.quantity && item.quantity > 1 ? ` (x${item.quantity})` : ''
            lines.push(`    ${item.name}${qty}`)
          })
        })
      }
    }

    // Total weight if available
    const totalWeight = inventory.reduce((sum, item) => {
      const qty = item.quantity || 1
      const weight = item.weight || 0
      return sum + (weight * qty)
    }, 0)

    if (totalWeight > 0) {
      lines.push('')
      lines.push(`**Total Weight:** ${totalWeight} lb`)
    }

    return {
      type: 'text',
      title: `${character.name}'s Inventory`,
      content: lines.join('\n'),
    }
  },
}
