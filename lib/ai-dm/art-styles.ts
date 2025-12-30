/**
 * Art Style Configuration
 * Shared constants and utilities for art generation across the application
 */

/**
 * Available art styles for campaign artwork
 */
export const ART_STYLES = [
  'Pixel Art',
  'Watercolor',
  'Oil Painting',
  'Comic Book',
  'Digital Fantasy Art',
] as const

export type ArtStyle = (typeof ART_STYLES)[number]

export const DEFAULT_ART_STYLE: ArtStyle = 'Pixel Art'

/**
 * Art style labels for UI display
 */
export const ART_STYLE_LABELS: Record<ArtStyle, string> = {
  'Pixel Art': 'Pixel Art - Retro 16-bit aesthetic',
  'Watercolor': 'Watercolor - Soft, artistic style',
  'Oil Painting': 'Oil Painting - Classical, rich textures',
  'Comic Book': 'Comic Book - Bold, dynamic illustrations',
  'Digital Fantasy Art': 'Digital Fantasy Art - Detailed concept art',
}

/**
 * Prompt modifiers for each art style
 * These are appended to image generation prompts to ensure consistent style
 */
export const ART_STYLE_MODIFIERS: Record<ArtStyle, string> = {
  'Pixel Art':
    'rendered as detailed pixel art with a retro 16-bit RPG aesthetic, crisp pixels, vibrant colors, nostalgic video game style',
  'Watercolor':
    'painted in soft watercolor style with flowing colors, gentle gradients, artistic brushwork, delicate color bleeding',
  'Oil Painting':
    'rendered as a classical oil painting with rich textures, dramatic lighting, fine brushstrokes reminiscent of Renaissance masters',
  'Comic Book':
    'illustrated in bold comic book style with strong outlines, dynamic shading, halftone dots, vibrant flat colors, action-packed composition',
  'Digital Fantasy Art':
    'created as high-quality digital fantasy art with detailed rendering, dramatic lighting, professional RPG artwork aesthetics, cinematic composition',
}

/**
 * Type guard to check if a value is a valid art style
 */
export function isValidArtStyle(value: string | null | undefined): value is ArtStyle {
  if (!value) return false
  return ART_STYLES.includes(value as ArtStyle)
}

/**
 * Get the art style modifier for prompt building
 * Falls back to default if invalid style provided
 */
export function getArtStyleModifier(artStyle: string | null | undefined): string {
  if (isValidArtStyle(artStyle)) {
    return ART_STYLE_MODIFIERS[artStyle]
  }
  return ART_STYLE_MODIFIERS[DEFAULT_ART_STYLE]
}

/**
 * Build a styled prompt by appending art style modifiers
 * @param basePrompt - The base image generation prompt
 * @param artStyle - The art style to apply
 * @returns The prompt with style modifiers
 */
export function buildStyledPrompt(basePrompt: string, artStyle: ArtStyle): string {
  const styleModifier = ART_STYLE_MODIFIERS[artStyle]

  // Check if there's a "Do not include" section to insert before
  const negativeIndex = basePrompt.indexOf('Do not include:')

  if (negativeIndex > -1) {
    // Insert style before negative prompts
    return `${basePrompt.slice(0, negativeIndex)}Art Style: ${styleModifier}.\n${basePrompt.slice(negativeIndex)}`
  }

  // Append to end
  return `${basePrompt}\nArt Style: ${styleModifier}.`
}
