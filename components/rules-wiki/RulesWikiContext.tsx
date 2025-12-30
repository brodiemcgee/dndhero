'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface RulesWikiContextValue {
  isOpen: boolean
  openSidebar: (topicPath?: string) => void
  closeSidebar: () => void
  toggleSidebar: () => void
  currentPath: string
  navigateTo: (path: string) => void
  goBack: () => void
  canGoBack: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  hasUserNavigated: boolean
}

const RulesWikiContext = createContext<RulesWikiContextValue | undefined>(undefined)

interface RulesWikiProviderProps {
  children: ReactNode
}

export function RulesWikiProvider({ children }: RulesWikiProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState('home')
  const [history, setHistory] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [hasUserNavigated, setHasUserNavigated] = useState(false)

  const openSidebar = useCallback((topicPath?: string) => {
    setIsOpen(true)
    // Reset user navigation tracking on fresh open
    setHasUserNavigated(false)
    // Set initial topic if provided and user hasn't manually navigated
    if (topicPath) {
      setCurrentPath(topicPath)
      setHistory([])
    }
  }, [])

  const closeSidebar = useCallback(() => {
    setIsOpen(false)
    // Reset state on close
    setHasUserNavigated(false)
    setSearchQuery('')
  }, [])

  const toggleSidebar = useCallback(() => {
    if (isOpen) {
      closeSidebar()
    } else {
      openSidebar()
    }
  }, [isOpen, openSidebar, closeSidebar])

  const navigateTo = useCallback((path: string) => {
    setHistory((prev) => [...prev, currentPath])
    setCurrentPath(path)
    setHasUserNavigated(true)
    setSearchQuery('') // Clear search when navigating
  }, [currentPath])

  const goBack = useCallback(() => {
    if (history.length > 0) {
      const newHistory = [...history]
      const previousPath = newHistory.pop()!
      setHistory(newHistory)
      setCurrentPath(previousPath)
    } else {
      setCurrentPath('home')
    }
  }, [history])

  const canGoBack = history.length > 0 || currentPath !== 'home'

  const value: RulesWikiContextValue = {
    isOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    currentPath,
    navigateTo,
    goBack,
    canGoBack,
    searchQuery,
    setSearchQuery,
    hasUserNavigated,
  }

  return <RulesWikiContext.Provider value={value}>{children}</RulesWikiContext.Provider>
}

export function useRulesWiki() {
  const context = useContext(RulesWikiContext)
  if (context === undefined) {
    throw new Error('useRulesWiki must be used within a RulesWikiProvider')
  }
  return context
}
