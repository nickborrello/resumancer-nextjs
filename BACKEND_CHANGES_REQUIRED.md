# Backend Changes Required for User Migration (Task 2.3)

## Overview

The Next.js frontend now has user linking callbacks that communicate with the backend during OAuth sign-in. The following endpoints and middleware changes are required in the **resumancer-backend** repository.

## Required Backend Changes

### 1. Create User Linking Endpoint

**File:** `src/routes/auth.js`

**Endpoint:** `POST /api/auth/link-oauth-user`

**Purpose:** Link NextAuth OAuth users to backend users by email, or create new users if they don't exist.

```javascript
// Link OAuth user to backend user (or create if new)
router.post('/auth/link-oauth-user', async (req, res, next) => {
  try {
    const { email, name, image, provider, providerAccountId } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists in backend
    let user = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (user.length === 0) {
      // Create new backend user for new OAuth user
      const [firstName, ...lastNameParts] = (name || '').split(' ');
      const lastName = lastNameParts.join(' ');

      const [newUser] = await db.insert(usersTable).values({
        email,
        first_name: firstName || null,
        last_name: lastName || null,
        email_verified: true, // OAuth emails are pre-verified
        credits: 3, // Default credits for new users
        subscription_tier: 'free',
        // Store provider info if applicable
        google_id: provider === 'google' ? providerAccountId : null,
      }).returning();

      user = newUser;
      
      res.status(201).json({
        userId: newUser.id,
        linked: true,
        created: true,
        message: 'New user created'
      });
    } else {
      // Update existing user with OAuth info
      const existingUser = user[0];
      
      const updates = {
        email_verified: true,
        last_login: new Date(),
      };

      // Update google_id if signing in with Google
      if (provider === 'google' && !existingUser.google_id) {
        updates.google_id = providerAccountId;
      }

      await db.update(usersTable)
        .set(updates)
        .where(eq(usersTable.id, existingUser.id));

      res.json({
        userId: existingUser.id,
        linked: true,
        created: false,
        message: 'Existing user linked to OAuth'
      });
    }
  } catch (error) {
    console.error('Error linking OAuth user:', error);
    next(error);
  }
});
```

### 2. Create User Lookup by Email Endpoint

**File:** `src/routes/users.js` (or `src/routes/auth.js`)

**Endpoint:** `GET /api/users/by-email/:email`

**Purpose:** Retrieve backend user data by email for session enhancement.

```javascript
// Get user by email (for NextAuth session callback)
router.get('/users/by-email/:email', async (req, res, next) => {
  try {
    const { email } = req.params;

    const [user] = await db.select({
      id: usersTable.id,
      email: usersTable.email,
      first_name: usersTable.first_name,
      last_name: usersTable.last_name,
      credits: usersTable.credits,
      subscription_tier: usersTable.subscription_tier,
      email_verified: usersTable.email_verified,
      created_at: usersTable.created_at,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user by email:', error);
    next(error);
  }
});
```

### 3. Update Authentication Middleware (Dual Auth Support)

**File:** `src/middleware/auth.js`

**Purpose:** Support both legacy JWT tokens and new NextAuth sessions.

```javascript
import jwt from 'jsonwebtoken';
import { db } from '../database/db.js';
import { usersTable } from '../database/schema.js';
import { eq } from 'drizzle-orm';

export const authMiddleware = async (req, res, next) => {
  try {
    // Check for JWT token (legacy Vite app auth)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [user] = await db.select()
          .from(usersTable)
          .where(eq(usersTable.id, decoded.userId))
          .limit(1);
        
        if (user) {
          req.user = user;
          return next();
        }
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError);
      }
    }

    // Check for NextAuth session (new OAuth auth)
    // NextAuth doesn't send session token in headers by default,
    // but we can validate based on user email from request body
    // or implement a custom header-based approach
    
    // For now, if no valid JWT, return 401
    // In production, implement NextAuth session validation
    // using session token from cookies or custom header
    
    return res.status(401).json({ error: 'Unauthorized' });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};
```

