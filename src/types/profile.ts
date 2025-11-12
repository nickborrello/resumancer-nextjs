/**
 * Profile Data Types and Validation Schemas
 *
 * This file defines comprehensive TypeScript interfaces and Zod validation schemas
 * for all profile sections in the Resumancer application. These types ensure type
 * safety across frontend and backend, enable robust runtime validation, and provide
 * a foundation for API endpoints and database schema design.
 *
 * Usage Patterns:
 * - Import types for TypeScript type checking: import type { Education } from '@/types/profile'
 * - Import schemas for runtime validation: import { EducationSchema } from '@/types/profile'
 *
 * All interfaces match the legacy frontend data structures and are compatible with
 * the database JSON column storage patterns defined in Task 2.4.
 */

import { z } from 'zod';

/**
 * Education entry interface
 * Represents a single educational qualification or degree
 */
export interface Education {
  /** Name of the school, university, or educational institution */
  schoolName: string;
  /** Field of study or major subject */
  major: string;
  /** Type of degree (e.g., "Bachelor of Science", "Master's") */
  degreeType: string;
  /** Grade Point Average (optional, 0.0-4.0 scale) */
  gpa?: string;
  /** Start date in YYYY-MM format */
  startDate: string;
  /** End date in YYYY-MM format (optional if currently attending) */
  endDate?: string;
  /** Whether the user is currently attending this institution */
  currentlyAttending: boolean;
  /** List of relevant coursework or subjects completed */
  coursework: string[];
}

/**
 * Work experience entry interface
 * Represents a single professional work experience
 */
export interface Experience {
  /** Name of the company or organization */
  companyName: string;
  /** Job title or position held */
  positionTitle: string;
  /** Location of the work (city, state, remote, etc.) */
  location?: string;
  /** Start date in YYYY-MM format */
  startDate: string;
  /** End date in YYYY-MM format (optional if currently working) */
  endDate?: string;
  /** Whether the user currently works at this company */
  currentlyWorkHere: boolean;
  /** List of key responsibilities and achievements (bullet points) */
  description: string[];
  /** Type of employment (Full-time, Part-time, Internship, Contract, Freelance) */
  experienceType?: string;
}

/**
 * Project entry interface
 * Represents a personal or professional project
 */
export interface Project {
  /** Name or title of the project */
  projectName: string;
  /** List of project features, technologies used, or key achievements */
  description: string[];
  /** List of technologies, frameworks, or tools used */
  technologies: string[];
  /** Start date in YYYY-MM format (optional) */
  startDate?: string;
  /** End date in YYYY-MM format (optional if currently working) */
  endDate?: string;
  /** Whether the user is currently working on this project */
  currentlyWorkingOn: boolean;
  /** URL to the project (GitHub, live demo, etc.) */
  projectUrl?: string;
  /** User's role or position on the project */
  positionTitle?: string;
  /** Location where the project was developed */
  location?: string;
}

/**
 * Skill category interface
 * Represents a grouping of related skills
 */
export interface SkillCategory {
  /** Name of the skill category (e.g., "Programming Languages", "Frameworks") */
  category: string;
  /** List of specific skills within this category */
  skills: string[];
}

/**
 * Language proficiency entry interface
 * Represents a single language with proficiency level
 */
export interface Language {
  /** Unique identifier for the language entry */
  id: string;
  /** Name of the language */
  language: string;
  /** Proficiency level (Native, Fluent, Professional, Intermediate, Basic) */
  proficiency: string;
}

/**
 * Certification entry interface
 * Represents a single professional certification
 */
export interface Certification {
  /** Unique identifier for the certification entry */
  id: string;
  /** Name of the certification */
  name: string;
  /** Issuing organization */
  issuingOrganization: string;
  /** Date obtained in YYYY-MM format */
  dateObtained: string;
  /** Credential ID or certificate number */
  credentialId?: string;
}

/**
 * Award entry interface
 * Represents a single award or honor
 */
