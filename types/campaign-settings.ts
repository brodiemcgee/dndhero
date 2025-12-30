/**
 * Campaign Setting Builder Types and Constants
 * Used for guided campaign setting creation with AI-generated descriptions
 */

export interface SettingOptions {
  themes: string[]
  storyTypes: string[]
  eras: string[]
  moods: string[]
  scales: string[]
}

export interface SettingCategory {
  id: keyof SettingOptions
  label: string
  description: string
  options: { value: string; label: string }[]
}

export const SETTING_CATEGORIES: SettingCategory[] = [
  {
    id: 'themes',
    label: 'Theme',
    description: 'What genre or style defines your world?',
    options: [
      { value: 'fantasy', label: 'Fantasy' },
      { value: 'sci-fi', label: 'Sci-Fi' },
      { value: 'horror', label: 'Horror' },
      { value: 'steampunk', label: 'Steampunk' },
      { value: 'post-apocalyptic', label: 'Post-Apocalyptic' },
      { value: 'urban-fantasy', label: 'Urban Fantasy' },
      { value: 'historical', label: 'Historical' },
      { value: 'mythological', label: 'Mythological' },
    ],
  },
  {
    id: 'storyTypes',
    label: 'Story Type',
    description: 'What kind of adventure awaits?',
    options: [
      { value: 'coming-of-age', label: 'Coming of Age' },
      { value: 'heroes-villains', label: 'Heroes vs Villains' },
      { value: 'political-intrigue', label: 'Political Intrigue' },
      { value: 'mystery', label: 'Mystery' },
      { value: 'exploration', label: 'Exploration' },
      { value: 'survival', label: 'Survival' },
      { value: 'redemption', label: 'Redemption' },
      { value: 'heist', label: 'Heist' },
    ],
  },
  {
    id: 'eras',
    label: 'Era / Time Period',
    description: 'When does your story take place?',
    options: [
      { value: 'ancient', label: 'Ancient' },
      { value: 'medieval', label: 'Medieval' },
      { value: 'renaissance', label: 'Renaissance' },
      { value: 'industrial', label: 'Industrial' },
      { value: 'modern', label: 'Modern' },
      { value: 'futuristic', label: 'Futuristic' },
      { value: 'timeless', label: 'Timeless' },
    ],
  },
  {
    id: 'moods',
    label: 'Mood / Atmosphere',
    description: 'What feeling should your campaign evoke?',
    options: [
      { value: 'epic', label: 'Epic' },
      { value: 'mysterious', label: 'Mysterious' },
      { value: 'gritty', label: 'Gritty' },
      { value: 'lighthearted', label: 'Lighthearted' },
      { value: 'dark', label: 'Dark' },
      { value: 'hopeful', label: 'Hopeful' },
      { value: 'tense', label: 'Tense' },
      { value: 'comedic', label: 'Comedic' },
    ],
  },
  {
    id: 'scales',
    label: 'Setting Scale',
    description: 'How vast is the world your heroes will explore?',
    options: [
      { value: 'village', label: 'Village / Local' },
      { value: 'city', label: 'City / Regional' },
      { value: 'kingdom', label: 'Kingdom' },
      { value: 'continental', label: 'Continental' },
      { value: 'worldwide', label: 'Worldwide' },
      { value: 'planar', label: 'Planar / Cosmic' },
    ],
  },
]

/**
 * Get the display labels for selected options
 */
export function getSelectedLabels(options: SettingOptions): string[] {
  const labels: string[] = []

  for (const category of SETTING_CATEGORIES) {
    const selectedValues = options[category.id]
    for (const value of selectedValues) {
      const option = category.options.find(o => o.value === value)
      if (option) {
        labels.push(option.label)
      }
    }
  }

  return labels
}

/**
 * Check if all categories have at least one selection
 */
export function validateSettingOptions(options: SettingOptions): { valid: boolean; missingCategories: string[] } {
  const missingCategories: string[] = []

  for (const category of SETTING_CATEGORIES) {
    if (options[category.id].length === 0) {
      missingCategories.push(category.label)
    }
  }

  return {
    valid: missingCategories.length === 0,
    missingCategories,
  }
}

/**
 * Create empty setting options
 */
export function createEmptySettingOptions(): SettingOptions {
  return {
    themes: [],
    storyTypes: [],
    eras: [],
    moods: [],
    scales: [],
  }
}
