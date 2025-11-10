import { test, expect } from '@playwright/test';

/**
 * Test Suite: Authentication Flow
 * Tests the login and authentication process
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check for login heading
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    
    // Check for OAuth providers
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /github/i })).toBeVisible();
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/dashboard');
    
    // Should redirect to login
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show demo mode option', async ({ page }) => {
    await page.goto('/login');
    
    // Check for demo mode link or button
    const demoButton = page.getByRole('button', { name: /demo/i }).or(
      page.getByRole('link', { name: /demo/i })
    );
    await expect(demoButton.first()).toBeVisible();
  });

  test('navbar should show login button when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Check navbar has login link
    const loginLink = page.getByRole('link', { name: /login|sign in/i });
    await expect(loginLink).toBeVisible();
  });
});

/**
 * Test Suite: Demo Mode Flow
 * Tests the demo resume builder without authentication
 */
test.describe('Demo Mode', () => {
  test('should allow demo resume creation without login', async ({ page }) => {
    await page.goto('/');
    
    // Look for demo or try free button
    const tryButton = page.getByRole('button', { name: /try|demo|start/i }).or(
      page.getByRole('link', { name: /try|demo|start/i })
    );
    
    if (await tryButton.first().isVisible()) {
      await tryButton.first().click();
      
      // Should navigate to builder or generate demo
      await page.waitForURL(/\/(builder|resume|dashboard)/);
      
      // Check that we're on a resume-related page
      expect(page.url()).toMatch(/\/(builder|resume|dashboard)/);
    }
  });
});
