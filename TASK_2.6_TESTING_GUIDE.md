# Task 2.6: End-to-End Authentication Testing Guide

## Overview

This guide walks through setting up and testing all three OAuth providers (Google, GitHub, Microsoft) with real credentials. You'll need to create OAuth applications in each provider's console.

## Prerequisites

- [ ] Next.js app running on `http://localhost:3001`
- [ ] Backend API running (resumancer-backend) with endpoints implemented
- [ ] Railway PostgreSQL database accessible
- [ ] Browser for testing OAuth flows

## Part 1: Set Up Google OAuth

### Step 1.1: Create Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing: "Resumancer"
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure consent screen if prompted:
   - User Type: **External**
   - App name: **Resumancer**
   - User support email: Your email
   - Developer contact: Your email
   - Add test users (your email for testing)
6. Create OAuth client ID:
   - Application type: **Web application**
   - Name: **Resumancer NextJS**
   - Authorized JavaScript origins:
     - `http://localhost:3001`
     - `https://your-production-domain.vercel.app` (when deployed)
   - Authorized redirect URIs:
     - `http://localhost:3001/api/auth/callback/google`
     - `https://your-production-domain.vercel.app/api/auth/callback/google`
7. Click **Create**
8. Copy the **Client ID** and **Client Secret**

### Step 1.2: Update .env.local

```env
# Google OAuth
AUTH_GOOGLE_ID=your_actual_google_client_id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your_actual_google_client_secret
```

### Step 1.3: Test Google OAuth

1. Restart Next.js dev server: `npm run dev`
2. Navigate to `http://localhost:3001/login`
3. Click **Sign in with Google** button
4. Select your Google account
5. Grant permissions (email, profile)
6. Verify redirect to `/dashboard`
7. Check session data displays correctly:
   - Name from Google profile
   - Email from Google account
   - Credits from backend (should be 3 for new users)
   - Subscription tier (should be "free")

### Step 1.4: Verify Backend Integration

```bash
# Check Railway database for new user
# In Railway PostgreSQL dashboard or via psql:

SELECT id, email, first_name, last_name, google_id, credits, subscription_tier
FROM users
WHERE email = 'your-test-email@gmail.com';

# Should show:
# - UUID id
# - email matching Google account
# - google_id populated with Google's user ID
# - credits = 3 (default for new users)
# - subscription_tier = 'free'
```

---

## Part 2: Set Up GitHub OAuth

### Step 2.1: Create GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Navigate to **Developer settings** → **OAuth Apps**
3. Click **New OAuth App**
4. Fill in application details:
   - Application name: **Resumancer**
   - Homepage URL: `http://localhost:3001`
   - Application description: *AI-powered resume builder*
   - Authorization callback URL: `http://localhost:3001/api/auth/callback/github`
5. Click **Register application**
6. Copy the **Client ID**
7. Click **Generate a new client secret**
8. Copy the **Client Secret** (only shown once!)

### Step 2.2: Update .env.local

```env
# GitHub OAuth
AUTH_GITHUB_ID=your_actual_github_client_id
AUTH_GITHUB_SECRET=your_actual_github_client_secret
```

### Step 2.3: Test GitHub OAuth

1. Restart Next.js dev server
2. Navigate to `http://localhost:3001/login`
3. Click **Sign in with GitHub** button
4. Authorize the Resumancer app
5. Verify redirect to `/dashboard`
6. Check session data:
   - Name from GitHub profile
   - Email from GitHub account (must be public or granted permission)
   - Backend data loaded (credits, subscription)

### Step 2.4: Test Multiple Providers for Same User

**Scenario:** User signed in with Google earlier, now signs in with GitHub using the same email.

**Expected Behavior:**
- Both OAuth accounts link to the same backend user (email-based matching)
- Credits preserved from first sign-in
- No duplicate user created
- Both `accounts` entries in NextAuth database point to same `user.id`

