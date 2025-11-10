# Resumancer Enhancement Todos

This document outlines the planned enhancements for the Resumancer Next.js application, focusing on Sentry improvements, AI SDK integration, and backend/database additions.

## Phase 1: Enable Sentry Logging
- **Objective:** Configure Sentry to capture console logs and structured logging.
- **Files:** sentry.client.config.js, sentry.server.config.js
- **Steps:**
  1. Add consoleLoggingIntegration to both config files.
  2. Enable _experiments: { enableLogs: true }.

## Phase 2: Add Error Boundaries
- **Objective:** Implement React error boundaries to catch and report UI errors.
- **Files:** src/components/ErrorBoundary.tsx, src/app/layout.tsx
- **Steps:**
  1. Create ErrorBoundary component using Sentry.
  2. Wrap the app in layout.tsx.

## Phase 3: Implement Custom Spans for Key Actions
- **Objective:** Add performance tracing for important user interactions and API calls.
- **Files:** src/components/Navbar.tsx, src/app/api/resumes/route.ts
- **Steps:**
  1. Add spans for button clicks in Navbar.
  2. Add spans for API calls in resume routes.

## Phase 4: Configure Performance Monitoring
- **Objective:** Enable detailed performance tracking and release health.
- **Files:** sentry.client.config.js, sentry.server.config.js
- **Steps:**
  1. Adjust tracesSampleRate and add integrations.
  2. Configure release tracking.

## Phase 5: Test and Validate Enhancements
- **Objective:** Verify that logging, error boundaries, and tracing work correctly.
- **Files:** None
- **Steps:**
  1. Test error boundary with a thrown error.
  2. Check Sentry dashboard for logs and spans.
  3. Verify performance data is captured.

## Phase 6: Add Vercel AI SDK
- **Objective:** Integrate Vercel AI SDK for enhanced AI capabilities and streaming.
- **Files:** package.json, src/lib/ai.ts, .env.local, src/app/api/resumes/ai-suggestions/route.ts
- **Steps:**
  1. Install @vercel/ai package.
  2. Configure AI providers and API keys.
  3. Update resume AI endpoints to use the SDK.
  4. Add streaming support for better UX.

## Phase 7: Add New Backend/Database
- **Objective:** Set up a new backend service or database component for additional features.
- **Files:** (To be determined)
- **Steps:**
  1. Define requirements for the new backend/database.
  2. Choose technology stack.
  3. Implement the new component.
  4. Integrate with existing system.

## Open Questions
1. Which specific API routes and components should get custom spans?
2. Should we keep existing backend AI integrations or migrate to Vercel AI SDK?
3. Any specific performance metrics to prioritize?
4. How to integrate Vercel AI SDK with existing setup?
5. What specific backend/database feature is needed?