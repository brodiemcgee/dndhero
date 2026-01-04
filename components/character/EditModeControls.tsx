'use client'

/**
 * EditModeControls Component
 * Provides Edit/Save/Cancel buttons for character sheet editing
 */

import { useEditMode } from './EditModeContext'
import { PixelButton } from '@/components/ui/PixelButton'

export function EditModeControls() {
  const { isEditMode, setEditMode, saveChanges, discardChanges, isSaving, error, pendingChanges } = useEditMode()

  const hasChanges = Object.keys(pendingChanges).length > 0

  if (!isEditMode) {
    return (
      <PixelButton
        variant="secondary"
        size="small"
        onClick={() => setEditMode(true)}
      >
        Edit Character
      </PixelButton>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {error && (
        <span className="text-red-400 text-sm">{error}</span>
      )}

      <PixelButton
        variant="secondary"
        size="small"
        onClick={discardChanges}
        disabled={isSaving}
      >
        Cancel
      </PixelButton>

      <PixelButton
        variant="primary"
        size="small"
        onClick={saveChanges}
        disabled={isSaving || !hasChanges}
      >
        {isSaving ? 'Saving...' : 'Save Changes'}
      </PixelButton>
    </div>
  )
}
