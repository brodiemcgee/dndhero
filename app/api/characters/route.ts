/**
 * Characters API Route
 * GET: List all characters owned by the current user
 */

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

import { createRouteClient as createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
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

    // Use service client to fetch characters (user already verified above)
    const serviceSupabase = createServiceClient()

    // Fetch user's characters (without nested campaign join to avoid issues)
    const { data: characters, error: charsError } = await serviceSupabase
      .from('characters')
      .select(`
        id,
        name,
        race,
        class,
        level,
        background,
        alignment,
        max_hp,
        current_hp,
        armor_class,
        strength,
        dexterity,
        constitution,
        intelligence,
        wisdom,
        charisma,
        campaign_id,
        portrait_url,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (charsError) {
      console.error('Error fetching characters:', charsError)
      return NextResponse.json(
        { error: 'Failed to fetch characters' },
        { status: 500 }
      )
    }

    // Debug logging
    console.log('Characters API - User ID:', user.id)
    console.log('Characters API - Raw query result:', JSON.stringify(characters, null, 2))
    console.log('Characters API - Character count:', characters?.length || 0)
    console.log('Characters API - Character IDs:', characters?.map((c: any) => c.id))

    // Get character limits using the database function
    const { data: limitsData, error: limitsError } = await serviceSupabase
      .rpc('get_character_limits', { check_user_id: user.id })

    let limits = {
      current: characters?.length || 0,
      max: 3,
      tier: 'free' as string,
    }

    if (!limitsError && limitsData && limitsData.length > 0) {
      limits = {
        current: limitsData[0].current_count,
        max: limitsData[0].max_characters,
        tier: limitsData[0].tier,
      }
    }

    // Transform characters to include campaign name and portrait
    const transformedCharacters = (characters || []).map((char: any) => ({
      id: char.id,
      name: char.name,
      race: char.race,
      class: char.class,
      level: char.level,
      background: char.background,
      alignment: char.alignment,
      max_hp: char.max_hp,
      current_hp: char.current_hp,
      armor_class: char.armor_class,
      strength: char.strength,
      dexterity: char.dexterity,
      constitution: char.constitution,
      intelligence: char.intelligence,
      wisdom: char.wisdom,
      charisma: char.charisma,
      campaign_id: char.campaign_id,
      portrait_url: char.portrait_url,
      campaign_name: char.campaigns?.name || null,
      campaign_state: char.campaigns?.state || null,
      is_standalone: char.campaign_id === null,
      created_at: char.created_at,
      updated_at: char.updated_at,
    }))

    console.log('Characters API - Transformed count:', transformedCharacters.length)
    console.log('Characters API - Limits:', limits)

    const response = NextResponse.json({
      characters: transformedCharacters,
      limits,
    })

    // Explicitly prevent caching (including Vercel edge)
    response.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    response.headers.set('CDN-Cache-Control', 'no-store')
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
  } catch (error) {
    console.error('Characters list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
