/**
 * Party Level Utilities for AI DM
 * Calculates party level and provides encounter scaling guidance
 */

export interface PartyLevelInfo {
  averageLevel: number
  partyTier: 1 | 2 | 3 | 4
  tierName: string
  partySize: number
  minLevel: number
  maxLevel: number
  appropriateCRRange: { min: number; max: number }
}

interface CharacterWithLevel {
  level?: number | null
}

/**
 * Calculate party level information from a list of characters
 */
export function calculatePartyLevelInfo(
  characters: CharacterWithLevel[]
): PartyLevelInfo {
  if (!characters || characters.length === 0) {
    return {
      averageLevel: 1,
      partyTier: 1,
      tierName: 'Tier 1: Local Heroes',
      partySize: 0,
      minLevel: 1,
      maxLevel: 1,
      appropriateCRRange: { min: 0.125, max: 2 },
    }
  }

  const levels = characters.map(c => c.level || 1)
  const averageLevel = Math.round(levels.reduce((a, b) => a + b, 0) / levels.length)
  const minLevel = Math.min(...levels)
  const maxLevel = Math.max(...levels)

  // Determine party tier based on D&D 5e tier system
  let partyTier: 1 | 2 | 3 | 4
  let tierName: string
  let appropriateCRRange: { min: number; max: number }

  if (averageLevel <= 4) {
    partyTier = 1
    tierName = 'Tier 1: Local Heroes'
    appropriateCRRange = { min: 0.125, max: averageLevel + 1 }
  } else if (averageLevel <= 10) {
    partyTier = 2
    tierName = 'Tier 2: Heroes of the Realm'
    appropriateCRRange = { min: averageLevel - 2, max: averageLevel + 3 }
  } else if (averageLevel <= 16) {
    partyTier = 3
    tierName = 'Tier 3: Masters of the Realm'
    appropriateCRRange = { min: averageLevel - 3, max: averageLevel + 5 }
  } else {
    partyTier = 4
    tierName = 'Tier 4: Masters of the World'
    appropriateCRRange = { min: averageLevel - 4, max: 30 }
  }

  return {
    averageLevel,
    partyTier,
    tierName,
    partySize: characters.length,
    minLevel,
    maxLevel,
    appropriateCRRange,
  }
}

/**
 * Build party level guidance text for the AI DM system prompt
 */
export function buildPartyLevelGuidance(info: PartyLevelInfo): string {
  if (info.partySize === 0) {
    return ''
  }

  const tierGuidance = getTierGuidance(info.partyTier, info.averageLevel)

  return `=== PARTY LEVEL AND ENCOUNTER SCALING ===

PARTY COMPOSITION:
- Average Level: ${info.averageLevel}
- Party Size: ${info.partySize} character${info.partySize !== 1 ? 's' : ''}
- Level Range: ${info.minLevel === info.maxLevel ? `Level ${info.minLevel}` : `${info.minLevel}-${info.maxLevel}`}
- Tier: ${info.partyTier} (${info.tierName})

${tierGuidance}

IMPORTANT SCALING RULES:
- Match monster CR to party level - use CR ${info.appropriateCRRange.min.toFixed(1).replace('.0', '')}-${info.appropriateCRRange.max} for appropriate challenge
- Scale treasure and rewards to party tier
- Narratively, threats should match their capabilities
- ${info.partySize < 4 ? 'SMALL PARTY: Reduce encounter difficulty or provide allies' : info.partySize > 5 ? 'LARGE PARTY: May need larger encounters or stronger single foes' : 'Standard party size - normal encounter balance'}
`
}

/**
 * Get tier-specific guidance for the DM
 */
