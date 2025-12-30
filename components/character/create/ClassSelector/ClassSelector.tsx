'use client'

import { useState } from 'react'
import type { DndClass } from '@/types/character-options'
import { ALL_CLASSES } from '@/data/character-options/classes'
import { ClassCard } from './ClassCard'
import { ClassDetail } from './ClassDetail'
import { SelectionGrid } from '../shared/SelectionCard'

interface ClassSelectorProps {
  selectedClass: DndClass | null
  onClassSelect: (dndClass: DndClass) => void
}

export function ClassSelector({
  selectedClass,
  onClassSelect,
}: ClassSelectorProps) {
  const [detailClass, setDetailClass] = useState<DndClass | null>(null)

  const handleViewDetails = (dndClass: DndClass) => {
    setDetailClass(dndClass)
  }

  return (
    <div>
      <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
        Choose Your Class
      </h2>
      <p className="text-fantasy-stone mb-6">
        Your class defines your character's capabilities in combat, exploration, and social interaction.
        Click on a class to select it, or click "Details" for more information about features and abilities.
      </p>

      {/* Class grid */}
      <SelectionGrid columns={3}>
        {ALL_CLASSES.map(dndClass => (
          <ClassCard
            key={dndClass.id}
            dndClass={dndClass}
            selected={selectedClass?.id === dndClass.id}
            onSelect={onClassSelect}
            onViewDetails={handleViewDetails}
          />
        ))}
      </SelectionGrid>

      {/* Detail modal */}
      {detailClass && (
        <ClassDetail
          dndClass={detailClass}
          onClose={() => setDetailClass(null)}
          onSelect={onClassSelect}
          isSelected={selectedClass?.id === detailClass.id}
        />
      )}
    </div>
  )
}