export interface Award {
  /** Unique identifier for the award entry */
  id: string;
  /** Name of the award */
  name: string;
  /** Organization that granted the award */
  organization: string;
  /** Date received in YYYY-MM format */
  dateReceived: string;
}

/**
 * Volunteer experience entry interface
 * Represents a single volunteer work experience
 */
export interface Volunteer {
  /** Unique identifier for the volunteer entry */
  id: string;
  /** Name of the organization */
  organization: string;
  /** Role or position held */
  role: string;
  /** Location of the volunteer work */
  location?: string;
  /** Start date in YYYY-MM format */
  startDate: string;
  /** End date in YYYY-MM format (optional if currently volunteering) */
  endDate?: string;
  /** Whether the user is currently volunteering */
  isCurrent: boolean;
  /** List of key responsibilities and achievements (bullet points) */
  bulletPoints: string[];
}

/**
 * Complete profile data interface
 * Aggregates all profile sections including personal information
 */
export interface ProfileData {
  // Personal Information
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's email address */
  email: string;
  /** User's phone number */
  phoneNumber: string;
  /** User's location (city, state, country) */
  location?: string;
  /** Primary address line */
  address?: string;
  /** Secondary address line */
  address2?: string;
  /** Postal or ZIP code */
  postalCode?: string;

  // Professional Summary
  /** Professional summary or objective statement */
  professionalSummary?: string;

  // Professional Links
  /** LinkedIn profile URL */
  linkedin?: string;
  /** Personal portfolio website URL */
  portfolio?: string;
  /** GitHub profile URL */
  github?: string;
  /** Other professional URL */
  otherUrl?: string;

  // Profile Sections
  /** List of educational qualifications */
  education: Education[];
  /** List of work experiences */
  experiences: Experience[];
  /** List of projects */
  projects: Project[];
  /** List of skill categories with associated skills */
  skills: SkillCategory[];

  // Additional sections
  /** List of languages with proficiency levels */
  languages: Language[];
  /** List of certifications */
  certifications: Certification[];
  /** List of awards and honors */
  awards: Award[];
  /** List of volunteer experiences */
  volunteer: Volunteer[];
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

/**
 * Zod schema for Education validation
 * Includes comprehensive field validation and date range checks
 */
export const EducationSchema = z.object({
  schoolName: z.string().min(1, "School name is required").max(200, "School name must be 200 characters or less"),
  major: z.string().min(1, "Major is required"),
  degreeType: z.string().min(1, "Degree type is required"),
  gpa: z.string().optional().refine(
    (gpa) => !gpa || (/^\d{1,2}(\.\d{1,2})?$/.test(gpa) && parseFloat(gpa) >= 0 && parseFloat(gpa) <= 4.0),
    "GPA must be between 0.0 and 4.0"
  ),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, "Start date must be in YYYY-MM format"),
  endDate: z.string().regex(/^\d{4}-\d{2}$/, "End date must be in YYYY-MM format").optional(),
  currentlyAttending: z.boolean(),
  coursework: z.array(z.string().max(500, "Each coursework entry must be 500 characters or less")).max(20, "Maximum 20 coursework entries allowed"),
}).refine(
  (data) => {
    // If currently attending, end date should not be set
    if (data.currentlyAttending && data.endDate) {
      return false;
    }
    // If not currently attending and both dates are set, start should be before end
    if (!data.currentlyAttending && data.startDate && data.endDate && data.startDate >= data.endDate) {
      return false;
    }
    return true;
  },
  "Invalid date range: start date must be before end date, and end date should not be set if currently attending"
);

/**
 * Zod schema for Experience validation
 * Includes date validation and array limits
 */
