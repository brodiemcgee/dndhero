'use client'

const INTEREST_OPTIONS = [
  'High Fantasy',
  'Dark Fantasy',
  'Sci-Fi Fantasy',
  'Horror',
  'Comedy',
  'Romance',
  'Political Intrigue',
  'Dungeon Crawling',
  'Roleplay Heavy',
  'Combat Heavy',
  'Exploration',
  'Mystery',
]

interface InterestsInputProps {
  selected: string[]
  onChange: (interests: string[]) => void
}

export default function InterestsInput({
  selected,
  onChange,
}: InterestsInputProps) {
  const toggleInterest = (interest: string) => {
    if (selected.includes(interest)) {
      onChange(selected.filter((i) => i !== interest))
    } else {
      onChange([...selected, interest])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {INTEREST_OPTIONS.map((interest) => {
        const isSelected = selected.includes(interest)
        return (
          <button
            key={interest}
            type="button"
            onClick={() => toggleInterest(interest)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isSelected
                ? 'bg-fantasy-gold text-fantasy-dark'
                : 'bg-fantasy-brown border-2 border-fantasy-stone text-fantasy-light hover:border-fantasy-tan'
            }`}
          >
            {interest}
          </button>
        )
      })}
    </div>
  )
}
