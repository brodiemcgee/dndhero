import Link from 'next/link'
import { PixelButton } from '@/components/ui/PixelButton'
import { PixelPanel } from '@/components/ui/PixelPanel'

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying out DND Hero',
    features: [
      '2 campaigns per month',
      '150 AI turns per month',
      'Full D&D 5e rules',
      'Multiplayer campaigns',
      'Character sheets',
      'Combat tracker',
      'Community support',
    ],
    cta: 'Start Free',
    href: '/auth/signup',
    highlighted: false,
  },
  {
    name: 'Standard',
    price: '$10',
    period: '/month',
    description: 'For regular adventurers',
    features: [
      'Unlimited campaigns',
      '500 AI turns per month',
      'All Free features',
      'Priority AI processing',
      'Voice & video chat',
      'AI-generated maps',
      'Priority support',
    ],
    cta: 'Upgrade to Standard',
    href: '/auth/signup',
    highlighted: true,
  },
  {
    name: 'Premium',
    price: '$20',
    period: '/month',
    description: 'For dedicated game masters',
    features: [
      'Unlimited campaigns',
      '1,500 AI turns per month',
      'All Standard features',
      'Advanced AI DM personality',
      'AI-generated portraits',
      'Custom content library',
      'Premium support',
      'Early access to features',
    ],
    cta: 'Upgrade to Premium',
    href: '/auth/signup',
    highlighted: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/" className="text-amber-400 hover:text-amber-300">
          ← Back to Home
        </Link>
      </div>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="font-['Press_Start_2P'] text-4xl text-amber-400 mb-6">
          Pricing
        </h1>
        <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto">
          Choose the plan that fits your adventuring needs
        </p>
        <p className="text-gray-400 max-w-xl mx-auto">
          All plans include full D&D 5e rules, multiplayer campaigns, and our AI Dungeon Master.
          Start free and upgrade anytime.
        </p>
      </div>

      {/* Pricing tiers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier) => (
            <PixelPanel key={tier.name}>
              <div className={`p-8 h-full flex flex-col ${tier.highlighted ? 'border-4 border-amber-500' : ''}`}>
                {tier.highlighted && (
                  <div className="text-center mb-4">
                    <span className="inline-block px-4 py-1 bg-amber-600 text-white text-sm font-bold rounded">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <h3 className="font-['Press_Start_2P'] text-2xl text-amber-300 mb-2">
                  {tier.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  <span className="text-gray-400">{tier.period}</span>
                </div>
                <p className="text-gray-400 mb-6">{tier.description}</p>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300">
                      <span className="text-amber-500 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={tier.href} className="block">
                  <PixelButton
                    className="w-full"
                    variant={tier.highlighted ? 'primary' : 'secondary'}
                  >
                    {tier.cta}
                  </PixelButton>
                </Link>
              </div>
            </PixelPanel>
          ))}
        </div>

        {/* Credit top-ups */}
        <div className="mt-16">
          <h2 className="font-['Press_Start_2P'] text-2xl text-center text-amber-400 mb-8">
            Need More Turns?
          </h2>
          <PixelPanel>
            <div className="p-8 text-center">
              <p className="text-gray-300 mb-6">
                Out of AI turns for the month? Purchase credit packs to keep the adventure going.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <div className="p-4 bg-gray-800 border-2 border-amber-700 rounded">
                  <div className="text-2xl font-bold text-white mb-2">$5</div>
                  <div className="text-amber-400 mb-2">100 Turns</div>
                  <div className="text-sm text-gray-400">$0.05 per turn</div>
                </div>
                <div className="p-4 bg-gray-800 border-2 border-amber-700 rounded">
                  <div className="text-2xl font-bold text-white mb-2">$20</div>
                  <div className="text-amber-400 mb-2">500 Turns</div>
                  <div className="text-sm text-gray-400">$0.04 per turn</div>
                </div>
                <div className="p-4 bg-gray-800 border-2 border-amber-700 rounded">
                  <div className="text-2xl font-bold text-white mb-2">$50</div>
                  <div className="text-amber-400 mb-2">1,500 Turns</div>
                  <div className="text-sm text-gray-400">$0.033 per turn</div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-6">
                Credits never expire and roll over month to month
              </p>
            </div>
          </PixelPanel>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="font-['Press_Start_2P'] text-2xl text-center text-amber-400 mb-8">
            FAQ
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <PixelPanel>
              <div className="p-6">
                <h3 className="text-amber-300 font-bold mb-2">What's an AI turn?</h3>
                <p className="text-gray-400">
                  An AI turn is one response from the AI Dungeon Master. This includes narrative generation,
                  combat resolution, and applying game rules. Player actions, dice rolls, and chat don't count.
                </p>
              </div>
            </PixelPanel>

            <PixelPanel>
              <div className="p-6">
                <h3 className="text-amber-300 font-bold mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-400">
                  Yes! Cancel your subscription anytime from your account settings.
                  You'll keep access until the end of your billing period.
                </p>
              </div>
            </PixelPanel>

            <PixelPanel>
              <div className="p-6">
                <h3 className="text-amber-300 font-bold mb-2">What happens if I exceed my turn limit?</h3>
                <p className="text-gray-400">
                  You'll get a warning at 70% usage. At 100%, you can either purchase credit packs to continue
                  or wait until next month. Your campaigns are saved and waiting.
                </p>
              </div>
            </PixelPanel>

            <PixelPanel>
              <div className="p-6">
                <h3 className="text-amber-300 font-bold mb-2">Do credits roll over?</h3>
                <p className="text-gray-400">
                  Yes! Any purchased credit packs roll over indefinitely. Monthly subscription turns
                  reset each billing cycle.
                </p>
              </div>
            </PixelPanel>

            <PixelPanel>
              <div className="p-6">
                <h3 className="text-amber-300 font-bold mb-2">Is there a refund policy?</h3>
                <p className="text-gray-400">
                  We offer full refunds within 7 days of purchase if you're not satisfied.
                  Contact support for assistance.
                </p>
              </div>
            </PixelPanel>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/20 border-y-4 border-amber-700 py-16 mt-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="font-['Press_Start_2P'] text-2xl text-amber-400 mb-6">
            Start Your Adventure Today
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            No credit card required for free tier
          </p>
          <Link href="/auth/signup">
            <PixelButton className="text-lg px-12 py-4">
              Create Free Account
            </PixelButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
