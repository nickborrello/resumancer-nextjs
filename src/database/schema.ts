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
  userId: text("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  fullName: text("full_name"),
  email: text("email"),
  phone: text("phone"),
  location: text("location"),
  linkedin: text("linkedin"),
  github: text("github"),
  portfolio: text("portfolio"),
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
  position: text("position").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  current: integer("current", { mode: "boolean" }).default(false),
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
  institution: text("institution").notNull(),
  major: text("major"),
  degree: text("degree"),
  gpa: text("gpa"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  current: integer("current", { mode: "boolean" }).default(false),
  description: text("description"), // JSON string
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
  name: text("name").notNull(),
  description: text("description"),
  link: text("link"),
  github: text("github"),
  technologies: text("technologies"), // JSON string
  startDate: text("start_date"),
  endDate: text("end_date"),
  current: integer("current", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * Skills Table
 *
 * Stores skills, organized by categories.
 */
export const skills = sqliteTable("skills", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  skills: text("skills").notNull(), // JSON string
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
  metadata: text("metadata"), // JSON string
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
 * Credit Packages Table
 *
 * Defines the available credit packages for purchase.
 */
export const creditPackages = sqliteTable("credit_packages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  credits: integer("credits").notNull(),
  price: integer("price").notNull(), // Price in cents
  currency: text("currency").default("usd"),
  stripePriceId: text("stripe_price_id"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});