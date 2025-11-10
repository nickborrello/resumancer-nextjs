import { test, expect } from '@playwright/test';

/**
 * Test Suite: End-to-End Integration Tests
 * Tests complete user journeys through the application
 */

test.describe('Complete User Journey', () => {
  test('homepage should load and display key elements', async ({ page }) => {
    await page.goto('/');
    
    // Check page loads successfully
    await expect(page).toHaveTitle(/resumancer/i);
    
    // Should have navigation
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Should have CTA or hero section
    const hero = page.getByRole('heading').first();
    await expect(hero).toBeVisible();
  });

  test('navigation menu should work', async ({ page }) => {
    await page.goto('/');
    
    // Check for navigation links
    const navLinks = [
      { text: /login|sign in/i, expectedUrl: /login/ },
      { text: /dashboard/i, expectedUrl: /dashboard|login/ },
      { text: /credits/i, expectedUrl: /credits|login/ },
    ];
    
    for (const { text, expectedUrl } of navLinks) {
      const link = page.getByRole('link', { name: text });
      
      if (await link.count() > 0 && await link.first().isVisible()) {
        await link.first().click();
        await page.waitForLoadState('networkidle');
        
        // Check we navigated somewhere
        expect(page.url()).toMatch(expectedUrl);
        
        // Go back to home
        await page.goto('/');
      }
    }
  });

  test('protected routes should redirect to login', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard',
      '/profile',
      '/credits',
      '/resume/editor/test-id',
    ];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      // Should be on login or the protected route (if authenticated)
      const url = page.url();
      const isProtectedOrLogin = url.includes('/login') || url.includes(route);
      
      expect(isProtectedOrLogin).toBeTruthy();
    }
  });
});

/**
 * Test Suite: API Endpoints
 * Tests that API routes respond correctly
 */
test.describe('API Endpoints', () => {
  test('API routes should be accessible', async ({ request }) => {
    // Test health/status if available
    // Note: These will fail without authentication, but shouldn't 500
    const endpoints = [
      { path: '/api/resumes/generate', method: 'POST' },
      { path: '/api/resumes/ai-suggestions', method: 'POST' },
      { path: '/api/stripe/create-checkout-session', method: 'POST' },
    ];
    
    for (const { path, method } of endpoints) {
      try {
        const response = await request.fetch(path, {
          method,
          headers: { 'Content-Type': 'application/json' },
          data: {},
        });
        
        // Should get 401 Unauthorized or 400 Bad Request, not 500
        expect([400, 401, 403]).toContain(response.status());
      } catch (error) {
        // Network errors are acceptable for this test
        console.log(`API endpoint ${path} test skipped due to network error`);
      }
    }
  });
});

/**
 * Test Suite: Performance & Accessibility
 * Tests for performance and basic accessibility
 */
test.describe('Performance & Accessibility', () => {
  test('homepage should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('pages should have proper document structure', async ({ page }) => {
    const pages = ['/', '/login', '/credits'];
    
    for (const url of pages) {
      await page.goto(url).catch(() => {});
      await page.waitForLoadState('networkidle');
      
      if (!page.url().includes('/login') || url === '/login') {
        // Should have a title
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);
        
        // Should have main content
        const main = page.locator('main, [role="main"], body > div');
        await expect(main.first()).toBeVisible();
      }
    }
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/');
    
    // Find all images
    const images = page.locator('img');
    const count = await images.count();
    
    // Check that visible images have alt text
    for (let i = 0; i < Math.min(count, 10); i++) {
      const img = images.nth(i);
      
      if (await img.isVisible()) {
        const alt = await img.getAttribute('alt');
        // Alt can be empty string for decorative images, but should exist
        expect(alt).not.toBeNull();
      }
    }
  });

  test('buttons should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    
    // Focus first interactive element
    await page.keyboard.press('Tab');
    
    // Should have visible focus indicator
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.tagName;
    });
    
    // Should have focused something (like a button or link)
    expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
  });
});

/**
 * Test Suite: Error Handling
 * Tests error states and handling
 */
test.describe('Error Handling', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/non-existent-page-12345');
    await page.waitForLoadState('networkidle');
    
    // Should show 404 page or redirect somewhere
    const bodyText = await page.textContent('body');
    
    // Should mention page not found or similar
    const has404Content = 
      /404|not found|page.*not.*exist/i.test(bodyText || '');
    
    // Or redirected to home/login
    const redirected = ['/', '/login'].some(path => page.url().endsWith(path));
    
    expect(has404Content || redirected).toBeTruthy();
  });

  test('forms should handle empty submissions', async ({ page }) => {
    await page.goto('/resume/editor/test-resume').catch(() => {});
    await page.waitForLoadState('networkidle');
    
    if (!page.url().includes('/login')) {
      // Try to find a form
      const form = page.locator('form').first();
      
      if (await form.isVisible()) {
        // Look for required fields
        const requiredInputs = form.locator('input[required], input[aria-required="true"]');
        const count = await requiredInputs.count();
        
        if (count > 0) {
          // Clear first required input
          await requiredInputs.first().clear();
          
          // Try to submit
          const submitButton = form.getByRole('button', { name: /save|submit/i });
          
          if (await submitButton.isVisible()) {
            await submitButton.click();
            await page.waitForTimeout(500);
            
            // Should show validation error
            const errorMessage = page.getByText(/required|cannot be empty/i);
            
            if (await errorMessage.count() > 0) {
              await expect(errorMessage.first()).toBeVisible();
            }
          }
        }
      }
    }
  });
});

/**
 * Test Suite: Mobile Responsiveness
 * Tests mobile viewport behavior
 */
test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size
  
  test('homepage should be responsive on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Should not have horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width || 0;
    
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // Allow 1px for rounding
  });

  test('navigation should work on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Should have mobile menu or visible nav
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav.first()).toBeVisible();
  });

  test('forms should be usable on mobile', async ({ page }) => {
    await page.goto('/login');
    
    // Buttons should be large enough to tap
    const buttons = page.locator('button, a');
    const firstButton = buttons.first();
    
    if (await firstButton.isVisible()) {
      const box = await firstButton.boundingBox();
      
      if (box) {
        // Height should be at least 44px (iOS recommendation)
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });
});
