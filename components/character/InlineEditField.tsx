'use client'

/**
 * InlineEditField Component
 * Reusable component for inline editing of text and number fields
 */

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { useEditMode } from './EditModeContext'

interface InlineEditFieldProps {
  field: string
  value: string | number
  type?: 'text' | 'number'
  className?: string
  placeholder?: string
  min?: number
  max?: number
  maxLength?: number
  multiline?: boolean
  rows?: number
}

export function InlineEditField({
  field,
  value,
  type = 'text',
  className = '',
  placeholder,
  min,
  max,
  maxLength,
  multiline = false,
  rows = 3,
}: InlineEditFieldProps) {
  const { isEditMode, pendingChanges, setPendingChange } = useEditMode()
  const [localValue, setLocalValue] = useState<string | number>(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  // Update local value when pending changes or original value changes
  useEffect(() => {
    const currentValue = pendingChanges[field as keyof typeof pendingChanges] !== undefined
      ? pendingChanges[field as keyof typeof pendingChanges]
      : value
    setLocalValue(currentValue as string | number ?? '')
  }, [field, value, pendingChanges])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = type === 'number' ? Number(e.target.value) : e.target.value
    setLocalValue(newValue)
    setPendingChange(field, newValue)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      // Revert to original value
      setLocalValue(value)
      setPendingChange(field, value)
      inputRef.current?.blur()
    } else if (e.key === 'Enter' && !multiline) {
      // Blur to "save" the change (actual save happens when user clicks save button)
      inputRef.current?.blur()
    }
  }

  // View mode - display the value
  if (!isEditMode) {
    return (
      <span className={className}>
        {value || <span className="text-fantasy-stone/50 italic">{placeholder || 'None'}</span>}
      </span>
    )
  }

  // Edit mode - show input
  const inputClassName = `
    w-full bg-fantasy-dark/50 border-2 border-fantasy-tan/30 rounded px-2 py-1
    text-white font-fantasy focus:border-fantasy-gold focus:outline-none
    transition-colors
    ${className}
  `

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={inputClassName}
      />
    )
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type={type}
      value={localValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      min={min}
      max={max}
      maxLength={maxLength}
      className={inputClassName}
    />
  )
}
