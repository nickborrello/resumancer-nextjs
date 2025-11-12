import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/database/db'
import { eq, and } from 'drizzle-orm'
import { resumes } from '@/database/schema'

export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  const { resumeId } = await params
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if this is a test resume request
  if (resumeId === 'test-resume-demo') {
    const demoResume = {
      id: "test-resume-demo",
      userId: session.user.id,
      title: "Demo Resume - Alex Johnson",
      resumeData: {
        personalInfo: {
          fullName: "Alex Johnson",
          email: "alex.johnson@email.com",
          phone: "+1 (555) 123-4567",
          location: "San Francisco, CA",
          linkedin: "linkedin.com/in/alexjohnsondev",
          github: "github.com/alexjohnson",
          portfolio: "alexjohnson.dev"
        },
        professionalSummary: "Results-driven Full-Stack Developer with 5+ years of experience in building and maintaining scalable web applications using React, Node.js, and PostgreSQL. Proven ability to lead projects from concept to deployment. Seeking to leverage my skills in a challenging role at a growth-oriented company.",
        experiences: [
          {
            id: "exp-1",
            company: "TechSolutions Inc.",
            jobTitle: "Senior Software Engineer",
            location: "Remote",
            startDate: "2021-01-01",
            endDate: null,
            isCurrent: true,
            bulletPoints: [
              {
                id: "bullet-exp-1-1",
                content: "Led the development of a new microservices-based architecture, improving system scalability by 40%."
              },
              {
                id: "bullet-exp-1-2",
                content: "Mentored 3 junior developers, conducting code reviews and fostering best practices in TypeScript and React."
              },
              {
                id: "bullet-exp-1-3",
                content: "Integrated Stripe for payment processing and Sentry for real-time error monitoring."
              }
            ]
          },
          {
            id: "exp-2",
            company: "WebInnovate",
            jobTitle: "Software Developer",
            location: "Boston, MA",
            startDate: "2019-06-01",
            endDate: "2020-12-31",
            isCurrent: false,
            bulletPoints: [
              {
                id: "bullet-exp-2-1",
                content: "Developed and maintained full-stack features for a client-facing SaaS platform using React and Express."
              },
              {
                id: "bullet-exp-2-2",
                content: "Wrote Playwright end-to-end tests, increasing test coverage from 60% to 95%."
              }
            ]
          }
        ],
        education: [
          {
            id: "edu-1",
            school: "Northeastern University",
            degree: "Master of Science",
            fieldOfStudy: "Computer Science",
            location: "Boston, MA",
            startDate: "2017-09-01",
            endDate: "2019-05-01",
            gpa: "3.9/4.0"
          }
        ],
        projects: [
          {
            id: "proj-1",
            name: "Resumancer - AI Resume Builder",
            link: "github.com/alexjohnson/resumancer",
            technologies: ["Next.js", "TypeScript", "Drizzle ORM", "OpenRouter", "Stripe"],
            bulletPoints: [
              {
                id: "bullet-proj-1-1",
                content: "Built a full-stack resume application featuring an agentic AI co-pilot using the Vercel AI SDK."
              },
              {
                id: "bullet-proj-1-2",
                content: "Implemented a credit system and payment processing using Stripe webhooks."
              }
            ]
          }
        ],
        skills: [
          {
            id: "skill-cat-1",
            category: "Programming Languages",
            list: ["JavaScript", "TypeScript", "Python", "SQL"]
          },
          {
            id: "skill-cat-2",
            category: "Frameworks & Libraries",
            list: ["React", "Next.js", "Node.js", "Express.js", "Drizzle ORM", "Tailwind CSS"]
          },
          {
            id: "skill-cat-3",
            category: "Databases",
            list: ["PostgreSQL", "SQLite", "Redis"]
          },
          {
            id: "skill-cat-4",
            category: "Tools & Platforms",
            list: ["Git", "Docker", "Sentry", "Playwright", "Vercel", "Railway"]
          }
        ],
        certifications: [
          {
            id: "cert-1",
            name: "AWS Certified Cloud Practitioner",
            issuingOrganization: "Amazon Web Services",
            dateObtained: "2023-03-01",
            credentialId: "AWS-123456"
          }
        ],
        awards: [
          {
            id: "award-1",
            name: "TechSolutions Q4 Hackathon Winner",
            organization: "TechSolutions Inc.",
            dateReceived: "2023-12-15"
          }
        ],
        volunteerExperience: [
          {
            id: "vol-1",
            organization: "Code for America",
            role: "Volunteer Developer",
            location: "Remote",
            startDate: "2022-01-01",
            endDate: null,
            isCurrent: true,
            bulletPoints: [
              {
                id: "bullet-vol-1-1",
                content: "Contribute to open-source civic tech projects to improve government services."
              }
            ]
          }
        ],
        languages: [
          {
            id: "lang-1",
            language: "English",
            proficiency: "Native"
          },
          {
            id: "lang-2",
            language: "Spanish",
            proficiency: "Conversational"
          }
        ]
      },
      mode: 'demo' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(demoResume)
  }

  try {
    const resume = await db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, session.user.id)))
      .limit(1)

    if (resume.length === 0) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    return NextResponse.json(resume[0])
  } catch (error) {
    console.error('Error fetching resume:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  const { resumeId } = await params
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Prevent updating the demo resume - it's read-only
  if (resumeId === 'test-resume-demo') {
    return NextResponse.json({
      error: 'Demo resume is read-only. Create a new resume to save changes.'
    }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { title, jobDescription, resumeData, profileId } = body

    if (!title || !resumeData) {
      return NextResponse.json({ error: 'Title and resumeData are required' }, { status: 400 })
    }

    const updatedResume = await db
      .update(resumes)
      .set({
        title,
        jobDescription,
        resumeData,
        profileId,
        updatedAt: new Date(),
      })
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, session.user.id)))
      .returning()

    if (updatedResume.length === 0) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    return NextResponse.json(updatedResume[0])
  } catch (error) {
    console.error('Error updating resume:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  const { resumeId } = await params
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Prevent deleting the demo resume
  if (resumeId === 'test-resume-demo') {
    return NextResponse.json({
      error: 'Demo resume cannot be deleted.'
    }, { status: 403 })
  }

  try {
    const deletedResume = await db
      .delete(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, session.user.id)))
      .returning()

    if (deletedResume.length === 0) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Resume deleted successfully' })
  } catch (error) {
    console.error('Error deleting resume:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}