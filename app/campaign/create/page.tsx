'use client'

/**
 * Campaign Creation Wizard
 * Multi-step form for creating a new campaign
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { UserMenu } from '@/components/auth/UserMenu'
import { PixelButton } from '@/components/ui/PixelButton'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { SettingOptionsStep } from '@/components/campaign/SettingOptionsStep'
import { SettingDescriptionStep } from '@/components/campaign/SettingDescriptionStep'
import { ART_STYLES, ART_STYLE_LABELS, DEFAULT_ART_STYLE, type ArtStyle } from '@/lib/ai-dm/art-styles'
import { createEmptySettingOptions, type SettingOptions } from '@/types/campaign-settings'

export const dynamic = 'force-dynamic'

type Step = 'basics_name' | 'basics_options' | 'basics_description' | 'settings' | 'dm_config'

// Map steps to their main section for the progress indicator
const STEP_SECTIONS: Record<Step, number> = {
  basics_name: 0,
  basics_options: 0,
  basics_description: 0,
  settings: 1,
  dm_config: 2,
}

export default function CreateCampaignPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('basics_name')
  const [loading, setLoading] = useState(false)
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    setting: '',
    mode: 'freeform' as 'single_player' | 'vote' | 'first_response_wins' | 'freeform',
    art_style: DEFAULT_ART_STYLE as ArtStyle,
    dm_config: {
      tone: 'balanced' as 'serious' | 'balanced' | 'humorous',
      difficulty: 'normal' as 'easy' | 'normal' | 'hard' | 'deadly',
      house_rules: [] as string[],
      narrative_style: 'descriptive' as 'concise' | 'descriptive' | 'epic',
    },
    strict_mode: false,
    adult_content_enabled: false,
  })

  const [settingOptions, setSettingOptions] = useState<SettingOptions>(createEmptySettingOptions())

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleDMConfigChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      dm_config: { ...formData.dm_config, [field]: value },
    })
  }

  const handleGenerateDescription = async () => {
    setIsGeneratingDescription(true)
    setError('')

    try {
      const response = await fetch('/api/campaign/generate-setting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settingOptions }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to generate description')
        setIsGeneratingDescription(false)
        return
      }

      setFormData({ ...formData, setting: data.description })
      setStep('basics_description')
    } catch (err) {
      setError('Failed to generate description. Please try again.')
    } finally {
      setIsGeneratingDescription(false)
    }
  }

  const handleRegenerateDescription = async () => {
    setIsGeneratingDescription(true)
    setError('')

    try {
      const response = await fetch('/api/campaign/generate-setting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settingOptions }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to regenerate description')
        return
      }

      setFormData({ ...formData, setting: data.description })
    } catch (err) {
      setError('Failed to regenerate description. Please try again.')
    } finally {
      setIsGeneratingDescription(false)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/campaign/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dm_config: {
            ...formData.dm_config,
            setting_options: settingOptions, // Store the selected options
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create campaign')
        setLoading(false)
        return
      }

      // Redirect to lobby
      router.push(`/campaign/${data.campaign.id}/lobby`)
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  // Determine which section is active for the progress bar
  const currentSection = STEP_SECTIONS[step]

  return (
    <AuthGuard>
      <div className="min-h-screen bg-fantasy-dark">
        <header className="border-b-4 border-fantasy-stone bg-fantasy-brown p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/dashboard" className="text-2xl font-bold text-fantasy-gold">
              DND HERO
            </Link>
            <UserMenu />
          </div>
        </header>

        <main className="max-w-3xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-fantasy-gold mb-2">Create New Campaign</h1>
            <p className="text-fantasy-tan">Set up your D&D adventure</p>
          </div>

          {error && (
            <div className="bg-fantasy-red/20 border-2 border-fantasy-red text-fantasy-red p-4 rounded mb-6">
              {error}
            </div>
          )}

          <PixelPanel className="p-6">
            {/* Step Indicator - 3 main sections */}
            <div className="flex gap-2 mb-8">
              {[0, 1, 2].map((sectionIdx) => (
                <div
                  key={sectionIdx}
                  className={`flex-1 h-2 rounded ${
                    currentSection === sectionIdx
                      ? 'bg-fantasy-gold'
                      : currentSection > sectionIdx
                        ? 'bg-fantasy-green'
                        : 'bg-fantasy-stone'
                  }`}
                />
              ))}
            </div>

            {/* Sub-step indicator for Basics section */}
            {currentSection === 0 && (
              <div className="flex justify-center gap-2 mb-6">
                {['basics_name', 'basics_options', 'basics_description'].map((s, idx) => (
                  <div
                    key={s}
                    className={`w-2 h-2 rounded-full ${
                      step === s
                        ? 'bg-fantasy-gold'
                        : ['basics_name', 'basics_options', 'basics_description'].indexOf(step) > idx
                          ? 'bg-fantasy-green'
                          : 'bg-fantasy-stone'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Step 1a: Campaign Name & Mode */}
            {step === 'basics_name' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-fantasy-gold mb-4">Campaign Basics</h2>

                <div>
                  <label className="block text-fantasy-tan mb-2 font-bold">Campaign Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-3 rounded focus:outline-none focus:border-fantasy-gold"
                    placeholder="The Lost Mines of Phandelver"
                  />
                </div>

                <div>
                  <label className="block text-fantasy-tan mb-2 font-bold">Turn Mode *</label>
                  <select
                    value={formData.mode}
                    onChange={(e) => handleChange('mode', e.target.value)}
                    className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-3 rounded focus:outline-none focus:border-fantasy-gold"
                  >
                    <option value="single_player">Single Player - DM only</option>
                    <option value="first_response_wins">First Response Wins - First player controls turn</option>
                    <option value="vote">Vote - Players vote on actions</option>
                    <option value="freeform">Freeform - All players contribute (recommended)</option>
                  </select>
                  <p className="text-xs text-fantasy-stone mt-1">
                    {formData.mode === 'freeform' && 'Players can freely contribute ideas. AI DM synthesizes all input.'}
                    {formData.mode === 'vote' && 'Players vote on actions. Majority wins.'}
                    {formData.mode === 'first_response_wins' && 'First player to respond controls the turn.'}
                    {formData.mode === 'single_player' && 'Only you (DM) can advance the story.'}
                  </p>
                </div>

                <div className="flex justify-end">
                  <PixelButton
                    onClick={() => setStep('basics_options')}
                    variant="primary"
                    disabled={!formData.name.trim()}
                  >
                    NEXT &rarr;
                  </PixelButton>
                </div>
              </div>
            )}

            {/* Step 1b: Setting Options */}
            {step === 'basics_options' && (
              <SettingOptionsStep
                options={settingOptions}
                onChange={setSettingOptions}
                onBack={() => setStep('basics_name')}
                onGenerate={handleGenerateDescription}
                isGenerating={isGeneratingDescription}
              />
            )}

            {/* Step 1c: Setting Description */}
            {step === 'basics_description' && (
              <SettingDescriptionStep
                options={settingOptions}
                description={formData.setting}
                onDescriptionChange={(desc) => handleChange('setting', desc)}
                onRegenerate={handleRegenerateDescription}
                isRegenerating={isGeneratingDescription}
                onBack={() => setStep('basics_options')}
                onNext={() => setStep('settings')}
              />
            )}

            {/* Step 2: Settings */}
            {step === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-fantasy-gold mb-4">Campaign Settings</h2>

                <div>
                  <label className="block text-fantasy-tan mb-2 font-bold">Art Style</label>
                  <select
                    value={formData.art_style}
                    onChange={(e) => handleChange('art_style', e.target.value)}
                    className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-3 rounded focus:outline-none focus:border-fantasy-gold"
                  >
                    {ART_STYLES.map((style) => (
                      <option key={style} value={style}>
                        {ART_STYLE_LABELS[style]}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-fantasy-stone mt-1">Defines the visual style for AI-generated scenes and portraits</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.strict_mode}
                      onChange={(e) => handleChange('strict_mode', e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-fantasy-tan font-bold">Strict Mode</span>
                  </label>
                  <p className="text-xs text-fantasy-stone mt-1">
                    AI DM follows D&D 5e rules precisely with no bending
                  </p>
                </div>

                <div className="border-t border-fantasy-stone pt-4 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.adult_content_enabled}
                      onChange={(e) => handleChange('adult_content_enabled', e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-fantasy-tan font-bold">Allow Adult Content</span>
                  </label>
                  <p className="text-xs text-fantasy-stone mt-1">
                    Enable mature themes (18+). All players must also opt-in via their profile settings.
                  </p>
                  {formData.adult_content_enabled && (
                    <p className="text-xs text-fantasy-gold mt-2">
                      Note: Adult content only activates when ALL campaign members have enabled it in their Profile Settings.
                    </p>
                  )}
                </div>

                <div className="flex justify-between">
                  <PixelButton onClick={() => setStep('basics_description')} variant="secondary">
                    &larr; BACK
                  </PixelButton>
                  <PixelButton onClick={() => setStep('dm_config')} variant="primary">
                    NEXT &rarr;
                  </PixelButton>
                </div>
              </div>
            )}

            {/* Step 3: DM Config */}
            {step === 'dm_config' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-fantasy-gold mb-4">DM Personality</h2>

                <div>
                  <label className="block text-fantasy-tan mb-2 font-bold">Tone</label>
                  <select
                    value={formData.dm_config.tone}
                    onChange={(e) => handleDMConfigChange('tone', e.target.value)}
                    className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-3 rounded focus:outline-none focus:border-fantasy-gold"
                  >
                    <option value="serious">Serious - Dark and dramatic</option>
                    <option value="balanced">Balanced - Mix of drama and fun</option>
                    <option value="humorous">Humorous - Light-hearted and comedic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-fantasy-tan mb-2 font-bold">Difficulty</label>
                  <select
                    value={formData.dm_config.difficulty}
                    onChange={(e) => handleDMConfigChange('difficulty', e.target.value)}
                    className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-3 rounded focus:outline-none focus:border-fantasy-gold"
                  >
                    <option value="easy">Easy - Forgiving encounters</option>
                    <option value="normal">Normal - Balanced challenge</option>
                    <option value="hard">Hard - Tough encounters</option>
                    <option value="deadly">Deadly - Brutal difficulty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-fantasy-tan mb-2 font-bold">Narrative Style</label>
                  <select
                    value={formData.dm_config.narrative_style}
                    onChange={(e) => handleDMConfigChange('narrative_style', e.target.value)}
                    className="w-full bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light p-3 rounded focus:outline-none focus:border-fantasy-gold"
                  >
                    <option value="concise">Concise - Short and punchy</option>
                    <option value="descriptive">Descriptive - Rich detail</option>
                    <option value="epic">Epic - Grand and theatrical</option>
                  </select>
                </div>

                <div className="flex justify-between">
                  <PixelButton onClick={() => setStep('settings')} variant="secondary">
                    &larr; BACK
                  </PixelButton>
                  <PixelButton
                    onClick={handleSubmit}
                    variant="primary"
                    disabled={loading || !formData.name || !formData.setting}
                  >
                    {loading ? 'CREATING...' : 'CREATE CAMPAIGN'}
                  </PixelButton>
                </div>
              </div>
            )}
          </PixelPanel>
        </main>
      </div>
    </AuthGuard>
  )
}
