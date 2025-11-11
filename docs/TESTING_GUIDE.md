# Testing Guide - Resumancer Next.js App

## 🚀 What's Ready to Test

### ✅ Fully Implemented Features

1. **Authentication System**
   - OAuth login with Google/GitHub/Discord
   - Session management
   - Protected routes

2. **Core Navigation**
   - Responsive Navbar with user avatar
   - Mobile menu support
   - Credits badge display

3. **Pages**
   - Home/Landing page with hero section
   - Dashboard page
   - Profile page with forms
   - Credits page with packages
   - Resumes page (empty state)
   - Resume Builder page
   - Resume Editor placeholder

4. **Resume Builder Flow**
   - Job description input (10,000 char limit)
   - Character counter with warnings
   - AI generation button (requires 1 credit)
   - Demo generation button (free)
   - Loading overlay
   - Toast notifications
   - API integration

5. **API Routes**
   - `POST /api/resumes/generate` - AI generation
   - `POST /api/resumes/generate-demo` - Demo generation

---

## 🧪 Test Scenarios

### Test 1: OAuth Login Flow
**Prerequisites:** OAuth credentials configured in `.env.local`

1. Navigate to `http://localhost:3001`
2. Click "Get Started" or "Sign In"
3. Choose OAuth provider (Google/GitHub/Discord)
4. Complete OAuth flow
5. **Expected:** Redirect to dashboard with user info in navbar

**Status:** ⏳ Requires OAuth credentials

---

### Test 2: Resume Builder - Demo Mode (No Credits Required)
**Prerequisites:** Logged in

1. Navigate to `/builder`
2. Click "Try Demo (Free)" button (no job description needed)
3. **Expected:** 
   - Loading overlay appears
   - "Generating Demo Resume..." message
   - API call to `/api/resumes/generate-demo`
   - Success toast: "Demo resume generated successfully!"
   - Auto-redirect to `/resume/editor/demo_[timestamp]`
   - Editor placeholder page loads

**Status:** ✅ Ready to test (works without OAuth if you mock session)

---

### Test 3: Resume Builder - AI Mode (Requires Credits)
**Prerequisites:** Logged in, credits > 0

1. Navigate to `/builder`
2. Paste job description in textarea
3. Observe character counter updates
4. Click "Generate AI Resume"
5. **Expected:**
   - Loading overlay appears
   - API call to `/api/resumes/generate`
   - Credits checked (must have ≥1)
   - Success toast: "Resume generated successfully!"
   - Credits deducted (shown in toast)
   - Auto-redirect to `/resume/editor/resume_[timestamp]`

**Status:** ✅ Ready to test

---

### Test 4: Credit Validation
**Prerequisites:** Logged in with 0 credits

1. Navigate to `/builder`
2. Paste job description
3. **Expected:**
   - AI button shows "No Credits Available" (disabled)
   - Warning message: "You need credits to generate AI resumes"
   - Link to credits page
4. Try clicking AI button: Should be disabled
5. Click "Try Demo (Free)" button
6. **Expected:** Works without credits

**Status:** ✅ Ready to test

---

### Test 5: Character Limit Validation
**Prerequisites:** Logged in

1. Navigate to `/builder`
2. Paste short text (< 8,000 chars)
   - **Expected:** Counter green, "X / 10,000 characters"
3. Paste long text (8,001-10,000 chars)
   - **Expected:** Counter orange, "⚠️ Getting close to limit"
4. Paste too long text (> 10,000 chars)
   - **Expected:** Counter red, "❌ Too long - please shorten"
   - AI button disabled
   - Error toast on submit

**Status:** ✅ Ready to test

---

### Test 6: API Error Handling
**Prerequisites:** Logged in

1. Test insufficient credits:
   - Mock credits = 0
   - Try AI generation
   - **Expected:** 402 error, orange toast with credit purchase link

2. Test validation error:
   - Empty job description
   - Click AI button
   - **Expected:** Error toast "Please paste a job description first"

3. Test unauthorized:
   - Log out
   - Try direct API call
   - **Expected:** 401 error

**Status:** ✅ Ready to test

---

### Test 7: Navigation Flow
**Prerequisites:** Logged in

1. From home → Click navbar "Resume Builder"
2. From builder → Generate demo → Redirects to editor
3. From editor → Click "Back to Builder"
4. From editor → Click "View All Resumes"
5. From any page → Click navbar items

**Expected:** All navigation works smoothly

**Status:** ✅ Ready to test

---

### Test 8: Responsive Design
**Prerequisites:** Any page

1. Desktop view (1920x1080)
   - **Expected:** Full navbar, side-by-side buttons
2. Tablet view (768px)
   - **Expected:** Compressed navbar, stacked buttons
3. Mobile view (375px)
   - **Expected:** Hamburger menu, vertical layout

**Status:** ✅ Ready to test

---

## 🛠️ Manual Testing Setup

### Option 1: With OAuth (Full Experience)
```bash
# 1. Configure OAuth credentials
cp .env.example .env.local
# Edit .env.local with your OAuth app credentials

# 2. Start dev server
npm run dev

# 3. Visit http://localhost:3001
# 4. Complete OAuth login
# 5. Test all features
```

### Option 2: Without OAuth (Mock Session)
```typescript
// Temporarily modify src/app/builder/page.tsx for testing
export default async function ResumeBuilderPage() {
  // Comment out auth check for testing
  // const session = await auth();
  // if (!session) redirect('/');
  
  // Mock session
  const mockCredits = 5;
  
  return (
    <>
      <Navbar />
      <div className="...">
        <ResumeBuilderClient credits={mockCredits} />
      </div>
    </>
  );
}
```

---

