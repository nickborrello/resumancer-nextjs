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

export interface BulletPoint {
  id: string;
  content: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  location?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface Experience {
  id: string;
  company: string;
  jobTitle: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  bulletPoints: BulletPoint[];
}

export interface Project {
  id: string;
  name: string;
  link?: string;
  technologies: string[];
  bulletPoints: BulletPoint[];
}

export interface SkillCategory {
  id: string;
  category: string;
  list: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  dateObtained: string;
  credentialId?: string;
}

export interface Award {
  id: string;
  name: string;
  organization: string;
  dateReceived: string;
}

export interface VolunteerExperience {
  id: string;
  organization: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  bulletPoints: BulletPoint[];
}

export interface Language {
  id: string;
  language: string;
  proficiency: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  professionalSummary: string;
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  skills: SkillCategory[];
  certifications?: Certification[];
  awards?: Award[];
  volunteerExperience?: VolunteerExperience[];
  languages?: Language[];
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
