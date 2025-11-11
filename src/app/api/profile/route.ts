import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/database/db'
import { eq } from 'drizzle-orm'
import { profiles } from '@/database/schema'
import { ProfileDataSchema } from '@/types/profile'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'
import type { ProfileData } from '@/types/profile'

export const runtime = 'nodejs'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Please sign in to access profile' },
      { status: 401 }
    )
  }

  try {
    const profileResult = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1)

    let profileData: ProfileData

    if (profileResult.length === 0) {
      // Return default empty profile structure
      profileData = {
        firstName: '',
        lastName: '',
        email: session.user.email || '',
        phoneNumber: '',
        location: '',
        address: '',
        address2: '',
        postalCode: '',
        linkedin: '',
        portfolio: '',
        github: '',
        otherUrl: '',
        education: [],
        experiences: [],
        projects: [],
        skills: [],
        languages: [],
        certifications: [],
        awards: [],
        volunteer: [],
      }
    } else {
      const profile = profileResult[0]!
      // Construct ProfileData from database row
      profileData = {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        location: profile.location || '',
        address: profile.address || '',
        address2: profile.address2 || '',
        postalCode: profile.postalCode || '',
        linkedin: '',
        portfolio: '',
        github: '',
        otherUrl: '',
        education: profile.education || [],
        experiences: profile.experiences || [],
        projects: profile.projects || [],
        skills: profile.skills || [],
        languages: [],
        certifications: [],
        awards: [],
        volunteer: [],
      }
    }

    return NextResponse.json(profileData)
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        userId: session.user.id,
        endpoint: '/api/profile',
        method: 'GET',
      },
    })
    console.error('Database error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = ProfileDataSchema.parse(body)

    await db
      .update(profiles)
      .set({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber,
        location: validatedData.location,
        address: validatedData.address,
        address2: validatedData.address2,
        postalCode: validatedData.postalCode,
        education: validatedData.education,
        experiences: validatedData.experiences,
        projects: validatedData.projects,
        skills: validatedData.skills,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, session.user.id))

    // Return the updated profile
    const updatedProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1)

    if (updatedProfile.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const profile = updatedProfile[0]!
    // Construct ProfileData from database row
    const profileData: ProfileData = {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      phoneNumber: profile.phoneNumber || '',
      location: profile.location || '',
      address: profile.address || '',
      address2: profile.address2 || '',
      postalCode: profile.postalCode || '',
      linkedin: '',
      portfolio: '',
      github: '',
      otherUrl: '',
      education: profile.education || [],
      experiences: profile.experiences || [],
      projects: profile.projects || [],
      skills: profile.skills || [],
      languages: [],
      certifications: [],
      awards: [],
      volunteer: [],
    }

    return NextResponse.json(profileData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 })
    }
    Sentry.captureException(error, {
      tags: {
        userId: session.user.id,
        endpoint: '/api/profile',
        method: 'PUT',
      },
    })
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
