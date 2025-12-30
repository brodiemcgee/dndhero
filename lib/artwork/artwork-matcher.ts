/**
 * Artwork Matching Service
 * Finds and reuses existing artwork from the library to save API costs
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { type ArtStyle } from '@/lib/ai-dm/art-styles'

export type AssetType = 'npc_portrait' | 'monster_portrait' | 'scene' | 'location'

export interface ArtworkMatchParams {
  artStyle: ArtStyle
  assetType: AssetType
  tags: string[]
  creatureType?: string
  creatureSubtype?: string
  environmentType?: string
  mood?: string
}

export interface ArtworkMatch {
  id: string
  imageUrl: string
  matchScore: number
  matchedTags: string[]
}

interface ArtworkLibraryRow {
  id: string
  image_url: string
  tags: string[]
  creature_type: string | null
  creature_subtype: string | null
  environment_type: string | null
  mood: string | null
}

/**
 * Find an exact match (100%) from the artwork library
 * Only returns if ALL criteria match exactly
 */
export async function findExactArtworkMatch(
  supabase: SupabaseClient,
  params: ArtworkMatchParams
): Promise<ArtworkMatch | null> {
  const { artStyle, assetType, tags, creatureType, creatureSubtype, environmentType, mood } = params

  // Query the artwork library
  let query = supabase
    .from('artwork_library')
    .select('id, image_url, tags, creature_type, creature_subtype, environment_type, mood')
    .eq('asset_type', assetType)
    .eq('art_style', artStyle)

  // Add optional filters
  if (creatureType) {
    query = query.eq('creature_type', creatureType)
  }
  if (creatureSubtype) {
    query = query.eq('creature_subtype', creatureSubtype)
  }
  if (environmentType) {
    query = query.eq('environment_type', environmentType)
  }
  if (mood) {
    query = query.eq('mood', mood)
  }

  // For tags, we need to check that all requested tags are present
  // Use containedBy for exact match
  if (tags.length > 0) {
    query = query.contains('tags', tags)
  }

  const { data, error } = await query.limit(10)

  if (error || !data || data.length === 0) {
    return null
  }

  // Find the best match - must be 100%
  for (const artwork of data as ArtworkLibraryRow[]) {
    const artworkTags = artwork.tags || []

    // Check if all requested tags are in artwork tags AND vice versa
    const allTagsMatch =
      tags.every(t => artworkTags.includes(t)) &&
      artworkTags.every(t => tags.includes(t))

    if (allTagsMatch) {
      return {
        id: artwork.id,
        imageUrl: artwork.image_url,
        matchScore: 100,
        matchedTags: tags,
      }
    }
  }

  return null
}

/**
 * Store new artwork in the library after generation
 */
