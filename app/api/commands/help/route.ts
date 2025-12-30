/**
 * Rules AI Endpoint
 * Answers D&D 5e rules questions separate from narrative AI
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MODEL_NAME = 'gpt-4o-mini'
const TEMPERATURE = 0.3 // Lower temperature for factual accuracy
const MAX_TOKENS = 1024

const RULES_SYSTEM_PROMPT = `You are a D&D 5e Rules Reference Assistant. Your role is to provide accurate, concise answers to rules questions based on the official SRD and Player's Handbook.

Guidelines:
- Be factual and precise
- Keep answers focused and practical (2-4 paragraphs max)
- Use examples to clarify complex mechanics
- If a rule is ambiguous, explain both common interpretations
- If you're unsure about something, say so
- Don't make up rules - stick to official 5e sources

Format:
- Use markdown for structure
- Bold important terms and numbers
- Use bullet points for lists
- Be concise - players are in the middle of a game

You are NOT the Dungeon Master. You don't narrate or roleplay.
You simply provide rules clarifications and mechanical explanations.

Common topics:
- Combat mechanics (attacks, advantage/disadvantage, cover, conditions)
- Spellcasting (components, concentration, slots, DCs)
- Ability checks and saving throws
- Movement and positioning
- Actions, bonus actions, reactions
- Resting and recovery`

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { question } = body

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    if (question.length > 500) {
      return NextResponse.json({ error: 'Question too long (max 500 characters)' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: RULES_SYSTEM_PROMPT },
          { role: 'user', content: question },
        ],
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
      }),
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, await response.text())
      return NextResponse.json({ error: 'Failed to get rules answer' }, { status: 500 })
    }

    const data = await response.json()
    const answer = data.choices?.[0]?.message?.content

    if (!answer) {
      return NextResponse.json({ error: 'No answer generated' }, { status: 500 })
    }

    return NextResponse.json({ answer })

  } catch (error) {
    console.error('Rules AI error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
