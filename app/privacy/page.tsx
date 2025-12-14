import Link from 'next/link'
import { PixelPanel } from '@/components/ui/PixelPanel'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-amber-400 hover:text-amber-300 mb-8 inline-block">
          ← Back to Home
        </Link>

        <PixelPanel>
          <div className="p-8 prose prose-invert max-w-none">
            <h1 className="font-['Press_Start_2P'] text-3xl text-amber-400 mb-8">
              Privacy Policy
            </h1>

            <p className="text-gray-300 mb-6">
              <strong>Last Updated: December 2024</strong>
            </p>

            <section className="mb-8">
              <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
                Information We Collect
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>We collect information you provide directly to us, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Account information (email, username, password)</li>
                  <li>Character and campaign data</li>
                  <li>Game actions and chat messages</li>
                  <li>Payment information (processed securely by Stripe)</li>
                  <li>Usage data and analytics</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
                How We Use Your Information
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>We use collected information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and improve our AI-powered D&D experience</li>
                  <li>Process your payments and manage subscriptions</li>
                  <li>Send important service updates</li>
                  <li>Ensure platform safety and enforce our Terms of Service</li>
                  <li>Analyze usage patterns to improve features</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
                Data Storage & Security
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Your data is stored securely using industry-standard encryption. We use Supabase
                  for database hosting and Stripe for payment processing. We implement appropriate
                  technical and organizational measures to protect your personal information.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
                AI & Your Data
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We use Google Gemini AI to power our Dungeon Master. Your campaign data is sent
                  to Google's AI service to generate narratives and game responses. Google processes
                  this data according to their privacy policy. We do not use your campaign data to
                  train AI models.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
                Sharing of Information
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>We share your information only in these cases:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>With other players in your campaigns (character names, actions)</li>
                  <li>With service providers (Stripe for payments, Google for AI)</li>
                  <li>When required by law or to protect our rights</li>
                  <li>With your explicit consent</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
                Your Rights
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your account and data</li>
                  <li>Export your campaign data</li>
                  <li>Opt out of marketing communications</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
                Children's Privacy
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  DND Hero is intended for users 13 years and older. We do not knowingly collect
                  information from children under 13. If we learn we have collected such
                  information, we will delete it.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
                Changes to This Policy
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We may update this privacy policy from time to time. We will notify you of
                  significant changes via email or through the platform.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-['Press_Start_2P'] text-xl text-amber-300 mb-4">
                Contact Us
              </h2>
              <div className="text-gray-300">
                <p>
                  For privacy-related questions or to exercise your rights, contact us at:
                  <br />
                  <a href="mailto:privacy@dndhero.com" className="text-amber-400 hover:text-amber-300">
                    privacy@dndhero.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        </PixelPanel>
      </div>
    </div>
  )
}
