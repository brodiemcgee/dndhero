'use client'

import { PixelPanel } from '@/components/ui/PixelPanel'

interface Scene {
  id: string
  name: string
  location: string
}

interface SceneInfoSectionProps {
  scene: Scene
}

export default function SceneInfoSection({ scene }: SceneInfoSectionProps) {
  return (
    <PixelPanel>
      <div className="p-4">
        <h3 className="font-['Press_Start_2P'] text-sm text-amber-300 mb-3">
          Location
        </h3>
        <div className="space-y-1">
          <div className="text-white font-semibold">{scene.name || 'Unknown'}</div>
          <div className="text-sm text-gray-400">{scene.location || 'Unknown location'}</div>
        </div>
      </div>
    </PixelPanel>
  )
}
