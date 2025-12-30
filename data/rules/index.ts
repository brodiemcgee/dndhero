/**
 * D&D 5e Rules Wiki Database
 * Master index with search and lookup functions
 */

import type { RuleEntry, RuleSearchEntry, RuleSearchFilters, RuleCategory } from '@/types/rules'

// Import rule modules
import { COMBAT_RULES } from './combat'
import { CORE_MECHANICS_RULES } from './core-mechanics'
import { CATEGORIES } from './categories'

// Re-export categories
export { CATEGORIES, getCategoryById, getSubcategoryInfo } from './categories'

// Combined master rule list
export const RULES: RuleEntry[] = [
  ...COMBAT_RULES,
  ...CORE_MECHANICS_RULES,
  // Add more as they're created:
  // ...SPELLCASTING_RULES,
  // ...CHARACTER_RULES,
  // ...EQUIPMENT_RULES,
  // ...GAMEPLAY_RULES,
]

// Fast lookup map by ID
const ruleMap = new Map<string, RuleEntry>()
RULES.forEach((rule) => ruleMap.set(rule.id, rule))

// Fast lookup map by slug
const ruleSlugMap = new Map<string, RuleEntry>()
RULES.forEach((rule) => ruleSlugMap.set(rule.slug, rule))

// Fast lookup by category/subcategory path
const rulePathMap = new Map<string, RuleEntry[]>()
RULES.forEach((rule) => {
  const path = `${rule.category}/${rule.subcategory}`
  if (!rulePathMap.has(path)) {
    rulePathMap.set(path, [])
  }
  rulePathMap.get(path)!.push(rule)
})

/**
 * Pre-computed search index for fast filtering
 */
const searchIndex: RuleSearchEntry[] = RULES.map((rule) => ({
  id: rule.id,
  name: rule.name,
  category: rule.category,
  subcategory: rule.subcategory,
  summary: rule.summary,
  tags: rule.tags,
  keywords: rule.keywords || [],
  // Pre-compute lowercase concatenated search text
  searchText: [rule.name, rule.summary, ...rule.tags, ...(rule.keywords || [])].join(' ').toLowerCase(),
}))

/**
 * Get rule by ID - O(1) lookup
 */
export function getRuleById(id: string): RuleEntry | undefined {
  return ruleMap.get(id)
}

/**
 * Get rule by slug - O(1) lookup
 */
export function getRuleBySlug(slug: string): RuleEntry | undefined {
  return ruleSlugMap.get(slug)
}

/**
 * Get multiple rules by IDs
 */
export function getRulesByIds(ids: string[]): RuleEntry[] {
  return ids.map((id) => ruleMap.get(id)).filter((rule): rule is RuleEntry => rule !== undefined)
}

/**
 * Get all rules in a category
 */
export function getRulesByCategory(category: RuleCategory): RuleEntry[] {
  return RULES.filter((rule) => rule.category === category)
}

/**
 * Get all rules in a subcategory
 */
export function getRulesBySubcategory(category: string, subcategory: string): RuleEntry[] {
  const path = `${category}/${subcategory}`
  return rulePathMap.get(path) || []
}

/**
 * Get rules by path (category/subcategory)
 */
export function getRulesByPath(path: string): RuleEntry[] {
  return rulePathMap.get(path) || []
}

/**
 * Fast search using pre-computed index
 * Designed for use with useMemo in React components
 */
export function searchRules(query: string, filters?: RuleSearchFilters): RuleEntry[] {
  const normalizedQuery = query.toLowerCase().trim()

  // Filter search index first (faster than filtering full objects)
  const matchingIds = searchIndex
    .filter((entry) => {
      // Text search
      if (normalizedQuery && !entry.searchText.includes(normalizedQuery)) {
        return false
      }

      // Category filter
      if (filters?.categories?.length && !filters.categories.includes(entry.category)) {
        return false
      }

      // Subcategory filter
      if (filters?.subcategories?.length && !filters.subcategories.includes(entry.subcategory)) {
        return false
      }

      // Tag filter
      if (filters?.tags?.length && !filters.tags.some((tag) => entry.tags.includes(tag))) {
        return false
      }

      return true
    })
    .map((entry) => entry.id)

  // Return full rule objects
  return getRulesByIds(matchingIds)
}

/**
 * Get all unique tags for filtering UI
 */
export function getAllTags(): string[] {
  const tagSet = new Set<string>()
  RULES.forEach((rule) => rule.tags.forEach((tag) => tagSet.add(tag)))
  return Array.from(tagSet).sort()
}

/**
 * Get rules count by category
 */
export function getRulesCountByCategory(): Record<string, number> {
  const counts: Record<string, number> = {}
  RULES.forEach((rule) => {
    counts[rule.category] = (counts[rule.category] || 0) + 1
  })
  return counts
}

/**
 * Get the first rule for a subcategory (for overview pages)
 */
export function getSubcategoryOverview(category: string, subcategory: string): RuleEntry | undefined {
  const rules = getRulesBySubcategory(category, subcategory)
  // Return the rule with 'overview' in the ID, or the first one
  return rules.find((r) => r.id.includes('overview')) || rules[0]
}

/**
 * Get related rules for a given rule
 */
export function getRelatedRules(rule: RuleEntry): RuleEntry[] {
  if (!rule.relatedRules || rule.relatedRules.length === 0) {
    return []
  }
  return getRulesByIds(rule.relatedRules)
}

/**
 * Stats about the rules database
 */
export function getRulesStats() {
  return {
    totalRules: RULES.length,
    byCategory: getRulesCountByCategory(),
    totalTags: getAllTags().length,
  }
}

export default RULES
