'use client'

import { useEffect } from 'react'
import { useRulesWiki } from './RulesWikiContext'
import { RulesWikiSearch } from './RulesWikiSearch'
import { RulesWikiNav } from './RulesWikiNav'
import { RulesWikiContent } from './RulesWikiContent'
import { RulesWikiBreadcrumb } from './RulesWikiBreadcrumb'

export function RulesWikiSidebar() {
  const { isOpen, closeSidebar, currentPath, searchQuery } = useRulesWiki()

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeSidebar()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeSidebar])

  // Determine if we're showing search results or content
  const showSearchResults = searchQuery.length > 0
  const showNavigation = currentPath === 'home' && !showSearchResults
  const showContent = currentPath !== 'home' && !showSearchResults

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 right-0 h-full
          w-full sm:w-96 lg:w-[28rem]
          bg-gray-900 border-l-2 border-amber-700
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          z-40
          flex flex-col
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Rules Wiki"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-amber-700 bg-gray-900">
          <h2 className="font-['Press_Start_2P'] text-sm text-amber-400">Rules Wiki</h2>
          <button
            onClick={closeSidebar}
            className="p-2 text-gray-400 hover:text-white hover:bg-amber-900/30 rounded transition-colors"
            aria-label="Close rules wiki"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-amber-700/50">
          <RulesWikiSearch />
        </div>

        {/* Breadcrumb (when viewing content) */}
        {showContent && (
          <div className="border-b border-amber-700/50">
            <RulesWikiBreadcrumb />
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {showSearchResults && <RulesWikiSearch showResults />}
          {showNavigation && <RulesWikiNav />}
          {showContent && <RulesWikiContent />}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-amber-700/50 text-center">
          <p className="text-xs text-gray-500">
            D&D 5e SRD Reference
          </p>
        </div>
      </div>
    </>
  )
}