**Verification:**
```bash
# Check NextAuth accounts table
SELECT provider, "providerAccountId", "userId"
FROM account
WHERE "userId" = (
  SELECT id FROM "user" WHERE email = 'your-test-email@example.com'
);

# Should show TWO rows:
# - provider: 'google', providerAccountId: '...', userId: 'same-id'
# - provider: 'github', providerAccountId: '...', userId: 'same-id'

# Check backend users table
SELECT id, email, google_id, credits
FROM users
WHERE email = 'your-test-email@example.com';

# Should show ONE row with google_id populated
# Credits unchanged from first sign-in
```

---

## Part 3: Set Up Microsoft OAuth

### Step 3.1: Create Microsoft Entra ID App

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Microsoft Entra ID** (formerly Azure AD)
3. Go to **App registrations** → **New registration**
4. Configure application:
   - Name: **Resumancer**
   - Supported account types: **Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) and personal Microsoft accounts**
   - Redirect URI:
     - Platform: **Web**
     - URI: `http://localhost:3001/api/auth/callback/microsoft-entra-id`
5. Click **Register**
6. Copy the **Application (client) ID**
7. Copy the **Directory (tenant) ID**
8. Navigate to **Certificates & secrets** → **New client secret**
9. Create secret with description "NextJS OAuth" and expiry (e.g., 24 months)
10. Copy the **Value** (client secret, only shown once!)

### Step 3.2: Update .env.local

```env
# Microsoft Entra ID OAuth
AUTH_MICROSOFT_ENTRA_ID_ID=your_actual_microsoft_client_id
AUTH_MICROSOFT_ENTRA_ID_SECRET=your_actual_microsoft_client_secret
AUTH_MICROSOFT_ENTRA_ID_TENANT_ID=your_actual_tenant_id
```

### Step 3.3: Test Microsoft OAuth

1. Restart Next.js dev server
2. Navigate to `http://localhost:3001/login`
3. Click **Sign in with Microsoft** button
4. Sign in with Microsoft account
5. Grant permissions (profile, email)
6. Verify redirect to `/dashboard`
7. Check session data displays correctly

---

## Part 4: Comprehensive Testing Scenarios

### Test 4.1: New User Registration

**Steps:**
1. Use a completely new email address
2. Sign in with any OAuth provider
3. Verify dashboard shows:
   - ✓ Credits = 3 (default)
   - ✓ Subscription tier = "free"
   - ✓ Email verified = true
4. Check backend users table:
   ```sql
   SELECT * FROM users WHERE email = 'new-user@example.com';
   ```
   - ✓ User created with UUID
   - ✓ google_id or provider ID populated
   - ✓ credits = 3
   - ✓ created_at timestamp present

### Test 4.2: Existing User Migration

**Prerequisite:** Manually create a user in backend database:
```sql
INSERT INTO users (id, email, first_name, last_name, credits, subscription_tier)
VALUES (
  gen_random_uuid(),
  'existing@example.com',
  'Existing',
  'User',
  10,
  'premium'
);
```

**Steps:**
1. Sign in with OAuth using `existing@example.com`
2. Verify dashboard shows:
   - ✓ Credits = 10 (preserved from backend)
   - ✓ Subscription tier = "premium" (preserved)
   - ✓ Name = "Existing User" (backend data)
3. Check backend users table:
   ```sql
   SELECT * FROM users WHERE email = 'existing@example.com';
   ```
   - ✓ google_id now populated (linked to OAuth)
   - ✓ Credits unchanged (10)
   - ✓ Subscription unchanged (premium)

### Test 4.3: Session Persistence

**Steps:**
1. Sign in with any provider
2. Navigate to `/dashboard`
3. Refresh page (F5)
4. Verify:
   - ✓ Still authenticated (no redirect to /login)
   - ✓ Session data still displays
   - ✓ No additional API calls to backend (session cached)

### Test 4.4: Route Protection

**Steps:**
1. Open browser in incognito/private mode
2. Navigate directly to `http://localhost:3001/dashboard`
3. Verify:
   - ✓ Redirects to `/login?callbackUrl=/dashboard`
   - ✓ Login page displays
