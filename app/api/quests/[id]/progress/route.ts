/**
 * Update Quest Progress API Route
 * Updates the progress percentage of a quest
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
    const { progress_percentage, reason } = body

    // Validate progress percentage
    if (typeof progress_percentage !== 'number' || progress_percentage < 0 || progress_percentage > 100) {
      return NextResponse.json(
        { error: 'Progress percentage must be a number between 0 and 100' },
        { status: 400 }
      )
    }

    const serviceSupabase = createServiceClient()

    // Get the quest
    const { data: quest, error: questError } = await serviceSupabase
      .from('quests')
      .select('id, quest_type, is_revealed, status, progress_percentage')
      .eq('id', questId)
      .single()

    if (questError || !quest) {
      return NextResponse.json(
        { error: 'Quest not found' },
        { status: 404 }
      )
    }

    // Check if quest is active
    if (quest.status !== 'active') {
      return NextResponse.json(
        { error: 'Can only update progress on active quests' },
        { status: 400 }
      )
    }

    // Update progress
    const { data: updatedQuest, error: updateError } = await serviceSupabase
      .from('quests')
      .update({
        progress_percentage: Math.round(progress_percentage),
      })
      .eq('id', questId)
      .select()
      .single()

    if (updateError) {
      console.error('Quest progress update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update quest progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      quest: {
        id: updatedQuest.id,
        progress_percentage: updatedQuest.progress_percentage,
        reason: reason,
      },
    })
  } catch (error) {
    console.error('Update quest progress error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
