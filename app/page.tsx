import Link from 'next/link'
import { PixelButton } from '@/components/ui/PixelButton'
import { PixelPanel } from '@/components/ui/PixelPanel'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pixel-pattern.png')] opacity-5"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="font-['Press_Start_2P'] text-4xl sm:text-5xl lg:text-6xl text-amber-400 mb-6 leading-tight">
              DND Hero
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-4">
              AI-Powered Dungeons & Dragons
            </p>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Play D&D 5e with your friends, guided by an intelligent AI Dungeon Master.
              No scheduling nightmares, no manual bookkeeping, just pure adventure.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <PixelButton className="text-lg px-8 py-4">
                  Start Adventure
                </PixelButton>
              </Link>
              <Link href="/auth/login">
                <PixelButton variant="secondary" className="text-lg px-8 py-4">
                  Login
                </PixelButton>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="font-['Press_Start_2P'] text-3xl text-center text-amber-400 mb-16">
          Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <PixelPanel>
            <div className="p-6">
              <div className="text-4xl mb-4">🎲</div>
              <h3 className="font-['Press_Start_2P'] text-lg text-amber-300 mb-4">
                Smart AI DM
              </h3>
              <p className="text-gray-400">
                Our AI Dungeon Master adapts to your party's choices, creates dynamic narratives,
                and enforces D&D 5e rules automatically.
              </p>
            </div>
          </PixelPanel>

          {/* Feature 2 */}
          <PixelPanel>
            <div className="p-6">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="font-['Press_Start_2P'] text-lg text-amber-300 mb-4">
                Full D&D 5e
              </h3>
              <p className="text-gray-400">
                Complete implementation of D&D 5th Edition rules: abilities, skills, combat,
                spells, and conditions.
              </p>
            </div>
          </PixelPanel>

          {/* Feature 3 */}
          <PixelPanel>
            <div className="p-6">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="font-['Press_Start_2P'] text-lg text-amber-300 mb-4">
                Multiplayer
              </h3>
              <p className="text-gray-400">
                Play with friends in real-time. Multiple turn modes: solo, voting, first-response,
                or freeform collaboration.
              </p>
            </div>
          </PixelPanel>

          {/* Feature 4 */}
          <PixelPanel>
            <div className="p-6">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="font-['Press_Start_2P'] text-lg text-amber-300 mb-4">
                Character Sheets
              </h3>
              <p className="text-gray-400">
                Full digital character sheets with automatic calculations, skill tracking,
                and spell management.
              </p>
            </div>
          </PixelPanel>

          {/* Feature 5 */}
          <PixelPanel>
            <div className="p-6">
              <div className="text-4xl mb-4">⚔️</div>
              <h3 className="font-['Press_Start_2P'] text-lg text-amber-300 mb-4">
                Combat Tracker
              </h3>
              <p className="text-gray-400">
                Automated initiative tracking, HP management, and condition effects.
                Focus on strategy, not bookkeeping.
              </p>
            </div>
          </PixelPanel>

          {/* Feature 6 */}
          <PixelPanel>
            <div className="p-6">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-['Press_Start_2P'] text-lg text-amber-300 mb-4">
                Safe & Private
              </h3>
              <p className="text-gray-400">
                Your campaigns are private by default. Built-in moderation and safety tools
                for a welcoming community.
              </p>
            </div>
          </PixelPanel>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-800/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-['Press_Start_2P'] text-3xl text-center text-amber-400 mb-16">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-700 rounded-full flex items-center justify-center mx-auto mb-6 font-['Press_Start_2P'] text-2xl text-white">
                1
              </div>
              <h3 className="font-['Press_Start_2P'] text-lg text-amber-300 mb-4">
                Create Campaign
              </h3>
              <p className="text-gray-400">
                Set your campaign's theme, choose a turn mode, and customize your AI DM's personality.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-700 rounded-full flex items-center justify-center mx-auto mb-6 font-['Press_Start_2P'] text-2xl text-white">
                2
              </div>
              <h3 className="font-['Press_Start_2P'] text-lg text-amber-300 mb-4">
                Build Characters
              </h3>
              <p className="text-gray-400">
                Invite friends and create your D&D characters with our guided wizard. No manual math required.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-700 rounded-full flex items-center justify-center mx-auto mb-6 font-['Press_Start_2P'] text-2xl text-white">
                3
              </div>
              <h3 className="font-['Press_Start_2P'] text-lg text-amber-300 mb-4">
                Play Together
              </h3>
              <p className="text-gray-400">
                Describe your actions, roll dice, and watch the AI DM bring your story to life in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Teaser */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="font-['Press_Start_2P'] text-3xl text-center text-amber-400 mb-8">
          Start Free
        </h2>
        <p className="text-center text-gray-400 mb-12 text-lg max-w-2xl mx-auto">
          Try DND Hero free with 2 campaigns and 150 AI turns per month.
          Upgrade anytime for unlimited adventures.
        </p>
        <div className="text-center">
          <Link href="/pricing">
            <PixelButton className="text-lg px-8 py-4">
              View Pricing
            </PixelButton>
          </Link>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/20 border-y-4 border-amber-700 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="font-['Press_Start_2P'] text-2xl sm:text-3xl text-amber-400 mb-6">
            Ready to Roll?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Join adventurers exploring AI-powered D&D campaigns
          </p>
          <Link href="/auth/signup">
            <PixelButton className="text-lg px-12 py-4">
              Create Free Account
            </PixelButton>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-['Press_Start_2P'] text-sm text-amber-400 mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/pricing" className="text-gray-400 hover:text-amber-300">Pricing</Link></li>
                <li><Link href="/auth/signup" className="text-gray-400 hover:text-amber-300">Sign Up</Link></li>
                <li><Link href="/auth/login" className="text-gray-400 hover:text-amber-300">Login</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-['Press_Start_2P'] text-sm text-amber-400 mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="https://www.dndbeyond.com/sources/basic-rules" target="_blank" rel="noopener" className="text-gray-400 hover:text-amber-300">D&D Rules</a></li>
                <li><Link href="/docs" className="text-gray-400 hover:text-amber-300">Documentation</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-['Press_Start_2P'] text-sm text-amber-400 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-400 hover:text-amber-300">Privacy</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-amber-300">Terms</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-['Press_Start_2P'] text-sm text-amber-400 mb-4">DND Hero</h3>
              <p className="text-gray-400 text-sm">
                AI-powered Dungeons & Dragons for modern adventurers
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            <p>© 2024 DND Hero. Not affiliated with Wizards of the Coast.</p>
            <p className="mt-2">
              Dungeons & Dragons and D&D are trademarks of Wizards of the Coast LLC.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
