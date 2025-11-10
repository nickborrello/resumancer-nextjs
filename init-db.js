import Database from 'better-sqlite3';

const db = new Database('C:\\temp\\dev.db');

const sql = `
CREATE TABLE \`account\` (
	\`userId\` text NOT NULL,
	\`type\` text NOT NULL,
	\`provider\` text NOT NULL,
	\`providerAccountId\` text NOT NULL,
	\`refresh_token\` text,
	\`access_token\` text,
	\`expires_at\` integer,
	\`token_type\` text,
	\`scope\` text,
	\`id_token\` text,
	\`session_state\` text,
	PRIMARY KEY(\`provider\`, \`providerAccountId\`),
	FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE \`credit_packages\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`name\` text NOT NULL,
	\`credits\` integer NOT NULL,
	\`price\` integer NOT NULL,
	\`currency\` text DEFAULT 'usd',
	\`stripe_price_id\` text,
	\`is_active\` integer DEFAULT 1,
	\`sort_order\` integer DEFAULT 0,
	\`created_at\` integer
);
CREATE TABLE \`credit_transactions\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`user_id\` text,
	\`type\` text NOT NULL,
	\`amount\` integer NOT NULL,
	\`description\` text NOT NULL,
	\`resume_id\` text,
	\`payment_id\` text,
	\`created_at\` integer,
	FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (\`resume_id\`) REFERENCES \`resumes\`(\`id\`) ON UPDATE no action ON DELETE set null
);
CREATE TABLE \`education\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`profile_id\` text,
	\`institution\` text NOT NULL,
	\`major\` text,
	\`degree\` text,
	\`gpa\` text,
	\`start_date\` text,
	\`end_date\` text,
	\`current\` integer DEFAULT 0,
	\`description\` text,
	\`created_at\` integer,
	\`updated_at\` integer,
	FOREIGN KEY (\`profile_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE \`experiences\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`profile_id\` text,
	\`position\` text NOT NULL,
	\`company\` text NOT NULL,
	\`location\` text,
	\`start_date\` text,
	\`end_date\` text,
	\`current\` integer DEFAULT 0,
	\`description\` text,
	\`created_at\` integer,
	\`updated_at\` integer,
	FOREIGN KEY (\`profile_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE \`payments\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`user_id\` text,
	\`stripe_payment_intent_id\` text,
	\`stripe_session_id\` text,
	\`amount\` integer NOT NULL,
	\`currency\` text DEFAULT 'usd',
	\`credits_purchased\` integer NOT NULL,
	\`status\` text NOT NULL,
	\`metadata\` text,
	\`created_at\` integer,
	\`completed_at\` integer,
	FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX \`payments_stripe_payment_intent_id_unique\` ON \`payments\` (\`stripe_payment_intent_id\`);
CREATE UNIQUE INDEX \`payments_stripe_session_id_unique\` ON \`payments\` (\`stripe_session_id\`);
CREATE TABLE \`profiles\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`userId\` text NOT NULL,
	\`full_name\` text,
	\`email\` text,
	\`phone\` text,
	\`location\` text,
	\`linkedin\` text,
	\`github\` text,
	\`portfolio\` text,
	\`created_at\` integer,
	\`updated_at\` integer,
	FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX \`profiles_userId_unique\` ON \`profiles\` (\`userId\`);
CREATE TABLE \`projects\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`profile_id\` text,
	\`name\` text NOT NULL,
	\`description\` text,
	\`link\` text,
	\`github\` text,
	\`technologies\` text,
	\`start_date\` text,
	\`end_date\` text,
	\`current\` integer DEFAULT 0,
	\`created_at\` integer,
	\`updated_at\` integer,
	FOREIGN KEY (\`profile_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE \`resumes\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`user_id\` text,
	\`profile_id\` text,
	\`title\` text NOT NULL,
	\`job_description\` text,
	\`resume_data\` text NOT NULL,
	\`metadata\` text,
	\`created_at\` integer,
	\`updated_at\` integer,
	FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (\`profile_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE \`session\` (
	\`sessionToken\` text PRIMARY KEY NOT NULL,
	\`userId\` text NOT NULL,
	\`expires\` integer NOT NULL,
	FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE \`skills\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`profile_id\` text,
	\`category\` text NOT NULL,
	\`skills\` text NOT NULL,
	\`created_at\` integer,
	\`updated_at\` integer,
	FOREIGN KEY (\`profile_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE \`user\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`name\` text,
	\`email\` text NOT NULL,
	\`emailVerified\` integer,
	\`image\` text,
	\`subscription_tier\` text DEFAULT 'free',
	\`credits\` integer DEFAULT 3,
	\`api_usage_count\` integer DEFAULT 0,
	\`last_login\` integer,
	\`created_at\` integer,
	\`updated_at\` integer
);
CREATE UNIQUE INDEX \`user_email_unique\` ON \`user\` (\`email\`);
CREATE TABLE \`verificationToken\` (
	\`identifier\` text NOT NULL,
	\`token\` text NOT NULL,
	\`expires\` integer NOT NULL,
	PRIMARY KEY(\`identifier\`, \`token\`)
);
`;

db.exec(sql);
db.close();

console.log('Database initialized');