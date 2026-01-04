/**
 * Reveal Quest API Route
 * Reveals a hidden primary quest to players
 */

import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: questId } = params
    const body = await request.json()
    const { turn_number, dramatic_moment } = body

    const serviceSupabase = createServiceClient()

    // Get the quest
    const { data: quest, error: questError } = await serviceSupabase
      .from('quests')
      .select('*, campaigns(current_turn)')
      .eq('id', questId)
      .single()

    if (questError || !quest) {
      return NextResponse.json(
        { error: 'Quest not found' },
        { status: 404 }
      )
    }

    // Check if already revealed
    if (quest.is_revealed) {
      return NextResponse.json(
        { error: 'Quest is already revealed' },
        { status: 400 }
      )
    }

    // Check if it's a primary quest
    if (quest.quest_type !== 'primary') {
      return NextResponse.json(
        { error: 'Only primary quests can be revealed' },
        { status: 400 }
      )
    }

    // Get current turn from campaign if not provided
    const currentTurn = turn_number || quest.campaigns?.current_turn || 0

    // Reveal the quest: swap hidden values to visible
    const { data: updatedQuest, error: updateError } = await serviceSupabase
      .from('quests')
      .update({
        title: quest.hidden_title,
        description: quest.hidden_description,
        is_revealed: true,
        revealed_at: new Date().toISOString(),
        turn_started: currentTurn,
        hidden_title: null,
        hidden_description: null,
      })
      .eq('id', questId)
      .select()
      .single()

    if (updateError) {
      console.error('Quest reveal error:', updateError)
      return NextResponse.json(
        { error: 'Failed to reveal quest' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      quest: {
        id: updatedQuest.id,
        title: updatedQuest.title,
        description: updatedQuest.description,
        turn_started: currentTurn,
        dramatic_moment: dramatic_moment,
      },
    })
  } catch (error) {
    console.error('Reveal quest error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
