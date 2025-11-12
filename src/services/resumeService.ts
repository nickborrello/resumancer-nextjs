import OpenRouterService from './openRouterService';

export class ResumeService {
  static async generateResume({
    jobDescription,
    profile,
    options = {},
  }: {
    jobDescription: string;
    profile: any;
    options?: any;
  }) {
    let resumeData;
    let isDemoGeneration = options.demo === true;

    try {
      // Use OpenRouter for AI generation
      console.log("AI mode: Using OpenRouter to generate resume...");
      const openRouter = new OpenRouterService();
      resumeData = await this.generateOpenRouterResume(
        openRouter,
        profile,
        jobDescription
      );
      console.log("OpenRouter generation successful");
    } catch (error) {
      console.warn("OpenRouter failed, falling back to demo mode:", error);
      resumeData = this.generateEnhancedDemoResume(profile, jobDescription);
      isDemoGeneration = true;
    }

    return {
      success: true,
      resume: resumeData,
      isDemo: isDemoGeneration,
      message: isDemoGeneration
        ? "Resume generated using demo mode"
        : "Resume generated successfully",
    };
  }

  static async generateOpenRouterResume(
    openRouter: OpenRouterService,
    profile: any,
    jobDescription: string
  ) {
    console.log("Starting multi-step AI optimization workflow...");

    // STEP 1: Extract keywords and qualifications from job description
    console.log("Step 1: Extracting keywords from job description...");
    const { keywords, qualifications } = await openRouter.extractKeywordsFromJobDescription(jobDescription);
    console.log(`Extracted ${keywords.length} keywords and ${qualifications.length} qualifications`);

    // STEP 2: Score relevance of all experiences and projects in parallel
    console.log("Step 2: Scoring relevance of experiences and projects...");

    const experienceScores = await Promise.all(
      (profile.experiences || []).map(async (exp: any, index: number) => {
        const itemText = `${exp.positionTitle || exp.position_title || ''} at ${exp.company || ''}
${Array.isArray(exp.description) ? exp.description.join('\n') : exp.description || ''}`;

        const score = await openRouter.scoreRelevance(keywords, qualifications, itemText, "experience");
        return { index, score: score.relevance_score, reason: score.reason, item: exp };
      })
    );

    const projectScores = await Promise.all(
      (profile.projects || []).map(async (proj: any, index: number) => {
        const itemText = `${proj.projectName || proj.project_name || ''}
${Array.isArray(proj.description) ? proj.description.join('\n') : proj.description || ''}
Technologies: ${Array.isArray(proj.technologies) ? proj.technologies.join(', ') : ''}`;

        const score = await openRouter.scoreRelevance(keywords, qualifications, itemText, "project");
        return { index, score: score.relevance_score, reason: score.reason, item: proj };
      })
    );

    // Select top experiences (all of them, but sorted by relevance)
    const sortedExperiences = experienceScores.sort((a, b) => b.score - a.score);

    // Select top 3-4 projects based on relevance score (threshold: 6+)
    const topProjects = projectScores
      .filter(p => p.score >= 6)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    const selectedProjectIndexes = topProjects.map(p => p.index);
    console.log(`Selected ${sortedExperiences.length} experiences and ${selectedProjectIndexes.length} projects`);

    // STEP 3: Optimize bullet points for selected items in parallel
    console.log("Step 3: Optimizing bullet points for selected items...");

    const experienceOptimizations = await Promise.all(
      sortedExperiences.map(async (expData) => {
        const exp = expData.item;
        const bulletPoints = Array.isArray(exp.description) ? exp.description :
                           (exp.description ? [exp.description] : []);

        if (bulletPoints.length === 0) {
          return {
            experienceIndex: expData.index,
            bulletPointSuggestions: []
          };
        }

        const optimization = await openRouter.optimizeBulletPoints(keywords, bulletPoints, "experience");
        return {
          experienceIndex: expData.index,
          bulletPointSuggestions: optimization.bulletPointSuggestions || []
        };
      })
    );

    const projectOptimizations = await Promise.all(
      topProjects.map(async (projData) => {
        const proj = projData.item;
        const bulletPoints = Array.isArray(proj.description) ? proj.description :
                           (proj.description ? [proj.description] : []);

        if (bulletPoints.length === 0) {
          return {
            projectIndex: projData.index,
            bulletPointSuggestions: []
          };
        }

        const optimization = await openRouter.optimizeBulletPoints(keywords, bulletPoints, "project");
        return {
          projectIndex: projData.index,
          bulletPointSuggestions: optimization.bulletPointSuggestions || []
        };
      })
    );

    // STEP 4: Generate global suggestions and professional summary
    console.log("Step 4: Generating global suggestions and professional summary...");
    const currentSummary = profile.professionalSummary || profile.professional_summary || "";
    const currentSkills = profile.skills || [];

    const globalData = await openRouter.generateGlobalSuggestions(
      keywords,
      qualifications,
      currentSummary,
      currentSkills
    );

    // Generate a descriptive title based on the job
    const firstKeywords = keywords.slice(0, 3).join(", ");
    const title = `Resume - ${firstKeywords}`;

    console.log("Multi-step optimization complete!");

    // Apply optimizations to create enhanced resume
    const optimizedResume = this.applyAIOptimizations(profile, {
      title,
      selectedProjectIndexes,
      globalSuggestions: globalData.globalSuggestions,
      sectionSuggestions: {
        professionalSummary: globalData.professionalSummary,
        experience: experienceOptimizations,
        projects: projectOptimizations,
        skills: globalData.skills
      }
    });

    // Add the title from AI to the resume data
    optimizedResume.title = title;

    return optimizedResume;
  }

