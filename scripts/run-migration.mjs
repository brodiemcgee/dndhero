#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local manually
const envPath = join(__dirname, '../.env.local')
const envContent = readFileSync(envPath, 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

console.log('🔗 Connecting to Supabase...')
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
})

async function runMigration() {
  try {
    const migrationPath = join(
      __dirname,
      '../supabase/migrations/20251214_fix_critical_schema_issues.sql'
    )

    console.log('📖 Reading migration file...')
    const sql = readFileSync(migrationPath, 'utf8')

    console.log('🚀 Executing migration...')

    // Use the raw SQL execution via REST API
    const { data, error } = await supabase.rpc('exec', { sql })

    if (error) {
      console.error('❌ Migration failed:', error.message)

      // Try alternative: Direct HTTP request to database
      console.log('🔄 Trying alternative method...')

      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ sql })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Alternative method also failed:', errorText)
        console.log('\n📝 Please run the migration manually via Supabase Studio SQL Editor:')
        console.log('https://supabase.com/dashboard/project/lopzkueebqzhwlmtkbgc/sql/new')
        process.exit(1)
      }

      console.log('✅ Migration executed successfully via alternative method!')
    } else {
      console.log('✅ Migration executed successfully!')
      if (data) {
        console.log('📊 Result:', data)
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    console.log('\n📝 Please run the migration manually via Supabase Studio SQL Editor:')
    console.log('https://supabase.com/dashboard/project/lopzkueebqzhwlmtkbgc/sql/new')
    process.exit(1)
  }
}

runMigration()
