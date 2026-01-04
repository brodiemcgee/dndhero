/**
 * DALL-E Image Generation Client
 * Server-side only - handles AI image generation for characters, NPCs, and scenes
 */

import { type ArtStyle, getArtStyleModifier, DEFAULT_ART_STYLE } from './art-styles'

// DALL-E model configuration
const DALLE_MODEL = 'dall-e-3'
const DALLE_API_ENDPOINT = 'https://api.openai.com/v1/images/generations'

/**
 * Shared result type for all image generation
 */
export interface ImageGenerationResult {
  success: boolean
  imageData?: Buffer
  mimeType?: string
  error?: string
}

/**
 * Parameters for building a character portrait prompt
 */
export interface PortraitPromptParams {
  name: string
  race: string
  class: string
  gender?: string | null
  age?: string | null
  height?: string | null
  build?: string | null
  skinTone?: string | null
  hairColor?: string | null
  hairStyle?: string | null
  eyeColor?: string | null
  distinguishingFeatures?: string | null
  clothingStyle?: string | null
  background?: string | null
  artStyle?: ArtStyle | null
}

/**
 * Parameters for NPC/Monster portrait generation
 */
export interface NpcPortraitParams {
  name: string
  type: 'npc' | 'monster'
  description?: string
  artStyle: ArtStyle
  campaignSetting?: string
}

/**
 * Parameters for scene art generation
 */
export interface SceneArtParams {
  locationName: string
  sceneDescription: string
  mood?: string
  artStyle: ArtStyle
  campaignSetting?: string
}

/**
 * Get race-specific descriptors for the prompt
 */
function getRaceDescriptors(race: string): string {
  const raceDescriptors: Record<string, string> = {
    human: 'human',
    elf: 'elven with pointed ears and graceful features',
    'high elf': 'high elf with elegant pointed ears and refined elven features',
    'wood elf': 'wood elf with earthy features and leaf-like pointed ears',
    'dark elf': 'dark elf (drow) with obsidian skin and white hair',
    dwarf: 'dwarven with a stout build and prominent beard',
    'hill dwarf': 'hill dwarf with weathered features and braided beard',
    'mountain dwarf': 'mountain dwarf with strong jaw and elaborate beard',
    halfling: 'halfling with a small stature and youthful appearance',
    'lightfoot halfling': 'lightfoot halfling with nimble features',
    'stout halfling': 'stout halfling with hardy features',
    gnome: 'gnome with small stature, large eyes, and pointed ears',
    'forest gnome': 'forest gnome with nature-touched features',
    'rock gnome': 'rock gnome with curious, inventive appearance',
    'half-elf': 'half-elf with subtle pointed ears and mixed human-elven features',
    'half-orc': 'half-orc with prominent tusks and greenish skin',
    tiefling: 'tiefling with demonic horns, unusual skin color, and a tail',
    dragonborn: 'dragonborn with draconic scales, snout, and no hair',
    aasimar: 'aasimar with celestial features and subtle radiance',
    goliath: 'goliath with gray stone-like skin and towering height',
    tabaxi: 'tabaxi with feline features, fur, and cat-like eyes',
    kenku: 'kenku with raven-like features and dark feathers',
    firbolg: 'firbolg with giant-kin features and a gentle demeanor',
    lizardfolk: 'lizardfolk with reptilian scales and a tail',
    tortle: 'tortle with a turtle shell and reptilian features',
    warforged: 'warforged construct with metallic and wood composite body',
    changeling: 'changeling with pale, almost featureless appearance',
    kalashtar: 'kalashtar with serene, ethereal human-like features',
    shifter: 'shifter with bestial features hinting at lycanthropic heritage',
    genasi: 'genasi with elemental features',
    'fire genasi': 'fire genasi with flame-like hair and warm-toned skin',
    'water genasi': 'water genasi with blue-green skin and flowing features',
    'earth genasi': 'earth genasi with stone-like skin and crystalline features',
    'air genasi': 'air genasi with pale skin and wind-swept features',
  }

  const normalized = race.toLowerCase()
  return raceDescriptors[normalized] || `${race} fantasy race`
}

/**
 * Get class-specific descriptors for the prompt
 */