export const ExperienceSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(200, "Company name must be 200 characters or less"),
  positionTitle: z.string().min(1, "Position title is required").max(200, "Position title must be 200 characters or less"),
  location: z.string().max(200, "Location must be 200 characters or less").optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, "Start date must be in YYYY-MM format"),
  endDate: z.string().regex(/^\d{4}-\d{2}$/, "End date must be in YYYY-MM format").optional(),
  currentlyWorkHere: z.boolean(),
  description: z.array(z.string().max(500, "Each description bullet must be 500 characters or less")).max(15, "Maximum 15 description bullets allowed"),
  experienceType: z.enum(["Full-time", "Part-time", "Internship", "Contract", "Freelance"]).optional(),
}).refine(
  (data) => {
    // If currently working here, end date should not be set
    if (data.currentlyWorkHere && data.endDate) {
      return false;
    }
    // If not currently working and both dates are set, start should be before end
    if (!data.currentlyWorkHere && data.startDate && data.endDate && data.startDate >= data.endDate) {
      return false;
    }
    return true;
  },
  "Invalid date range: start date must be before end date, and end date should not be set if currently working here"
);

/**
 * Zod schema for Project validation
 * Includes URL validation and array limits
 */
export const ProjectSchema = z.object({
  projectName: z.string().min(1, "Project name is required").max(200, "Project name must be 200 characters or less"),
  description: z.array(z.string().max(500, "Each description bullet must be 500 characters or less")).max(15, "Maximum 15 description bullets allowed"),
  technologies: z.array(z.string().max(100, "Each technology must be 100 characters or less")).max(20, "Maximum 20 technologies allowed"),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, "Start date must be in YYYY-MM format").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}$/, "End date must be in YYYY-MM format").optional(),
  currentlyWorkingOn: z.boolean(),
  projectUrl: z.string().url("Project URL must be a valid URL").optional().or(z.literal("")),
  positionTitle: z.string().max(200, "Position title must be 200 characters or less").optional(),
  location: z.string().max(200, "Location must be 200 characters or less").optional(),
}).refine(
  (data) => {
    // If currently working on, end date should not be set
    if (data.currentlyWorkingOn && data.endDate) {
      return false;
    }
    // If not currently working and both dates are set, start should be before end
    if (!data.currentlyWorkingOn && data.startDate && data.endDate && data.startDate >= data.endDate) {
      return false;
    }
    return true;
  },
  "Invalid date range: start date must be before end date, and end date should not be set if currently working on project"
);

/**
 * Zod schema for SkillCategory validation
 * Ensures category has skills and reasonable limits
 */
export const SkillCategorySchema = z.object({
  category: z.string().min(1, "Category name is required").max(100, "Category name must be 100 characters or less"),
  skills: z.array(z.string().min(1, "Skill cannot be empty").max(100, "Each skill must be 100 characters or less")).min(1, "Category must have at least one skill").max(50, "Maximum 50 skills per category"),
});

/**
 * Zod schema for Language validation
 * Validates language proficiency entries
 */
export const LanguageSchema = z.object({
  id: z.string().uuid("Invalid language ID"),
  language: z.string().min(1, "Language name is required").max(100, "Language name must be 100 characters or less"),
  proficiency: z.enum(["Native", "Fluent", "Professional", "Intermediate", "Basic"]),
});

/**
 * Zod schema for Certification validation
 * Validates certification entries
 */
export const CertificationSchema = z.object({
  id: z.string().uuid("Invalid certification ID"),
  name: z.string().min(1, "Certification name is required").max(200, "Certification name must be 200 characters or less"),
  issuingOrganization: z.string().min(1, "Issuing organization is required").max(200, "Issuing organization must be 200 characters or less"),
  dateObtained: z.string().regex(/^\d{4}-\d{2}$/, "Date obtained must be in YYYY-MM format"),
  credentialId: z.string().max(100, "Credential ID must be 100 characters or less").optional(),
});

/**
 * Zod schema for Award validation
 * Validates award entries
 */
export const AwardSchema = z.object({
  id: z.string().uuid("Invalid award ID"),
  name: z.string().min(1, "Award name is required").max(200, "Award name must be 200 characters or less"),
  organization: z.string().min(1, "Organization is required").max(200, "Organization must be 200 characters or less"),
  dateReceived: z.string().regex(/^\d{4}-\d{2}$/, "Date received must be in YYYY-MM format"),
});

