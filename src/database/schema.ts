import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import type { AdapterAccountType } from "next-auth/adapters";

/**
 * Users Table
 *
 * Stores core user information from OAuth providers and application-specific data.
 * The `id` is a text field for NextAuth.js compatibility.
 */
export const users = sqliteTable("user", {
  // NextAuth.js Core Fields
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp" }),
  image: text("image"),

  // Application-Specific Fields from resumancer-backend
  subscription_tier: text("subscription_tier").default("free"),
  credits: integer("credits").default(3),
  api_usage_count: integer("api_usage_count").default(0),
  last_login: integer("last_login", { mode: "timestamp" }),
  created_at: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updated_at: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * Accounts Table
 *
 * Links users to their OAuth provider accounts (Google, GitHub, etc.).
 * Stores OAuth tokens and metadata.
 */
export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
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
export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

/**
 * Verification Tokens Table
 *
 * Used for email verification and magic link authentication.
 */
export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp" }).notNull(),
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
export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
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
  isPrimary: integer("is_primary", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * Experiences Table
 *
 * Stores professional work experience entries.
 */
export const experiences = sqliteTable("experiences", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  position: text("position_title").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  experienceType: text("experience_type"), // Full-time, Part-time, Internship, Contract, Freelance
  startDate: text("start_date"),
  endDate: text("end_date"),
  current: integer("currently_work_here", { mode: "boolean" }).default(false),
  description: text("description"), // JSON string
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * Education Table
 *
 * Stores academic history and qualifications.
 */
export const education = sqliteTable("education", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  institution: text("school_name").notNull(),
  major: text("major"),
  degree: text("degree_type"),
  gpa: text("gpa"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  current: integer("currently_attending", { mode: "boolean" }).default(false),
  coursework: text("coursework"), // JSON string
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * Projects Table
 *
 * Stores personal or professional projects.
 */
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  name: text("project_name").notNull(),
  location: text("location"),
  position: text("position_title"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  current: integer("currently_working_on", { mode: "boolean" }).default(false),
  description: text("description"), // JSON string
  link: text("link"),
  technologies: text("technologies"), // JSON string
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * Skills Table
 *
 * Stores skills as a JSON array for each profile.
 */
export const skills = sqliteTable("skills", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .unique(),
  skills: text("skills").notNull(), // JSON array of skill strings
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * Resumes Table
 *
 * Stores generated resumes and their associated data.
 */
export const resumes = sqliteTable("resumes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  profileId: text("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  jobDescription: text("job_description"),
  resumeData: text("resume_data").notNull(), // JSON string
  mode: text("mode").default("ai"), // 'ai' or 'demo'
  metadata: text("metadata"), // JSON string
  lastOpenedAt: integer("last_opened_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * Credit Transactions Table
 *
 * Logs all credit-related activities (purchases, usage).
 */
export const creditTransactions = sqliteTable("credit_transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // e.g., 'purchase', 'generation'
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  resumeId: text("resume_id").references(() => resumes.id, { onDelete: "set null" }),
  paymentId: text("payment_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * Payments Table
 *
 * Records payment information from Stripe.
 */
export const payments = sqliteTable("payments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
  stripeSessionId: text("stripe_session_id").unique(),
  amount: integer("amount").notNull(),
  currency: text("currency").default("usd"),
  creditsPurchased: integer("credits_purchased").notNull(),
  status: text("status").notNull(),
  metadata: text("metadata"), // JSON string
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

/**
 * Password Reset Tokens Table
 *
 * Used for password reset functionality.
 */
export const passwordResetTokens = sqliteTable("password_reset_tokens", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  used: integer("used", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * Portfolio Links Table
 *
 * Stores portfolio and social media links.
 */
export const portfolioLinks = sqliteTable("portfolio_links", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id").references(() => profiles.id, { onDelete: "cascade" }).unique(),
  linkedin: text("linkedin"),
  portfolio: text("portfolio"),
  github: text("github"),
  otherUrl: text("other_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * Languages Table
 *
 * Stores language proficiencies.
 */
export const languages = sqliteTable("languages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  language: text("language").notNull(),
  proficiency: text("proficiency"), // Native, Fluent, Professional, Intermediate, Basic
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * Certifications Table
 *
 * Stores professional certifications.
 */
export const certifications = sqliteTable("certifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  certificationName: text("certification_name").notNull(),
  issuer: text("issuer"),
  dateReceived: text("date_received"),
  expirationDate: text("expiration_date"),
  credentialId: text("credential_id"),
  verificationUrl: text("verification_url"),
  description: text("description"), // JSON string
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * Awards Table
 *
 * Stores awards and honors.
 */
export const awards = sqliteTable("awards", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  awardName: text("award_name").notNull(),
  issuer: text("issuer"),
  dateReceived: text("date_received"),
  description: text("description"), // JSON string
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * Volunteer Experience Table
 *
 * Stores volunteer work experience.
 */
export const volunteer = sqliteTable("volunteer", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  organization: text("organization").notNull(),
  role: text("role").notNull(),
  location: text("location"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  current: integer("currently_volunteering", { mode: "boolean" }).default(false),
  description: text("description"), // JSON string
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * API Usage Table
 *
 * Tracks API usage for billing and analytics.
 */
export const apiUsage = sqliteTable("api_usage", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  tokensUsed: integer("tokens_used"),
  cost: text("cost"), // Store as string for decimal precision
  success: integer("success", { mode: "boolean" }).notNull(),
  errorMessage: text("error_message"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * Credit Packages Table
 *
 * Defines available credit packages for purchase.
 */
export const creditPackages = sqliteTable("credit_packages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  credits: integer("credits").notNull(),
  price: integer("price").notNull(),
  currency: text("currency").default("usd"),
  stripePriceId: text("stripe_price_id"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});