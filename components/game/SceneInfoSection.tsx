'use client'

import { PixelPanel } from '@/components/ui/PixelPanel'
import Image from 'next/image'

interface SceneImage {
  id: string
  image_url: string
  location_name: string
  generation_status: 'pending' | 'generating' | 'completed' | 'failed'
}

interface Scene {
  id: string
  name: string
  location: string
}

interface SceneInfoSectionProps {
  scene: Scene
  sceneImage?: SceneImage | null
  isGenerating?: boolean
}

export default function SceneInfoSection({
  scene,
  sceneImage,
  isGenerating = false,
}: SceneInfoSectionProps) {
  const showImage = sceneImage?.image_url && sceneImage.generation_status === 'completed'
  const showLoading = isGenerating || sceneImage?.generation_status === 'generating'

  // Only render if there's an image to show or one is generating
  if (!showImage && !showLoading) {
    return null
  }

  return (
    <PixelPanel>
      <div className="p-4">
        <h3 className="font-['Press_Start_2P'] text-sm text-amber-300 mb-3">
          Scene
        </h3>

        {/* Scene Image Display */}
        {showImage && (
          <div className="relative w-full aspect-video rounded overflow-hidden border-2 border-amber-700">
            <Image
              src={sceneImage.image_url}
              alt={scene.name || 'Scene'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 300px"
            />
          </div>
        )}

        {/* Loading State */}
        {showLoading && (
          <div className="w-full aspect-video rounded bg-gray-800 border-2 border-amber-700/50 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs text-amber-400/70">Generating scene art...</p>
            </div>
          </div>
        )}
      </div>
    </PixelPanel>
  )
}
