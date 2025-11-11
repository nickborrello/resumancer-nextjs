import {
  pgTable,
  text,
  integer,
  uuid,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

/**
 * Users Table
 *
 * Stores core user information from OAuth providers and application-specific data.
 * The `id` is a text field for NextAuth.js compatibility.
 */
export const users = pgTable("user", {
  // NextAuth.js Core Fields
  id: uuid("id")
    .primaryKey()
    .defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),

  // Application-Specific Fields from resumancer-backend
  subscription_tier: text("subscription_tier").default("free"),
  credits: integer("credits").default(3),
  api_usage_count: integer("api_usage_count").default(0),
  last_login: timestamp("last_login", { mode: "date" }),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

/**
 * Accounts Table
 *
 * Links users to their OAuth provider accounts (Google, GitHub, etc.).
 * Stores OAuth tokens and metadata.
 */
export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

/**
 * Sessions Table
 *
 * Stores active user sessions for authentication.
 */
export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

/**
 * Verification Tokens Table
 *
 * Used for email verification and magic link authentication.
 */
export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compositePk: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// --- Application-Specific Tables ---

/**
 * Profiles Table
 *
 * Stores personal and contact information for a user's resume.
 * A user can have one primary profile.
 */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  // Personal Info
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phoneNumber: text("phone_number"),
  location: text("location"),
  address: text("address"),
  address2: text("address2"),
  postalCode: text("postal_code"),
  isPrimary: integer("is_primary").default(1),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

/**
 * Experiences Table
 *
 * Stores professional work experience entries.
 */
export const experiences = pgTable("experiences", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  position: text("position_title").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  experienceType: text("experience_type"), // Full-time, Part-time, Internship, Contract, Freelance
  startDate: text("start_date"),
  endDate: text("end_date"),
  current: integer("currently_work_here").default(0),
  description: text("description"), // JSON string
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

/**
 * Education Table
 *
 * Stores academic history and qualifications.
 */
export const education = pgTable("education", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  institution: text("school_name").notNull(),
  major: text("major"),
  degree: text("degree_type"),
  gpa: text("gpa"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  current: integer("currently_attending").default(0),
  coursework: text("coursework"), // JSON string
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

/**
 * Projects Table
 *
 * Stores personal or professional projects.
 */
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  name: text("project_name").notNull(),
  location: text("location"),
  position: text("position_title"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  current: integer("currently_working_on").default(0),
  description: text("description"), // JSON string
  link: text("link"),
  technologies: text("technologies"), // JSON string
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

/**
 * Skills Table
 *
 * Stores skills as a JSON array for each profile.
 */
export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .unique(),
  skills: text("skills").notNull(), // JSON array of skill strings
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

/**
 * Resumes Table
 *
 * Stores generated resumes and their associated data.
 */
export const resumes = pgTable("resumes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  jobDescription: text("job_description"),
  resumeData: text("resume_data").notNull(), // JSON string
  mode: text("mode").default("ai"), // 'ai' or 'demo'
  metadata: text("metadata"), // JSON string
  lastOpenedAt: timestamp("last_opened_at", { mode: "date" }).defaultNow(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

/**
 * Credit Transactions Table
 *
 * Logs all credit-related activities (purchases, usage).
 */
export const creditTransactions = pgTable("credit_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // e.g., 'purchase', 'generation'
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  resumeId: uuid("resume_id").references(() => resumes.id, { onDelete: "set null" }),
  paymentId: text("payment_id"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

/**
 * Payments Table
 *
 * Records payment information from Stripe.
 */
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
  stripeSessionId: text("stripe_session_id").unique(),
  amount: integer("amount").notNull(),
  currency: text("currency").default("usd"),
  creditsPurchased: integer("credits_purchased").notNull(),
  status: text("status").notNull(),
  metadata: text("metadata"), // JSON string
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  completedAt: timestamp("completed_at", { mode: "date" }),
});

/**
 * Password Reset Tokens Table
 *
 * Used for password reset functionality.
 */
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  used: integer("used").default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

/**
 * Portfolio Links Table
 *
 * Stores portfolio and social media links.
 */
export const portfolioLinks = pgTable("portfolio_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).unique(),
  linkedin: text("linkedin"),
  portfolio: text("portfolio"),
  github: text("github"),
  otherUrl: text("other_url"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

/**
 * Languages Table
 *
 * Stores language proficiencies.
 */
export const languages = pgTable("languages", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  language: text("language").notNull(),
  proficiency: text("proficiency"), // Native, Fluent, Professional, Intermediate, Basic
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

/**
 * Certifications Table
 *
 * Stores professional certifications.
 */
export const certifications = pgTable("certifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  certificationName: text("certification_name").notNull(),
  issuer: text("issuer"),
  dateReceived: text("date_received"),
  expirationDate: text("expiration_date"),
  credentialId: text("credential_id"),
  verificationUrl: text("verification_url"),
  description: text("description"), // JSON string
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

/**
 * Awards Table
 *
 * Stores awards and honors.
 */
export const awards = pgTable("awards", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  awardName: text("award_name").notNull(),
  issuer: text("issuer"),
  dateReceived: text("date_received"),
  description: text("description"), // JSON string
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

/**
 * Volunteer Experience Table
 *
 * Stores volunteer work experience.
 */
export const volunteer = pgTable("volunteer", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  organization: text("organization").notNull(),
  role: text("role").notNull(),
  location: text("location"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  current: integer("currently_volunteering").default(0),
  description: text("description"), // JSON string
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

/**
 * API Usage Table
 *
 * Tracks API usage for billing and analytics.
 */
export const apiUsage = pgTable("api_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  tokensUsed: integer("tokens_used"),
  cost: text("cost"), // Store as string for decimal precision
  success: integer("success").notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

/**
 * Credit Packages Table
 *
 * Defines available credit packages for purchase.
 */
export const creditPackages = pgTable("credit_packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  credits: integer("credits").notNull(),
  price: integer("price").notNull(),
  currency: text("currency").default("usd"),
  stripePriceId: text("stripe_price_id"),
  isActive: integer("is_active").default(1),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});