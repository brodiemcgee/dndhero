import type { Race } from '@/types/character-options'
import { HUMAN } from './human'
import { ELF } from './elf'
import { DWARF } from './dwarf'
import { HALFLING } from './halfling'
import { DRAGONBORN } from './dragonborn'
import { GNOME } from './gnome'
import { HALF_ELF } from './half-elf'
import { HALF_ORC } from './half-orc'
import { TIEFLING } from './tiefling'

export const ALL_RACES: Race[] = [
  HUMAN,
  ELF,
  DWARF,
  HALFLING,
  DRAGONBORN,
  GNOME,
  HALF_ELF,
  HALF_ORC,
  TIEFLING,
]

export const RACES_BY_ID: Record<string, Race> = Object.fromEntries(
  ALL_RACES.map(race => [race.id, race])
)

export function getRaceById(id: string): Race | undefined {
  return RACES_BY_ID[id]
}

export function getRaceByName(name: string): Race | undefined {
  return ALL_RACES.find(race => race.name.toLowerCase() === name.toLowerCase())
}

// Re-export individual races
export { HUMAN, ELF, DWARF, HALFLING, DRAGONBORN, GNOME, HALF_ELF, HALF_ORC, TIEFLING }
