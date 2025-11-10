import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/database/db'
import { eq } from 'drizzle-orm'
import { resumes, users, creditTransactions, profiles } from '@/database/schema'
import OpenAI from 'openai'

export const runtime = 'nodejs'

const openai = new OpenAI({
  apiKey: process.env['OPENROUTER_API_KEY'],
  baseURL: 'https://openrouter.ai/api/v1',
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

    // Call OpenRouter (using Claude for resume generation)
    const completion = await openai.chat.completions.create({
      model: 'anthropic/claude-3-haiku',
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

    // Perform atomic transaction for debugging
    try {
      console.log('Starting database transaction...');
      await db.transaction(async (tx) => {
        try {
          // 1. Prepare and log data for resume insert
          const resumeInsertData = {
            userId: session.user.id,
            profileId: profile.length > 0 ? profile[0]!.id : null,
            title: `Resume for ${jobDescription.slice(0, 50)}...`,
            jobDescription,
            resumeData,
          };
          console.log('DEBUG: Inserting into resumes:', JSON.stringify(resumeInsertData, null, 2));
          await tx.insert(resumes).values(resumeInsertData);

          // 2. Prepare and log data for user credit update
          const newCredits = (user[0]?.credits ?? 0) - 1;
          console.log(`DEBUG: Updating user ${session.user.id} credits to:`, newCredits);
          await tx
            .update(users)
            .set({ credits: newCredits })
            .where(eq(users.id, session.user.id));

          // 3. Prepare and log data for credit transaction
          const creditLogData = {
            userId: session.user.id,
            type: 'generation' as const,
            amount: 1,
            description: 'AI Resume Generation',
            resumeId: null, // Set to null as we can't get the ID from the insert on SQLite
          };
          console.log('DEBUG: Inserting into creditTransactions:', JSON.stringify(creditLogData, null, 2));
          await tx.insert(creditTransactions).values(creditLogData);

          console.log('Transaction completed successfully.');

        } catch (txError) {
          console.error('ERROR INSIDE TRANSACTION:', txError);
          throw txError; // Ensure the transaction rolls back
        }
      });
    } catch (dbError) {
      // This will catch the error thrown from the transaction block
      console.error('ERROR DURING DB TRANSACTION:', dbError);
      // Re-throw or handle as needed, for now just let the outer catch handle it
      throw dbError;
    }


    return NextResponse.json({ success: true, message: 'Resume generated successfully.' })
  } catch (error) {
    console.error('Error in resume generation:', error)
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    )
  }
}
