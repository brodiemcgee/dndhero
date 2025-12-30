'use client'

/**
 * Export/Import Buttons Component
 * Provides UI for exporting and importing characters
 */

import { useState, useRef } from 'react'
import { Download, Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { generateExportFilename } from '@/lib/character/export-schema'

interface ExportImportButtonsProps {
  characterId?: string
  characterName?: string
  campaignId?: string
  onImportSuccess?: (character: unknown) => void
  className?: string
}

export function ExportImportButtons({
  characterId,
  characterName,
  campaignId,
  onImportSuccess,
  className = '',
}: ExportImportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'warning'
    text: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    if (!characterId) return

    setIsExporting(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/characters/${characterId}/export`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Export failed')
      }

      // Get the JSON data
      const data = await response.json()

      // Create blob and download
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)

      const filename = generateExportFilename(characterName || 'character')
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setMessage({
        type: 'success',
        text: `${characterName} exported successfully!`,
      })
    } catch (error) {
      console.error('Export error:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Export failed',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setMessage(null)

    try {
      // Read file content
      const text = await file.text()
      let characterData: unknown

      try {
        characterData = JSON.parse(text)
      } catch {
        throw new Error('Invalid JSON file')
      }

      // Send to import API
      const response = await fetch('/api/characters/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character_data: characterData,
          campaign_id: campaignId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Import failed')
      }

      // Show success message with any warnings
      if (result.warnings && result.warnings.length > 0) {
        setMessage({
          type: 'warning',
          text: `${result.message} (${result.warnings.length} warning${result.warnings.length > 1 ? 's' : ''})`,
        })
      } else {
        setMessage({
          type: 'success',
          text: result.message,
        })
      }

      // Callback with new character
      onImportSuccess?.(result.character)
    } catch (error) {
      console.error('Import error:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Import failed',
      })
    } finally {
      setIsImporting(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex gap-2">
        {/* Export Button */}
        {characterId && (
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="
              flex items-center gap-2 px-4 py-2
              bg-amber-900/30 border border-amber-600/50 rounded-lg
              text-amber-100 hover:bg-amber-800/40
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
            "
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export Character
          </button>
        )}

        {/* Import Button */}
        <button
          onClick={handleImportClick}
          disabled={isImporting}
          className="
            flex items-center gap-2 px-4 py-2
            bg-emerald-900/30 border border-emerald-600/50 rounded-lg
            text-emerald-100 hover:bg-emerald-800/40
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
          "
        >
          {isImporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          Import Character
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm
            ${message.type === 'success' ? 'bg-emerald-900/30 text-emerald-200 border border-emerald-600/30' : ''}
            ${message.type === 'error' ? 'bg-red-900/30 text-red-200 border border-red-600/30' : ''}
            ${message.type === 'warning' ? 'bg-amber-900/30 text-amber-200 border border-amber-600/30' : ''}
          `}
        >
          {message.type === 'success' && <CheckCircle className="w-4 h-4" />}
          {message.type === 'error' && <AlertCircle className="w-4 h-4" />}
          {message.type === 'warning' && <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}
    </div>
  )
}

/**
 * Standalone Export Button (for use in character detail pages)
 */
export function ExportButton({
  characterId,
  characterName,
  className = '',
}: {
  characterId: string
  characterName: string
  className?: string
}) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const response = await fetch(`/api/characters/${characterId}/export`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Export failed')
      }

      const data = await response.json()

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)

      const filename = generateExportFilename(characterName)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      alert(error instanceof Error ? error.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`
        flex items-center gap-2 px-3 py-1.5
        bg-stone-800/50 border border-stone-600/50 rounded
        text-stone-300 hover:bg-stone-700/50 hover:text-stone-100
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200 text-sm
        ${className}
      `}
    >
      {isExporting ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      Export
    </button>
  )
}

/**
 * Standalone Import Button (for use in character list/dashboard)
 */
export function ImportButton({
  campaignId,
  onSuccess,
  className = '',
}: {
  campaignId?: string
  onSuccess?: (character: unknown) => void
  className?: string
}) {
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)

    try {
      const text = await file.text()
      const characterData = JSON.parse(text)

      const response = await fetch('/api/characters/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character_data: characterData,
          campaign_id: campaignId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Import failed')
      }

      onSuccess?.(result.character)
    } catch (error) {
      console.error('Import error:', error)
      alert(error instanceof Error ? error.message : 'Import failed')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isImporting}
        className={`
          flex items-center gap-2 px-3 py-1.5
          bg-emerald-900/30 border border-emerald-600/50 rounded
          text-emerald-200 hover:bg-emerald-800/40
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200 text-sm
          ${className}
        `}
      >
        {isImporting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Upload className="w-3.5 h-3.5" />
        )}
        Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  )
}
