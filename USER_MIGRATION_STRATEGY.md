# User Migration Strategy - Vite App to NextAuth.js

## Overview

This document outlines the strategy for migrating existing users from the Vite app's authentication system (JWT-based with backend `users` table) to NextAuth.js v5 with OAuth providers.

## Current State Analysis

### Existing Backend Schema (resumancer-backend)

**Users Table:**
```javascript
usersTable {
  id: uuid (primary key)
  email: varchar(255) unique
  password_hash: text (optional - for email/password users)
  google_id: varchar(255) unique (for Google OAuth users)
  first_name: varchar(255)
  last_name: varchar(255)
  email_verified: boolean (default false)
  credits: integer (default 3)
  subscription_tier: varchar(50) (default 'free')
  created_at: timestamp
  // ... other fields
}
```

**Related Tables:**
- `profiles` - User profile information
- `experiences` - Work experience entries
- `education` - Education entries
- `projects` - Project entries
- `skills` - Skills data
- `resumes` - Generated resumes
- `credit_transactions` - Credit purchase history

### New NextAuth.js Schema (This App)

**User Table:**
```sql
user {
  id: text (primary key)
  name: text
  email: text (unique)
  emailVerified: timestamp
  image: text
}
```

**Account Table:**
```sql
account {
  userId: text (FK to user.id)
  type: text
  provider: text (google, github, microsoft-entra-id)
  providerAccountId: text
  access_token: text
  refresh_token: text
  // ... OAuth tokens
  PRIMARY KEY (provider, providerAccountId)
}
```

## Migration Challenge

**Problem:** Two separate user tables in different databases:
1. **Backend (Railway):** `users` table (existing users with data)
2. **Frontend (Railway):** `user` table (new NextAuth.js users)

**Goal:** Link NextAuth.js OAuth users to existing backend users to preserve their data (credits, resumes, profiles).

## Migration Strategy

### Approach: Email-Based User Linking

Since both systems use **email as the unique identifier**, we'll link users based on email addresses.

### Scenario 1: Existing User Signs In with OAuth

**Flow:**
1. User clicks "Sign in with Google" on login page
2. NextAuth.js creates/finds user in NextAuth `user` table
3. **Custom callback** checks if email exists in backend `users` table
4. If exists: Link NextAuth user to backend user by email
5. If not exists: Create new backend user entry

### Scenario 2: New User Signs In with OAuth

**Flow:**
1. User clicks OAuth provider button
2. NextAuth.js creates new user in `user` table
3. Backend API creates corresponding entry in `users` table
4. Backend initializes: credits=3, subscription_tier='free'

### Scenario 3: Legacy Email/Password User Migration

**Challenge:** User has email/password account, now wants OAuth

**Flow:**
1. User signs in with OAuth using same email
2. System detects existing backend user with that email
3. Link OAuth account to existing user
4. Optional: Mark email/password as deprecated (keep for backward compatibility)

## Implementation Plan

### Phase 1: Dual Authentication Support (Backward Compatibility)

**Duration:** During migration period

**Backend Changes:**
1. Keep existing JWT authentication middleware
2. Add NextAuth.js session validation middleware
3. Support both auth methods in parallel

```javascript
// Backend: Support both auth types
const authMiddleware = async (req, res, next) => {
  // Check for existing JWT token
  const jwtToken = req.headers.authorization?.replace('Bearer ', '');
  
  // Check for NextAuth session cookie
  const sessionToken = req.cookies['next-auth.session-token'];
  
  if (jwtToken) {
    // Legacy JWT validation
    const user = await validateJWT(jwtToken);
    req.user = user;
    return next();
  }
  
  if (sessionToken) {
    // NextAuth session validation
    const session = await validateNextAuthSession(sessionToken);
    req.user = await findUserByEmail(session.user.email);
    return next();
  }
  
  return res.status(401).json({ error: 'Unauthorized' });
};
```

### Phase 2: User Linking Logic

**Backend API Endpoint:** `POST /api/auth/link-oauth-user`

```javascript
// Link NextAuth OAuth user to backend user
router.post('/auth/link-oauth-user', async (req, res) => {
  const { email, name, image, provider, providerAccountId } = req.body;
  
  // Check if user exists in backend
  let user = await findUserByEmail(email);
  
  if (!user) {
    // Create new backend user for new OAuth user
    user = await createUser({
      email,
      first_name: extractFirstName(name),
      last_name: extractLastName(name),
      email_verified: true, // OAuth emails are verified
      credits: 3,
      subscription_tier: 'free',
      // Store OAuth provider info (optional)
      google_id: provider === 'google' ? providerAccountId : null
    });
  } else {
    // Update existing user with OAuth info
    await updateUser(user.id, {
      email_verified: true,
      // Update google_id if signing in with Google
      ...(provider === 'google' && { google_id: providerAccountId })
    });
  }
  
  return res.json({ 
    userId: user.id,
    linked: true 
  });
});
```

**Frontend Integration:** NextAuth.js callback