function getClassDescriptors(characterClass: string): string {
  const classDescriptors: Record<string, string> = {
    barbarian: 'fierce barbarian warrior with tribal markings',
    bard: 'charismatic bard with artistic flair',
    cleric: 'devout cleric with holy symbols',
    druid: 'nature-attuned druid with organic elements',
    fighter: 'battle-hardened fighter with martial bearing',
    monk: 'disciplined monk with serene composure',
    paladin: 'noble paladin with righteous bearing',
    ranger: 'wilderness ranger with a keen hunter\'s gaze',
    rogue: 'cunning rogue with shadowy demeanor',
    sorcerer: 'innate sorcerer with magical energy',
    warlock: 'mysterious warlock with otherworldly presence',
    wizard: 'learned wizard with arcane knowledge',
    artificer: 'inventive artificer with mechanical accessories',
    'blood hunter': 'grim blood hunter with marked features',
  }

  const normalized = characterClass.toLowerCase()
  return classDescriptors[normalized] || `${characterClass} adventurer`
}

/**
 * Build a detailed portrait prompt from character parameters
 */
export function buildPortraitPrompt(params: PortraitPromptParams): string {
  const {
    race,
    class: characterClass,
    gender,
    age,
    height,
    build,
    skinTone,
    hairColor,
    hairStyle,
    eyeColor,
    distinguishingFeatures,
    clothingStyle,
    background,
    artStyle,
  } = params

  // Get art style modifier
  const styleModifier = getArtStyleModifier(artStyle)

  // Build the core description
  const raceDesc = getRaceDescriptors(race)
  const classDesc = getClassDescriptors(characterClass)

  // Build physical description parts
  const physicalParts: string[] = []

  if (gender) {
    physicalParts.push(gender.toLowerCase())
  }

  if (age) {
    physicalParts.push(age.toLowerCase())
  }

  // Build appearance description
  const appearanceParts: string[] = []

  if (skinTone) {
    appearanceParts.push(`${skinTone} skin`)
  }

  if (hairColor && hairStyle) {
    appearanceParts.push(`${hairColor} ${hairStyle} hair`)
  } else if (hairColor) {
    appearanceParts.push(`${hairColor} hair`)
  } else if (hairStyle) {
    appearanceParts.push(`${hairStyle} hair`)
  }

  if (eyeColor) {
    appearanceParts.push(`${eyeColor} eyes`)
  }

  // Build the prompt
  let prompt = `A fantasy character portrait of a`

  if (physicalParts.length > 0) {
    prompt += ` ${physicalParts.join(' ')}`
  }

  prompt += ` ${raceDesc}, a ${classDesc}.`

  // Add physical build
  if (height || build) {
    const buildParts: string[] = []
    if (height) buildParts.push(height.toLowerCase())
    if (build) buildParts.push(build.toLowerCase())
    prompt += ` They have a ${buildParts.join(', ')} build.`
  }

  // Add appearance details
  if (appearanceParts.length > 0) {
    prompt += ` Physical features: ${appearanceParts.join(', ')}.`
  }

  // Add distinguishing features
  if (distinguishingFeatures) {
    prompt += ` Notable features: ${distinguishingFeatures}.`
  }

  // Add clothing
  if (clothingStyle) {
    prompt += ` Wearing: ${clothingStyle}.`
  } else if (background) {
    // Use background to infer clothing if not specified
    prompt += ` Dressed appropriately for a ${background.toLowerCase()}.`
  }

  // Add style guidelines using the campaign's art style
  prompt += ` Style: ${styleModifier}. Dramatic lighting, heroic pose. Portrait composition, head and shoulders, facing the viewer. Professional fantasy RPG character art, vibrant colors, detailed textures. Simple dark gradient or subtle fantasy environment background. No text, watermarks, borders, or frames.`

  return prompt
}

/**
 * Build a portrait prompt for an NPC or monster
 */
export function buildNpcPortraitPrompt(params: NpcPortraitParams): string {
  const { name, type, description, artStyle, campaignSetting } = params

  const styleModifier = getArtStyleModifier(artStyle)
  const typeDescription = type === 'monster' ? 'fantasy creature or monster' : 'fantasy NPC character'

  let prompt = `A portrait of ${name}, a ${typeDescription}.`

  if (description) {
    prompt += ` ${description}.`
  }

  if (campaignSetting) {
    prompt += ` Set in a ${campaignSetting} world.`
  }

  prompt += ` Style: ${styleModifier}. Dramatic lighting. Portrait composition, head and shoulders, facing the viewer. Professional fantasy RPG character art, vibrant colors. Simple, contextual fantasy environment background. No text, watermarks, borders, frames, or multiple characters.`

  return prompt
}