## 🔍 API Testing (Using Thunder Client or Postman)

### Test API Route Directly

#### 1. Generate Demo Resume
```http
POST http://localhost:3001/api/resumes/generate-demo
Content-Type: application/json

{
  "jobDescription": "Optional job description"
}
```

**Expected Response:**
```json
{
  "resumeId": "demo_1234567890",
  "resume": {
    "personalInfo": { ... },
    "professionalSummary": "...",
    "experiences": [...],
    "education": [...],
    "projects": [...],
    "skills": [...]
  },
  "message": "Demo resume generated successfully! This is a free preview."
}
```

#### 2. Generate AI Resume
```http
POST http://localhost:3001/api/resumes/generate
Content-Type: application/json

{
  "jobDescription": "Software Engineer at TechCorp..."
}
```

**Expected Response (if credits available):**
```json
{
  "resumeId": "resume_1234567890",
  "resume": { ... },
  "message": "Resume generated successfully!",
  "creditsRemaining": 4
}
```

**Expected Response (no credits):**
```json
{
  "error": "Insufficient credits",
  "message": "You need at least 1 credit to generate a resume."
}
```

---

## ✅ Verification Checklist

### Before Testing
- [ ] Dependencies installed: `npm install`
- [ ] Environment variables configured (`.env.local`)
- [ ] Dev server running: `npm run dev`
- [ ] TypeScript compiles: `npm run type-check` (no errors)
- [ ] ESLint passes: `npm run lint` (no errors)

### During Testing
- [ ] OAuth login works (if configured)
- [ ] Navbar shows user info and credits
- [ ] Builder page loads with credits display
- [ ] Character counter updates live
- [ ] Demo generation works (free)
- [ ] AI generation validates credits
- [ ] Loading overlay shows during generation
- [ ] Success toast appears after generation
- [ ] Auto-redirect to editor works
- [ ] Editor placeholder loads with resumeId
- [ ] Error handling works (no credits, validation)
- [ ] Mobile responsive design works

### After Testing
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Performance acceptable (< 3s load time)
- [ ] UX smooth (animations, transitions)

---

## 🐛 Known Limitations (Expected)

1. **Editor is Placeholder:** Full editor not yet implemented
2. **Mock Resume Data:** API returns hardcoded data (no OpenAI)
3. **No Database:** Resume not saved to database
4. **Credits Not Deducted:** Session credits don't actually change
5. **No PDF Generation:** Download functionality not implemented

These are **expected** and will be implemented in remaining Phase 5 work.

---

## 📊 Expected API Responses

### Success Responses

#### Demo Generation Success
```json
{
  "resumeId": "demo_1699564800000",
  "resume": {
    "personalInfo": {
      "fullName": "Demo User",
      "email": "demo@example.com",
      "phone": "+1 (555) 000-0000",
      "location": "Demo City, State"
    },
    "professionalSummary": "This is a demo resume...",
    "experiences": [
      {
        "id": "1",
        "company": "Demo Company Inc.",
        "position": "Software Engineer",
        "startDate": "2020-01",
        "endDate": "2024-12",
        "current": true,
        "description": ["Demo achievement 1", "Demo achievement 2"]
      }
    ],
    "education": [...],
    "projects": [...],
    "skills": [...]
  },
  "message": "Demo resume generated successfully! This is a free preview."
}
```

#### AI Generation Success
```json
{
  "resumeId": "resume_1699564800000",
  "resume": { /* similar structure */ },
  "message": "Resume generated successfully!",
  "creditsRemaining": 4
}
```

### Error Responses

#### Unauthorized (401)
```json
{
  "error": "Unauthorized"
}
```

#### Insufficient Credits (402)
```json
{
  "error": "Insufficient credits",
  "message": "You need at least 1 credit to generate a resume."
}
```

#### Validation Error (400)
```json
{
  "error": "Job description is required"
}
```

#### Server Error (500)
```json
{
  "error": "Failed to generate resume"
}
```

---

## 🎯 Testing Priority

### High Priority (Test First)
1. ✅ Demo generation (easiest, no dependencies)
2. ✅ Character counter and validation
3. ✅ API error responses
4. ✅ Navigation and routing

### Medium Priority
5. Credit validation logic
6. Loading states and animations
7. Toast notifications
8. Responsive design

### Low Priority (Optional)
9. OAuth login (requires credentials)
10. Performance testing
11. Edge cases

---

## 🚀 Quick Test Commands

```bash
# Run all checks
npm run type-check && npm run lint && npm run dev

# Check API route
curl -X POST http://localhost:3001/api/resumes/generate-demo \
  -H "Content-Type: application/json" \
  -d '{"jobDescription": "test"}'

# Check compilation
npm run build
```

---

## 📝 Test Results Template

```markdown
## Test Results - [Date]

### Environment
- Browser: Chrome/Firefox/Safari
- Node: v20.x
- Next.js: 16.0.1

### Test Scenarios
- [ ] OAuth Login: PASS/FAIL/SKIP
- [ ] Demo Generation: PASS/FAIL
- [ ] AI Generation: PASS/FAIL
- [ ] Credit Validation: PASS/FAIL
- [ ] Character Limit: PASS/FAIL
- [ ] Error Handling: PASS/FAIL
- [ ] Navigation: PASS/FAIL
- [ ] Responsive Design: PASS/FAIL

### Issues Found
1. [Description]
2. [Description]

### Notes
[Additional observations]
```

---

**Status:** All features ready for testing! 🎉

**Next Steps:**
1. Start dev server: `npm run dev`
2. Navigate to builder: `/builder`
3. Click "Try Demo (Free)"
4. Verify complete flow works

**Ready to test!** 🚀