### 4. CORS Configuration Update

**File:** `src/server.js`

**Purpose:** Allow NextAuth callbacks from Next.js app on port 3001.

```javascript
import cors from 'cors';

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173', // Vite app (legacy)
    'http://localhost:3001', // Next.js app (new)
    process.env.FRONTEND_URL, // Production frontend
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
```

## Environment Variables to Add

**File:** `.env` in resumancer-backend

```env
# Frontend URLs for CORS
FRONTEND_URL=https://your-production-frontend.vercel.app
NEXTJS_DEV_URL=http://localhost:3001
VITE_DEV_URL=http://localhost:5173
```

## Testing the Integration

### Test 1: New OAuth User Creation
```bash
# From Next.js frontend, trigger OAuth sign-in
# Backend should receive POST /api/auth/link-oauth-user
# Backend should create new user with credits=3

curl -X POST http://localhost:3000/api/auth/link-oauth-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "name": "New User",
    "image": "https://example.com/avatar.jpg",
    "provider": "google",
    "providerAccountId": "12345"
  }'

# Expected: 201 Created, userId returned
```

### Test 2: Existing User Linking
```bash
# Create existing user first in backend
# Then trigger OAuth with same email
# Backend should link OAuth to existing user

curl -X POST http://localhost:3000/api/auth/link-oauth-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@example.com",
    "name": "Existing User",
    "provider": "google",
    "providerAccountId": "67890"
  }'

# Expected: 200 OK, existing userId returned, credits preserved
```

### Test 3: User Lookup by Email
```bash
curl http://localhost:3000/api/users/by-email/user@example.com

# Expected: User object with credits, subscription_tier, etc.
```

## Migration Timeline

1. **Phase 1:** Implement backend endpoints (link-oauth-user, by-email)
2. **Phase 2:** Update CORS to allow Next.js app
3. **Phase 3:** Deploy backend changes to Railway
4. **Phase 4:** Test with Next.js frontend Task 2.6
5. **Phase 5:** Monitor for edge cases, handle via ad-hoc delegation

## Database Migrations

The backend database does NOT need new tables. The existing `users` table will be used to store user data, linked to NextAuth users by email.

**Existing tables that will be used:**
- `users` - Main user accounts
- `profiles` - User profile data
- `experiences` - Work experience
- `education` - Education history
- `projects` - Projects
- `skills` - Skills
- `resumes` - Generated resumes
- `credit_transactions` - Credit purchase history

All of these remain unchanged and will continue to work with the `users.id` foreign key.

## Security Considerations

1. **Email Verification:** OAuth providers verify emails, so `email_verified` is set to `true` automatically
2. **Rate Limiting:** Consider adding rate limits to `/api/auth/link-oauth-user` to prevent abuse
3. **Input Validation:** Validate email format, name length, provider values
4. **Error Handling:** Don't expose sensitive error details to frontend
5. **Logging:** Log all user creation/linking events for audit trail

## Rollback Plan

If OAuth migration causes issues:

1. Backend continues supporting JWT tokens (unchanged)
2. Users can still access Vite app on port 5173
3. New users via OAuth are isolated (won't affect existing users)
4. Can disable OAuth endpoints if needed without affecting legacy auth

## Success Criteria

Backend integration is successful when:

- [ ] `/api/auth/link-oauth-user` endpoint working
- [ ] `/api/users/by-email/:email` endpoint working
- [ ] New OAuth users created with 3 credits
- [ ] Existing users linked by email without data loss
- [ ] CORS allows Next.js app requests
- [ ] Both JWT and OAuth users can access API endpoints

## Questions & Issues

For any issues or edge cases during backend implementation, coordinate with Frontend Team (Next.js migration) to ensure proper integration.

**Frontend Contact:** NextAuth.js implementation in `resumancer-nextjs/src/auth.ts`  
**Backend Files:** `resumancer-backend/src/routes/auth.js`, `src/middleware/auth.js`
