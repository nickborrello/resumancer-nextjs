# Database Migration Reference - Railway Backend

## Overview

The NextAuth.js database tables need to be created in the Railway-hosted PostgreSQL database that's managed by the `resumancer-backend` repository.

## Migration Files Location

**This Repository:** `src/database/migrations/0000_mute_rictor.sql`

## Tables to Create in Railway Database

### 1. user
```sql
CREATE TABLE "user" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text,
  "email" text NOT NULL,
  "emailVerified" timestamp,
  "image" text,
  CONSTRAINT "user_email_unique" UNIQUE("email")
);
```

### 2. account
```sql
CREATE TABLE "account" (
  "userId" text NOT NULL,
  "type" text NOT NULL,
  "provider" text NOT NULL,
  "providerAccountId" text NOT NULL,
  "refresh_token" text,
  "access_token" text,
  "expires_at" integer,
  "token_type" text,
  "scope" text,
  "id_token" text,
  "session_state" text,
  CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
```

### 3. session
```sql
CREATE TABLE "session" (
  "sessionToken" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL,
  "expires" timestamp NOT NULL
);
```

### 4. verificationToken
```sql
CREATE TABLE "verificationToken" (
  "identifier" text NOT NULL,
  "token" text NOT NULL,
  "expires" timestamp NOT NULL,
  CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
```

### Foreign Keys
```sql
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" 
  FOREIGN KEY ("userId") REFERENCES "public"."user"("id") 
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" 
  FOREIGN KEY ("userId") REFERENCES "public"."user"("id") 
  ON DELETE cascade ON UPDATE no action;
```

## Integration Steps (To Be Done Later)

1. **Copy Migration SQL** to resumancer-backend repository
2. **Execute in Railway** database via backend's migration system
3. **Update DATABASE_URL** in this project's `.env.local` to point to Railway database
4. **Verify Connection** with `npm run db:studio`

## Environment Variable

This Next.js app needs access to the same Railway PostgreSQL database:

```env
DATABASE_URL=postgresql://postgres:***@containers-us-west-xxx.railway.app:5432/railway
```

Get this connection string from Railway dashboard → resumancer-backend database → Connect.

## Notes

- Tables use NextAuth.js v5 schema requirements
- Foreign keys use CASCADE delete for data integrity
- Email uniqueness enforced on user table
- Compatible with existing backend's Drizzle ORM setup
- Migration file: `0000_mute_rictor.sql` (generated on 2025-11-09)
