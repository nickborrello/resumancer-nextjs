# Phase 6: Backend Integration & Production Readiness

## Overview
**Goal:** Connect the frontend to the Railway backend, implement PDF generation, add AI-powered resume suggestions, complete OAuth testing, and deploy to production.

**Status:** Ready to begin  
**Estimated Duration:** 2-3 weeks  
**Priority:** HIGH (core functionality depends on backend integration)

---

## Prerequisites Completed ✅
- ✅ Phase 5: Resume editor with live preview and auto-save
- ✅ LocalStorage persistence for drafts
- ✅ Production build verified (BUILD_ID: WEx36VUarvCpjENGDsR7O)
- ✅ All TypeScript errors resolved
- ✅ 12 routes compiled successfully

---

## Phase 6 Tasks

### Task 6.1: Backend API Integration (HIGH PRIORITY)
**Objective:** Connect frontend to Railway backend for resume CRUD operations

**Files to Modify:**
- `src/components/resume-editor/ResumeEditorClient.tsx`
- `src/services/api.js` (or create new API service)
- `.env.local` (add BACKEND_API_URL)

**Changes Required:**

1. **Environment Configuration:**
   ```bash
   # .env.local
   # Use existing Railway backend from Vite app:
   NEXT_PUBLIC_BACKEND_API_URL=https://resumancer-backend-dev.up.railway.app
   # or http://localhost:3000 for local development
   ```

