# Database Setup Instructions for Task 2.2b

**Task:** Execute Database Migrations  
**Requires:** User Coordination (You will run migrations in your database environment)

---

## Overview

Task 2.2a has prepared the NextAuth.js database schema and migration files. Task 2.2b requires **you** to execute these migrations in your PostgreSQL database.

## Prerequisites

Before proceeding, ensure you have:

1. **PostgreSQL Database:**
   - ✅ Local PostgreSQL installed (v12+), OR
   - ✅ Cloud database service (Railway, Vercel Postgres, Supabase, etc.)

2. **Database Connection String:**
   - Format: `postgresql://username:password@host:port/database`
   - Example local: `postgresql://postgres:password@localhost:5432/resumancer`
   - Example Railway: `postgresql://postgres:***@roundhouse.proxy.rlwy.net:12345/railway`

3. **Environment Variable Set:**
   - `DATABASE_URL` in `.env.local` configured with your actual database credentials

---

## Step 1: Generate Migration Files

Run the following command to generate SQL migration files from the Drizzle schema:

```bash
npm run db:generate
```

**Expected Output:**
```
drizzle-kit: v0.31.x
Reading config file 'drizzle.config.ts'
Generating SQL migrations...
✔ Generated migrations in src/database/migrations/
```

**What This Does:**
- Reads `src/database/schema.ts` (4 NextAuth tables: users, accounts, sessions, verificationTokens)
- Generates SQL CREATE TABLE statements
- Saves migration files to `src/database/migrations/` directory

**Verify:** Check that `src/database/migrations/` contains `.sql` files

---

## Step 2: Review Migration Files (Optional but Recommended)

Before executing, review the generated SQL to understand what will be created:

```bash
# List migration files
ls src/database/migrations/

# View the latest migration (example)
cat src/database/migrations/0000_initial_schema.sql
```

**Expected SQL Content:**
- `CREATE TABLE "user"` - User accounts table
- `CREATE TABLE "account"` - OAuth provider accounts
- `CREATE TABLE "session"` - Active sessions
- `CREATE TABLE "verificationToken"` - Email verification tokens

---

## Step 3: Configure Database Connection

### Option A: Local PostgreSQL

1. **Start PostgreSQL:**
   ```bash
   # Windows (if using PostgreSQL installed locally)
   # PostgreSQL should auto-start, or start via Services app
   ```

2. **Create Database:**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres

   # Create database
   CREATE DATABASE resumancer;

   # Exit
   \q
   ```

3. **Update `.env.local`:**
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/resumancer
   ```

### Option B: Cloud Database (Railway, Vercel, etc.)

1. **Get Connection String:**
   - Railway: Go to your database service → Connect → Copy `DATABASE_URL`
   - Vercel Postgres: Project Settings → Storage → Copy connection string
   - Supabase: Project Settings → Database → Connection string

2. **Update `.env.local`:**
   ```
   DATABASE_URL=postgresql://user:pass@host:port/database
   ```

---

## Step 4: Execute Migrations

Run the migration command to create tables in your database:

```bash
npm run db:migrate
```

**Expected Output:**
```
drizzle-kit: v0.31.x
Applying migrations...
✔ Migration 0000_initial_schema.sql applied successfully
All migrations applied successfully
```

**What This Does:**
- Connects to your PostgreSQL database using `DATABASE_URL`
- Executes SQL CREATE TABLE statements
- Creates 4 NextAuth tables: `user`, `account`, `session`, `verificationToken`

---

## Step 5: Verify Migration Success

### Option A: Using Drizzle Studio (Recommended)

Drizzle Studio provides a web UI to inspect your database:

```bash
npm run db:studio
```

**Expected:**
- Opens browser at `https://local.drizzle.studio`
- Shows 4 tables: `user`, `account`, `session`, `verificationToken`
- All tables should be empty (no rows yet)

### Option B: Using psql Command Line

