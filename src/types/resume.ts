// Resume data types for the application

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location?: string;
  description: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  startDate?: string;
  endDate?: string;
}

export interface Skill {
  category: string;
  skills: string[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  professionalSummary: string;
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  resumeData: ResumeData;
  mode: 'ai' | 'demo';
  createdAt: string;
  updatedAt: string;
}

export interface GenerateResumeRequest {
  jobDescription: string;
}

export interface GenerateResumeResponse {
  resumeId: string;
  resume: ResumeData;
  message: string;
  creditsRemaining?: number;
}
