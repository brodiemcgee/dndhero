# DnD Hero

A retro pixel-art D&D game built with React, TypeScript, and Supabase. Experience collaborative storytelling and adventure with friends in a nostalgic 8-bit fantasy aesthetic.

## Features

- **Character Creation**: Create custom D&D characters with traditional races, classes, and ability scores
- **Multiplayer Lobbies**: Create or join game sessions with friends
- **Real-time Gameplay**: Synchronized game state across all players
- **Combat System**: Turn-based combat with initiative tracking
- **Quest System**: Track active and completed quests
- **Voice Chat Integration**: Built-in voice communication support
- **Retro Aesthetic**: Beautiful pixel-art UI with fantasy color palette

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4.0 with custom fantasy theme
- **UI Components**: Radix UI + Custom pixel-art components
- **Icons**: Lucide React
- **Backend**: Supabase (Edge Functions + Database)

## Project Structure

```
dndhero/
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── LandingPage.tsx
│   │   ├── CharacterCreation.tsx
│   │   ├── GameLobby.tsx
│   │   ├── GameView.tsx
│   │   ├── CharacterSheet.tsx
│   │   ├── Inventory.tsx
│   │   ├── QuestLog.tsx
│   │   ├── CombatTracker.tsx
│   │   └── ...
│   ├── styles/
│   │   └── globals.css    # Custom CSS with fantasy theme
│   ├── utils/
│   │   └── supabase/      # Supabase configuration
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── package.json
├── vite.config.ts
├── tsconfig.json
└── index.html
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- A Supabase project (for backend functionality)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/brodiemcgee/dndhero.git
cd dndhero
```

2. Install dependencies:
```bash
npm install
```

3. Configure Supabase:
   - Update `src/utils/supabase/info.tsx` with your Supabase project credentials
   - Deploy the Supabase Edge Functions from the original Figma Make project

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5173`

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Game Flow

1. **Landing**: Create a player profile or load existing one
2. **Game Creation/Join**: Create a new game or join an existing one
3. **Character Creation**: Design your D&D character with stats, class, and race
4. **Lobby**: Wait for all players to create characters
5. **Adventure**: Collaborative gameplay with narrative-driven actions
6. **Combat**: Turn-based tactical encounters

## Design System

The game uses a custom 8-bit fantasy aesthetic with:
- Earthy color palette (browns, golds, greens)
- Pixel-perfect borders and buttons
- Retro monospace font (Courier New)
- Textured backgrounds
- Animated elements for engagement

## Attributions

This project includes components from:
- [shadcn/ui](https://ui.shadcn.com/) (MIT License)
- Images from [Unsplash](https://unsplash.com) (Unsplash License)

Original design and prototype created in Figma Make.

## License

This project is provided as-is for educational and personal use.

## Future Enhancements

- AI Dungeon Master integration
- Dice rolling animations
- Character progression and leveling
- Inventory management with item effects
- Map visualization
- Custom campaign creation tools

---

Built with ⚔️ by the community