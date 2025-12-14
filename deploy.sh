#!/bin/bash

# DND Hero Deployment Script
echo "🚀 Deploying DND Hero to Vercel..."
echo ""

# Add environment variables to Vercel
echo "📝 Adding environment variables..."

echo "NEXT_PUBLIC_SUPABASE_URL" | vercel env add production <<EOF
https://lopzkueebqzhwlmtkbgc.supabase.co
EOF

echo "NEXT_PUBLIC_SUPABASE_ANON_KEY" | vercel env add production <<EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvcHprdWVlYnF6aHdsbXRrYmdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MTc0NTgsImV4cCI6MjA4MDk5MzQ1OH0.fGfo-Tc1VykYk2Z0CVRf-aGcMZNRnAfNZ3QKdbvClSs
EOF

echo "SUPABASE_SERVICE_ROLE_KEY" | vercel env add production <<EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvcHprdWVlYnF6aHdsbXRrYmdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQxNzQ1OCwiZXhwIjoyMDgwOTkzNDU4fQ.dPyEqSwlK0nx5eT-ET_WnXQlij2VM9ZSog0S0NDE7vY
EOF

echo "GOOGLE_AI_API_KEY" | vercel env add production <<EOF
AIzaSyBT8x3Y-DBHBdPPPRuMTU3NBMLYvMastQ4
EOF

echo "NEXT_PUBLIC_SITE_URL" | vercel env add production <<EOF
https://dndhero.vercel.app
EOF

echo ""
echo "✅ Environment variables added!"
echo ""
echo "🚀 Deploying to production..."
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo "Visit your app at: https://dndhero.vercel.app"
