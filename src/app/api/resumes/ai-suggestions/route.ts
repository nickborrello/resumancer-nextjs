import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

interface AISuggestion {
  id: string;
  type: 'improvement' | 'addition' | 'removal';
  section: string;
  original?: string;
  suggested: string;
  reason: string;
}

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

    // Parse request body
    const { resumeData } = await request.json();

    if (!resumeData) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      );
    }

    // TODO: Call OpenAI API to generate intelligent suggestions
    // For now, return mock suggestions based on basic analysis
    const suggestions: AISuggestion[] = [];

    // Analyze professional summary
    if (!resumeData.professionalSummary || resumeData.professionalSummary.length < 50) {
      suggestions.push({
        id: `suggestion_${Date.now()}_1`,
        type: 'improvement',
        section: 'Professional Summary',
        original: resumeData.professionalSummary || '',
        suggested: 'Results-driven professional with extensive experience in [your field]. Proven track record of [key achievement]. Skilled in [key skills] with a passion for [industry/technology]. Seeking to leverage expertise to drive innovation and deliver exceptional results.',
        reason: 'A compelling professional summary should be 3-4 sentences and highlight your unique value proposition.',
      });
    }

    // Analyze experience descriptions
    if (resumeData.experiences && resumeData.experiences.length > 0) {
      resumeData.experiences.forEach((exp: any, index: number) => {
        if (!exp.description || exp.description.length === 0) {
          suggestions.push({
            id: `suggestion_${Date.now()}_exp_${index}`,
            type: 'addition',
            section: 'Experience',
            suggested: 'Add 3-5 bullet points highlighting your key responsibilities and quantifiable achievements. Use action verbs and include metrics where possible (e.g., "Increased efficiency by 30%").',
            reason: `Your ${exp.position} role at ${exp.company} needs achievement descriptions to demonstrate impact.`,
          });
        } else if (exp.description.length < 2) {
          suggestions.push({
            id: `suggestion_${Date.now()}_exp_${index}`,
            type: 'addition',
            section: 'Experience',
            suggested: 'Add more bullet points (aim for 3-5) to fully showcase your contributions and achievements in this role.',
            reason: `Your ${exp.position} role has only ${exp.description.length} bullet point(s). Add more to demonstrate comprehensive impact.`,
          });
        }

        // Check for weak bullet points
        exp.description?.forEach((bullet: string, bulletIndex: number) => {
          if (bullet.length < 20) {
            suggestions.push({
              id: `suggestion_${Date.now()}_exp_${index}_${bulletIndex}`,
              type: 'improvement',
              section: 'Experience',
              original: bullet,
              suggested: 'Expand this bullet point to include specific actions, technologies used, and quantifiable results. Example: "Led development of feature X using React and Node.js, resulting in 25% increase in user engagement"',
              reason: 'This bullet point is too brief. Add context, impact, and metrics to make it more compelling.',
            });
          }

          // Check for action verbs
          const startsWithActionVerb = /^(Led|Developed|Built|Implemented|Designed|Managed|Created|Improved|Optimized|Architected|Delivered|Launched|Collaborated|Coordinated|Established)/i.test(bullet);
          if (!startsWithActionVerb) {
            const actionVerbs = ['Led', 'Developed', 'Built', 'Implemented', 'Designed', 'Managed', 'Created', 'Improved', 'Optimized'];
            const randomVerb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
            suggestions.push({
              id: `suggestion_${Date.now()}_verb_${index}_${bulletIndex}`,
              type: 'improvement',
              section: 'Experience',
              original: bullet,
              suggested: `${randomVerb} ${bullet.charAt(0).toLowerCase()}${bullet.slice(1)}`,
              reason: 'Start with a strong action verb to make your accomplishments more impactful.',
            });
          }
        });
      });
    }

    // Analyze skills
    if (!resumeData.skills || resumeData.skills.length === 0) {
      suggestions.push({
        id: `suggestion_${Date.now()}_skills`,
        type: 'addition',
        section: 'Skills',
        suggested: 'Add relevant technical and soft skills organized by category (e.g., Programming Languages, Frameworks, Tools, Soft Skills).',
        reason: 'A skills section helps recruiters quickly identify your technical proficiencies and qualifications.',
      });
    } else if (resumeData.skills.length < 3) {
      suggestions.push({
        id: `suggestion_${Date.now()}_skills_expand`,
        type: 'addition',
        section: 'Skills',
        suggested: 'Expand your skills section to include more categories such as: Programming Languages, Frontend Technologies, Backend Technologies, Databases, Cloud & DevOps, and Soft Skills.',
        reason: 'Having 4-6 skill categories provides a comprehensive view of your technical expertise.',
      });
    }

    // Analyze projects
    if (!resumeData.projects || resumeData.projects.length === 0) {
      suggestions.push({
        id: `suggestion_${Date.now()}_projects`,
        type: 'addition',
        section: 'Projects',
        suggested: 'Add 2-3 significant projects that demonstrate your technical skills and problem-solving abilities. Include project name, description, technologies used, and links if available.',
        reason: 'Projects showcase practical application of your skills and initiative, especially valuable for career changers or recent graduates.',
      });
    } else {
      resumeData.projects.forEach((project: any, index: number) => {
        if (!project.technologies || project.technologies.length === 0) {
          suggestions.push({
            id: `suggestion_${Date.now()}_proj_tech_${index}`,
            type: 'addition',
            section: 'Projects',
            suggested: 'Add the technologies and tools you used for this project (e.g., React, Node.js, PostgreSQL, AWS).',
            reason: `The ${project.name} project is missing technology tags, which help recruiters understand your technical stack.`,
          });
        }

        if (!project.description || project.description.length < 30) {
          suggestions.push({
            id: `suggestion_${Date.now()}_proj_desc_${index}`,
            type: 'improvement',
            section: 'Projects',
            original: project.description || '',
            suggested: 'Provide a detailed description that includes: (1) What problem it solves, (2) Key features, (3) Your specific contributions, and (4) Any notable results or metrics.',
            reason: `The description for ${project.name} should be more detailed to showcase the project's value and your contributions.`,
          });
        }
      });
    }

    // Analyze education
    if (!resumeData.education || resumeData.education.length === 0) {
      suggestions.push({
        id: `suggestion_${Date.now()}_education`,
        type: 'addition',
        section: 'Education',
        suggested: 'Add your educational background including degree, institution, graduation date, and relevant coursework or achievements.',
        reason: 'Education credentials are essential for most positions and demonstrate your foundational knowledge.',
      });
    }

    // Limit suggestions to avoid overwhelming the user
    const limitedSuggestions = suggestions.slice(0, 8);

    return NextResponse.json(
      {
        suggestions: limitedSuggestions,
        message: `Generated ${limitedSuggestions.length} suggestions`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
