import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DnDHero - AI-Powered D&D 5e',
  description: 'Play D&D 5e with an AI Dungeon Master in a multiplayer web experience',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
