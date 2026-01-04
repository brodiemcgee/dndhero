'use client'

/**
 * BackgroundTab Component
 * Displays character appearance, backstory, allies & organizations, and treasure
 * Styled like page 2 of the official D&D character sheet
 */

import Image from 'next/image'
import { Character } from './types'
import { useEditMode } from '../EditModeContext'

interface BackgroundTabProps {
  character: Character
  onPortraitClick?: () => void
}

export function BackgroundTab({ character, onPortraitClick }: BackgroundTabProps) {
  const { isEditMode, pendingChanges, setPendingChange } = useEditMode()

  const backstory = (pendingChanges.backstory as string) ?? character.backstory ?? ''
  const age = (pendingChanges.age as string) ?? character.age ?? ''
  const height = (pendingChanges.height as string) ?? character.height ?? ''
  const eyeColor = (pendingChanges.eye_color as string) ?? character.eye_color ?? ''
  const skinTone = (pendingChanges.skin_tone as string) ?? character.skin_tone ?? ''
  const hairColor = (pendingChanges.hair_color as string) ?? character.hair_color ?? ''
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Character Appearance */}
        <div className="bg-fantasy-brown border-4 border-fantasy-tan rounded-lg p-4">
          <h4 className="text-sm font-bold text-fantasy-gold uppercase tracking-wider mb-3 border-b-2 border-fantasy-tan pb-2">
            Character Appearance
          </h4>

          {/* Portrait */}
          <div
            className="relative w-full aspect-[3/4] max-w-xs mx-auto mb-4 cursor-pointer group"
            onClick={onPortraitClick}
          >
            <div className="w-full h-full border-4 border-fantasy-gold bg-fantasy-dark rounded-lg overflow-hidden">
              {character.portrait_url ? (
                <Image
                  src={character.portrait_url}
                  alt={character.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-fantasy-stone">
                  <svg className="w-24 h-24 mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span className="text-sm">Click to add portrait</span>
                </div>
              )}
            </div>
            {onPortraitClick && character.portrait_url && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <span className="text-white">Change Portrait</span>
              </div>
            )}
          </div>

          {/* Physical Description */}
          <div className="grid grid-cols-3 gap-2 text-sm mb-4">
            <AppearanceField
              label="Age"
              value={age}
              isEditMode={isEditMode}
              onChange={(value) => setPendingChange('age', value)}
            />
            <AppearanceField
              label="Height"
              value={height}
              isEditMode={isEditMode}
              onChange={(value) => setPendingChange('height', value)}
            />
            <AppearanceField label="Weight" value={character.weight} />
            <AppearanceField
              label="Eyes"
              value={eyeColor}
              isEditMode={isEditMode}
              onChange={(value) => setPendingChange('eye_color', value)}
            />
            <AppearanceField
              label="Skin"
              value={skinTone}
              isEditMode={isEditMode}
              onChange={(value) => setPendingChange('skin_tone', value)}
            />
            <AppearanceField
              label="Hair"
              value={hairColor}
              isEditMode={isEditMode}
              onChange={(value) => setPendingChange('hair_color', value)}
            />
          </div>

          {/* Additional Appearance Details */}
          {(character.build || character.hair_style || character.distinguishing_features || character.clothing_style) && (
            <div className="space-y-2 text-sm border-t border-fantasy-stone/30 pt-3">
              {character.build && (
                <div>
                  <span className="text-fantasy-stone">Build: </span>
                  <span className="text-fantasy-tan">{character.build}</span>
                </div>
              )}
              {character.hair_style && (
                <div>
                  <span className="text-fantasy-stone">Hair Style: </span>
                  <span className="text-fantasy-tan">{character.hair_style}</span>
                </div>
              )}
              {character.distinguishing_features && (
                <div>
                  <span className="text-fantasy-stone">Distinguishing Features: </span>
                  <span className="text-fantasy-tan">{character.distinguishing_features}</span>
                </div>
              )}
              {character.clothing_style && (
                <div>
                  <span className="text-fantasy-stone">Clothing: </span>
                  <span className="text-fantasy-tan">{character.clothing_style}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Character Backstory */}
        <div className="bg-fantasy-brown border-4 border-fantasy-tan rounded-lg p-4">
          <h4 className="text-sm font-bold text-fantasy-gold uppercase tracking-wider mb-3 border-b-2 border-fantasy-tan pb-2">
            Character Backstory
          </h4>
          <div className="min-h-[200px] bg-fantasy-dark/30 rounded p-3">
            {isEditMode ? (
              <textarea
                value={backstory}
                onChange={(e) => setPendingChange('backstory', e.target.value)}
                placeholder="Every hero has a story..."
                rows={8}
                className="w-full h-full min-h-[180px] bg-fantasy-dark/50 border border-fantasy-gold rounded p-2 text-fantasy-tan text-sm font-fantasy focus:outline-none resize-none"
              />
            ) : backstory ? (
              <p className="text-fantasy-tan text-sm whitespace-pre-wrap leading-relaxed">
                {backstory}
              </p>
            ) : (
              <p className="text-fantasy-stone italic text-sm">
                No backstory written yet. Every hero has a story...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Allies & Organizations */}
        <div className="bg-fantasy-brown border-4 border-fantasy-tan rounded-lg p-4">
          <h4 className="text-sm font-bold text-fantasy-gold uppercase tracking-wider mb-3 border-b-2 border-fantasy-tan pb-2">
            Allies & Organizations
          </h4>

          <div className="space-y-3">
            {character.allies_and_organizations && character.allies_and_organizations.length > 0 ? (
              character.allies_and_organizations.map((ally, index) => (
                <div key={index} className="bg-fantasy-dark/30 rounded p-3">
                  <div className="flex items-start gap-3">
                    {/* Symbol/Icon */}
                    {ally.symbol_url ? (
                      <div className="w-12 h-12 flex-shrink-0 border border-fantasy-stone rounded overflow-hidden">
                        <Image
                          src={ally.symbol_url}
                          alt={ally.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 flex-shrink-0 border border-fantasy-stone rounded flex items-center justify-center text-fantasy-stone">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                        </svg>
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-white">{ally.name}</div>
                      {ally.description && (
                        <p className="text-fantasy-tan text-sm mt-1">{ally.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-fantasy-stone italic text-sm text-center py-4">
                No allies or organizations
              </p>
            )}
          </div>
        </div>

        {/* Additional Features & Traits */}
        {character.additional_features && (
          <div className="bg-fantasy-brown border-4 border-fantasy-tan rounded-lg p-4">
            <h4 className="text-sm font-bold text-fantasy-gold uppercase tracking-wider mb-3 border-b-2 border-fantasy-tan pb-2">
              Additional Features & Traits
            </h4>
            <div className="bg-fantasy-dark/30 rounded p-3">
              <p className="text-fantasy-tan text-sm whitespace-pre-wrap">
                {character.additional_features}
              </p>
            </div>
          </div>
        )}

        {/* Treasure */}
        <div className="bg-fantasy-brown border-4 border-fantasy-tan rounded-lg p-4">
          <h4 className="text-sm font-bold text-fantasy-gold uppercase tracking-wider mb-3 border-b-2 border-fantasy-tan pb-2">
            Treasure
          </h4>

          <div className="space-y-2">
            {character.treasure && character.treasure.length > 0 ? (
              character.treasure.map((item, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-fantasy-dark/30 rounded">
                  <span className="text-yellow-500">&#9830;</span>
                  <div>
                    <div className="text-white text-sm font-medium">{item.name}</div>
                    {item.description && (
                      <p className="text-fantasy-stone text-xs">{item.description}</p>
                    )}
                    {item.value && (
                      <span className="text-yellow-500 text-xs">{item.value}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-fantasy-stone italic text-sm text-center py-4">
                No treasure acquired
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface AppearanceFieldProps {
  label: string
  value: string | null | undefined
  isEditMode?: boolean
  onChange?: (value: string) => void
}

function AppearanceField({ label, value, isEditMode, onChange }: AppearanceFieldProps) {
  return (
    <div className="text-center">
      <div className="bg-fantasy-dark/50 rounded px-2 py-1 mb-1 min-h-[28px] flex items-center justify-center">
        {isEditMode && onChange ? (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-center text-fantasy-tan text-sm bg-transparent border-b border-fantasy-gold focus:outline-none"
          />
        ) : (
          <span className="text-fantasy-tan text-sm">{value || '-'}</span>
        )}
      </div>
      <div className="text-xs text-fantasy-stone uppercase">{label}</div>
    </div>
  )
}
