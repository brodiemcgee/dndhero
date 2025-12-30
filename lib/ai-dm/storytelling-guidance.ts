/**
 * Storytelling Guidance Module
 * Provides tone-adaptive prompt sections for AI DM narration
 */

export type Tone = 'serious' | 'balanced' | 'humorous'
export type NarrativeStyle = 'concise' | 'descriptive' | 'epic'
export type ActionType = 'routine' | 'dramatic' | 'combat'

interface ToneGuidance {
  atmosphere: string
  dialogueStyle: string
  tensionBuilding: string
}

interface NarrativeStyleGuidance {
  lengthGuidance: string
  detailLevel: string
}

/**
 * Get tone-specific atmosphere and dialogue guidance
 */
export function getToneGuidance(tone: Tone): ToneGuidance {
  switch (tone) {
    case 'serious':
      return {
        atmosphere: `ATMOSPHERE (Serious Tone):
- Treat the world as real with genuine stakes and consequences
- Deaths and failures should feel weighty and meaningful
- NPCs have realistic motivations, fears, and complexities
- Avoid comedic moments except for rare character-driven levity
- Describe injuries, exhaustion, and emotional tolls authentically`,
        dialogueStyle: `DIALOGUE (Serious Tone):
- Dialogue should feel grounded - avoid anachronisms or pop culture references
- NPCs speak with gravitas appropriate to their station
- Let silence and pauses carry weight
- Conversations have subtext and hidden agendas`,
        tensionBuilding: `TENSION (Serious Tone):
- Build dread through atmosphere and foreshadowing
- Let danger feel real and ever-present
- Consequences of failure should be clear
- Victory feels earned, not given`
      }

    case 'humorous':
      return {
        atmosphere: `ATMOSPHERE (Humorous Tone):
- Lean into the absurdity - this is meant to be fun and silly
- NPCs can be exaggerated, quirky, or intentionally tropey
- Describe failures as comically spectacular when appropriate
- Even serious moments can have comedic undertones or unexpected twists
- Dramatic villain monologues can be interrupted or subverted`,
        dialogueStyle: `DIALOGUE (Humorous Tone):
- Embrace puns, wordplay, and situational comedy
- NPCs have exaggerated personalities and verbal tics
- Pop culture references and anachronisms are welcome
- Let characters banter and bounce off each other`,
        tensionBuilding: `TENSION (Humorous Tone):
- Tension can be undercut with comedic timing
- Villains can be threatening AND ridiculous
- Stakes matter but the journey should be fun
- Let players' jokes influence the narrative`
      }

    case 'balanced':
    default:
      return {
        atmosphere: `ATMOSPHERE (Balanced Tone):
- Mix drama with lighter moments naturally - follow player energy
- Stakes are real but there's room for wit and camaraderie
- NPCs can be serious threats OR colorful characters
- Allow banter and humor that emerges from character interactions
- Dramatic moments get dramatic narration; casual moments can be lighter`,
        dialogueStyle: `DIALOGUE (Balanced Tone):
- Match dialogue tone to the moment - serious when needed, light when appropriate
- NPCs have personality without being caricatures
- Let conversations breathe between tense and relaxed
- Players set the tone, you amplify it`,
        tensionBuilding: `TENSION (Balanced Tone):
- Build tension when dramatically appropriate
- Know when to release tension with levity
- Let victories feel satisfying without being saccharine
- Failures have consequences but aren't crushing`
      }
  }
}

/**
 * Get narrative style guidance for length and detail
 */
