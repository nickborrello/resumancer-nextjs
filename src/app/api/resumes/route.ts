import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/database/db'
import { eq } from 'drizzle-orm'
import { resumes } from '@/database/schema'

export const runtime = 'nodejs'

export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userResumes = await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, session.user.id))

    return NextResponse.json(userResumes)
  } catch (error) {
    console.error('Error fetching resumes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, jobDescription, resumeData, profileId } = body

    if (!title || !resumeData) {
      return NextResponse.json({ error: 'Title and resumeData are required' }, { status: 400 })
    }

    const newResume = await db
      .insert(resumes)
      .values({
        userId: session.user.id,
        title,
        jobDescription,
        resumeData,
        profileId,
      })
      .returning()

    return NextResponse.json(newResume[0], { status: 201 })
  } catch (error) {
    console.error('Error creating resume:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
