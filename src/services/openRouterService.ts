// OpenRouter AI Service - Unified API for multiple AI models
// Provides access to OpenAI, Anthropic, Google, and other models through single API

// A helper function to extract JSON safely
function extractJSON(text: string) {
  // First try to find JSON in code blocks
  const codeBlockMatch = text.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }

  // Try to find JSON object/array directly
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    return text.substring(jsonStart, jsonEnd + 1);
  }

  // Fallback to the entire text
  return text.trim();
}

class OpenRouterService {
  baseURL: string;
  apiKey: string;
  referer: string;
  title: string;

  constructor() {
    this.baseURL = "https://openrouter.ai/api/v1";
    this.apiKey = process.env['OPENROUTER_API_KEY'] || '';
    this.referer = process.env['FRONTEND_URL'] || "https://resumancer.com";
    this.title = "Resumancer AI Resume Builder";

    if (!this.apiKey) {
      console.warn(
        "OpenRouter API key not found. AI features will be limited."
      );
    }
  }

  // Available models ranked by capability (cheapest to most expensive)
  static get AVAILABLE_MODELS() {
    return {
      // Fast & Cheap (for simple tasks)
      "microsoft/wizardlm-2-8x22b": { cost: "low", speed: "fast", capability: "simple" },
      "meta-llama/llama-3.1-8b-instruct": { cost: "low", speed: "fast", capability: "simple" },

      // Balanced (good for resume optimization) - BEST VALUE ZONE
      "anthropic/claude-3-haiku": { cost: "low", speed: "fast", capability: "medium" },
      "xai/grok-2-1212": { cost: "medium", speed: "fast", capability: "medium" },
      "openai/gpt-4o-mini": { cost: "medium", speed: "fast", capability: "medium" },
      "google/gemini-flash-1.5": { cost: "medium", speed: "fast", capability: "medium" },

    };
  }

  // Auto-select best model based on task complexity and budget
  selectModel(taskComplexity: string = "medium", budget: string = "medium") {
    const models = OpenRouterService.AVAILABLE_MODELS;

    const costMap: Record<string, number> = { low: 1, medium: 2, high: 3 };
    const budgetCap = costMap[budget] || 1; // Default to 'low'

    const capabilityMap: Record<string, number> = { simple: 1, medium: 2, complex: 3 };
    const requiredCapability = capabilityMap[taskComplexity] || 2; // Default to 'medium'

    const candidates = Object.entries(models)
      .map(([name, props]) => ({
        name,
        ...props,
        costLevel: costMap[props.cost] || 99,
        capabilityLevel: capabilityMap[props.capability] || 0,
      }))
      .filter(
        (model: any) =>
          model.costLevel <= budgetCap &&
          model.capabilityLevel >= requiredCapability
      );

    if (candidates.length > 0) {
      // Sort by cheapest cost first, then by highest capability
      candidates.sort((a: any, b: any) => {
        if (a.costLevel !== b.costLevel) {
          return a.costLevel - b.costLevel;
        }
        return b.capabilityLevel - a.capabilityLevel;
      });
      return candidates[0]!.name;
    }

    // Fallback logic if no perfect match
    // 1. Try to find any model at the required capability, ignoring budget
    const capableModels = Object.entries(models)
      .map(([name, props]) => ({
        name,
        ...props,
        costLevel: costMap[props.cost] || 99,
        capabilityLevel: capabilityMap[props.capability] || 0,
      }))
      .filter((model: any) => model.capabilityLevel >= requiredCapability)
      .sort((a: any, b: any) => a.costLevel - b.costLevel); // Sort by cheapest

    if (capableModels.length > 0) {
      return capableModels[0]!.name;
    }

    // 2. If still nothing, return the "best value" default
    return "anthropic/claude-3-haiku";
  }

