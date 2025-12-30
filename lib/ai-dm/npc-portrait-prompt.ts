/**
 * NPC Portrait Prompt Builder
 * Creates generation prompts for NPCs and monsters
 */

import { type ArtStyle, getArtStyleModifier } from './art-styles'

export interface NpcPortraitParams {
  name: string
  type: 'npc' | 'monster'
  description?: string
  artStyle: ArtStyle
  campaignSetting?: string
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

  prompt += `
Style: ${styleModifier}. Dramatic lighting.
Framing: Portrait composition, head and shoulders, facing the viewer.
Quality: Professional fantasy RPG character art, vibrant colors.
Background: Simple, contextual fantasy environment.
Do not include: text, watermarks, borders, frames, multiple characters.`

  return prompt
}

/**
 * Build a scene art prompt
 */
export interface SceneArtParams {
  locationName: string
  sceneDescription: string
  mood?: string
  artStyle: ArtStyle
  campaignSetting?: string
}

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

  prompt += `
Style: ${styleModifier}. Cinematic composition, atmospheric lighting.
Composition: Wide landscape view, establishing shot, immersive environment.
Quality: Professional fantasy illustration, highly detailed environment.
Do not include: text, watermarks, UI elements, close-up of characters.`

  return prompt
}
