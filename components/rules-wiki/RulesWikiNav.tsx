'use client'

import { useState } from 'react'
import { useRulesWiki } from './RulesWikiContext'
import { CATEGORIES } from '@/data/rules'

// Icons for categories
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'core-mechanics': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  combat: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  spellcasting: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  character: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  equipment: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
  gameplay: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
}

export function RulesWikiNav() {
  const { navigateTo } = useRulesWiki()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const handleSubcategoryClick = (categoryId: string, subcategoryId: string) => {
    navigateTo(`${categoryId}/${subcategoryId}`)
  }

  return (
    <div className="p-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Browse Categories
      </h3>

      <nav className="space-y-1">
        {CATEGORIES.sort((a, b) => a.order - b.order).map((category) => {
          const isExpanded = expandedCategories.has(category.id)
          const icon = CATEGORY_ICONS[category.id]

          return (
            <div key={category.id}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left rounded hover:bg-amber-900/20 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-amber-500 group-hover:text-amber-400">
                    {icon}
                  </span>
                  <div>
                    <span className="text-gray-200 font-medium text-sm">{category.name}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Subcategories */}
              {isExpanded && (
                <div className="ml-8 mt-1 space-y-0.5 border-l border-gray-700 pl-3">
                  {category.subcategories.sort((a, b) => a.order - b.order).map((subcategory) => (
                    <button
                      key={subcategory.id}
                      onClick={() => handleSubcategoryClick(category.id, subcategory.id)}
                      className="w-full text-left px-3 py-1.5 text-sm text-gray-400 hover:text-amber-300 hover:bg-amber-900/20 rounded transition-colors"
                    >
                      {subcategory.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Quick Links */}
      <div className="mt-8 pt-4 border-t border-gray-700">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Quick Reference
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => navigateTo('combat/conditions')}
            className="px-3 py-2 text-xs text-center bg-gray-800 hover:bg-amber-900/30 border border-gray-700 hover:border-amber-700 rounded transition-colors text-gray-300"
          >
            Conditions
          </button>
          <button
            onClick={() => navigateTo('combat/actions')}
            className="px-3 py-2 text-xs text-center bg-gray-800 hover:bg-amber-900/30 border border-gray-700 hover:border-amber-700 rounded transition-colors text-gray-300"
          >
            Actions
          </button>
          <button
            onClick={() => navigateTo('combat/death-saves')}
            className="px-3 py-2 text-xs text-center bg-gray-800 hover:bg-amber-900/30 border border-gray-700 hover:border-amber-700 rounded transition-colors text-gray-300"
          >
            Death Saves
          </button>
          <button
            onClick={() => navigateTo('core-mechanics/advantage-disadvantage')}
            className="px-3 py-2 text-xs text-center bg-gray-800 hover:bg-amber-900/30 border border-gray-700 hover:border-amber-700 rounded transition-colors text-gray-300"
          >
            Adv/Dis
          </button>
        </div>
      </div>
    </div>
  )
}
