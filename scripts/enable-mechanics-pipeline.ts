/**
 * Script to enable mechanics pipeline on campaigns
 *
 * Run with: npx tsx scripts/enable-mechanics-pipeline.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local manually
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local')
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) continue
      const key = trimmed.slice(0, eqIndex)
      let value = trimmed.slice(eqIndex + 1)
      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      // Remove trailing \n (backslash + n) that Vercel adds - check char codes
      while (value.length >= 2 &&
             value.charCodeAt(value.length - 2) === 92 &&
             value.charCodeAt(value.length - 1) === 110) {
        value = value.slice(0, -2)
      }
      process.env[key] = value.trim()
    }
  } catch (e) {
    // ignore
  }
}

loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  console.log('Run: npx vercel env pull .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function main() {
  const args = process.argv.slice(2)
  const campaignId = args[0]

  if (campaignId === '--all') {
    // Enable for all campaigns - fetch and update each
    const { data: campaigns, error: fetchError } = await supabase
      .from('campaigns')
      .select('id, name, dm_config')

    if (fetchError) {
      console.error('Error fetching campaigns:', fetchError)
      process.exit(1)
    }

    if (!campaigns || campaigns.length === 0) {
      console.log('No campaigns found')
      process.exit(0)
    }

    console.log(`Enabling mechanics pipeline for ${campaigns.length} campaign(s)...\n`)

    for (const campaign of campaigns) {
      const dmConfig = (campaign.dm_config || {}) as Record<string, unknown>
      const newConfig = { ...dmConfig, use_mechanics_pipeline: true }

      const { error: updateError } = await supabase
        .from('campaigns')
        .update({ dm_config: newConfig })
        .eq('id', campaign.id)

      if (updateError) {
        console.error(`✗ Failed for ${campaign.name}: ${updateError.message}`)
      } else {
        console.log(`✓ Enabled for: ${campaign.name}`)
      }
    }

    console.log('\nDone!')
  } else if (campaignId) {
    // Enable for specific campaign
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('id, name, dm_config')
      .eq('id', campaignId)
      .single()

    if (fetchError || !campaign) {
      console.error('Campaign not found:', campaignId)
      process.exit(1)
    }

    const newConfig = { ...(campaign.dm_config || {}), use_mechanics_pipeline: true }

    const { error } = await supabase
      .from('campaigns')
      .update({ dm_config: newConfig })
      .eq('id', campaignId)

    if (error) {
      console.error('Error:', error)
      process.exit(1)
    }

    console.log(`✓ Enabled mechanics pipeline for: ${campaign.name}`)
  } else {
    // List all campaigns
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('id, name, dm_config')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error:', error)
      process.exit(1)
    }

    console.log('\nCampaigns:')
    console.log('─'.repeat(80))

    for (const c of campaigns || []) {
      const pipelineEnabled = c.dm_config?.use_mechanics_pipeline === true
      const status = pipelineEnabled ? '✓ ENABLED' : '○ disabled'
      console.log(`${status}  ${c.name}`)
      console.log(`         ID: ${c.id}`)
    }

    console.log('\n─'.repeat(80))
    console.log('\nUsage:')
    console.log('  npx tsx scripts/enable-mechanics-pipeline.ts <campaign-id>  # Enable for one')
    console.log('  npx tsx scripts/enable-mechanics-pipeline.ts --all          # Enable for all')
  }
}

main().catch(console.error)
