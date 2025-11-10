import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/database/db'
import { eq } from 'drizzle-orm'
import { resumes, users, creditTransactions, profiles } from '@/database/schema'
import OpenAI from 'openai'

export const runtime = 'nodejs'

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
})

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
    const body = await request.json()
    const { jobDescription } = body

    if (!jobDescription?.trim()) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      )
    }

    // Check user credits
    const user = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    if (!user.length || (user[0]?.credits ?? 0) <= 0) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 402 }
      )
    }

    // Fetch user profile
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1)

    // Construct OpenAI prompt
    const profileData = profile.length > 0 ? profile[0] : {}
    const prompt = `
Generate a professional resume in JSON format based on the following:

Job Description:
${jobDescription}

User Profile:
${JSON.stringify(profileData, null, 2)}

Please create a comprehensive resume that matches the job description. Return only valid JSON with the following structure:
{
  "personalInfo": {...},
  "professionalSummary": "...",
  "education": [...],
  "experiences": [...],
  "projects": [...],
  "skills": [...]
}
`

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })

    const generatedContent = completion.choices[0]?.message?.content
    if (!generatedContent) {
      throw new Error('Failed to generate resume content')
    }

    let resumeData
    try {
      resumeData = JSON.parse(generatedContent)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError)
      throw new Error('Invalid response format from AI service')
    }

    // Perform atomic transaction
    const result = await db.transaction(async (tx) => {
      // Create the resume
      const newResume = await tx
        .insert(resumes)
        .values({
          userId: session.user.id,
          profileId: profile.length > 0 ? profile[0]!.id : null,
          title: `Resume for ${jobDescription.slice(0, 50)}...`,
          jobDescription,
          resumeData,
        })
        .returning()

      // Decrement user credits
      await tx
        .update(users)
        .set({ credits: (user[0]?.credits ?? 0) - 1 })
        .where(eq(users.id, session.user.id))

      // Log credit transaction
      await tx
        .insert(creditTransactions)
        .values({
          userId: session.user.id,
          type: 'generation',
          amount: 1,
          description: 'AI Resume Generation',
          resumeId: newResume[0]!.id,
        })

      return newResume[0]
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in resume generation:', error)
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    )
  }
}
