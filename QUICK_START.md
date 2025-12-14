# DND Hero - Quick Start Guide

## ✅ What's Done

Your DND Hero app is being deployed! Here's what's already configured:

1. ✅ **Database Created** - All 18 tables created in Supabase
2. ✅ **Vercel Deployment Started** - Deploying to production now
3. ✅ **Gemini AI Key Added** - Your AI DM is ready

## 🔧 What You Need To Do Now

### Step 1: Get Your Supabase Service Role Key (2 minutes)

1. Go to: https://supabase.com/dashboard/project/lopzkueebqzhwlmtkbgc/settings/api
2. Copy the **`service_role`** key (NOT the anon key)
3. Add it to your `.env.local` file:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 2: Add Environment Variables to Vercel (5 minutes)

Go to: https://vercel.com/contact-7048s-projects/dndhero/settings/environment-variables

Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://lopzkueebqzhwlmtkbgc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvcHprdWVlYnF6aHdsbXRrYmdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MTc0NTgsImV4cCI6MjA4MDk5MzQ1OH0.fGfo-Tc1VykYk2Z0CVRf-aGcMZNRnAfNZ3QKdbvClSs
SUPABASE_SERVICE_ROLE_KEY=(paste your service role key)
GOOGLE_AI_API_KEY=AIzaSyBT8x3Y-DBHBdPPPRuMTU3NBMLYvMastQ4
NEXT_PUBLIC_SITE_URL=(your Vercel URL, e.g., https://dndhero.vercel.app)
```

**For Stripe (optional - can add later):**
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STANDARD_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_CREDITS_100_PRICE_ID=price_...
STRIPE_CREDITS_500_PRICE_ID=price_...
STRIPE_CREDITS_1500_PRICE_ID=price_...
```

### Step 3: Redeploy After Adding Variables

After adding environment variables in Vercel:
1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"

OR run:
```bash
vercel --prod
```

### Step 4: Test Your App! (5 minutes)

Once deployed:

1. ✅ Visit your Vercel URL
2. ✅ Sign up for an account
3. ✅ Create a campaign
4. ✅ Create a character
5. ✅ Start the game
6. ✅ Submit an action - watch the AI DM respond!

---

## 🎮 Your App is LIVE!

**Supabase Dashboard:** https://supabase.com/dashboard/project/lopzkueebqzhwlmtkbgc
**Vercel Dashboard:** https://vercel.com/contact-7048s-projects/dndhero

---

## 💳 Setting Up Payments (Optional - Later)

When you're ready to enable payments:

1. **Create Stripe Account:** https://dashboard.stripe.com
2. **Create Products:**
   - Standard: $10/month subscription
   - Premium: $20/month subscription
   - 100 Credits: $5 one-time
   - 500 Credits: $20 one-time
   - 1500 Credits: $50 one-time
3. **Copy Price IDs** to environment variables
4. **Set up Webhook:**
   - URL: `https://your-vercel-url.vercel.app/api/stripe/webhook`
   - Events: `customer.subscription.*`, `checkout.session.completed`, `invoice.payment_failed`
5. **Copy Webhook Secret** to `STRIPE_WEBHOOK_SECRET`

---

## 🆘 Troubleshooting

**"Database error"**
→ Make sure service role key is added to Vercel

**"AI not responding"**
→ Check GOOGLE_AI_API_KEY is correct

**"Can't create campaign"**
→ Check all Supabase environment variables are set

**Build failing**
→ Check Vercel build logs for specific error

---

## 📚 Next Steps

1. Test with friends!
2. Set up Stripe for payments
3. Customize DM personality in campaign settings
4. Share feedback!

**Need help?** Check the full deployment guide in `DEPLOYMENT_GUIDE.md`
