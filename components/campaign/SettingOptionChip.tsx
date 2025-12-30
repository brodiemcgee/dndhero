'use client'

interface SettingOptionChipProps {
  label: string
  selected: boolean
  onToggle: () => void
}

export function SettingOptionChip({ label, selected, onToggle }: SettingOptionChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        px-3 py-2 rounded border-2 text-sm font-medium transition-all duration-150
        ${selected
          ? 'bg-fantasy-gold/20 border-fantasy-gold text-fantasy-gold'
          : 'bg-fantasy-brown border-fantasy-stone text-fantasy-tan hover:border-fantasy-gold/50 hover:text-fantasy-light'
        }
      `}
    >
      {label}
    </button>
  )
}
