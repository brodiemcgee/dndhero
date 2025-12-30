/**
 * Pending Dice Rolls API Route
 * Returns pending dice roll requests for a turn contract
 */

import { createRouteClient as createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const QuerySchema = z.object({
  turnContractId: z.string().uuid(),
})

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const turnContractId = url.searchParams.get('turnContractId')

    const validation = QuerySchema.safeParse({ turnContractId })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid turnContractId' },
        { status: 400 }
      )
    }

    const { client: supabase } = createClient(request)

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the turn contract to verify access
    const { data: turnContract, error: turnError } = await supabase
      .from('turn_contracts')
      .select(`
        id,
        phase,
        scenes!inner(campaign_id)
      `)
      .eq('id', turnContractId)
      .single()

    if (turnError || !turnContract) {
      return NextResponse.json({ error: 'Turn contract not found' }, { status: 404 })
    }

    // Verify user is a campaign member
    const { data: membership } = await supabase
      .from('campaign_members')
      .select('role')
      .eq('campaign_id', turnContract.scenes.campaign_id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a campaign member' }, { status: 403 })
    }

    // Get all dice roll requests for this turn (pending and completed)
    const { data: rollRequests, error: rollsError } = await supabase
      .from('dice_roll_requests')
      .select(`
        id,
        character_id,
        roll_type,
        dice_notation,
        notation,
        ability,
        skill,
        dc,
        advantage,
        disadvantage,
        description,
        reason,
        roll_order,
        resolved,
        resolved_at,
        result_total,
        result_breakdown,
        result_rolls,
        result_critical,
        result_fumble,
        success,
        created_at
      `)
      .eq('turn_contract_id', turnContractId)
      .order('roll_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (rollsError) {
      console.error('Failed to fetch roll requests:', rollsError)
      return NextResponse.json({ error: 'Failed to fetch rolls' }, { status: 500 })
    }

    // Get character info for each roll
    const characterIds = [...new Set(rollRequests?.filter(r => r.character_id).map(r => r.character_id))]

    let characters: Record<string, { name: string; user_id: string }> = {}
    if (characterIds.length > 0) {
      const { data: charData } = await supabase
        .from('characters')
        .select('id, name, user_id')
        .in('id', characterIds)

      if (charData) {
        characters = charData.reduce((acc, char) => {
          acc[char.id] = { name: char.name, user_id: char.user_id }
          return acc
        }, {} as Record<string, { name: string; user_id: string }>)
      }
    }

    // Enrich roll requests with character info and user ownership
    const enrichedRolls = rollRequests?.map(roll => ({
      ...roll,
      notation: roll.dice_notation || roll.notation,
      character_name: roll.character_id ? characters[roll.character_id]?.name : null,
      is_own_character: roll.character_id ? characters[roll.character_id]?.user_id === user.id : false,
      can_roll: roll.character_id
        ? characters[roll.character_id]?.user_id === user.id || membership.role === 'host'
        : membership.role === 'host',
    })) || []

    // Split into pending and completed
    const pendingRolls = enrichedRolls.filter(r => !r.resolved)
    const completedRolls = enrichedRolls.filter(r => r.resolved)

    return NextResponse.json({
      turnPhase: turnContract.phase,
      pendingRolls,
      completedRolls,
      allComplete: pendingRolls.length === 0,
      isHost: membership.role === 'host',
    })
  } catch (error) {
    console.error('Pending rolls error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
