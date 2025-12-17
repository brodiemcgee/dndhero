'use client'

/**
 * AppearanceStep Component
 * Physical appearance form for character creation wizard
 */

interface AppearanceData {
  gender: string
  age: string
  height: string
  build: string
  skin_tone: string
  hair_color: string
  hair_style: string
  eye_color: string
  distinguishing_features: string
  clothing_style: string
}

interface AppearanceStepProps {
  data: AppearanceData
  race: string
  onChange: (field: keyof AppearanceData, value: string) => void
}

// Gender options
const GENDERS = ['Male', 'Female', 'Non-binary', 'Other']

// Age categories
const AGES = ['Young', 'Young Adult', 'Adult', 'Middle-aged', 'Elderly', 'Ancient']

// Height options
const HEIGHTS = ['Very Short', 'Short', 'Average', 'Tall', 'Very Tall']

// Build options
const BUILDS = ['Thin', 'Slender', 'Athletic', 'Average', 'Stocky', 'Muscular', 'Heavy']

// Hair colors (common)
const HAIR_COLORS = [
  'Black', 'Dark Brown', 'Brown', 'Auburn', 'Red', 'Strawberry Blonde',
  'Blonde', 'Platinum Blonde', 'Gray', 'White', 'Silver', 'Blue', 'Green', 'Purple', 'Pink', 'Bald'
]

// Hair styles
const HAIR_STYLES = [
  'Bald', 'Shaved', 'Very Short', 'Short', 'Medium', 'Long', 'Very Long',
  'Braided', 'Ponytail', 'Topknot', 'Dreadlocks', 'Curly', 'Wavy', 'Mohawk'
]

// Eye colors
const EYE_COLORS = [
  'Brown', 'Dark Brown', 'Hazel', 'Green', 'Blue', 'Gray', 'Amber',
  'Golden', 'Red', 'Purple', 'Silver', 'Black', 'White', 'Heterochromatic'
]

// Race-specific skin tones
const SKIN_TONES: Record<string, string[]> = {
  Human: ['Pale', 'Fair', 'Light', 'Medium', 'Olive', 'Tan', 'Brown', 'Dark Brown', 'Deep Brown'],
  Elf: ['Pale', 'Fair', 'Light', 'Medium', 'Olive', 'Bronze', 'Golden'],
  'High Elf': ['Pale', 'Fair', 'Light', 'Bronze', 'Golden'],
  'Wood Elf': ['Light', 'Medium', 'Olive', 'Tan', 'Copper', 'Bronze'],
  'Dark Elf': ['Obsidian', 'Charcoal', 'Deep Purple', 'Midnight Blue', 'Dark Gray'],
  Dwarf: ['Pale', 'Fair', 'Ruddy', 'Tan', 'Brown', 'Gray'],
  Halfling: ['Pale', 'Fair', 'Light', 'Medium', 'Tan', 'Brown'],
  Gnome: ['Pale', 'Fair', 'Light', 'Medium', 'Tan', 'Brown', 'Gray'],
  'Half-Elf': ['Pale', 'Fair', 'Light', 'Medium', 'Olive', 'Tan', 'Brown'],
  'Half-Orc': ['Pale Green', 'Light Green', 'Green', 'Gray-Green', 'Brown-Green', 'Gray'],
  Tiefling: ['Pale', 'Red', 'Crimson', 'Maroon', 'Purple', 'Blue', 'Lavender', 'Dark Gray', 'Black'],
  Dragonborn: [
    'Brass (Metallic)', 'Bronze (Metallic)', 'Copper (Metallic)', 'Gold (Metallic)', 'Silver (Metallic)',
    'Black', 'Blue', 'Green', 'Red', 'White'
  ],
  Aasimar: ['Pale', 'Fair', 'Golden', 'Silver', 'Luminous', 'Ivory'],
  Goliath: ['Gray', 'Light Gray', 'Stone Gray', 'Mountain Gray', 'Slate'],
  Tabaxi: ['Spotted (Leopard)', 'Striped (Tiger)', 'Solid (Panther)', 'Tawny (Lion)', 'Gray', 'White'],
  Firbolg: ['Pale Blue', 'Light Blue', 'Gray-Blue', 'Flesh-tone', 'Pink'],
  Genasi: ['Fire (Red/Orange)', 'Water (Blue/Green)', 'Earth (Brown/Gray)', 'Air (Pale/White)'],
}

// Default skin tones for races not in the list
const DEFAULT_SKIN_TONES = ['Pale', 'Fair', 'Light', 'Medium', 'Tan', 'Brown', 'Dark']