export function getNarrativeStyleGuidance(style: NarrativeStyle): NarrativeStyleGuidance {
  switch (style) {
    case 'concise':
      return {
        lengthGuidance: `NARRATION LENGTH (Concise Style):
- 1-2 paragraphs for most responses
- Quick, punchy descriptions focused on action and consequence
- Cut to the point - players want to act, not read
- Reserve longer narration ONLY for major plot reveals or climactic moments`,
        detailLevel: `DETAIL LEVEL (Concise Style):
- One vivid detail per description beats five generic ones
- Focus on what's actionable and relevant
- Trust players to fill in atmospheric gaps
- Sensory details only when they matter`
      }

    case 'epic':
      return {
        lengthGuidance: `NARRATION LENGTH (Epic Style):
- 3-5 paragraphs for significant moments
- Paint vivid, cinematic scenes with rich detail
- Build atmosphere before action, let consequences breathe
- Treat the narrative like chapters of an epic fantasy novel
- Simple actions can still be concise (1-2 paragraphs)`,
        detailLevel: `DETAIL LEVEL (Epic Style):
- Layer sensory details to create immersion
- Describe the weight and significance of moments
- NPCs have presence - describe their bearing, not just appearance
- Environment is a character - it reacts to events`
      }

    case 'descriptive':
    default:
      return {
        lengthGuidance: `NARRATION LENGTH (Descriptive Style):
- 2-4 paragraphs typically
- Balance action with atmosphere
- Include sensory details that ground players in the scene
- Expand for dramatic moments, condense for routine actions`,
        detailLevel: `DETAIL LEVEL (Descriptive Style):
- 2-3 sensory details per scene description
- Describe what's interesting, skip what's mundane
- Let the environment tell stories
- NPCs have distinguishing features worth noting`
      }
  }
}

/**
 * Build sensory immersion guidance (universal across tones)
 */
export function buildSensoryGuidance(): string {
  return `SENSORY IMMERSION:
Create vivid experiences by weaving in sensory details naturally:
- SIGHT: Lighting, colors, movement, scale, expressions
- SOUND: Ambient noise, dialogue tone, silence, echoes
- SMELL: Environment scents, character odors, magical aromas
- TOUCH: Temperature, textures, physical sensations
- TASTE: When relevant - food, potions, blood, dust in the air

Choose 2-3 senses per scene description. Don't list them - weave them naturally:
BAD: "You see a tavern. You hear music. You smell ale."
GOOD: "Firelight flickers across weathered faces as a fiddle's mournful tune winds through pipe smoke and the sharp tang of spilled ale."

Eliminate filter words:
AVOID: "You see a goblin. You hear footsteps approaching."
USE: "A goblin crouches by the fire. Footsteps echo from the corridor."`
}

/**
 * Build dramatic pacing guidance
 */
export function buildDramaticPacingGuidance(): string {
  return `DRAMATIC PACING:
- REVEALS: Build before revealing. Describe the locked chest, the strange symbols, the character's hesitation - THEN the contents or truth.
- TENSION: Use short sentences in dangerous moments. "The blade flashes. You dodge. Barely."
- CLIFFHANGERS: End combat rounds or tense moments with the threat still present: "The creature's shadow looms larger as it rounds the corner..."
- QUIET MOMENTS: Let victories breathe. After defeating the dragon, describe the sudden silence, the settling dust, the weight of survival.
- PACING BY STAKES:
  * Routine actions: Brief and efficient
  * Important choices: Pause to set the scene
  * Combat/danger: Quick, visceral, urgent
  * Major story beats: Expand fully, let the moment land`
}

/**
 * Build NPC voice and personality guidance
 */
export function buildNPCVoiceGuidance(): string {
  return `NPC VOICE AND PERSONALITY:
- Give each NPC a DISTINCT voice - vary speech patterns, vocabulary, and cadence
- Use any defined speech_pattern CONSISTENTLY when an NPC speaks
- Show personality through actions and dialogue, not exposition
- NPCs should remember prior interactions with the party

Examples of distinctive NPC speech:
- Nervous merchant: "Y-yes, well, you see, the thing is... *wrings hands* ...prices have gone up. Yes. Up."
- Gruff soldier: "State your business. Now."
- Wise elder: "Patience, young one. The river does not hurry, yet it carves the mountain."
- Shady dealer: "Friend! My favorite customer! Have I got a deal for you..."
- Formal noble: "One does not simply request an audience with the Count."
- Enthusiastic bard: "Oh! Oh! You simply MUST hear about the time I—"

AVOID generic NPC dialogue like: "Hello, adventurers. How can I help you today?"

When creating NPCs, give them:
1. A distinctive speech pattern or verbal quirk
2. A motivation that colors their interactions
3. A memorable physical mannerism`
}

/**
 * Build character integration guidance (using PC bonds, flaws, ideals)
 */
