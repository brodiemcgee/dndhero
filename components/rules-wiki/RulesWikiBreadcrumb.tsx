'use client'

import { useMemo } from 'react'
import { useRulesWiki } from './RulesWikiContext'
import { getSubcategoryInfo } from '@/data/rules'

export function RulesWikiBreadcrumb() {
  const { currentPath, goBack, canGoBack, navigateTo } = useRulesWiki()

  // Parse path to get category and subcategory info
  const pathInfo = useMemo(() => {
    const parts = currentPath.split('/')
    const [categoryId, subcategoryWithHash] = parts
    const [subcategoryId] = subcategoryWithHash?.split('#') || []

    if (!categoryId || !subcategoryId) return null

    const info = getSubcategoryInfo(categoryId, subcategoryId)
    return info
  }, [currentPath])

  if (!pathInfo) return null

  return (
    <nav className="flex items-center gap-2 px-4 py-2 text-sm">
      {/* Back Button */}
      {canGoBack && (
        <button
          onClick={goBack}
          className="p-1 text-gray-400 hover:text-amber-400 transition-colors"
          aria-label="Go back"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Home */}
      <button
        onClick={() => navigateTo('home')}
        className="text-gray-400 hover:text-amber-400 transition-colors"
      >
        Home
      </button>

      <span className="text-gray-600">/</span>

      {/* Category */}
      <span className="text-gray-400">{pathInfo.category.name}</span>

      <span className="text-gray-600">/</span>

      {/* Subcategory (current) */}
      <span className="text-amber-400 font-medium">{pathInfo.subcategory.name}</span>
    </nav>
  )
}
