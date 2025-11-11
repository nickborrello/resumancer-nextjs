## Plan: Upgrade AI Feature to Agentic Co-Pilot

Convert the existing "suggestions" endpoint into a full agentic co-pilot that uses tools to apply edits directly to a text editor on the frontend. This involves upgrading to Vercel AI SDK v6 with OpenRouter provider, implementing tool-based interactions, and creating a React component for real-time editing with user-approved suggestions.

**Phases 4**
1. **Phase 1: Install Dependencies and Research Latest APIs**
    - **Objective:** Set up the latest Vercel AI SDK v6, OpenRouter provider, and Zod for tool schemas.
    - **Files/Functions to Modify/Create:** package.json, install scripts.
    - **Tests to Write:** None (dependency installation).
    - **Steps:**
        1. Install ai@latest, @ai-sdk/react@latest, @openrouter/ai-sdk-provider@latest, zod@latest.
        2. Verify compatibility with Next.js 16 and TypeScript 5+.
        3. Research streamText API, tool definitions, and useChat onToolCall handler.

2. **Phase 2: Implement Backend Agentic API Route**
    - **Objective:** Upgrade src/app/api/resumes/ai-suggestions/route.ts to use streamText with OpenRouter and define applyResumeEdit tool with section, entityId, originalText, newText schema.
    - **Files/Functions to Modify/Create:** src/app/api/resumes/ai-suggestions/route.ts
    - **Tests to Write:** Unit tests for tool execution, integration tests for streamText response.
    - **Steps:**
        1. Import openrouter from @openrouter/ai-sdk-provider and streamText, tool from ai.
        2. Define applyResumeEdit tool with zod schema: section enum, entityId optional, originalText, newText.
        3. Update POST handler to use streamText with OpenRouter model and tools.
        4. Configure streaming response compatible with useChat.
        5. Handle authentication and resume data fetching.

3. **Phase 3: Implement Frontend Agentic Editor Component**
    - **Objective:** Create src/components/resume-editor/MyEditor.tsx using useChat hook to handle tool calls as suggestions, not auto-apply.
    - **Files/Functions to Modify/Create:** src/components/resume-editor/MyEditor.tsx
    - **Tests to Write:** Component tests for useChat integration, tool call handling, suggestions state.
    - **Steps:**
        1. Create 'use client' component with useState for editor text and suggestions array.
        2. Initialize useChat with API route, onToolCall to add to suggestions, onError for fallbacks.
        3. Render chat messages with plain text and tool call buttons.
        4. Implement handleApplySuggestion to verify and apply changes to editor state.
        5. Handle conflicts by checking if originalText still exists.

4. **Phase 4: Test Integration and Error Handling**
    - **Objective:** Ensure the agentic co-pilot works end-to-end with proper error handling.
    - **Files/Functions to Modify/Create:** Integration tests, error handling in components.
    - **Tests to Write:** E2E tests for chat flow, tool calls, apply suggestions.
    - **Steps:**
        1. Test tool calls populate suggestions list.
        2. Test applying suggestions updates editor state correctly.
        3. Test fallback to plain text messages.
        4. Test error handling for API failures and invalid suggestions.

**Open Questions**
1. What specific sections should be in the enum? (summary, experience, education, skills, projects)
2. How to structure the resume data in the frontend state? (JSON with sections and entities)
3. Should the chat persist across sessions or be per-resume?</content>
<parameter name="filePath">plans/upgrade-ai-feature-agentic-copilot-plan.md