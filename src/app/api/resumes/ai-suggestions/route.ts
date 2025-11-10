import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import OpenAI from 'openai'

export const runtime = 'nodejs'

interface AISuggestion {
  id: string
  type: 'improvement' | 'addition' | 'removal'
  section: string
  original?: string
  suggested: string
  reason: string
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const { resumeData } = await request.json()

    if (!resumeData) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      )
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env['OPENROUTER_API_KEY'],
      baseURL: 'https://openrouter.ai/api/v1',
    })

    // Construct AI prompt
    const prompt = `You are an expert career coach and resume writer. Analyze the following resume data and provide specific, actionable suggestions for improvement.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Please provide suggestions in the following JSON format:
{
  "suggestions": [
    {
      "id": "unique_id",
      "type": "improvement|addition|removal",
      "section": "Professional Summary|Experience|Education|Projects|Skills",
      "original": "original text (if applicable)",
      "suggested": "suggested improvement or addition",
      "reason": "brief explanation of why this suggestion improves the resume"
    }
  ]
}

Focus on:
1. Professional Summary: Make it compelling and specific
2. Experience: Use action verbs, quantify achievements, ensure 3-5 bullets per role
3. Skills: Organize by categories, include relevant technologies
4. Projects: Add technologies, detailed descriptions, impact metrics
5. Education: Include relevant coursework or achievements
6. Overall: ATS optimization, keyword integration, length and formatting

Provide 5-8 high-impact suggestions. Be specific and actionable.`

    // Call AI model
    const completion = await openai.chat.completions.create({
      model: 'anthropic/claude-3-haiku',
      messages: [
        {
          role: 'system',
          content: 'You are an expert career coach providing resume improvement suggestions. Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    })

    const generatedContent = completion.choices[0]?.message?.content
    if (!generatedContent) {
      throw new Error('Failed to generate suggestions')
    }

    let aiResponse
    try {
      // Try to parse the response as JSON
      aiResponse = JSON.parse(generatedContent)
    } catch (parseError) {
      // If direct parse fails, try to extract JSON from markdown
      const jsonMatch = generatedContent.match(/```json\n([\s\S]*?)\n```/)
      if (jsonMatch && jsonMatch[1]) {
        aiResponse = JSON.parse(jsonMatch[1])
      } else {
        throw new Error('Invalid AI response format')
      }
    }

    const suggestions: AISuggestion[] = aiResponse.suggestions || []

    // Validate and clean suggestions
    const validSuggestions = suggestions
      .filter(s => s.id && s.type && s.section && s.suggested && s.reason)
      .slice(0, 10) // Limit to 10 suggestions

    return NextResponse.json(
      {
        suggestions: validSuggestions,
        message: `Generated ${validSuggestions.length} AI-powered suggestions`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error generating AI suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}
