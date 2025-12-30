'use client'

import { ReactNode } from 'react'

interface SelectionCardProps {
  id: string
  name: string
  description: string
  selected: boolean
  onSelect: (id: string) => void
  onViewDetails?: () => void
  children?: ReactNode
  badge?: ReactNode
  disabled?: boolean
  showCheckbox?: boolean
}

export function SelectionCard({
  id,
  name,
  description,
  selected,
  onSelect,
  onViewDetails,
  children,
  badge,
  disabled = false,
  showCheckbox = true,
}: SelectionCardProps) {
  const handleClick = () => {
    if (!disabled) {
      onSelect(id)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault()
      onSelect(id)
    }
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        relative p-4 rounded-lg border-2 transition-all cursor-pointer
        ${selected
          ? 'border-amber-500 bg-amber-900/20 ring-1 ring-amber-500/50'
          : 'border-stone-700 bg-stone-800/50 hover:border-stone-600 hover:bg-stone-800'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {showCheckbox && (
            <div
              className={`
                w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                ${selected
                  ? 'bg-amber-500 border-amber-500'
                  : 'bg-transparent border-stone-500'
                }
              `}
            >
              {selected && (
                <svg className="w-3 h-3 text-stone-900" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          )}
          <h3 className="font-bold text-fantasy-gold text-lg">{name}</h3>
        </div>

        {onViewDetails && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails()
            }}
            className="text-xs text-amber-400 hover:text-amber-300 px-2 py-1 border border-amber-700/50 rounded hover:bg-amber-900/20"
          >
            Details
          </button>
        )}
      </div>

      {/* Badge area */}
      {badge && (
        <div className="mb-2">
          {badge}
        </div>
      )}

      {/* Description */}
      <p className="text-sm text-fantasy-light/80 line-clamp-2 mb-3">
        {description}
      </p>

      {/* Additional content (traits, features, etc.) */}
      {children && (
        <div className="pt-2 border-t border-stone-700/50">
          {children}
        </div>
      )}
    </div>
  )
}

interface SelectionGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3
}

export function SelectionGrid({ children, columns = 3 }: SelectionGridProps) {
  const colClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  }[columns]

  return (
    <div className={`grid gap-4 ${colClass}`}>
      {children}
    </div>
  )
}