4. Sign in with any provider
5. Verify:
   - ✓ Redirects back to `/dashboard`
   - ✓ Protected content now accessible

### Test 4.5: Sign Out

**Steps:**
1. From dashboard, click **Sign Out** button
2. Verify:
   - ✓ Redirects to `/login` or home page
   - ✓ Session destroyed
3. Navigate to `http://localhost:3001/dashboard`
4. Verify:
   - ✓ Redirects to `/login` (route protection working)
   - ✓ Cannot access protected content

### Test 4.6: Error Handling

**Test Backend Unavailable:**
1. Stop backend API server
2. Sign in with OAuth (should still work due to graceful degradation)
3. Verify dashboard shows:
   - ✓ Name and email from OAuth provider
   - ✓ Credits = undefined or 0 (backend data unavailable)
   - ✓ Subscription tier = undefined or null
   - ✓ No error message displayed (fails silently)
4. Check browser console for warnings (not errors)

**Test Invalid OAuth Credentials:**
1. Change `AUTH_GOOGLE_SECRET` to invalid value in `.env.local`
2. Restart dev server
3. Try to sign in with Google
4. Verify:
   - ✓ Error message displayed on login page
   - ✓ User not redirected
   - ✓ Can try again with different provider

---

## Part 5: Verification Checklist

### OAuth Flow Verification

- [ ] Google OAuth: Sign in successful
- [ ] GitHub OAuth: Sign in successful
- [ ] Microsoft OAuth: Sign in successful
- [ ] All providers redirect to `/dashboard` after authentication
- [ ] Session data includes name, email, image from OAuth

### Backend Integration Verification

- [ ] New users created in backend `users` table
- [ ] Existing users linked by email (no duplicates)
- [ ] `google_id` populated for Google OAuth users
- [ ] Credits displayed correctly from backend
- [ ] Subscription tier displayed correctly from backend
- [ ] Backend API `/api/auth/link-oauth-user` endpoint working
- [ ] Backend API `/api/users/by-email/:email` endpoint working

### Session Management Verification

- [ ] Session persists across page refreshes
- [ ] Session accessible in client components via `useSession()`
- [ ] Session accessible in server components via `auth()`
- [ ] Session destroyed on sign out

### Route Protection Verification

- [ ] `/dashboard` redirects to `/login` when unauthenticated
- [ ] `/resume` redirects to `/login` when unauthenticated
- [ ] `/profile` redirects to `/login` when unauthenticated
- [ ] `/credits` redirects to `/login` when unauthenticated
- [ ] `/login` redirects to `/dashboard` when authenticated
- [ ] Callback URL preserved in redirect (e.g., `/login?callbackUrl=/dashboard`)

### Multi-Provider Verification

- [ ] Same email across providers links to same backend user
- [ ] Credits preserved when switching providers
- [ ] Both OAuth accounts shown in NextAuth `account` table
- [ ] No duplicate users created

### Error Handling Verification

- [ ] OAuth errors display on login page (not crash app)
- [ ] Backend unavailable: Auth continues with degraded data
- [ ] Invalid credentials: Error shown, user can retry
- [ ] Network errors handled gracefully

---

## Part 6: Common Issues and Solutions

### Issue 1: "Redirect URI mismatch"

**Symptom:** OAuth provider shows error: "redirect_uri_mismatch"

**Solution:**
- Verify callback URL in provider console exactly matches:
  - Google: `http://localhost:3001/api/auth/callback/google`
  - GitHub: `http://localhost:3001/api/auth/callback/github`
  - Microsoft: `http://localhost:3001/api/auth/callback/microsoft-entra-id`
- Check for trailing slashes (should NOT have)
- Verify port number matches (3001, not 3000)
- Restart dev server after changing `.env.local`

### Issue 2: "Invalid client secret"

**Symptom:** Authentication fails with "invalid_client" error

**Solution:**
- Regenerate client secret in provider console
- Copy ENTIRE secret (some are very long)
- Update `.env.local` with new secret
- Restart dev server
- Clear browser cookies for localhost:3001

