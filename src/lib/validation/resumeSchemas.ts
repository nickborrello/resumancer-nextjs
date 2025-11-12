import { z } from 'zod';

// Bullet Point Schema
export const bulletPointSchema = z.object({
  id: z.string(),
  content: z.string().min(1, 'Bullet point content is required'),
});

// Personal Info Schema
export const personalInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  portfolio: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
});

// Education Schema
export const educationSchema = z.object({
  id: z.string(),
  school: z.string().min(1, 'School name is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().min(1, 'Field of study is required'),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
});

// Experience Schema
export const experienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  bulletPoints: z.array(bulletPointSchema).optional(),
});

// Project Schema
export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Project name is required'),
  link: z.string().url('Invalid project URL').optional().or(z.literal('')),
  technologies: z.array(z.string()).optional(),
  bulletPoints: z.array(bulletPointSchema).optional(),
});

// Skill Category Schema
export const skillCategorySchema = z.object({
  id: z.string(),
  category: z.string().min(1, 'Category name is required'),
  list: z.array(z.string()).min(1, 'At least one skill is required'),
});

// Certification Schema
export const certificationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Certification name is required'),
  issuingOrganization: z.string().min(1, 'Issuing organization is required'),
  dateObtained: z.string().min(1, 'Date obtained is required'),
  credentialId: z.string().optional(),
});

// Award Schema
export const awardSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Award name is required'),
  organization: z.string().min(1, 'Organization is required'),
  dateReceived: z.string().min(1, 'Date received is required'),
});

// Volunteer Experience Schema
export const volunteerExperienceSchema = z.object({
  id: z.string(),
  organization: z.string().min(1, 'Organization is required'),
  role: z.string().min(1, 'Role is required'),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  bulletPoints: z.array(bulletPointSchema).optional(),
});

// Language Schema
export const languageSchema = z.object({
  id: z.string(),
  language: z.string().min(1, 'Language is required'),
  proficiency: z.string().min(1, 'Proficiency level is required'),
});

// Main Resume Data Schema
export const resumeDataSchema = z.object({
  personalInfo: personalInfoSchema,
  professionalSummary: z.string().optional(),
  education: z.array(educationSchema).optional(),
  experiences: z.array(experienceSchema).optional(),
  projects: z.array(projectSchema).optional(),
  skills: z.array(skillCategorySchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  awards: z.array(awardSchema).optional(),
  volunteerExperience: z.array(volunteerExperienceSchema).optional(),
  languages: z.array(languageSchema).optional(),
});

// Type exports
export type ResumeFormData = z.infer<typeof resumeDataSchema>;
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Project = z.infer<typeof projectSchema>;
export type SkillCategory = z.infer<typeof skillCategorySchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type Award = z.infer<typeof awardSchema>;
export type VolunteerExperience = z.infer<typeof volunteerExperienceSchema>;
export type Language = z.infer<typeof languageSchema>;
export type BulletPoint = z.infer<typeof bulletPointSchema>;
