import { openrouter } from '@openrouter/ai-sdk-provider'
import { streamText, tool } from 'ai'
import { z } from 'zod'
import { NextRequest } from 'next/server'
import { auth } from '@/auth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Parse request body
    const body = await request.json()
    const { resumeData } = body

    if (!resumeData) {
      return new Response(JSON.stringify({ error: 'Resume data is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Define the applyResumeEdit tool
    const applyResumeEdit = tool({
      description: 'Apply an edit to a specific section of the resume.',
      parameters: z.object({
        section: z.enum(['summary', 'experience', 'education', 'skills', 'projects']),
        entityId: z.string().optional().describe('The database ID of the experience, education, or project item.'),
        originalText: z.string().describe('The original bullet point or text to be replaced.'),
        newText: z.string().describe('The new, improved text.'),
      }),
    })

    // Construct AI prompt
    const prompt = `You are an expert career coach and resume writer. Analyze the following resume data and provide specific, actionable suggestions for improvement by using the applyResumeEdit tool to propose changes.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Your task is to identify specific improvements and use the applyResumeEdit tool for each suggestion. Do not provide plain text suggestions; use the tool to propose edits directly.

Focus on:
1. Professional Summary: Make it compelling and specific
2. Experience: Use action verbs, quantify achievements, ensure 3-5 bullets per role
3. Skills: Organize by categories, include relevant technologies
4. Projects: Add technologies, detailed descriptions, impact metrics
5. Education: Include relevant coursework or achievements
6. Overall: ATS optimization, keyword integration, length and formatting

Use the tool multiple times if you have multiple suggestions. Each tool call represents one proposed edit that the user can choose to apply.`

    // Stream the text with tools
    const result = await streamText({
      model: openrouter('anthropic/claude-3-haiku'),
      prompt,
      tools: {
        applyResumeEdit,
      },
    })

    // Return the streaming response
    return result.toAIStreamResponse()
  } catch (error) {
    console.error('Error in AI suggestions:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate suggestions' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
