'use client'

/**
 * EditModeContext
 * Provides edit mode state and functionality for character sheets
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Character } from './CharacterSheet/types'

interface EditModeContextType {
  isEditMode: boolean
  setEditMode: (mode: boolean) => void
  pendingChanges: Partial<Character>
  setPendingChange: (field: string, value: unknown) => void
  saveChanges: () => Promise<void>
  discardChanges: () => void
  isSaving: boolean
  error: string | null
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined)

interface EditModeProviderProps {
  children: ReactNode
  character: Character
  onSave?: (updatedCharacter: Character) => void
}

export function EditModeProvider({ children, character, onSave }: EditModeProviderProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [pendingChanges, setPendingChangesState] = useState<Partial<Character>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setEditMode = useCallback((mode: boolean) => {
    setIsEditMode(mode)
    if (!mode) {
      // Clear pending changes when exiting edit mode
      setPendingChangesState({})
      setError(null)
    }
  }, [])

  const setPendingChange = useCallback((field: string, value: unknown) => {
    setPendingChangesState(prev => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const saveChanges = useCallback(async () => {
    if (Object.keys(pendingChanges).length === 0) {
      setEditMode(false)
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/characters/${character.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pendingChanges),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save changes')
      }

      const { character: updatedCharacter } = await response.json()

      // Call onSave callback with updated character
      if (onSave) {
        onSave(updatedCharacter)
      }

      // Clear pending changes and exit edit mode
      setPendingChangesState({})
      setIsEditMode(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      console.error('Error saving character changes:', err)
    } finally {
      setIsSaving(false)
    }
  }, [character.id, pendingChanges, onSave, setEditMode])

  const discardChanges = useCallback(() => {
    setPendingChangesState({})
    setIsEditMode(false)
    setError(null)
  }, [])

  const value: EditModeContextType = {
    isEditMode,
    setEditMode,
    pendingChanges,
    setPendingChange,
    saveChanges,
    discardChanges,
    isSaving,
    error,
  }

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  )
}

export function useEditMode(): EditModeContextType {
  const context = useContext(EditModeContext)
  if (context === undefined) {
    throw new Error('useEditMode must be used within an EditModeProvider')
  }
  return context
}