  async chatCompletion(messages: any[], options: any = {}) {
    if (!this.apiKey) {
      throw new Error("OpenRouter API key not configured");
    }

    const model =
      options.model || this.selectModel(options.complexity, options.budget);

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": this.referer, // From constructor
          "X-Title": this.title,         // From constructor
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2000,
          top_p: options.topP || 1,
          ...options,
        }),
      });

      if (!response.ok) {
        // Better error handling - try to parse structured error response
        const errorBody = await response.text();
        let errorMessage = errorBody;
        try {
          // Try to parse OpenRouter's structured error
          const errorJson = JSON.parse(errorBody);
          if (errorJson.error && errorJson.error.message) {
            errorMessage = errorJson.error.message;
          }
        } catch (e) {
          // It wasn't JSON, just use the raw text
        }
        throw new Error(`OpenRouter API error: ${response.status} - ${errorMessage}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`OpenRouter API call failed for model ${model}:`, error);
      throw error;
    }
  }

  // STEP 1: Extract keywords and requirements from job description
  async extractKeywordsFromJobDescription(jobDescription: string, options: any = {}) {
    const messages = [
      {
        role: "system",
        content: `You are an expert at analyzing job descriptions. Extract the most critical keywords, skills, and qualifications that an ATS system would look for.

IMPORTANT: Return ONLY a valid JSON object with this exact structure. Do not include any other text, explanations, or formatting:

{
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "qualifications": ["qualification1", "qualification2", "qualification3"]
}

Focus on:
- Technical skills and technologies (JavaScript, React, Node.js, etc.)
- Years of experience requirements
- Education requirements
- Soft skills mentioned
- Industry-specific terminology
- Certifications

Extract 10-15 of the most important items. Return only the JSON object, nothing else.`,
      },
      {
        role: "user",
        content: `Extract the key keywords and qualifications from this job description:

${jobDescription}`,
      },
    ];

    const response = await this.chatCompletion(messages, {
      model: "anthropic/claude-3-haiku",
      temperature: 0.1,
      maxTokens: 500,
      ...options,
    });

    try {
      const rawContent = response.choices[0].message.content;
      console.log("Raw AI response for keyword extraction:", rawContent);
      const jsonContent = extractJSON(rawContent);
      console.log("Extracted JSON content:", jsonContent);
      return JSON.parse(jsonContent);
    } catch (error) {
      console.error("Failed to parse keyword extraction response:", error);
      console.error("Raw content was:", response.choices[0].message.content);

      // Fallback: try to extract some basic keywords from the job description manually
      console.log("Attempting fallback keyword extraction...");
      const fallbackKeywords = this.extractKeywordsFallback(jobDescription);
      return { keywords: fallbackKeywords, qualifications: [] };
    }
  }

  // STEP 2: Score relevance of a single item (experience or project)
  async scoreRelevance(keywords: string[], qualifications: string[], itemText: string, itemType: string = "experience", options: any = {}) {
    const messages = [
      {
        role: "system",
        content: `You are an expert at evaluating how relevant a ${itemType} is to a job posting. Score from 1-10 based on keyword matches and alignment with qualifications.

Return ONLY a JSON object:
{
  "relevance_score": 8,
  "reason": "Brief explanation of the score"
}`,
      },
      {
        role: "user",
        content: `Job Keywords: ${keywords.join(", ")}
Job Qualifications: ${qualifications.join("; ")}

${itemType.charAt(0).toUpperCase() + itemType.slice(1)} to evaluate:
${itemText}

Score this ${itemType}'s relevance from 1-10.`,
      },
    ];

    const response = await this.chatCompletion(messages, {
      model: "anthropic/claude-3-haiku",
      temperature: 0.1,
      maxTokens: 200,
      ...options,
    });

    try {
      const rawContent = response.choices[0].message.content;
      const jsonContent = extractJSON(rawContent);
      return JSON.parse(jsonContent);
    } catch (error) {
      console.error("Failed to parse relevance score response:", error);
      return { relevance_score: 5, reason: "Unable to score" };
    }
  }

  // STEP 3: Optimize bullet points for a single item
  async optimizeBulletPoints(keywords: string[], bulletPoints: string[], itemType: string = "experience", options: any = {}) {
    const messages = [
      {
        role: "system",
        content: `You are an expert resume writer. Rewrite these bullet points to be more impactful, keyword-rich, and quantifiable.

Return ONLY a JSON object:
{
  "bulletPointSuggestions": [
    {
      "bulletIndex": 0,
      "suggestedBullet": "Improved version of bullet point",
      "keyImprovements": ["Added metrics", "Used stronger verb"]
    }
  ]
}

Focus on:
- Strong action verbs
- Quantifiable metrics and results
- Incorporating relevant keywords naturally
- Clear value propositions
- Concise, impactful language`,
      },
      {
        role: "user",
        content: `Job Keywords: ${keywords.join(", ")}

Current ${itemType} bullet points:
${bulletPoints.map((b: string, i: number) => `${i}. ${b}`).join("\n")}

Rewrite each bullet point to be more impactful and keyword-optimized.`,
      },
    ];

    const response = await this.chatCompletion(messages, {
      model: "anthropic/claude-3-haiku",
      temperature: 0.3,
      maxTokens: 1000,
      ...options,
    });

    try {
      const rawContent = response.choices[0].message.content;
      const jsonContent = extractJSON(rawContent);
      return JSON.parse(jsonContent);
    } catch (error) {
      console.error("Failed to parse bullet optimization response:", error);
      return { bulletPointSuggestions: [] };
    }
  }

  // STEP 4: Generate global suggestions and professional summary
  async generateGlobalSuggestions(keywords: string[], qualifications: string[], currentSummary: string, selectedSkills: any[], options: any = {}) {
    const messages = [
      {
        role: "system",
        content: `You are an expert career counselor. Provide high-level resume optimization advice and write a compelling professional summary.

Return ONLY a JSON object:
{
  "globalSuggestions": {
    "overallRecommendations": ["recommendation 1", "recommendation 2"],
    "keywordSuggestions": ["suggestion 1", "suggestion 2"],
    "atsSuggestions": ["tip 1", "tip 2"]
  },
  "professionalSummary": {
    "suggestedText": "Compelling 2-3 sentence summary...",
    "keyImprovements": ["improvement 1", "improvement 2"]
  },
  "skills": {
    "suggestedSkills": {
      "Programming Languages": [],
      "Frameworks & Libraries": [],
      "Databases": [],
      "Cloud & DevOps": [],
      "Tools & Testing": []
    }
  }
}`,
      },
      {
        role: "user",
        content: `Job Keywords: ${keywords.join(", ")}
Job Qualifications: ${qualifications.join("; ")}

Current Professional Summary:
${currentSummary || "None provided"}

Current Skills:
${JSON.stringify(selectedSkills, null, 2)}

Provide:
1. Global recommendations for the resume
2. Keyword integration suggestions
3. ATS optimization tips
4. A rewritten professional summary that incorporates key qualifications
5. Suggested skills organized by category`,
      },
    ];

    const response = await this.chatCompletion(messages, {
      model: "anthropic/claude-3-haiku",
      temperature: 0.4,
      maxTokens: 1500,
      ...options,
    });

    try {
      const rawContent = response.choices[0].message.content;
      const jsonContent = extractJSON(rawContent);
      return JSON.parse(jsonContent);
    } catch (error) {
      console.error("Failed to parse global suggestions response:", error);
      return {
        globalSuggestions: {
          overallRecommendations: [],
          keywordSuggestions: [],
          atsSuggestions: []
        },
        professionalSummary: {
          suggestedText: currentSummary || "",
          keyImprovements: []
        },
        skills: {
          suggestedSkills: {
            "Programming Languages": [],
            "Frameworks & Libraries": [],
            "Databases": [],
            "Cloud & DevOps": [],
            "Tools & Testing": []
          }
        }
      };
    }
  }

  // Fallback method for keyword extraction when AI fails
  extractKeywordsFallback(jobDescription: string): string[] {
    const text = jobDescription.toLowerCase();

    // Common tech keywords to look for
    const commonKeywords = [
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'php', 'ruby',
      'react', 'vue', 'angular', 'express', 'django', 'flask', 'spring',
      'nodejs', 'node.js', 'html', 'css', 'sql', 'mongodb', 'postgresql', 'mysql',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'agile', 'scrum',
      'api', 'rest', 'graphql', 'testing', 'jest', 'selenium', 'cypress'
    ];

    const foundKeywords: string[] = [];

    for (const keyword of commonKeywords) {
      if (text.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    }

    // Also extract some words that appear frequently
    const words = jobDescription.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const wordCount: Record<string, number> = {};

    for (const word of words) {
      if (!commonKeywords.includes(word) && !['with', 'that', 'this', 'from', 'have', 'will', 'your', 'work', 'team', 'experience'].includes(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    }

    // Get words that appear more than once
    const frequentWords = Object.entries(wordCount)
      .filter(([_, count]) => count > 1)
      .map(([word]) => word)
      .slice(0, 5);

    return [...foundKeywords, ...frequentWords].slice(0, 15);
  }

  async generateCoverLetter(jobDescription: string, resumeData: any, options: any = {}) {
    const messages = [
      {
        role: "system",
        content:
          "You are a professional cover letter writer. Create compelling, personalized cover letters that highlight relevant experience and enthusiasm.",
      },
      {
        role: "user",
        content: `Job Description: ${jobDescription}

Candidate Profile: ${JSON.stringify(resumeData, null, 2)}

Write a professional cover letter that:
1. Addresses the hiring manager specifically
2. Highlights 2-3 most relevant experiences
3. Shows enthusiasm for the company/role
4. Calls to action for next steps

Keep it to 3-4 paragraphs, professional tone.`,
      },
    ];

    const response = await this.chatCompletion(messages, {
      model: this.selectModel("complex", options.budget),
      temperature: 0.7,
      maxTokens: 1000,
      ...options,
    });

    return response.choices[0].message.content;
  }

  // Fallback method - tries multiple Claude models in order of preference
  async chatCompletionWithFallback(messages: any[], options: any = {}) {
    const modelsToTry = [
      "anthropic/claude-3-haiku", // Primary: Claude-3-Haiku (fast and reliable)
      "anthropic/claude-3.5-sonnet", // Secondary: More powerful Sonnet model
    ];

    for (const model of modelsToTry) {
      try {
        console.log(`Trying OpenRouter model: ${model}`);
        const result = await this.chatCompletion(messages, {
          ...options,
          model,
        });
        console.log(`Success with model: ${model}`);
        return result;
      } catch (error) {
        console.warn(`Model ${model} failed:`, error instanceof Error ? error.message : String(error));
        continue;
      }
    }

    throw new Error("All Claude models failed - check API key and credits");
  }
}

export default OpenRouterService;