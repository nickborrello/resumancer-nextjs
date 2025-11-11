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
        firstName: profile.firstName || profile.first_name || "",
        lastName: profile.lastName || profile.last_name || "",
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || profile.phone_number || "",
        location: profile.location || "",
        linkedin: profile.linkedin || "",
        github: profile.github || "",
        portfolio: profile.portfolio || "",
        otherUrl: profile.otherUrl || profile.other_url || "",
      },
      experiences: (profile.experiences || []).map((exp: any) => ({
        id: exp.id,
        positionTitle: exp.positionTitle || exp.position_title || "",
        company: exp.company || "",
        location: exp.location || "",
        experienceType: exp.experienceType || exp.experience_type || "",
        startDate: exp.startDate || exp.start_date || "",
        endDate: exp.endDate || exp.end_date || "",
        currentlyWorkHere:
          exp.currentlyWorkHere || exp.currently_work_here || false,
        description: exp.description || "",
      })),
      projects: (aiOptimization.selectedProjectIndexes || [])
        .filter((index: number) => index >= 0 && index < (profile.projects || []).length)
        .map((index: number) => {
          const proj = profile.projects[index];
          return {
            id: proj.id,
            projectName: proj.projectName || proj.project_name || "",
            positionTitle: proj.positionTitle || proj.position_title || "",
            location: proj.location || "",
            startDate: proj.startDate || proj.start_date || "",
            endDate: proj.endDate || proj.end_date || "",
            currentlyWorkingOn:
              proj.currentlyWorkingOn || proj.currently_working_on || false,
            description: proj.description || "",
            link: proj.link || "",
            technologies: proj.technologies || [],
          };
        }),
      skills: this.categorizeSkillsForResume(profile.skills || []),
      technicalSkills: this.categorizeSkillsForResume(profile.skills || []),
      education: (profile.education || []).map((edu: any) => ({
        id: edu.id,
        schoolName: edu.schoolName || edu.school_name || "",
        major: edu.major || "",
        degreeType: edu.degreeType || edu.degree_type || "",
        gpa: edu.gpa || "",
        startDate: edu.startDate || edu.start_date || "",
        endDate: edu.endDate || edu.end_date || "",
        currentlyAttending:
          edu.currentlyAttending || edu.currently_attending || false,
        coursework: edu.coursework || [],
      })),
      certifications: (profile.certifications || []).map((cert: any) => ({
        id: cert.id,
        certificationName:
          cert.certificationName || cert.certification_name || "",
        issuingOrganization:
          cert.issuingOrganization || cert.issuing_organization || "",
        issueDate: cert.issueDate || cert.issue_date || "",
        expirationDate: cert.expirationDate || cert.expiration_date || "",
        credentialId: cert.credentialId || cert.credential_id || "",
        credentialUrl: cert.credentialUrl || cert.credential_url || "",
      })),
      professionalSummary:
        profile.professionalSummary || profile.professional_summary || "",
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
        firstName: "Alex",
        lastName: "Thompson",
        email: "alex.thompson@email.com",
        phoneNumber: "+1 (555) 123-4567",
        location: "San Francisco, CA, USA",
        linkedin: "linkedin.com/in/alexthompson",
        github: "github.com/alexthompson",
        portfolio: "alexthompson.dev",
        otherUrl: "",
      },
      experiences: [
        {
          id: "exp-1",
          positionTitle: "Senior Software Engineer",
          company: "TechCorp Solutions",
          location: "San Francisco, CA, USA",
          experienceType: "Full-time",
          startDate: "2022-03-01",
          endDate: "",
          currentlyWorkHere: true,
          description: [
            "Led development of microservices architecture serving 500K+ users, improving system reliability by 40%",
            "Implemented CI/CD pipelines using Jenkins and Docker, reducing deployment time from 2 hours to 15 minutes",
            "Mentored junior developers and conducted code reviews, improving team code quality metrics by 25%"
          ],
        },
        {
          id: "exp-2",
          positionTitle: "Software Engineer",
          company: "StartupXYZ",
          location: "Austin, TX, USA",
          experienceType: "Full-time",
          startDate: "2020-06-01",
          endDate: "2022-02-28",
          currentlyWorkHere: false,
          description: [
            "Built responsive React applications with TypeScript, increasing user engagement by 35%",
            "Designed and implemented RESTful APIs using Node.js and Express, handling 10K+ requests per minute",
            "Collaborated with cross-functional teams using Agile methodologies to deliver features ahead of schedule"
          ],
        },
        {
          id: "exp-3",
          positionTitle: "Junior Developer",
          company: "WebDev Agency",
          location: "Remote",
          experienceType: "Full-time",
          startDate: "2019-01-01",
          endDate: "2020-05-31",
          currentlyWorkHere: false,
          description: [
            "Developed custom WordPress themes and plugins for client websites, improving load times by 50%",
            "Maintained and optimized MySQL databases, ensuring 99.9% uptime for client applications",
            "Implemented SEO best practices, increasing organic traffic by 60% for key clients"
          ],
        },
      ],
      projects: [
        {
          id: "proj-1",
          projectName: "E-Commerce Platform",
          positionTitle: "",
          location: "",
          startDate: "",
          endDate: "",
          currentlyWorkingOn: false,
          description: [
            "Developed a full-stack e-commerce platform using React, Node.js, and PostgreSQL",
            "Implemented secure payment processing with Stripe API, real-time inventory management, and responsive design",
            "Features include user authentication, shopping cart, order tracking, and admin dashboard",
            "Deployed on AWS with 99.9% uptime and handling 50K+ monthly transactions"
          ],
          link: "github.com/alexthompson/ecommerce-platform",
          technologies: ["React", "Node.js", "PostgreSQL", "Stripe API", "AWS", "Docker"],
        },
        {
          id: "proj-2",
          projectName: "Task Management App",
          positionTitle: "",
          location: "",
          startDate: "",
          endDate: "",
          currentlyWorkingOn: false,
          description: [
            "Built a collaborative task management application with real-time updates using Socket.io",
            "Implemented drag-and-drop functionality, team collaboration features, and progress tracking",
            "Created RESTful API with JWT authentication and role-based access control",
            "Features include project boards, time tracking, file attachments, and email notifications"
          ],
          link: "github.com/alexthompson/taskmanager",
          technologies: ["React", "Express.js", "MongoDB", "Socket.io", "JWT", "Material-UI"],
        },
        {
          id: "proj-3",
          projectName: "Data Visualization Dashboard",
          positionTitle: "",
          location: "",
          startDate: "",
          endDate: "",
          currentlyWorkingOn: false,
          description: [
            "Created an interactive data visualization dashboard using D3.js and React",
            "Integrated with multiple APIs to aggregate and display real-time data from various sources",
            "Implemented advanced charting capabilities, filtering options, and export functionality",
            "Dashboard processes 1M+ data points daily and provides insights for business decision-making"
          ],
          link: "github.com/alexthompson/data-dashboard",
          technologies: ["React", "D3.js", "Python", "Flask", "PostgreSQL", "Chart.js"],
        },
        {
          id: "proj-4",
          projectName: "Mobile Fitness App",
          positionTitle: "",
          location: "",
          startDate: "",
          endDate: "",
          currentlyWorkingOn: false,
          description: [
            "Developed a cross-platform mobile fitness application using React Native",
            "Features include workout tracking, progress monitoring, social sharing, and personalized workout recommendations",
            "Integrated with health APIs for accurate data tracking and implemented offline functionality",
            "App has 10K+ downloads with 4.8-star rating"
          ],
          link: "github.com/alexthompson/fitness-app",
          technologies: ["React Native", "Firebase", "HealthKit", "Google Fit API", "Redux"],
        },
      ],
      skills: [
        {
          category: "Programming Languages",
          skills: ["JavaScript", "TypeScript", "Python"]
        },
        {
          category: "Frameworks & Libraries",
          skills: ["React", "Node.js", "Express.js"]
        },
        {
          category: "Databases",
          skills: ["PostgreSQL", "MongoDB", "Redis"]
        },
        {
          category: "Cloud & DevOps",
          skills: ["AWS", "Docker", "Kubernetes"]
        },
        {
          category: "Tools & Testing",
          skills: ["Git", "Jest", "Jenkins"]
        }
      ],
      education: [
        {
          id: "edu-1",
          schoolName: "University of California, Berkeley",
          major: "Computer Science",
          degreeType: "Bachelor of Science",
          gpa: "3.7",
          startDate: "2015-08-01",
          endDate: "2019-05-31",
          currentlyAttending: false,
          coursework: ["Data Structures", "Algorithms", "Software Engineering", "Database Systems", "Web Development", "Machine Learning"],
        },
      ],
      certifications: [
        {
          id: "cert-1",
          certificationName: "AWS Certified Solutions Architect",
          issuingOrganization: "Amazon Web Services",
          issueDate: "2023-06-15",
          expirationDate: "2026-06-15",
          credentialId: "AWS-SAA-123456",
          credentialUrl: "aws.amazon.com/verification",
        },
        {
          id: "cert-2",
          certificationName: "Certified Scrum Master",
          issuingOrganization: "Scrum Alliance",
          issueDate: "2022-11-20",
          expirationDate: "2025-11-20",
          credentialId: "CSM-789012",
          credentialUrl: "scrumalliance.org/verification",
        },
      ],
      professionalSummary: "Experienced full-stack software engineer with 5+ years of expertise in building scalable web applications and leading development teams. Proficient in modern JavaScript frameworks, cloud platforms, and DevOps practices. Passionate about creating user-centric solutions that drive business value and improve developer experience.",
      optimizationNotes: {
        mode: "demo",
        provider: "demo",
        aiSuggestions: {
          skillsAnalysis: {
            missingSkills: [],
            emphasizeSkills: [],
            removeSkills: [],
            suggestedSkills: {
              "Programming Languages": ["Go", "Rust"],
              "Frameworks & Libraries": ["Next.js", "GraphQL"],
              "Databases": ["Elasticsearch"],
              "Cloud & DevOps": ["Terraform", "DataDog"],
              "Tools & Testing": ["Cypress", "Playwright"]
            },
            currentSkills: ["JavaScript", "TypeScript", "Python", "React", "Node.js", "Express.js", "PostgreSQL", "MongoDB", "Redis", "AWS", "Docker", "Kubernetes", "Git", "Jest", "Jenkins"],
          },
          projectOptimizations: [
            {
              projectId: 0,
              bulletPointSuggestions: [
                {
                  bulletIndex: 0,
                  originalBullet: "Developed a full-stack e-commerce platform using React, Node.js, and PostgreSQL",
                  suggestedBullet: "Architected and developed a scalable e-commerce platform using React, Node.js, and PostgreSQL, handling 10K+ daily transactions with 99.9% uptime",
                  keyImprovements: ["Added quantification (10K+ transactions, 99.9% uptime)", "Used stronger action verb (Architected vs. Developed)"]
                },
                {
                  bulletIndex: 1,
                  originalBullet: "Implemented secure payment processing with Stripe API, real-time inventory management, and responsive design",
                  suggestedBullet: "Integrated Stripe API for secure payment processing, implemented real-time inventory management system, and created fully responsive design optimized for mobile and desktop",
                  keyImprovements: ["Added specific technologies (Stripe API)", "Clarified scope (mobile and desktop)", "Used more precise language"]
                }
              ]
            }
          ],
          projectSuggestions: [],
          experienceOptimizations: [
            {
              experienceId: 0,
              bulletPointSuggestions: [
                {
                  bulletIndex: 0,
                  originalBullet: "Led development of microservices architecture serving 500K+ users, improving system reliability by 40%",
                  suggestedBullet: "Led cross-functional team of 8 engineers in developing microservices architecture serving 500K+ users, improving system reliability by 40% and reducing deployment time by 60%",
                  keyImprovements: ["Added team size quantification (8 engineers)", "Added additional metric (60% deployment time reduction)", "Specified cross-functional aspect"]
                },
                {
                  bulletIndex: 1,
                  originalBullet: "Implemented CI/CD pipelines using Jenkins and Docker, reducing deployment time from 2 hours to 15 minutes",
                  suggestedBullet: "Designed and implemented comprehensive CI/CD pipelines using Jenkins and Docker, reducing deployment time from 2 hours to 15 minutes and eliminating manual deployment errors",
                  keyImprovements: ["Used stronger action verb (Designed vs. Implemented)", "Added outcome (eliminating manual errors)", "Emphasized comprehensiveness"]
                }
              ]
            },
            {
              experienceId: 1,
              bulletPointSuggestions: [
                {
                  bulletIndex: 0,
                  originalBullet: "Built responsive React applications with TypeScript, increasing user engagement by 35%",
                  suggestedBullet: "Developed responsive React applications with TypeScript and Redux, increasing user engagement by 35% and improving mobile performance scores by 25 points",
                  keyImprovements: ["Added specific technologies (Redux)", "Added additional metric (25 point performance improvement)", "Quantified performance impact"]
                }
              ]
            }
          ],
          experienceSuggestions: [],
          professionalSummarySuggestion: "Experienced full-stack software engineer with 5+ years of expertise in building scalable web applications and leading development teams. Proficient in modern JavaScript frameworks, cloud platforms, and DevOps practices. Passionate about creating user-centric solutions that drive business value and improve developer experience.",
          professionalSummaryImprovements: [
            "More directly addresses the '5+ years of experience' from the job description.",
            "Uses stronger, more confident language."
          ],
          educationSuggestions: [
            {
              educationIndex: 0,
              suggestions: [
                "Consider adding relevant coursework if it aligns with keywords from the job description (e.g., 'Machine Learning', 'Database Systems')."
              ]
            }
          ],
          overallSuggestions: ["Consider highlighting leadership experience and quantifiable achievements"],
          keywordSuggestions: ["full-stack developer", "React", "Node.js", "AWS", "microservices"],
          atsOptimization: {
            recommendedKeywords: ["software engineer", "full-stack", "JavaScript", "React", "AWS"],
            formattingTips: ["Use action verbs at the beginning of bullet points", "Include specific metrics and outcomes"],
          },
        },
        projectsSelected: 4,
      },
    };
  }

  static categorizeSkillsForResume(skills: any[]) {
    console.log('categorizeSkillsForResume input:', JSON.stringify(skills, null, 2));

    // If skills are already in the correct categorized format, return as is
    if (Array.isArray(skills) && skills.length > 0 && skills[0] && typeof skills[0] === 'object' && 'category' in skills[0] && 'skills' in skills[0]) {
      console.log('Already in correct format');
      return skills;
    }

    // Handle double-nested structure: skills: [{ skills: [{ category: "...", skills: [...] }] }]
    if (Array.isArray(skills) && skills.length > 0 && skills[0] && typeof skills[0] === 'object' && 'skills' in skills[0] && Array.isArray(skills[0].skills)) {
      console.log('Double-nested structure detected, returning skills[0].skills');
      return skills[0].skills;
    }

    // If skills are a flat array, categorize them
    if (Array.isArray(skills)) {
      console.log('Categorizing flat array');
      const categories = this.categorizeSkills(skills);
      return [
        { category: "Programming Languages", skills: categories['programmingLanguages'] },
        { category: "Frameworks & Libraries", skills: categories['frameworks'] },
        { category: "Databases", skills: categories['databases'] },
        { category: "Cloud & DevOps", skills: categories['cloud'] },
        { category: "Tools & Testing", skills: categories['tools'] }
      ].filter(cat => cat.skills && cat.skills.length > 0);
    }

    console.log('Default empty categories');
    // Default empty categories if no skills
    return [
      { category: "Programming Languages", skills: [] },
      { category: "Frameworks & Libraries", skills: [] },
      { category: "Databases", skills: [] },
      { category: "Cloud & DevOps", skills: [] },
      { category: "Tools & Testing", skills: [] }
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