```typescript
// src/auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, { /* ... */ }),
  providers: [Google, GitHub, MicrosoftEntraId],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Call backend to link/create user
      const response = await fetch(`${BACKEND_API_URL}/api/auth/link-oauth-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          image: user.image,
          provider: account.provider,
          providerAccountId: account.providerAccountId
        })
      });
      
      if (!response.ok) {
        console.error('Failed to link OAuth user to backend');
        return false; // Prevent sign-in
      }
      
      return true; // Allow sign-in
    },
    
    async session({ session, user }) {
      // Fetch backend user data to include in session
      const backendUser = await fetch(`${BACKEND_API_URL}/api/users/by-email/${user.email}`);
      if (backendUser.ok) {
        const userData = await backendUser.json();
        session.user.backendId = userData.id;
        session.user.credits = userData.credits;
        session.user.subscriptionTier = userData.subscription_tier;
      }
      return session;
    }
  }
});
```

### Phase 3: Data Integrity Checks

**Validation Rules:**

1. **Email Uniqueness:**
   - NextAuth `user.email` must be unique
   - Backend `users.email` must be unique
   - One-to-one mapping enforced

2. **Orphan Prevention:**
   - Every NextAuth user must have corresponding backend user
   - signIn callback ensures backend user exists before allowing login

3. **Credits Preservation:**
   - Existing users keep their credits
   - New users get default 3 credits

4. **Resume Ownership:**
   - Resumes remain linked to backend `users.id`
   - API uses backend user ID for resume queries

## Edge Cases & Ad-Hoc Delegation

### Edge Case 1: Email Mismatch

**Scenario:** User signs in with OAuth email different from their original account

**Example:**
- Original account: `user@personal.com`
- OAuth sign-in: `user@company.com`

**Resolution:** Ad-hoc delegation to Manager Agent
- Manual user linking required
- Confirm user identity before merging accounts
- Preserve all data from original account

### Edge Case 2: Multiple OAuth Providers

**Scenario:** User signs in with Google, then later tries GitHub with same email

**Resolution:** Automatic handling
- NextAuth links multiple accounts to same `user.id`
- Backend user remains the same (matched by email)
- Multiple entries in `account` table, one `user` record

### Edge Case 3: Deleted Backend User, Active NextAuth Session

**Scenario:** Backend user deleted, but NextAuth session still active

**Resolution:**
- Backend API returns 404 for missing user
- Frontend detects and forces sign-out
- User must re-register (creates new account)

### Edge Case 4: Duplicate Emails Across Providers

**Scenario:** User has `user@gmail.com` in Google AND Microsoft OAuth

**Resolution:** Automatic handling
- NextAuth treats as same user (email match)
- Both OAuth accounts link to same NextAuth `user.id`
- Backend has one user record

### Edge Case 5: Email Change Request

**Scenario:** User wants to change their email address

**Resolution:** Ad-hoc delegation to Manager Agent
- Email is primary key for linking
- Requires coordinated update in both databases
- Must maintain referential integrity

## Testing Strategy

### Test Case 1: New User OAuth Sign-In
1. Sign in with Google (new email)
2. Verify NextAuth `user` created
3. Verify backend `users` created
4. Verify 3 credits assigned
5. Verify can generate resume

### Test Case 2: Existing User OAuth Sign-In
1. Create backend user manually (simulate existing user)
2. Sign in with OAuth using same email
3. Verify NextAuth `user` created
4. Verify linked to existing backend user
5. Verify credits preserved
6. Verify existing resumes accessible

### Test Case 3: Multiple Provider Linking
1. Sign in with Google
2. Sign out
3. Sign in with GitHub (same email)
4. Verify both accounts link to same `user.id`
5. Verify can sign in with either provider

### Test Case 4: Backend API Access
1. Sign in with OAuth
2. Generate resume
3. Verify API uses correct backend user ID
4. Verify credits deducted correctly

## Rollback Plan

If migration fails, revert to Vite app:

1. Keep Vite app running on port 5173 (don't delete)
2. Backend continues supporting JWT tokens
3. Users can access old app during migration
4. Gradual cutover approach

## Success Criteria

Migration is successful when:

- [ ] All existing users can sign in with OAuth
- [ ] No data loss (credits, resumes, profiles)
- [ ] New users can register via OAuth
- [ ] Backend API works with NextAuth sessions
- [ ] Zero duplicate users created
- [ ] Email uniqueness maintained across both systems

## Timeline

- **Task 2.3:** Create migration logic (current)
- **Task 2.4:** Update login UI with OAuth buttons
- **Task 2.5:** Implement session middleware
- **Task 2.6:** End-to-end testing with real OAuth credentials
- **Phase 3+:** Monitor for edge cases, handle via ad-hoc delegation

## Backend Changes Required

**Note:** These changes need to be made in the `resumancer-backend` repository:

1. Create NextAuth session validation middleware
2. Add `/api/auth/link-oauth-user` endpoint
3. Add `/api/users/by-email/:email` endpoint
4. Update auth middleware to support both JWT and NextAuth sessions
5. Update all API routes to work with both auth methods

These backend changes are **outside the scope of this frontend migration task** and should be coordinated separately with backend development.

## Conclusion

This strategy prioritizes **data preservation** and **backward compatibility** while transitioning to NextAuth.js OAuth-only authentication. The email-based linking approach ensures existing users don't lose their data, and edge cases are documented for ad-hoc Manager Agent delegation when needed.