function getTierGuidance(tier: 1 | 2 | 3 | 4, avgLevel: number): string {
  switch (tier) {
    case 1:
      return `TIER 1 ENCOUNTER GUIDANCE (Levels 1-4):
- Challenge Ratings: CR 0-${avgLevel + 1} creatures are appropriate
- Easy: Single CR ${Math.max(0.25, avgLevel - 2)} or group of CR 1/4 creatures
- Medium: CR ${Math.max(0.5, avgLevel - 1)} to CR ${avgLevel} creatures
- Hard: CR ${avgLevel + 1} or boss with minions
- Deadly: CR ${avgLevel + 2}+ (use sparingly with dramatic setup)

APPROPRIATE THREATS:
- Monsters: Goblins, kobolds, wolves, bandits, skeletons, giant rats
- Enemy types: Local thugs, cult initiates, minor beasts, small undead groups
- Environmental: Simple traps, difficult terrain, minor hazards

TREASURE (per significant encounter):
- Gold: 10-50 gp
- Items: Common items, basic equipment, potions of healing
- No magic items typically; scrolls of 1st level spells rare

NARRATIVE SCOPE:
- Stakes: Local village/neighborhood threats
- Travel: Local area, single town/village
- Allies: Common folk, local guards, helpful merchants`

    case 2:
      return `TIER 2 ENCOUNTER GUIDANCE (Levels 5-10):
- Challenge Ratings: CR ${avgLevel - 2}-${avgLevel + 3} creatures are appropriate
- Easy: CR ${avgLevel - 2} or multiple CR 1-2 creatures
- Medium: CR ${avgLevel - 1} to CR ${avgLevel + 1} creatures
- Hard: CR ${avgLevel + 2} or boss + significant minions
- Deadly: CR ${avgLevel + 4}+ (climactic battles only)

APPROPRIATE THREATS:
- Monsters: Trolls, young dragons, elementals, vampires, werewolves, chimeras
- Enemy types: Cult leaders, bandit captains, corrupt nobles with guards, minor demons
- Environmental: Magical traps, cursed items, moderate dungeon challenges

TREASURE (per significant encounter):
- Gold: 100-500 gp
- Magic items: Uncommon items common, occasional Rare items
- Consumables: Potions of greater healing, scrolls of 2nd-3rd level spells

NARRATIVE SCOPE:
- Stakes: Regional threats, town/city-level consequences
- Travel: Regions, multiple towns, wilderness journeys
- Allies: Local nobility, guild contacts, temple support`

    case 3:
      return `TIER 3 ENCOUNTER GUIDANCE (Levels 11-16):
- Challenge Ratings: CR ${avgLevel - 3}-${avgLevel + 5} creatures are appropriate
- Easy: CR ${avgLevel - 3} or multiple CR 5-7 creatures
- Medium: CR ${avgLevel - 1} to CR ${avgLevel + 2} creatures
- Hard: CR ${avgLevel + 3}-${avgLevel + 4} or multiple dangerous foes
- Deadly: CR ${avgLevel + 6}+ (world-shaking encounters)

APPROPRIATE THREATS:
- Monsters: Adult dragons, giants, liches, demon lords, powerful undead
- Enemy types: Archmages, warlords, planar entities, legendary beasts
- Environmental: Deadly traps, planar hazards, reality-warping effects

TREASURE (per significant encounter):
- Gold: 1,000-5,000 gp
- Magic items: Rare items common, occasional Very Rare items
- Consumables: Superior potions, scrolls of 4th-6th level spells

NARRATIVE SCOPE:
- Stakes: Continental/kingdom-level threats
- Travel: Continents, planes, teleportation circles
- Allies: Kings, archmages, planar beings`

    case 4:
      return `TIER 4 ENCOUNTER GUIDANCE (Levels 17-20):
- Challenge Ratings: CR ${avgLevel - 4}-30 creatures are appropriate
- Easy: CR ${avgLevel - 4} or multiple CR 10+ creatures
- Medium: CR ${avgLevel - 2} to CR ${avgLevel + 3} creatures
- Hard: CR ${avgLevel + 4}-CR 25 or armies of lesser foes
- Deadly: CR 26+ or deity-level threats

APPROPRIATE THREATS:
- Monsters: Ancient dragons, demon princes, archdevils, elder beings, gods' avatars
- Enemy types: Legendary villains, planar overlords, cosmic entities
- Environmental: World-ending phenomena, divine wrath, reality collapse

TREASURE (per significant encounter):
- Gold: 10,000+ gp
- Magic items: Very Rare items common, Legendary items possible
- Consumables: Supreme potions, scrolls of 7th-9th level spells, artifacts

NARRATIVE SCOPE:
- Stakes: World-ending/planar-level threats, divine conflicts
- Travel: Planes, divine realms, outer reaches of reality
- Allies: Demigods, celestials, legendary heroes, dragon councils`
  }
}
