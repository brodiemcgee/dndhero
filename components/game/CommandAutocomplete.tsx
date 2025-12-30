'use client'

interface CommandAutocompleteProps {
  /** Current input value */
  input: string
  /** Ghost text to show after input (the completion portion) */
  ghostText: string
  /** Whether to show the autocomplete */
  isVisible: boolean
}

/**
 * Inline ghost text autocomplete overlay for commands
 *
 * Renders as an absolute-positioned overlay that shows the
 * completion text in a faded color after the user's input.
 */
export function CommandAutocomplete({ input, ghostText, isVisible }: CommandAutocompleteProps) {
  if (!isVisible || !ghostText) {
    return null
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none flex items-start px-4 py-2 font-mono text-base"
      aria-hidden="true"
    >
      {/* Invisible text matching user input to position ghost text correctly */}
      <span className="text-transparent whitespace-pre">{input}</span>
      {/* Ghost text in faded color */}
      <span className="text-gray-500">{ghostText}</span>
      {/* Tab hint */}
      <span className="text-gray-600 text-xs ml-2 mt-0.5">[Tab]</span>
    </div>
  )
}

export default CommandAutocomplete