/**
 * Build a scene art prompt
 */
export function buildSceneArtPrompt(params: SceneArtParams): string {
  const { locationName, sceneDescription, mood, artStyle, campaignSetting } = params

  const styleModifier = getArtStyleModifier(artStyle)

  let prompt = `A fantasy scene illustration: ${locationName}. ${sceneDescription}.`

  if (campaignSetting) {
    prompt += ` Set in a ${campaignSetting} world.`
  }

  if (mood) {
    const moodDescriptors: Record<string, string> = {
      tense: 'Tense atmosphere, dramatic shadows, sense of anticipation',
      peaceful: 'Serene and calm, soft lighting, welcoming ambiance',
      mysterious: 'Shrouded in mystery, ethereal mist, hidden depths',
      exciting: 'Dynamic and energetic, vivid colors, sense of adventure',
      dark: 'Dark and foreboding, ominous shadows, gothic atmosphere',
      hopeful: 'Warm light breaking through, uplifting colors, sense of possibility',
      dangerous: 'Treacherous environment, warning signs, tension in the air',
      epic: 'Grand scale, awe-inspiring vistas, heroic proportions',
    }
    const moodDesc = moodDescriptors[mood] || mood
    prompt += ` Mood: ${moodDesc}.`
  }

  prompt += ` Style: ${styleModifier}. Cinematic composition, atmospheric lighting. Wide landscape view, establishing shot, immersive environment. Professional fantasy illustration, highly detailed environment. No text, watermarks, UI elements, or close-up of characters.`

  return prompt
}

/**
 * Core DALL-E API call function
 */
async function callDalleApi(
  prompt: string,
  size: '1024x1024' | '1792x1024' | '1024x1792'
): Promise<ImageGenerationResult> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return {
      success: false,
      error: 'OPENAI_API_KEY environment variable is not set',
    }
  }

  try {
    const response = await fetch(DALLE_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DALLE_MODEL,
        prompt: prompt,
        n: 1,
        size: size,
        quality: 'standard',
        response_format: 'b64_json',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('DALL-E API error:', errorData)
      return {
        success: false,
        error: errorData.error?.message || `API error: ${response.status}`,
      }
    }

    const data = await response.json()

    // Check if we got any images
    if (!data.data || data.data.length === 0) {
      return {
        success: false,
        error: 'No image generated',
      }
    }

    // Get the base64 image data
    const imageData = data.data[0].b64_json

    if (!imageData) {
      return {
        success: false,
        error: 'No image data in response',
      }
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageData, 'base64')

    return {
      success: true,
      imageData: imageBuffer,
      mimeType: 'image/png',
    }
  } catch (error) {
    console.error('DALL-E generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during generation',
    }
  }
}

/**
 * Generate a character portrait using OpenAI DALL-E API
 */
export async function generatePortrait(
  params: PortraitPromptParams
): Promise<ImageGenerationResult> {
  const prompt = buildPortraitPrompt(params)
  return callDalleApi(prompt, '1024x1024')
}

/**
 * Generate an NPC or monster portrait using OpenAI DALL-E API
 */
export async function generateNpcPortrait(
  params: NpcPortraitParams
): Promise<ImageGenerationResult> {
  const prompt = buildNpcPortraitPrompt(params)
  return callDalleApi(prompt, '1024x1024')
}

/**
 * Generate scene art using OpenAI DALL-E API (landscape format)
 */
export async function generateSceneArt(
  params: SceneArtParams
): Promise<ImageGenerationResult> {
  const prompt = buildSceneArtPrompt(params)
  return callDalleApi(prompt, '1792x1024')
}

/**
 * Validate that the DALL-E API is accessible
 */
export async function validateDalleApi(): Promise<boolean> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return false
  }

  return true
}

/**
 * Get model info
 */
export function getDalleModelInfo(): {
  name: string
  portraitSize: string
  sceneSize: string
  outputFormat: string
} {
  return {
    name: DALLE_MODEL,
    portraitSize: '1024x1024',
    sceneSize: '1792x1024',
    outputFormat: 'PNG',
  }
}

// Legacy exports for backwards compatibility
export { ImageGenerationResult as PortraitGenerationResult }
export const validateImagenApi = validateDalleApi
export const getImagenModelInfo = getDalleModelInfo