  // Apply AI optimization suggestions to resume data
  static applyAIOptimizations(profile: any, aiOptimization: any) {
    // Start with base profile data - DO NOT automatically apply AI suggestions
    const optimizedResume: any = {
      personalInfo: {
        fullName: profile.firstName && profile.lastName
          ? `${profile.firstName} ${profile.lastName}`
          : profile.firstName || profile.last_name || "",
        email: profile.email || "",
        phone: profile.phoneNumber || profile.phone_number || "",
        location: profile.location || "",
        linkedin: profile.linkedin || "",
        github: profile.github || "",
        portfolio: profile.portfolio || "",
      },
      experiences: (profile.experiences || []).map((exp: any) => ({
        id: exp.id || `exp-${Math.random().toString(36).substr(2, 9)}`,
        company: exp.company || "",
        jobTitle: exp.positionTitle || exp.position_title || "",
        location: exp.location || "",
        startDate: exp.startDate || exp.start_date || "",
        endDate: exp.endDate || exp.end_date || "",
        isCurrent: exp.currentlyWorkHere || exp.currently_work_here || false,
        bulletPoints: Array.isArray(exp.description)
          ? exp.description.map((desc: string, index: number) => ({
              id: `bullet-exp-${exp.id || 'temp'}-${index}`,
              content: desc
            }))
          : exp.description
            ? [{ id: `bullet-exp-${exp.id || 'temp'}-0`, content: exp.description }]
            : []
      })),
      projects: (aiOptimization.selectedProjectIndexes || [])
        .filter((index: number) => index >= 0 && index < (profile.projects || []).length)
        .map((index: number) => {
          const proj = profile.projects[index];
          return {
            id: proj.id || `proj-${Math.random().toString(36).substr(2, 9)}`,
            name: proj.projectName || proj.project_name || "",
            link: proj.link || "",
            technologies: proj.technologies || [],
            bulletPoints: Array.isArray(proj.description)
              ? proj.description.map((desc: string, bulletIndex: number) => ({
                  id: `bullet-proj-${proj.id || 'temp'}-${bulletIndex}`,
                  content: desc
                }))
              : proj.description
                ? [{ id: `bullet-proj-${proj.id || 'temp'}-0`, content: proj.description }]
                : []
          };
        }),
      skills: this.categorizeSkillsForResume(profile.skills || []),
      education: (profile.education || []).map((edu: any) => ({
        id: edu.id || `edu-${Math.random().toString(36).substr(2, 9)}`,
        school: edu.schoolName || edu.school_name || "",
        degree: edu.degreeType || edu.degree_type || "",
        fieldOfStudy: edu.major || "",
        location: edu.location || "",
        startDate: edu.startDate || edu.start_date || "",
        endDate: edu.endDate || edu.end_date || "",
        gpa: edu.gpa || "",
      })),
      certifications: (profile.certifications || []).map((cert: any) => ({
        id: cert.id || `cert-${Math.random().toString(36).substr(2, 9)}`,
        name: cert.certificationName || cert.certification_name || "",
        issuingOrganization: cert.issuingOrganization || cert.issuing_organization || "",
        dateObtained: cert.issueDate || cert.issue_date || "",
        credentialId: cert.credentialId || cert.credential_id || "",
      })),
      professionalSummary: profile.professionalSummary || profile.professional_summary || "",
      optimizationNotes: {
        mode: "openrouter",
        provider: "multiple",
        aiSuggestions: {
          title: aiOptimization.title || "Resume",
          selectedProjectIndexes: aiOptimization.selectedProjectIndexes || [],
          globalSuggestions: aiOptimization.globalSuggestions || {},
          sectionSuggestions: aiOptimization.sectionSuggestions || {},
        },
        projectsSelected: (aiOptimization.selectedProjectIndexes || []).length,
      },
    };

    return optimizedResume;
  }

