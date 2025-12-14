# DND Hero - Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- Node.js 18+ installed
- A Supabase account and project
- A Google Cloud account (for Gemini AI)
- A Stripe account (for payments)
- A Vercel account (for deployment)

---

## 1. Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site URL
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Google Gemini AI
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (configure in Stripe Dashboard first)
STRIPE_STANDARD_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_CREDITS_100_PRICE_ID=price_...
STRIPE_CREDITS_500_PRICE_ID=price_...
STRIPE_CREDITS_1500_PRICE_ID=price_...
```

---

## 2. Supabase Setup

### 2.1 Create Project
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Note your project URL and API keys

### 2.2 Run Migrations
Execute the migration files in order:
```bash
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_schema_continued.sql
supabase/migrations/003_rls_policies.sql
```

You can run these via:
- Supabase SQL Editor (copy/paste each file)
- OR Supabase CLI: `supabase db push`

### 2.3 Storage Buckets
Create storage buckets:
- `character-portraits` (public)
- `maps` (public)
- `campaign-assets` (public)

### 2.4 Auth Settings
In Supabase Dashboard → Authentication → Settings:
- Enable Email provider
- Set Site URL: `https://yourdomain.com`
- Add redirect URLs:
  - `https://yourdomain.com/api/auth/callback`
  - `http://localhost:3000/api/auth/callback` (for local dev)

---

## 3. Google Gemini AI Setup

### 3.1 Get API Key
1. Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `.env.local` as `GOOGLE_AI_API_KEY`

### 3.2 Enable Billing
- Gemini requires a billing account
- Set usage quotas to control costs
- Monitor usage at [Google Cloud Console](https://console.cloud.google.com)

---

## 4. Stripe Setup

### 4.1 Create Products
In Stripe Dashboard → Products:

**1. Standard Subscription**
- Name: "DND Hero Standard"
- Billing: Recurring, Monthly
- Price: $10/month
- Copy the Price ID → `STRIPE_STANDARD_PRICE_ID`

**2. Premium Subscription**
- Name: "DND Hero Premium"
- Billing: Recurring, Monthly
- Price: $20/month
- Copy the Price ID → `STRIPE_PREMIUM_PRICE_ID`

**3. Credit Packs (One-time payments)**
- 100 Credits: $5 → `STRIPE_CREDITS_100_PRICE_ID`
- 500 Credits: $20 → `STRIPE_CREDITS_500_PRICE_ID`
- 1500 Credits: $50 → `STRIPE_CREDITS_1500_PRICE_ID`

### 4.2 Webhook Setup
1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
   - `invoice.payment_failed`
4. Copy Signing Secret → `STRIPE_WEBHOOK_SECRET`

---

## 5. Vercel Deployment

### 5.1 Install Vercel CLI
```bash
npm i -g vercel
```

### 5.2 Link Project
```bash
vercel link
```

### 5.3 Set Environment Variables
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add GOOGLE_AI_API_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_WEBHOOK_SECRET
# ... add all Stripe price IDs
```

OR add via Vercel Dashboard → Project Settings → Environment Variables

### 5.4 Deploy
```bash
vercel --prod
```

---

## 6. Post-Deployment Checklist

### 6.1 Verify Auth
- [ ] Sign up works
- [ ] Email verification received
- [ ] Login works
- [ ] Password reset works

### 6.2 Verify Game Flow
- [ ] Create campaign
- [ ] Create character
- [ ] Start game
- [ ] Submit action
- [ ] AI DM responds
- [ ] Dice rolls work
- [ ] Real-time updates work

### 6.3 Verify Payments
- [ ] Checkout session creates
- [ ] Subscription activates
- [ ] Webhook processes events
- [ ] Database updates correctly
- [ ] Quota enforcement works

### 6.4 Security
- [ ] RLS policies active
- [ ] Service role key not exposed
- [ ] HTTPS enabled
- [ ] CORS configured

---

## 7. Monitoring & Maintenance

### 7.1 Supabase
- Monitor database size
- Check API usage
- Review auth logs
- Watch for RLS errors

### 7.2 Google AI
- Monitor token usage
- Set spending limits
- Track cost per turn
- Review error rates

### 7.3 Stripe
- Monitor subscriptions
- Track failed payments
- Review disputes
- Analyze MRR

### 7.4 Vercel
- Monitor function execution time
- Check error rates
- Review bandwidth usage
- Optimize Edge functions

---

## 8. Scaling Considerations

### When to Scale

**Database (Supabase):**
- Upgrade when approaching connection limits
- Consider read replicas for high traffic
- Enable connection pooling

**AI Processing:**
- Implement request queuing for high loads
- Cache common responses
- Use rate limiting per user

**File Storage:**
- Use CDN for assets
- Implement image optimization
- Set up automatic cleanup

### Cost Optimization

1. **AI Costs (Biggest expense):**
   - Monitor average tokens per turn
   - Optimize prompts for conciseness
   - Implement turn caching
   - Set per-user rate limits

2. **Database:**
   - Archive old campaigns
   - Implement pagination
   - Optimize queries
   - Use indexes effectively

3. **Functions:**
   - Minimize cold starts
   - Optimize bundle size
   - Use Edge runtime where possible

---

## 9. Troubleshooting

### Common Issues

**1. Auth redirect not working**
- Check Supabase redirect URLs
- Verify NEXT_PUBLIC_SITE_URL
- Check middleware configuration

**2. AI DM not responding**
- Verify GOOGLE_AI_API_KEY
- Check Gemini quota limits
- Review API error logs

**3. Stripe webhooks failing**
- Verify webhook secret
- Check endpoint URL
- Review Stripe event logs
- Ensure POST method allowed

**4. Real-time not working**
- Check Supabase Realtime enabled
- Verify RLS policies
- Check WebSocket connection

**5. Database errors**
- Run migrations in order
- Verify RLS policies
- Check service role permissions

---

## 10. Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run type checking
npm run type-check

# Build for production
npm run build
```

### Testing
```bash
# Manual testing checklist
1. Create account
2. Create campaign
3. Invite player (test with 2nd account)
4. Create character
5. Start game
6. Submit actions
7. Test dice rolling
8. Test payment flow (Stripe test mode)
```

### Git Workflow
```bash
# Feature branch
git checkout -b feature/name

# Commit changes
git add .
git commit -m "feat: description"

# Push to main (or PR)
git push origin main
```

---

## 11. Launch Checklist

### Pre-Launch
- [ ] All environment variables set
- [ ] Database migrations run
- [ ] RLS policies active
- [ ] Stripe products configured
- [ ] Stripe webhook active
- [ ] Auth flows tested
- [ ] Payment flows tested
- [ ] AI DM responding
- [ ] Legal pages reviewed
- [ ] Privacy policy complete
- [ ] Terms of service complete

### Launch Day
- [ ] Deploy to production
- [ ] Verify all features work
- [ ] Monitor error logs
- [ ] Test with real users
- [ ] Monitor Stripe webhooks
- [ ] Watch AI costs
- [ ] Check database performance

### Post-Launch
- [ ] Set up monitoring alerts
- [ ] Create backup strategy
- [ ] Document known issues
- [ ] Plan feature roadmap
- [ ] Gather user feedback

---

## Support & Resources

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Stripe Docs:** https://stripe.com/docs
- **Google AI Docs:** https://ai.google.dev/docs
- **Vercel Docs:** https://vercel.com/docs

---

**You're ready to launch! 🚀**

For production support, monitor logs closely in the first few days and be prepared to iterate based on user feedback.
