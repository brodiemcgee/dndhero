/**
 * D&D 5e Rules Wiki Types
 * Type definitions for the rules reference system
 */

/**
 * Rule content categories
 */
export type RuleCategory =
  | 'core-mechanics'
  | 'combat'
  | 'spellcasting'
  | 'character'
  | 'equipment'
  | 'gameplay'

/**
 * Reference types for cross-linking between content
 */
export type ReferenceType = 'rule' | 'spell' | 'item' | 'condition' | 'class' | 'race'

/**
 * Cross-reference to another piece of content
 */
export interface RuleReference {
  type: ReferenceType
  id: string
  label?: string // Display label if different from referenced item's name
}

/**
 * Table structure for rules that include data tables
 */
export interface RuleTable {
  caption?: string
  headers: string[]
  rows: string[][]
  footnotes?: string[]
}

/**
 * Example structure for illustrating rules
 */
export interface RuleExample {
  title: string
  description: string
  diceNotation?: string // e.g., "1d20 + 5"
  result?: string
}

/**
 * Main rule entry interface
 */
export interface RuleEntry {
  // Core identification
  id: string
  name: string
  slug: string // URL-friendly version

  // Categorization
  category: RuleCategory
  subcategory: string

  // Content
  summary: string // Brief 1-2 sentence overview
  description: string // Full markdown content

  // Examples and tables
  examples?: RuleExample[]
  tables?: RuleTable[]

  // Cross-linking
  relatedRules?: string[] // Rule IDs
  relatedSpells?: string[] // Spell IDs from data/spells/
  relatedConditions?: string[] // Condition names from CONDITIONS

  // Search optimization
  tags: string[]
  keywords?: string[] // Additional search terms

  // Metadata
  source: 'SRD' | 'PHB' | 'DMG' | 'custom'
  pageReference?: string // e.g., "PHB p.194"

  // Optional content
  tips?: string[] // DM/player tips
  commonMistakes?: string[] // Common misunderstandings
}

/**
 * Category metadata for navigation UI
 */
export interface CategoryMeta {
  id: RuleCategory
  name: string
  description: string
  icon: string // Icon name for UI
  order: number // Sort order in navigation
  subcategories: SubcategoryMeta[]
}

/**
 * Subcategory metadata for navigation
 */
export interface SubcategoryMeta {
  id: string
  name: string
  description?: string
  order: number
}

/**
 * Search index entry for fast lookups
 */
export interface RuleSearchEntry {
  id: string
  name: string
  category: RuleCategory
  subcategory: string
  summary: string
  tags: string[]
  keywords: string[]
  searchText: string // Pre-computed lowercase search text
}

/**
 * Search filters for rule queries
 */
export interface RuleSearchFilters {
  categories?: RuleCategory[]
  subcategories?: string[]
  tags?: string[]
}

/**
 * Wiki navigation state
 */
export interface WikiNavigationState {
  currentPath: string
  history: string[]
  hasUserNavigated: boolean
}

/**
 * Game context for auto-navigation
 */
export interface GameContextForWiki {
  pendingRollType?: string
  pendingRollSkill?: string
  pendingRollAbility?: string
  isInCombat: boolean
  characterConditions: string[]
  recentEventTypes: string[]
  turnPhase?: string
}

/**
 * Suggested wiki topic from context detection
 */
export interface SuggestedWikiTopic {
  path: string
  title: string
  priority: number
  reason: string
}