export function buildCharacterIntegrationGuidance(): string {
  return `CHARACTER INTEGRATION (USE ACTIVELY):
When roleplaying scenes, actively reference and test PC personality:

- PERSONALITY TRAITS: Use these as opportunities for roleplay hooks
  Example: If a character "has trouble trusting strangers", have NPCs notice their wariness

- BONDS: Create situations that challenge or affirm character bonds
  Example: If bonded to "protect the innocent", present scenarios with innocents at risk

- IDEALS: NPCs can align with or challenge PC ideals
  Example: An NPC with opposite ideals creates natural tension

- FLAWS: Gently put characters in situations where flaws might emerge
  Example: A character who "acts before thinking" faces time-pressure decisions

- BACKSTORY: Reference backstory elements when narratively appropriate
  Example: Locations, people, or factions from their past might appear

IMPORTANT: Don't lecture players about their traits. Instead, CREATE situations where they naturally come up.

Creating Character Moments:
1. When a character's personality matches a situation, LEAN INTO IT
   - A brash character gets to be heroically reckless
   - A cautious character notices the trap others missed

2. Create "small moments" that feel personal
   - An NPC reminds a character of someone from their backstory
   - A situation mirrors a character's bond or ideal

3. Let FLAWS be interesting, not punishing
   - "Your distrust of strangers makes the merchant nervous" (creates roleplay)
   - NOT: "Because you're distrustful, you miss the clue" (feels punitive)`
}

/**
 * Detect action type from player messages for adaptive length
 */
export function detectActionType(messages: string[]): ActionType {
  const combined = messages.join(' ').toLowerCase()

  const combatKeywords = [
    'attack', 'fight', 'cast', 'spell', 'strike', 'shoot',
    'swing', 'stab', 'slash', 'rage', 'smite', 'fireball',
    'hit', 'damage', 'kill', 'battle', 'charge'
  ]

  const dramaticKeywords = [
    'confront', 'reveal', 'confess', 'betray', 'die', 'death',
    'save', 'rescue', 'sacrifice', 'final', 'promise', 'swear',
    'forgive', 'remember', 'farewell', 'truth', 'secret'
  ]

  if (combatKeywords.some(k => combined.includes(k))) return 'combat'
  if (dramaticKeywords.some(k => combined.includes(k))) return 'dramatic'
  return 'routine'
}

/**
 * Get adaptive length guidance based on action type
 */
export function getAdaptiveLengthGuidance(actionType: ActionType): string {
  switch (actionType) {
    case 'combat':
      return `CURRENT MOMENT: Combat/Action
- Visceral and urgent narration
- Describe the action cinematically
- Short, punchy sentences build tension
- Focus on consequences and momentum`

    case 'dramatic':
      return `CURRENT MOMENT: Dramatic
- Take your time with this moment
- 3-5 paragraphs appropriate
- Let the scene breathe
- Emotional weight matters here`

    case 'routine':
    default:
      return `CURRENT MOMENT: Routine
- Be efficient - 1-2 paragraphs
- Keep the momentum going
- Save elaborate description for bigger moments`
  }
}

/**
 * Build complete storytelling prompt section
 */
export function buildStorytellingPromptSection(
  tone: string,
  narrativeStyle: string,
  actionType: ActionType = 'routine'
): string {
  const toneGuidance = getToneGuidance((tone as Tone) || 'balanced')
  const styleGuidance = getNarrativeStyleGuidance((narrativeStyle as NarrativeStyle) || 'descriptive')

  const sections = [
    '=== STORYTELLING GUIDANCE ===',
    '',
    toneGuidance.atmosphere,
    '',
    toneGuidance.dialogueStyle,
    '',
    styleGuidance.lengthGuidance,
    '',
    getAdaptiveLengthGuidance(actionType),
    '',
    buildSensoryGuidance(),
    '',
    buildDramaticPacingGuidance(),
    '',
    buildNPCVoiceGuidance(),
    '',
    buildCharacterIntegrationGuidance()
  ]

  return sections.join('\n')
}

/**
 * Build condensed storytelling guidance (for token-constrained prompts)
 */
export function buildCondensedStorytellingGuidance(tone: string): string {
  const toneHints: Record<string, string> = {
    serious: 'Real stakes, grounded dialogue, meaningful consequences.',
    balanced: 'Mix drama with levity, follow player energy.',
    humorous: 'Embrace absurdity, exaggerated NPCs, comedic timing.'
  }

  return `STORYTELLING:
Tone: ${toneHints[tone] || toneHints.balanced}
- Weave 2-3 senses per scene (sight, sound, smell) naturally
- Each NPC needs a distinct voice and speech pattern
- Build before reveals, use short sentences in danger
- Reference character traits/bonds/flaws to create personal moments
- Let flaws be interesting, not punitive`
}
