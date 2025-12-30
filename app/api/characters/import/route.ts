/**
 * Character Import API Route
 * POST: Imports a character from JSON data
 */

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { validateImportData, transformImportToCharacter } from '@/lib/character/import-schema'

const ImportRequestSchema = z.object({
  character_data: z.record(z.unknown()),
  campaign_id: z.string().uuid().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate request structure
    const requestValidation = ImportRequestSchema.safeParse(body)
    if (!requestValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request format',
          details: requestValidation.error.errors,
        },
        { status: 400 }
      )
    }

    const { character_data, campaign_id } = requestValidation.data

    const { client: supabase } = createClient(request)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // If campaign_id is provided, verify user has access
    if (campaign_id) {
      const { data: dbCampaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('id, dm_id')
        .eq('id', campaign_id)
        .single()

      if (campaignError || !dbCampaign) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        )
      }

      const campaign = dbCampaign as Record<string, unknown>

      // Check if user is DM or a player in the campaign
      const { data: membership } = await supabase
        .from('campaign_players')
        .select('id')
        .eq('campaign_id', campaign_id)
        .eq('user_id', user.id)
        .single()

      if (campaign.dm_id !== user.id && !membership) {
        return NextResponse.json(
          { error: 'You do not have access to this campaign' },
          { status: 403 }
        )
      }
    }

    // Check character limits (without campaign)
    if (!campaign_id) {
      // Get user's subscription tier
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()

      const profile = dbProfile as Record<string, unknown> | null
      const tier = (profile?.subscription_tier as string) || 'free'

      // Character limits by tier
      const limits: Record<string, number> = {
        free: 3,
        standard: 10,
        premium: Infinity,
      }

      const maxCharacters = limits[tier] || 3

      // Count existing standalone characters
      const { count: characterCount } = await supabase
        .from('characters')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('campaign_id', null)

      if ((characterCount || 0) >= maxCharacters) {
        return NextResponse.json(
          {
            error: `Character limit reached (${maxCharacters} for ${tier} tier)`,
            upgrade_required: tier !== 'premium',
          },
          { status: 403 }
        )
      }
    }

    // Validate import data
    const validationResult = validateImportData(character_data)

    if (!validationResult.valid) {
      return NextResponse.json(
        {
          error: 'Invalid character data',
          details: validationResult.errors,
        },
        { status: 400 }
      )
    }

    // Transform to character record
    const characterRecord = transformImportToCharacter(
      validationResult.character!,
      user.id,
      campaign_id
    )

    // Create the character using service client
    const serviceSupabase = createServiceClient()
    const { data: newCharacter, error: createError } = await serviceSupabase
      .from('characters')
      .insert(characterRecord)
      .select()
      .single()

    if (createError || !newCharacter) {
      console.error('Error creating imported character:', createError)
      return NextResponse.json(
        { error: 'Failed to import character' },
        { status: 500 }
      )
    }

    const character = newCharacter as Record<string, unknown>

    return NextResponse.json({
      success: true,
      character: newCharacter,
      warnings: validationResult.warnings,
      message: `${character.name} has been imported successfully!`,
    })
  } catch (error) {
    console.error('Import character error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
