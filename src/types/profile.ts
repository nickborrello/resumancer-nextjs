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

  // Additional legacy arrays (simplified for now)
  /** List of languages spoken */
  languages: string[];
  /** List of certifications (detailed schema TBD) */
  certifications: any[];
  /** List of awards and honors (detailed schema TBD) */
  awards: any[];
  /** List of volunteer experiences (detailed schema TBD) */
  volunteer: any[];
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

  // Additional arrays (simplified validation for now)
  languages: z.array(z.string().max(100, "Each language must be 100 characters or less")).max(20, "Maximum 20 languages allowed"),
  certifications: z.array(z.any()), // Detailed schema TBD
  awards: z.array(z.any()), // Detailed schema TBD
  volunteer: z.array(z.any()), // Detailed schema TBD
});

// Type inference helpers for validated data
export type ValidatedEducation = z.infer<typeof EducationSchema>;
export type ValidatedExperience = z.infer<typeof ExperienceSchema>;
export type ValidatedProject = z.infer<typeof ProjectSchema>;
export type ValidatedSkillCategory = z.infer<typeof SkillCategorySchema>;
export type ValidatedProfileData = z.infer<typeof ProfileDataSchema>;
