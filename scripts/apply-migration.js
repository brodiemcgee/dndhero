#!/usr/bin/env node

/**
 * Apply database migration using Supabase client
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function applyMigration() {
  try {
    const migrationPath = path.join(
      __dirname,
      '../supabase/migrations/20251214_fix_critical_schema_issues.sql'
    )

    console.log('Reading migration file...')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('Applying migration...')

    // Split the SQL into individual statements
    const statements = sql
      .split('$$')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    // For migrations, we need to use the database REST API directly
    // Since the JS client doesn't support arbitrary SQL execution
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // If the RPC doesn't exist, we'll need to use a different approach
      console.log('Direct SQL execution not available via RPC')
      console.log('Please apply the migration manually via Supabase Studio SQL Editor')
      console.log('Migration file:', migrationPath)
      process.exit(1)
    }

    console.log('Migration applied successfully!')
    console.log(data)
  } catch (error) {
    console.error('Migration error:', error.message)
    process.exit(1)
  }
}

applyMigration()
