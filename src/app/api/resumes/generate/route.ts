import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import type { GenerateResumeRequest, GenerateResumeResponse, ResumeData } from '@/types/resume';

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

    // Check credits
    const credits = session.user.credits ?? 0;
    if (credits < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits', message: 'You need at least 1 credit to generate a resume.' },
        { status: 402 }
      );
    }

    // Parse request body
    const body: GenerateResumeRequest = await request.json();
    const { jobDescription } = body;

    if (!jobDescription?.trim()) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    // TODO: Call OpenAI API to generate resume based on job description
    // For now, return mock data
    const mockResumeData: ResumeData = {
      personalInfo: {
        fullName: session.user.name || 'John Doe',
        email: session.user.email || 'john@example.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/johndoe',
        github: 'github.com/johndoe',
        portfolio: 'johndoe.com',
      },
      professionalSummary: 'Experienced software engineer with 5+ years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies. Proven track record of building scalable applications and leading development teams.',
      experiences: [
        {
          id: '1',
          company: 'Tech Corp',
          position: 'Senior Software Engineer',
          startDate: '2021-01',
          endDate: '2024-12',
          current: true,
          location: 'San Francisco, CA',
          description: [
            'Led development of microservices architecture serving 1M+ users',
            'Improved application performance by 40% through optimization',
            'Mentored team of 5 junior developers',
          ],
        },
        {
          id: '2',
          company: 'StartupXYZ',
          position: 'Full Stack Developer',
          startDate: '2019-06',
          endDate: '2021-01',
          current: false,
          location: 'Remote',
          description: [
            'Built RESTful APIs using Node.js and Express',
            'Developed responsive UIs with React and TypeScript',
            'Implemented CI/CD pipelines using GitHub Actions',
          ],
        },
      ],
      education: [
        {
          id: '1',
          institution: 'University of California',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2015-09',
          endDate: '2019-05',
          gpa: '3.8',
          description: 'Focus on Software Engineering and Algorithms',
        },
      ],
      projects: [
        {
          id: '1',
          name: 'E-commerce Platform',
          description: 'Built a full-stack e-commerce platform with React, Node.js, and PostgreSQL',
          technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
          link: 'github.com/johndoe/ecommerce',
        },
        {
          id: '2',
          name: 'Task Management App',
          description: 'Developed a collaborative task management application with real-time updates',
          technologies: ['Next.js', 'Socket.io', 'MongoDB'],
          link: 'github.com/johndoe/taskapp',
        },
      ],
      skills: [
        {
          category: 'Languages',
          skills: ['JavaScript', 'TypeScript', 'Python', 'SQL'],
        },
        {
          category: 'Frontend',
          skills: ['React', 'Next.js', 'Vue.js', 'Tailwind CSS'],
        },
        {
          category: 'Backend',
          skills: ['Node.js', 'Express', 'PostgreSQL', 'MongoDB'],
        },
        {
          category: 'Tools',
          skills: ['Git', 'Docker', 'AWS', 'CI/CD'],
        },
      ],
    };

    // TODO: Save to database and deduct credit
    // For now, generate a mock resume ID
    const resumeId = `resume_${Date.now()}`;

    const response: GenerateResumeResponse = {
      resumeId,
      resume: mockResumeData,
      message: 'Resume generated successfully!',
      creditsRemaining: credits - 1,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error generating resume:', error);
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    );
  }
}
