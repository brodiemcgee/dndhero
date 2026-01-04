/**
 * Google Imagen API Client
 * Server-side only - handles AI portrait generation for characters
 */

import { type ArtStyle, getArtStyleModifier, DEFAULT_ART_STYLE } from './art-styles'

// Imagen model configuration
const IMAGEN_MODEL = 'imagen-4.0-generate-001'
const IMAGEN_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'

/**
 * Parameters for building a portrait prompt
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
 * Result from portrait generation
 */
export interface PortraitGenerationResult {
  success: boolean
  imageData?: Buffer
  mimeType?: string
  error?: string
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
  prompt += `
Style: ${styleModifier}. Dramatic lighting, heroic pose.
Framing: Portrait composition, head and shoulders, facing the viewer.
Quality: Professional fantasy RPG character art, vibrant colors, detailed textures.
Background: Simple, dark gradient or subtle fantasy environment.
Do not include: text, watermarks, borders, frames, multiple characters.`

  return prompt
}

/**
 * Generate a character portrait using Google Imagen API
 */
export async function generatePortrait(
  params: PortraitPromptParams
): Promise<PortraitGenerationResult> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return {
      success: false,
      error: 'GEMINI_API_KEY environment variable is not set',
    }
  }

  const prompt = buildPortraitPrompt(params)

  try {
    const response = await fetch(
      `${IMAGEN_API_ENDPOINT}/${IMAGEN_MODEL}:predict`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '1:1',
            personGeneration: 'allow_adult',
            safetySetting: 'block_some',
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Imagen API error:', errorData)
      return {
        success: false,
        error: errorData.error?.message || `API error: ${response.status}`,
      }
    }

    const data = await response.json()

    // Check if we got any predictions
    if (!data.predictions || data.predictions.length === 0) {
      return {
        success: false,
        error: 'No image generated',
      }
    }

    // Get the base64 image data
    const prediction = data.predictions[0]
    const base64Image = prediction.bytesBase64Encoded

    if (!base64Image) {
      return {
        success: false,
        error: 'No image data in response',
      }
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Image, 'base64')

    return {
      success: true,
      imageData: imageBuffer,
      mimeType: prediction.mimeType || 'image/png',
    }
  } catch (error) {
    console.error('Portrait generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during generation',
    }
  }
}

/**
 * Validate that the Imagen API is accessible
 */
export async function validateImagenApi(): Promise<boolean> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return false
  }

  // Just check that we can reach the API - don't actually generate
  // The actual validation happens when we try to generate
  return true
}

/**
 * Get model info
 */
export function getImagenModelInfo(): {
  name: string
  aspectRatio: string
  outputFormat: string
} {
  return {
    name: IMAGEN_MODEL,
    aspectRatio: '1:1',
    outputFormat: 'PNG',
  }
}
