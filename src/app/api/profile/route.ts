import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/database/db'
import { eq } from 'drizzle-orm'
import { profiles, portfolioLinks, languages, certifications, awards, volunteer } from '@/database/schema'
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
      .select({
        id: profiles.id,
        userId: profiles.userId,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        email: profiles.email,
        phoneNumber: profiles.phoneNumber,
        location: profiles.location,
        address: profiles.address,
        address2: profiles.address2,
        postalCode: profiles.postalCode,
        // professionalSummary: profiles.professionalSummary, // Temporarily commented out until column is added
        isPrimary: profiles.isPrimary,
        education: profiles.education,
        experiences: profiles.experiences,
        projects: profiles.projects,
        skills: profiles.skills,
        createdAt: profiles.createdAt,
        updatedAt: profiles.updatedAt,
      })
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
        professionalSummary: '',
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

      // Fetch related data from separate tables
      const [portfolioLinksData, languagesData, certificationsData, awardsData, volunteerData] = await Promise.all([
        db.select().from(portfolioLinks).where(eq(portfolioLinks.profileId, profile.id)).limit(1),
        db.select().from(languages).where(eq(languages.profileId, profile.id)),
        db.select().from(certifications).where(eq(certifications.profileId, profile.id)),
        db.select().from(awards).where(eq(awards.profileId, profile.id)),
        db.select().from(volunteer).where(eq(volunteer.profileId, profile.id)),
      ])

      const portfolio = portfolioLinksData[0]

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
        professionalSummary: (profile as any).professionalSummary || '', // Handle missing column
        linkedin: portfolio?.linkedin || '',
        portfolio: portfolio?.portfolio || '',
        github: portfolio?.github || '',
        otherUrl: portfolio?.otherUrl || '',
        education: profile.education || [],
        experiences: profile.experiences || [],
        projects: profile.projects || [],
        skills: profile.skills || [],
        languages: languagesData.map(lang => ({
          id: lang.id,
          language: lang.language,
          proficiency: lang.proficiency as any, // Cast to match type
        })),
        certifications: certificationsData.map(cert => ({
          id: cert.id,
          name: cert.certificationName,
          issuingOrganization: cert.issuer || '',
          dateObtained: cert.dateReceived || '',
          credentialId: cert.credentialId || undefined,
        })),
        awards: awardsData.map(award => ({
          id: award.id,
          name: award.awardName,
          organization: award.issuer || '',
          dateReceived: award.dateReceived || '',
        })),
        volunteer: volunteerData.map(vol => ({
          id: vol.id,
          organization: vol.organization,
          role: vol.role,
          location: vol.location || undefined,
          startDate: vol.startDate || '',
          endDate: vol.endDate || undefined,
          isCurrent: vol.current === 1,
          bulletPoints: vol.description ? JSON.parse(vol.description) : [],
        })),
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

    // Get or create profile
    let profileResult = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1)

    let profileId: string

    if (profileResult.length === 0) {
      // Create new profile
      const newProfile = await db
        .insert(profiles)
        .values({
          userId: session.user.id,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          phoneNumber: validatedData.phoneNumber,
          location: validatedData.location,
          address: validatedData.address,
          address2: validatedData.address2,
          postalCode: validatedData.postalCode,
          // professionalSummary: validatedData.professionalSummary, // Temporarily commented out until column is added
          education: validatedData.education,
          experiences: validatedData.experiences,
          projects: validatedData.projects,
          skills: validatedData.skills,
        })
        .returning({ id: profiles.id })

      profileId = newProfile[0]!.id
    } else {
      // Update existing profile
      profileId = profileResult[0]!.id
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
          // professionalSummary: validatedData.professionalSummary, // Temporarily commented out until column is added
          education: validatedData.education,
          experiences: validatedData.experiences,
          projects: validatedData.projects,
          skills: validatedData.skills,
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, session.user.id))
    }

    // Handle portfolio links
    const existingPortfolio = await db
      .select()
      .from(portfolioLinks)
      .where(eq(portfolioLinks.profileId, profileId))
      .limit(1)

    const portfolioData = {
      linkedin: validatedData.linkedin || null,
      portfolio: validatedData.portfolio || null,
      github: validatedData.github || null,
      otherUrl: validatedData.otherUrl || null,
    }

    if (existingPortfolio.length === 0) {
      if (portfolioData.linkedin || portfolioData.portfolio || portfolioData.github || portfolioData.otherUrl) {
        await db
          .insert(portfolioLinks)
          .values({
            profileId,
            ...portfolioData,
          })
      }
    } else {
      await db
        .update(portfolioLinks)
        .set(portfolioData)
        .where(eq(portfolioLinks.profileId, profileId))
    }

    // Handle languages - delete all and re-insert
    await db.delete(languages).where(eq(languages.profileId, profileId))
    if (validatedData.languages.length > 0) {
      await db.insert(languages).values(
        validatedData.languages.map(lang => ({
          profileId,
          language: lang.language,
          proficiency: lang.proficiency,
        }))
      )
    }

    // Handle certifications - delete all and re-insert
    await db.delete(certifications).where(eq(certifications.profileId, profileId))
    if (validatedData.certifications.length > 0) {
      await db.insert(certifications).values(
        validatedData.certifications.map(cert => ({
          profileId,
          certificationName: cert.name,
          issuer: cert.issuingOrganization,
          dateReceived: cert.dateObtained,
          credentialId: cert.credentialId || null,
        }))
      )
    }

    // Handle awards - delete all and re-insert
    await db.delete(awards).where(eq(awards.profileId, profileId))
    if (validatedData.awards.length > 0) {
      await db.insert(awards).values(
        validatedData.awards.map(award => ({
          profileId,
          awardName: award.name,
          issuer: award.organization,
          dateReceived: award.dateReceived,
        }))
      )
    }

    // Handle volunteer - delete all and re-insert
    await db.delete(volunteer).where(eq(volunteer.profileId, profileId))
    if (validatedData.volunteer.length > 0) {
      await db.insert(volunteer).values(
        validatedData.volunteer.map(vol => ({
          profileId,
          organization: vol.organization,
          role: vol.role,
          location: vol.location || null,
          startDate: vol.startDate,
          endDate: vol.endDate || null,
          current: vol.isCurrent ? 1 : 0,
          description: JSON.stringify(vol.bulletPoints),
        }))
      )
    }

    // Return the updated profile
    const updatedProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1)

    if (updatedProfile.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Re-fetch all data to return complete profile
    const profile = updatedProfile[0]!
    const [portfolioLinksData, languagesData, certificationsData, awardsData, volunteerData] = await Promise.all([
      db.select().from(portfolioLinks).where(eq(portfolioLinks.profileId, profile.id)).limit(1),
      db.select().from(languages).where(eq(languages.profileId, profile.id)),
      db.select().from(certifications).where(eq(certifications.profileId, profile.id)),
      db.select().from(awards).where(eq(awards.profileId, profile.id)),
      db.select().from(volunteer).where(eq(volunteer.profileId, profile.id)),
    ])

    const portfolio = portfolioLinksData[0]

    const profileData: ProfileData = {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      phoneNumber: profile.phoneNumber || '',
      location: profile.location || '',
      address: profile.address || '',
      address2: profile.address2 || '',
      postalCode: profile.postalCode || '',
      professionalSummary: (profile as any).professionalSummary || '', // Handle missing column
      linkedin: portfolio?.linkedin || '',
      portfolio: portfolio?.portfolio || '',
      github: portfolio?.github || '',
      otherUrl: portfolio?.otherUrl || '',
      education: profile.education || [],
      experiences: profile.experiences || [],
      projects: profile.projects || [],
      skills: profile.skills || [],
      languages: languagesData.map(lang => ({
        id: lang.id,
        language: lang.language,
        proficiency: lang.proficiency as any,
      })),
      certifications: certificationsData.map(cert => ({
        id: cert.id,
        name: cert.certificationName,
        issuingOrganization: cert.issuer || '',
        dateObtained: cert.dateReceived || '',
        credentialId: cert.credentialId || undefined,
      })),
      awards: awardsData.map(award => ({
        id: award.id,
        name: award.awardName,
        organization: award.issuer || '',
        dateReceived: award.dateReceived || '',
      })),
      volunteer: volunteerData.map(vol => ({
        id: vol.id,
        organization: vol.organization,
        role: vol.role,
        location: vol.location || undefined,
        startDate: vol.startDate || '',
        endDate: vol.endDate || undefined,
        isCurrent: vol.current === 1,
        bulletPoints: vol.description ? JSON.parse(vol.description) : [],
      })),
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