2. **Replace LocalStorage with API Calls:**
   ```typescript
   // Current: localStorage.setItem(`resume-draft-${resumeId}`, JSON.stringify(data))
   // Replace with:
   const saveResume = async (data: ResumeFormData) => {
     const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/resumes/${resumeId}`, {
       method: 'PUT',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(data),
     });
     return response.json();
   };
   ```

3. **Load Resume from Backend:**
   ```typescript
   useEffect(() => {
     const loadResume = async () => {
       const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/resumes/${resumeId}`);
       const data = await response.json();
       form.reset(data);
     };
     loadResume();
   }, [resumeId]);
   ```

4. **Keep LocalStorage as Backup:**
   - Save to localStorage AND backend (optimistic update)
   - Load from backend first, fallback to localStorage if offline
   - Clear localStorage draft after successful backend save

**Testing:**
- [ ] Verify resume saves to backend
- [ ] Verify resume loads from backend on page refresh
- [ ] Test offline behavior (localStorage fallback)
- [ ] Test error handling (network failures)

---

### Task 6.2: PDF Generation with @react-pdf/renderer (HIGH PRIORITY)
**Objective:** Implement actual PDF download functionality

**Dependencies:**
```bash
npm install @react-pdf/renderer file-saver
```

**Files to Create:**
- `src/components/resume-pdf/ResumePDFDocument.tsx` - PDF template
- `src/components/resume-pdf/generatePDF.ts` - PDF generation logic

**Implementation:**

1. **Create PDF Document Component:**
   ```typescript
   import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

   export default function ResumePDFDocument({ data }: { data: ResumeFormData }) {
     return (
       <Document>
         <Page size="A4" style={styles.page}>
           {/* Header with contact info */}
           <View style={styles.header}>
             <Text style={styles.name}>{data.personalInfo.firstName} {data.personalInfo.lastName}</Text>
             <Text>{data.personalInfo.email}</Text>
           </View>

           {/* Professional Summary */}
           <View style={styles.section}>
             <Text style={styles.sectionTitle}>Professional Summary</Text>
             <Text>{data.professionalSummary}</Text>
           </View>

           {/* Experience */}
           {data.experience.map((exp, idx) => (
             <View key={idx} style={styles.experienceItem}>
               <Text style={styles.jobTitle}>{exp.jobTitle}</Text>
               <Text>{exp.company}</Text>
               {/* Bullet points */}
             </View>
           ))}

           {/* Projects, Education, Skills sections */}
         </Page>
       </Document>
     );
   }
   ```

2. **PDF Generation Function:**
   ```typescript
   import { pdf } from '@react-pdf/renderer';
   import { saveAs } from 'file-saver';

   export async function generateAndDownloadPDF(data: ResumeFormData) {
     const blob = await pdf(<ResumePDFDocument data={data} />).toBlob();
     saveAs(blob, `${data.personalInfo.firstName}_Resume.pdf`);
   }
   ```

3. **Update Download Button:**
   ```typescript
   const handleDownloadPDF = async () => {
     const formData = form.getValues();
     await generateAndDownloadPDF(formData);
     // Show success toast
   };
   ```

**Testing:**
- [ ] PDF downloads successfully
- [ ] All sections render correctly
- [ ] Formatting looks professional (fonts, spacing, alignment)
- [ ] Test with different data (empty fields, long text, etc.)

---

### Task 6.3: AI-Powered Resume Suggestions (MEDIUM PRIORITY)
**Objective:** Add AI suggestions panel for resume improvements

**Backend Endpoint Required:**
```
POST /api/resumes/ai-suggestions
Body: { resumeData: ResumeFormData, section: 'experience' | 'projects' | 'summary' }
Response: { suggestions: string[], improvedContent: string }
```

**Files to Create:**
- `src/components/resume-editor/AISuggestionsPanel.tsx`

**Implementation:**

1. **Add AI Panel Toggle:**
   ```typescript
   const [showAISuggestions, setShowAISuggestions] = useState(false);
   ```

2. **Fetch Suggestions:**
   ```typescript
   const getAISuggestions = async (section: string) => {
     const formData = form.getValues();
     const response = await fetch('/api/resumes/ai-suggestions', {
       method: 'POST',
       body: JSON.stringify({ resumeData: formData, section }),
     });
     const { suggestions } = await response.json();
     return suggestions;
   };
   ```

3. **UI Integration:**
   - Add "✨ Get AI Suggestions" button to each section
   - Display suggestions in a sidebar or modal
   - "Apply Suggestion" button to update form field

**Testing:**
- [ ] AI suggestions load for each section
- [ ] Suggestions are relevant and helpful
- [ ] Apply button correctly updates form
- [ ] Loading states work properly

---

### Task 6.4: Complete OAuth Testing (HIGH PRIORITY)
**Objective:** Test OAuth login with real Google/GitHub/Discord credentials

**Testing Checklist:**
- [ ] **Google OAuth:**
  - Create test Google account (or use personal)
  - Test login flow
  - Verify user created in database
  - Check session persists across page refreshes
  - Test logout

- [ ] **GitHub OAuth:**
  - Test with GitHub account
  - Verify avatar image loads
  - Check profile data imports correctly

- [ ] **Discord OAuth:**
  - Test with Discord account
  - Verify all user data syncs

**Expected Issues:**
- Image loading from external OAuth providers (may need `next.config.ts` update)
- Session refresh timing
- Logout redirect

**Fixes:**
```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' }, // GitHub
      { protocol: 'https', hostname: 'cdn.discordapp.com' }, // Discord
    ],
  },
};
```

---

### Task 6.5: Stripe Integration for Credit Purchases (MEDIUM PRIORITY)
**Objective:** Enable users to purchase credits

**Backend Endpoints Required:**
```
POST /api/stripe/create-checkout-session
Body: { packageId: 'basic' | 'pro' | 'enterprise' }
Response: { sessionId: string }

POST /api/stripe/webhook
Body: Stripe webhook event
Response: 200 OK
```

**Files to Modify:**
- `src/app/credits/page.tsx` - Enable purchase buttons

**Implementation:**

1. **Install Stripe:**
   ```bash
   npm install @stripe/stripe-js
   ```

2. **Create Checkout Session:**
   ```typescript
   import { loadStripe } from '@stripe/stripe-js';

   const handlePurchase = async (packageId: string) => {
     const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
     const response = await fetch('/api/stripe/create-checkout-session', {
       method: 'POST',
       body: JSON.stringify({ packageId }),
     });
     const { sessionId } = await response.json();
     await stripe?.redirectToCheckout({ sessionId });
   };
   ```

3. **Success Page:**
   - Create `/credits/success` route
   - Display transaction details
   - Update user credits in UI

**Testing:**
- [ ] Test mode payments work (Stripe test cards)
- [ ] Credits update after successful payment
- [ ] Transaction history shows purchase
- [ ] Webhook receives payment confirmation

---

### Task 6.6: E2E Testing with Playwright (LOW PRIORITY)
**Objective:** Add automated end-to-end tests

**Installation:**
```bash
npm install -D @playwright/test
npx playwright install
```

**Test Scenarios:**
1. **Authentication Flow:**
   - Login with Google OAuth
   - Navigate to dashboard
   - Logout

2. **Resume Creation Flow:**
   - Navigate to builder
   - Fill in form fields
   - Save resume
   - Download PDF

3. **Credit Purchase Flow:**
   - Navigate to credits page
   - Select package
   - Complete payment (test mode)
   - Verify credits updated

**Files to Create:**
- `tests/auth.spec.ts`
- `tests/resume-builder.spec.ts`
- `tests/credits.spec.ts`

---

### Task 6.7: Production Deployment to Vercel (HIGH PRIORITY)
**Objective:** Deploy application to production

**Steps:**

1. **Environment Variables (Vercel Dashboard):**
   ```
   NEXTAUTH_URL=https://resumancer.vercel.app
   NEXTAUTH_SECRET=<production-secret>
   GOOGLE_ID=<production-google-client-id>
   GOOGLE_SECRET=<production-google-secret>
   GITHUB_ID=<production-github-client-id>
   GITHUB_SECRET=<production-github-secret>
   DATABASE_URL=<railway-production-postgres-url>
   NEXT_PUBLIC_BACKEND_API_URL=https://resumancer-backend.railway.app
   STRIPE_PUBLISHABLE_KEY=<stripe-live-key>
   STRIPE_SECRET_KEY=<stripe-live-secret>
   ```

2. **Connect Git Repository:**
   - Link Vercel to GitHub repo
   - Enable automatic deployments from `main` branch

3. **Database Migration:**
   ```bash
   # Connect to Railway production database
   DATABASE_URL=<production-url> npx prisma migrate deploy
   ```

4. **DNS Configuration:**
   - Add custom domain (e.g., resumancer.com)
   - Configure SSL/TLS

5. **Verify Deployment:**
   - Test all OAuth providers
   - Test resume creation flow
   - Test PDF generation
   - Test credit purchases

---

## Success Criteria

### Phase 6 Complete When:
- ✅ All resume data saves to and loads from Railway backend
- ✅ PDF generation works in production
- ✅ OAuth login tested with all providers
- ✅ Stripe integration functional (test mode minimum)
- ✅ Application deployed to Vercel
- ✅ All features work in production environment

---

## Timeline Estimate

**Week 1:**
- Task 6.1: Backend API Integration (2-3 days)
- Task 6.2: PDF Generation (2-3 days)
- Task 6.4: OAuth Testing (1 day)

**Week 2:**
- Task 6.3: AI Suggestions (2-3 days)
- Task 6.5: Stripe Integration (2-3 days)

**Week 3:**
- Task 6.6: E2E Testing (optional, 1-2 days)
- Task 6.7: Production Deployment (1-2 days)
- Final testing and bug fixes

---

## Risk Mitigation

**Potential Issues:**
1. **Backend API Downtime:**
   - Mitigation: Keep localStorage fallback
   - Implement offline mode detection

2. **PDF Generation Performance:**
   - Mitigation: Generate PDF server-side if slow on client
   - Add loading indicators

3. **Stripe Webhook Failures:**
   - Mitigation: Implement retry logic
   - Manual credit reconciliation tool

4. **OAuth Image Loading:**
   - Mitigation: Add fallback avatar generation
   - Update next.config.ts remotePatterns

---

## Next Immediate Actions

1. **Set up Railway backend connection:**
   - Add BACKEND_API_URL to .env.local
   - Test connectivity

2. **Start with Task 6.1 (Backend Integration):**
   - Replace localStorage with API calls
   - Keep localStorage as backup
   - Test save/load functionality

3. **Proceed to Task 6.2 (PDF Generation):**
   - Install @react-pdf/renderer
   - Create basic PDF template
   - Implement download button

---

**Ready to begin Phase 6!** 🚀
