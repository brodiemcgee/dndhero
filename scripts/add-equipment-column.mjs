import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function addEquipmentColumn() {
  console.log('Adding equipment column to characters table...')

  const sql = `
    ALTER TABLE characters
      ADD COLUMN IF NOT EXISTS equipment JSONB DEFAULT '{}'::jsonb;
  `

  const { data, error } = await supabase.rpc('exec', { sql })

  if (error) {
    // Try using the SQL editor API directly
    console.log('Trying direct SQL execution...')
    const { error: sqlError } = await supabase
      .from('_realtime')
      .select('*')
      .limit(0) // Just to test connection

    if (sqlError) {
      console.error('Database connection error:', sqlError)
    }

    console.error('Migration error:', error)
    console.log('\nPlease run this SQL manually in the Supabase SQL Editor:')
    console.log(sql)
    process.exit(1)
  }

  console.log('✅ Equipment column added successfully!')
}

addEquipmentColumn()