```bash
# Connect to database
psql -U postgres -d resumancer

# List tables
\dt

# Expected output:
#              List of relations
#  Schema |       Name         | Type  |  Owner
# --------+--------------------+-------+---------
#  public | account            | table | postgres
#  public | session            | table | postgres
#  public | user               | table | postgres
#  public | verificationToken  | table | postgres

# View user table structure
\d user

# Exit
\q
```

### Option C: Using Database GUI (pgAdmin, TablePlus, DBeaver, etc.)

1. Connect to your database using the GUI tool
2. Navigate to the `resumancer` database
3. Verify 4 tables exist with correct schemas

---

## Step 6: Confirm Completion

After successful migration, confirm the following:

- [ ] `npm run db:generate` executed without errors
- [ ] `npm run db:migrate` executed without errors
- [ ] 4 tables exist in database: `user`, `account`, `session`, `verificationToken`
- [ ] Tables are empty (no rows) - this is expected
- [ ] `.env.local` has correct `DATABASE_URL`

**Reply to Implementation Agent with confirmation:**

```
✅ Task 2.2b Complete
- Migration files generated: Yes
- Migrations executed: Yes
- Database tables verified: Yes (4 tables: user, account, session, verificationToken)
- DATABASE_URL configured: Yes
```

---

## Troubleshooting

### Error: "DATABASE_URL environment variable is required"

**Solution:**
1. Ensure `.env.local` exists in project root
2. Verify `DATABASE_URL` is set and not empty
3. Restart your terminal/IDE to reload environment variables

### Error: "database \"resumancer\" does not exist"

**Solution:**
```bash
# Create the database first
psql -U postgres
CREATE DATABASE resumancer;
\q

# Then retry migration
npm run db:migrate
```

### Error: "connection refused" or "ECONNREFUSED"

**Solution:**
1. Verify PostgreSQL is running: `psql -U postgres` (should connect)
2. Check host/port in `DATABASE_URL` are correct
3. For cloud databases, verify network access/IP whitelist

### Error: "table already exists"

**Cause:** Migrations were already run previously

**Solution:**
```bash
# Option 1: Drop and recreate tables (CAUTION: Deletes all data)
psql -U postgres -d resumancer
DROP TABLE IF EXISTS "user" CASCADE;
DROP TABLE IF EXISTS account CASCADE;
DROP TABLE IF EXISTS session CASCADE;
DROP TABLE IF EXISTS "verificationToken" CASCADE;
\q

# Then retry migration
npm run db:migrate

# Option 2: If tables are correct, migrations are already complete
# Verify with Drizzle Studio: npm run db:studio
```

### Error: "permission denied for schema public"

**Solution:**
```bash
# Grant permissions to your user
psql -U postgres
GRANT ALL ON SCHEMA public TO your_username;
\q
```

---

## Next Steps After Completion

Once migrations are confirmed successful, Implementation Agent will proceed with:

- **Task 2.3:** User Migration from Vite App (migrate existing users to new auth system)
- **Task 2.4:** Create NextAuth Login UI (add OAuth buttons to login page)
- **Task 2.5:** Implement Session Management (protect routes with middleware)
- **Task 2.6:** End-to-End Authentication Testing (test OAuth flows with real credentials)

**Do not proceed to Task 2.3 until Task 2.2b is confirmed complete.**

---

## Database Schema Reference

### `user` Table
```sql
CREATE TABLE "user" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  "emailVerified" TIMESTAMP,
  image TEXT
);
```

### `account` Table
```sql
CREATE TABLE account (
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  PRIMARY KEY (provider, "providerAccountId")
);
```

### `session` Table
```sql
CREATE TABLE session (
  "sessionToken" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL
);
```

### `verificationToken` Table
```sql
CREATE TABLE "verificationToken" (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token)
);
```

---

**Questions or Issues?**  
Reply with details, and Implementation Agent will provide assistance.
