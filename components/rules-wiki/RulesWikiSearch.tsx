'use client'

import { useMemo } from 'react'
import { useRulesWiki } from './RulesWikiContext'
import { searchRules, getCategoryById } from '@/data/rules'

interface RulesWikiSearchProps {
  showResults?: boolean
}

export function RulesWikiSearch({ showResults = false }: RulesWikiSearchProps) {
  const { searchQuery, setSearchQuery, navigateTo } = useRulesWiki()

  // Search results
  const results = useMemo(() => {
    if (searchQuery.length < 2) return []
    return searchRules(searchQuery).slice(0, 20) // Limit to 20 results
  }, [searchQuery])

  const handleResultClick = (ruleId: string, category: string, subcategory: string) => {
    navigateTo(`${category}/${subcategory}#${ruleId}`)
    setSearchQuery('')
  }

  if (showResults) {
    return (
      <div className="p-4">
        {searchQuery.length < 2 ? (
          <p className="text-gray-400 text-sm">Type at least 2 characters to search...</p>
        ) : results.length === 0 ? (
          <p className="text-gray-400 text-sm">No results found for "{searchQuery}"</p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 mb-3">
              {results.length} result{results.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
            {results.map((rule) => {
              const category = getCategoryById(rule.category)
              return (
                <button
                  key={rule.id}
                  onClick={() => handleResultClick(rule.id, rule.category, rule.subcategory)}
                  className="w-full text-left p-3 bg-gray-800/50 hover:bg-amber-900/30 rounded border border-gray-700 hover:border-amber-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-amber-300 font-medium text-sm">{rule.name}</h4>
                      <p className="text-gray-400 text-xs mt-1 line-clamp-2">{rule.summary}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {category?.name || rule.category}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {rule.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 bg-gray-700 text-gray-400 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search rules..."
        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:border-amber-600 transition-colors"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