### Issue 3: Session shows undefined credits/subscription

**Symptom:** Dashboard shows `undefined` or `0` for credits/subscription

**Possible Causes:**
1. Backend API not running
2. Backend endpoint `/api/users/by-email/:email` not implemented
3. CORS blocking frontend requests to backend
4. User doesn't exist in backend database

**Solution:**
- Check backend API is running: `curl http://localhost:3000/health`
- Test backend endpoint directly:
  ```bash
  curl http://localhost:3000/api/users/by-email/your-test-email@example.com
  ```
- Check backend logs for CORS errors
- Verify CORS config allows `http://localhost:3001`
- Check browser Network tab for failed API requests
- Manually create user in backend database if needed

### Issue 4: "Adapter error" or database errors

**Symptom:** Console shows Drizzle/PostgreSQL errors

**Solution:**
- Verify `DATABASE_URL` in `.env.local` is correct
- Run migrations: `npm run db:migrate` (if not done by backend)
- Check PostgreSQL is running (Railway dashboard)
- Verify database has required tables:
  ```sql
  \dt  -- List all tables
  -- Should show: user, account, session, verification_token
  ```
- Check Drizzle schema matches database schema
- Restart dev server

### Issue 5: Multiple users created for same email

**Symptom:** Two users with same email in backend database

**Possible Causes:**
- Backend `/api/auth/link-oauth-user` endpoint not checking for existing user by email
- Race condition if two sign-ins happen simultaneously

**Solution:**
- Fix backend endpoint to check for existing user FIRST:
  ```javascript
  // Correct order
  const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existingUser.length > 0) {
    // Link to existing
  } else {
    // Create new
  }
  ```
- Add unique constraint on `users.email` in database:
  ```sql
  ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
  ```
- Manually merge duplicate users if needed

---

## Part 7: Success Criteria

Task 2.6 is complete when ALL of the following are verified:

### OAuth Providers
- [ ] Google OAuth fully functional end-to-end
- [ ] GitHub OAuth fully functional end-to-end
- [ ] Microsoft OAuth fully functional end-to-end
- [ ] All providers tested with real accounts
- [ ] All providers display correct user data

### Backend Integration
- [ ] New users automatically created in backend database
- [ ] Existing users linked by email (tested)
- [ ] Credits fetched from backend and displayed
- [ ] Subscription tier fetched from backend and displayed
- [ ] No duplicate users created

### Session & Route Protection
- [ ] Session persists across page refreshes
- [ ] Protected routes redirect unauthenticated users to `/login`
- [ ] Auth routes redirect authenticated users to `/dashboard`
- [ ] Sign out clears session completely

### Error Handling
- [ ] Backend unavailable: Frontend continues with degraded data
- [ ] Invalid OAuth credentials: Error shown to user
- [ ] Network errors handled without crashing app

### Documentation
- [ ] All environment variables documented in `.env.example`
- [ ] OAuth setup instructions clear and complete
- [ ] Common issues and solutions documented

---

## Part 8: Next Steps After Task 2.6

Once all tests pass and authentication is fully verified:

1. **Update `.env.example`** with actual callback URLs for production
2. **Create production OAuth apps** with production domains
3. **Deploy to Vercel/Railway** with production environment variables
4. **Test production OAuth flows** end-to-end
5. **Proceed to Phase 3** - Core Pages Migration
   - Task 3.1: Migrate Navbar component
   - Task 3.2: Migrate Profile page
   - Task 3.3: Migrate Credits page
   - Task 3.4: Migrate PreviousResumes page
   - Task 3.5: Test all core pages

## Notes

- Keep Vite app running during testing for fallback
- Backend API must be running for full integration testing
- Test with multiple email addresses (Gmail, GitHub, Microsoft)
- Document any edge cases encountered
- Save OAuth app credentials securely (1Password, LastPass, etc.)

---

**Testing Coordinator:** [Your Name]  
**Date Started:** [Date]  
**Date Completed:** [Date]  
**Status:** ⏳ Pending User Coordination
