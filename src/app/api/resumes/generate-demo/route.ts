import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import type { GenerateResumeResponse, ResumeData } from '@/types/resume';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Demo mode is free, no credit check needed
    // Job description is optional for demo mode
    await request.json(); // Parse body but don't use it

    // Generate demo resume with hardcoded data
    const demoResumeData: ResumeData = {
      personalInfo: {
        fullName: session.user.name || 'Demo User',
        email: session.user.email || 'demo@example.com',
        phone: '+1 (555) 000-0000',
        location: 'Demo City, State',
        linkedin: 'linkedin.com/in/demouser',
        github: 'github.com/demouser',
        portfolio: 'demouser.com',
      },
      professionalSummary: 'This is a demo resume generated to showcase the resume builder functionality. You can edit all sections and customize the content to match your profile.',
      experiences: [
        {
          id: '1',
          company: 'Demo Company Inc.',
          position: 'Software Engineer',
          startDate: '2020-01',
          endDate: '2024-12',
          current: true,
          location: 'Demo City, State',
          description: [
            'This is a demo experience entry',
            'You can edit this text and add your own achievements',
            'Click on any section to customize it',
          ],
        },
      ],
      education: [
        {
          id: '1',
          institution: 'Demo University',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2016-09',
          endDate: '2020-05',
          gpa: '3.5',
          description: 'Demo education entry - customize with your details',
        },
      ],
      projects: [
        {
          id: '1',
          name: 'Demo Project',
          description: 'This is a demo project entry. Replace with your own projects.',
          technologies: ['React', 'Node.js', 'TypeScript'],
          link: 'github.com/demo/project',
        },
      ],
      skills: [
        {
          category: 'Languages',
          skills: ['JavaScript', 'TypeScript', 'Python'],
        },
        {
          category: 'Frameworks',
          skills: ['React', 'Next.js', 'Express'],
        },
        {
          category: 'Tools',
          skills: ['Git', 'Docker', 'AWS'],
        },
      ],
    };

    // Generate demo resume ID
    const resumeId = `demo_${Date.now()}`;

    const response: GenerateResumeResponse = {
      resumeId,
      resume: demoResumeData,
      message: 'Demo resume generated successfully! This is a free preview.',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error generating demo resume:', error);
    return NextResponse.json(
      { error: 'Failed to generate demo resume' },
      { status: 500 }
    );
  }
}