export async function storeArtworkInLibrary(
  supabase: SupabaseClient,
  imageUrl: string,
  params: ArtworkMatchParams,
  originalPrompt: string,
  originalDescription?: string,
  createdBy?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  const { data, error } = await supabase
    .from('artwork_library')
    .insert({
      image_url: imageUrl,
      asset_type: params.assetType,
      art_style: params.artStyle,
      tags: params.tags,
      creature_type: params.creatureType || null,
      creature_subtype: params.creatureSubtype || null,
      environment_type: params.environmentType || null,
      mood: params.mood || null,
      original_prompt: originalPrompt,
      original_description: originalDescription || null,
      usage_count: 1,
      created_by: createdBy || null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to store artwork in library:', error)
    return { success: false, error: error.message }
  }

  return { success: true, id: data.id }
}

/**
 * Increment usage count for an artwork
 */
export async function incrementArtworkUsage(
  supabase: SupabaseClient,
  artworkId: string
): Promise<void> {
  await supabase.rpc('increment_artwork_usage', { artwork_id: artworkId })
    .catch(err => {
      // Fallback to manual increment if RPC doesn't exist
      supabase
        .from('artwork_library')
        .update({ usage_count: supabase.rpc('increment_artwork_usage_inline', { id: artworkId }) })
        .eq('id', artworkId)
        .then(() => {})
        .catch(() => {
          // Last resort - just update with a query
          console.error('Failed to increment artwork usage:', err)
        })
    })
}

// =============================================
// TAG EXTRACTION FUNCTIONS
// =============================================

// Common fantasy races for detection
const RACES = [
  'human', 'elf', 'high elf', 'wood elf', 'dark elf', 'drow',
  'dwarf', 'hill dwarf', 'mountain dwarf',
  'halfling', 'gnome', 'half-elf', 'half-orc',
  'tiefling', 'dragonborn', 'aasimar', 'goliath',
  'tabaxi', 'kenku', 'firbolg', 'lizardfolk', 'tortle',
  'warforged', 'changeling', 'shifter', 'genasi',
  'orc', 'goblin', 'hobgoblin', 'bugbear', 'kobold',
  'troll', 'ogre', 'giant', 'skeleton', 'zombie', 'ghost',
  'vampire', 'werewolf', 'demon', 'devil', 'angel',
]

// Common roles/classes
const ROLES = [
  'warrior', 'fighter', 'knight', 'paladin', 'soldier', 'guard',
  'wizard', 'mage', 'sorcerer', 'warlock', 'witch',
  'cleric', 'priest', 'priestess', 'healer',
  'rogue', 'thief', 'assassin', 'spy',
  'ranger', 'hunter', 'archer', 'scout',
  'barbarian', 'berserker',
  'druid', 'shaman',
  'bard', 'minstrel',
  'monk', 'martial artist',
  'merchant', 'shopkeeper', 'trader', 'vendor',
  'innkeeper', 'bartender', 'tavern keeper',
  'blacksmith', 'smith', 'craftsman', 'artisan',
  'noble', 'lord', 'lady', 'king', 'queen', 'prince', 'princess',
  'peasant', 'farmer', 'villager', 'commoner',
  'beggar', 'urchin',
  'sailor', 'pirate', 'captain',
]

// Physical descriptors
const AGE_GROUPS = ['young', 'youthful', 'middle-aged', 'old', 'elderly', 'ancient', 'ageless']
const GENDERS = ['male', 'female', 'androgynous']
const FEATURES = [
  'scarred', 'tattooed', 'hooded', 'armored', 'robed',
  'bearded', 'bald', 'muscular', 'thin', 'fat', 'tall', 'short',
  'one-eyed', 'blind', 'masked', 'cloaked',
]

// Environment types
const ENVIRONMENTS = [
  'forest', 'woodland', 'jungle', 'swamp', 'marsh',
  'mountain', 'cave', 'underground', 'dungeon', 'mine',
  'desert', 'wasteland', 'badlands',
  'ocean', 'sea', 'beach', 'coast', 'underwater',
  'city', 'town', 'village', 'urban', 'street', 'alley',
  'castle', 'fortress', 'tower', 'palace', 'keep',
  'tavern', 'inn', 'pub', 'bar',
  'temple', 'church', 'shrine', 'cathedral',
  'library', 'study', 'archive',
  'market', 'bazaar', 'shop',
  'cemetery', 'graveyard', 'crypt', 'tomb',
  'battlefield', 'ruins', 'abandoned',
  'farm', 'field', 'meadow', 'plains', 'grassland',
  'arctic', 'tundra', 'ice', 'snow', 'frozen',
  'volcanic', 'lava', 'fire', 'infernal',
]

// Time and weather
const TIME_OF_DAY = ['dawn', 'morning', 'day', 'afternoon', 'dusk', 'evening', 'night', 'midnight']
const WEATHER = ['sunny', 'cloudy', 'overcast', 'rainy', 'stormy', 'foggy', 'misty', 'snowy']

// Moods
const MOODS = ['peaceful', 'tense', 'mysterious', 'dangerous', 'dark', 'bright', 'hopeful', 'ominous', 'epic', 'exciting']

/**
 * Parse NPC/monster description into searchable tags
 */
export function parseNpcToTags(
  name: string,
  type: 'npc' | 'monster',
  description: string
): { tags: string[]; creatureType: string | null; creatureSubtype: string | null } {
  const text = `${name} ${description}`.toLowerCase()
  const tags: string[] = []
  let creatureType: string | null = null
  let creatureSubtype: string | null = null

  // Detect race/creature
  for (const race of RACES) {
    if (text.includes(race)) {
      tags.push(race)
      creatureSubtype = race

      // Determine creature type based on race
      if (['human', 'elf', 'dwarf', 'halfling', 'gnome', 'half-elf', 'half-orc', 'tiefling', 'aasimar'].includes(race)) {
        creatureType = 'humanoid'
      } else if (['dragon', 'dragonborn', 'kobold'].includes(race)) {
        creatureType = 'dragon'
      } else if (['skeleton', 'zombie', 'ghost', 'vampire'].includes(race)) {
        creatureType = 'undead'
      } else if (['demon', 'devil'].includes(race)) {
        creatureType = 'fiend'
      } else if (['angel'].includes(race)) {
        creatureType = 'celestial'
      } else if (['goblin', 'hobgoblin', 'bugbear', 'orc', 'ogre', 'troll', 'giant'].includes(race)) {
        creatureType = 'humanoid'
      }

      break // Take first match
    }
  }

  // Default creature type for monsters
  if (type === 'monster' && !creatureType) {
    creatureType = 'beast'
  }

  // Detect role/class
  for (const role of ROLES) {
    if (text.includes(role)) {
      tags.push(role)
      break
    }
  }

  // Detect gender
  for (const gender of GENDERS) {
    if (text.includes(gender)) {
      tags.push(gender)
      break
    }
  }

  // Detect age
  for (const age of AGE_GROUPS) {
    if (text.includes(age)) {
      tags.push(age)
      break
    }
  }

  // Detect features
  for (const feature of FEATURES) {
    if (text.includes(feature)) {
      tags.push(feature)
    }
  }

  return { tags, creatureType, creatureSubtype }
}

/**
 * Parse scene description into searchable tags
 */
export function parseSceneToTags(
  locationName: string,
  description: string,
  mood?: string
): { tags: string[]; environmentType: string | null; detectedMood: string | null } {
  const text = `${locationName} ${description}`.toLowerCase()
  const tags: string[] = []
  let environmentType: string | null = null
  let detectedMood: string | null = mood || null

  // Detect environment
  for (const env of ENVIRONMENTS) {
    if (text.includes(env)) {
      tags.push(env)
      if (!environmentType) {
        environmentType = env
      }
    }
  }

  // Detect time of day
  for (const time of TIME_OF_DAY) {
    if (text.includes(time)) {
      tags.push(time)
      break
    }
  }

  // Detect weather
  for (const weather of WEATHER) {
    if (text.includes(weather)) {
      tags.push(weather)
      break
    }
  }

  // Detect mood from description if not provided
  if (!detectedMood) {
    for (const m of MOODS) {
      if (text.includes(m)) {
        detectedMood = m
        break
      }
    }
  }

  if (detectedMood) {
    tags.push(detectedMood)
  }

  return { tags, environmentType, detectedMood }
}

/**
 * Detect creature type from entity type and description
 */
export function detectCreatureType(type: 'npc' | 'monster', description: string): string {
  const text = description.toLowerCase()

  // Check common creature types
  const creatureTypes = [
    'aberration', 'beast', 'celestial', 'construct', 'dragon',
    'elemental', 'fey', 'fiend', 'giant', 'humanoid',
    'monstrosity', 'ooze', 'plant', 'undead',
  ]

  for (const ct of creatureTypes) {
    if (text.includes(ct)) {
      return ct
    }
  }

  // Default based on type
  return type === 'monster' ? 'beast' : 'humanoid'
}