/**
 * Zod schema for Volunteer validation
 * Validates volunteer experience entries
 */
export const VolunteerSchema = z.object({
  id: z.string().uuid("Invalid volunteer ID"),
  organization: z.string().min(1, "Organization is required").max(200, "Organization must be 200 characters or less"),
  role: z.string().min(1, "Role is required").max(200, "Role must be 200 characters or less"),
  location: z.string().max(200, "Location must be 200 characters or less").optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, "Start date must be in YYYY-MM format"),
  endDate: z.string().regex(/^\d{4}-\d{2}$/, "End date must be in YYYY-MM format").optional(),
  isCurrent: z.boolean(),
  bulletPoints: z.array(z.string().max(500, "Each bullet point must be 500 characters or less")).max(15, "Maximum 15 bullet points allowed"),
}).refine(
  (data) => {
    // If currently volunteering, end date should not be set
    if (data.isCurrent && data.endDate) {
      return false;
    }
    // If not currently volunteering and both dates are set, start should be before end
    if (!data.isCurrent && data.startDate && data.endDate && data.startDate >= data.endDate) {
      return false;
    }
    return true;
  },
  "Invalid date range: start date must be before end date, and end date should not be set if currently volunteering"
);

/**
 * Zod schema for complete ProfileData validation
 * Combines all sections with overall limits
 */
export const ProfileDataSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, "First name is required").max(100, "First name must be 100 characters or less"),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name must be 100 characters or less"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required").max(20, "Phone number must be 20 characters or less"),
  location: z.string().max(200, "Location must be 200 characters or less").optional(),
  address: z.string().max(200, "Address must be 200 characters or less").optional(),
  address2: z.string().max(200, "Address line 2 must be 200 characters or less").optional(),
  postalCode: z.string().max(20, "Postal code must be 20 characters or less").optional(),

  // Professional Summary
  professionalSummary: z.string().max(1000, "Professional summary must be 1000 characters or less").optional(),

  // Professional Links
  linkedin: z.string().url("LinkedIn must be a valid URL").optional().or(z.literal("")),
  portfolio: z.string().url("Portfolio must be a valid URL").optional().or(z.literal("")),
  github: z.string().url("GitHub must be a valid URL").optional().or(z.literal("")),
  otherUrl: z.string().url("Other URL must be a valid URL").optional().or(z.literal("")),
  // Profile Sections
  education: z.array(EducationSchema).max(10, "Maximum 10 education entries allowed"),
  experiences: z.array(ExperienceSchema).max(15, "Maximum 15 experience entries allowed"),
  projects: z.array(ProjectSchema).max(20, "Maximum 20 project entries allowed"),
  skills: z.array(SkillCategorySchema).max(10, "Maximum 10 skill categories allowed"),

  // Additional sections
  languages: z.array(LanguageSchema).max(20, "Maximum 20 languages allowed"),
  certifications: z.array(CertificationSchema).max(20, "Maximum 20 certifications allowed"),
  awards: z.array(AwardSchema).max(20, "Maximum 20 awards allowed"),
  volunteer: z.array(VolunteerSchema).max(15, "Maximum 15 volunteer entries allowed"),
});

// Type inference helpers for validated data
export type ValidatedEducation = z.infer<typeof EducationSchema>;
export type ValidatedExperience = z.infer<typeof ExperienceSchema>;
export type ValidatedProject = z.infer<typeof ProjectSchema>;
export type ValidatedSkillCategory = z.infer<typeof SkillCategorySchema>;
export type ValidatedLanguage = z.infer<typeof LanguageSchema>;
export type ValidatedCertification = z.infer<typeof CertificationSchema>;
export type ValidatedAward = z.infer<typeof AwardSchema>;
export type ValidatedVolunteer = z.infer<typeof VolunteerSchema>;
export type ValidatedProfileData = z.infer<typeof ProfileDataSchema>;
