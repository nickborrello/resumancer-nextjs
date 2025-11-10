## Plan: Fix Black Fonts on Dark Backgrounds

This plan addresses the contrast issue where black fonts appear on dark backgrounds in the Resumancer app, caused by Tailwind CSS theme color classes not rendering correctly. We'll verify the Tailwind v4 configuration, replace problematic theme classes with standard Tailwind colors, and test the fixes to ensure proper readability in dark mode.

**Phases 4**
1. **Phase 1: Verify Tailwind v4 Configuration**
    - **Objective:** Confirm why `@theme inline` in tailwind.config.js isn't applying CSS variables, leading to default black text.
    - **Files/Functions to Modify/Create:** tailwind.config.js, src/index.css
    - **Tests to Write:** None (configuration verification)
    - **Steps:**
        1. Inspect browser dev tools to check if CSS variables like --foreground are applied.
        2. Verify Tailwind v4 installation and @import syntax.
        3. Test if @theme inline is supported or needs adjustment.

2. **Phase 2: Replace Theme Classes in UI Components**
    - **Objective:** Update Button, Card, Input, and other components to use standard Tailwind colors instead of theme classes.
    - **Files/Functions to Modify/Create:** src/components/ui/Button.tsx, src/components/ui/Card.tsx, src/components/ui/Input.tsx, src/components/ui/Label.tsx
    - **Tests to Write:** None (styling changes)
    - **Steps:**
        1. Replace `text-foreground` with `text-gray-100` or `text-white`.
        2. Replace `text-primary-foreground` with `text-white`.
        3. Replace `text-card-foreground` with `text-gray-100`.
        4. Ensure changes maintain the Amethyst theme where appropriate.

3. **Phase 3: Update Body and Inherited Text Colors**
    - **Objective:** Fix body text and inherited colors in pages/components to prevent black text on dark backgrounds.
    - **Files/Functions to Modify/Create:** src/index.css, src/components/Navbar.tsx, src/pages/Home.tsx
    - **Tests to Write:** None (styling changes)
    - **Steps:**
        1. Update @layer base in src/index.css to use explicit colors.
        2. Check and fix headings/paragraphs in pages that inherit from body.

4. **Phase 4: Test and Validate Contrast Fixes**
    - **Objective:** Run the app and verify that text is readable on dark backgrounds across components.
    - **Files/Functions to Modify/Create:** None (testing phase)
    - **Tests to Write:** None (manual verification)
    - **Steps:**
        1. Start the dev server and check key pages/components.
        2. Ensure no black text on dark backgrounds in Navbar, forms, cards, etc.

**Open Questions**
1. Should we keep forced dark mode or allow system preference? (Keep forced for now, as per current setup)
2. Any specific components/pages with persistent issues beyond the listed ones? (Based on research, these cover the main areas)
3. Do we need to update the resume preview styling? (No, as it's intentionally white background)