export function AppearanceStep({ data, race, onChange }: AppearanceStepProps) {
  // Get race-specific skin tones or defaults
  const skinTones = SKIN_TONES[race] || DEFAULT_SKIN_TONES

  return (
    <div className="space-y-6">
      <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
        Physical Appearance
      </h2>

      <p className="text-gray-400 text-sm mb-6">
        Describe your character&apos;s physical appearance. These details will be used to generate your character portrait.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* Gender */}
        <div>
          <label className="block text-amber-300 mb-2">Gender</label>
          <select
            value={data.gender}
            onChange={(e) => onChange('gender', e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border-2 border-amber-700 rounded text-white"
          >
            <option value="">Select gender...</option>
            {GENDERS.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Age */}
        <div>
          <label className="block text-amber-300 mb-2">Age</label>
          <select
            value={data.age}
            onChange={(e) => onChange('age', e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border-2 border-amber-700 rounded text-white"
          >
            <option value="">Select age...</option>
            {AGES.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* Height */}
        <div>
          <label className="block text-amber-300 mb-2">Height</label>
          <select
            value={data.height}
            onChange={(e) => onChange('height', e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border-2 border-amber-700 rounded text-white"
          >
            <option value="">Select height...</option>
            {HEIGHTS.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        {/* Build */}
        <div>
          <label className="block text-amber-300 mb-2">Build</label>
          <select
            value={data.build}
            onChange={(e) => onChange('build', e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border-2 border-amber-700 rounded text-white"
          >
            <option value="">Select build...</option>
            {BUILDS.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Skin Tone */}
        <div>
          <label className="block text-amber-300 mb-2">
            Skin Tone
            <span className="text-xs text-gray-500 ml-2">({race})</span>
          </label>
          <select
            value={data.skin_tone}
            onChange={(e) => onChange('skin_tone', e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border-2 border-amber-700 rounded text-white"
          >
            <option value="">Select skin tone...</option>
            {skinTones.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* Eye Color */}
        <div>
          <label className="block text-amber-300 mb-2">Eye Color</label>
          <select
            value={data.eye_color}
            onChange={(e) => onChange('eye_color', e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border-2 border-amber-700 rounded text-white"
          >
            <option value="">Select eye color...</option>
            {EYE_COLORS.map(ec => (
              <option key={ec} value={ec}>{ec}</option>
            ))}
          </select>
        </div>

        {/* Hair Color */}
        <div>
          <label className="block text-amber-300 mb-2">Hair Color</label>
          <select
            value={data.hair_color}
            onChange={(e) => onChange('hair_color', e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border-2 border-amber-700 rounded text-white"
          >
            <option value="">Select hair color...</option>
            {HAIR_COLORS.map(hc => (
              <option key={hc} value={hc}>{hc}</option>
            ))}
          </select>
        </div>

        {/* Hair Style */}
        <div>
          <label className="block text-amber-300 mb-2">Hair Style</label>
          <select
            value={data.hair_style}
            onChange={(e) => onChange('hair_style', e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border-2 border-amber-700 rounded text-white"
          >
            <option value="">Select hair style...</option>
            {HAIR_STYLES.map(hs => (
              <option key={hs} value={hs}>{hs}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Distinguishing Features */}
      <div>
        <label className="block text-amber-300 mb-2">
          Distinguishing Features
          <span className="text-xs text-gray-500 ml-2">(optional)</span>
        </label>
        <textarea
          value={data.distinguishing_features}
          onChange={(e) => onChange('distinguishing_features', e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border-2 border-amber-700 rounded text-white h-24"
          placeholder="Scars, tattoos, birthmarks, unusual features..."
        />
      </div>

      {/* Clothing Style */}
      <div>
        <label className="block text-amber-300 mb-2">
          Typical Attire
          <span className="text-xs text-gray-500 ml-2">(optional)</span>
        </label>
        <textarea
          value={data.clothing_style}
          onChange={(e) => onChange('clothing_style', e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border-2 border-amber-700 rounded text-white h-24"
          placeholder="Describe your character's typical clothing and accessories..."
        />
      </div>

      {/* Preview hint */}
      <div className="p-4 bg-gray-800/50 border border-gray-700 rounded">
        <p className="text-gray-400 text-sm">
          <span className="text-amber-400">Tip:</span> After creating your character, you can generate an AI portrait based on these details or upload your own image.
        </p>
      </div>
    </div>
  )
}