  // Enhanced demo mode - transforms profile to resume format matching the profile endpoint
  static generateEnhancedDemoResume(_profile: any, _jobDescription: string) {
    // Return demo data that matches the AI API structure exactly
    console.log("Using demo resume data that matches AI API structure");

    return {
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
    };
  }

  static categorizeSkillsForResume(skills: any[]) {
    console.log('categorizeSkillsForResume input:', JSON.stringify(skills, null, 2));

    // If skills are already in the correct categorized format, return as is
    if (Array.isArray(skills) && skills.length > 0 && skills[0] && typeof skills[0] === 'object' && 'category' in skills[0] && 'skills' in skills[0]) {
      // Convert old format to new format
      return skills.map((skillCat, index) => ({
        id: skillCat.id || `skill-cat-${index + 1}`,
        category: skillCat.category,
        list: skillCat.skills || []
      }));
    }

    // Handle double-nested structure: skills: [{ skills: [{ category: "...", skills: [...] }] }]
    if (Array.isArray(skills) && skills.length > 0 && skills[0] && typeof skills[0] === 'object' && 'skills' in skills[0] && Array.isArray(skills[0].skills)) {
      console.log('Double-nested structure detected, returning skills[0].skills');
      return skills[0].skills.map((skillCat: any, index: number) => ({
        id: skillCat.id || `skill-cat-${index + 1}`,
        category: skillCat.category,
        list: skillCat.skills || []
      }));
    }

    // If skills are a flat array, categorize them
    if (Array.isArray(skills)) {
      console.log('Categorizing flat array');
      const categories = this.categorizeSkills(skills);
      return [
        { id: "skill-cat-1", category: "Programming Languages", list: categories['programmingLanguages'] },
        { id: "skill-cat-2", category: "Frameworks & Libraries", list: categories['frameworks'] },
        { id: "skill-cat-3", category: "Databases", list: categories['databases'] },
        { id: "skill-cat-4", category: "Cloud & DevOps", list: categories['cloud'] },
        { id: "skill-cat-5", category: "Tools & Testing", list: categories['tools'] }
      ].filter(cat => cat.list && cat.list.length > 0);
    }

    console.log('Default empty categories');
    // Default empty categories if no skills
    return [
      { id: "skill-cat-1", category: "Programming Languages", list: [] },
      { id: "skill-cat-2", category: "Frameworks & Libraries", list: [] },
      { id: "skill-cat-3", category: "Databases", list: [] },
      { id: "skill-cat-4", category: "Cloud & DevOps", list: [] },
      { id: "skill-cat-5", category: "Tools & Testing", list: [] }
    ];
  }

  static categorizeSkills(skills: string[]): Record<string, string[]> {
    const categories: Record<string, string[]> = {
      programmingLanguages: [],
      frameworks: [],
      databases: [],
      tools: [],
      cloud: [],
    };

    const langPattern =
      /(javascript|typescript|python|java|c\+\+|c#|go|rust|php|ruby|swift|kotlin)/i;
    const frameworkPattern =
      /(react|vue|angular|express|django|flask|spring|laravel|rails)/i;
    const dbPattern =
      /(postgresql|mysql|mongodb|redis|elasticsearch|sqlite|dynamodb)/i;
    const cloudPattern = /(aws|azure|gcp|docker|kubernetes)/i;

    skills.forEach((skill) => {
      if (langPattern.test(skill)) categories['programmingLanguages']!.push(skill);
      else if (frameworkPattern.test(skill)) categories['frameworks']!.push(skill);
      else if (dbPattern.test(skill)) categories['databases']!.push(skill);
      else if (cloudPattern.test(skill)) categories['cloud']!.push(skill);
      else categories['tools']!.push(skill);
    });

    return categories;
  }
}