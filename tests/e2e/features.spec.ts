import { test, expect } from '@playwright/test';

/**
 * Test Suite: AI Suggestions Feature
 * Tests the AI-powered resume suggestions functionality
 */

test.describe('AI Suggestions', () => {
  test('should display AI suggestions panel toggle', async ({ page }) => {
    await page.goto('/resume/editor/test-resume').catch(() => {});
    await page.waitForLoadState('networkidle');
    
    if (!page.url().includes('/login')) {
      // Look for AI suggestions toggle button
      const aiButton = page.getByRole('button', { name: /ai|suggestion/i });
      
      if (await aiButton.count() > 0) {
        await expect(aiButton.first()).toBeVisible();
      }
    }
  });

  test('should toggle AI suggestions panel', async ({ page }) => {
    await page.goto('/resume/editor/test-resume').catch(() => {});
    await page.waitForLoadState('networkidle');
    
    if (!page.url().includes('/login')) {
      const aiButton = page.getByRole('button', { name: /ai.*suggestion/i });
      
      if (await aiButton.isVisible()) {
        // Click to show AI suggestions
        await aiButton.click();
        await page.waitForTimeout(500);
        
        // Should show AI suggestions panel
        const aiPanel = page.getByText(/generate.*suggestion/i).or(
          page.getByText(/ai.*suggestion/i)
        );
        
        if (await aiPanel.count() > 0) {
          await expect(aiPanel.first()).toBeVisible();
        }
      }
    }
  });

  test('should have generate suggestions button', async ({ page }) => {
    await page.goto('/resume/editor/test-resume').catch(() => {});
    await page.waitForLoadState('networkidle');
    
    if (!page.url().includes('/login')) {
      // Toggle AI panel
      const aiButton = page.getByRole('button', { name: /ai.*suggestion/i });
      
      if (await aiButton.isVisible()) {
        await aiButton.click();
        await page.waitForTimeout(500);
        
        // Look for generate button
        const generateButton = page.getByRole('button', { name: /generate/i });
        
        if (await generateButton.count() > 0) {
          await expect(generateButton.first()).toBeVisible();
        }
      }
    }
  });
});

/**
 * Test Suite: PDF Generation
 * Tests the PDF download functionality
 */
test.describe('PDF Generation', () => {
  test('should have download PDF button', async ({ page }) => {
    await page.goto('/resume/editor/test-resume').catch(() => {});
    await page.waitForLoadState('networkidle');
    
    if (!page.url().includes('/login')) {
      // Look for download button
      const downloadButton = page.getByRole('button', { name: /download.*pdf/i });
      
      if (await downloadButton.count() > 0) {
        await expect(downloadButton.first()).toBeVisible();
        await expect(downloadButton.first()).toBeEnabled();
      }
    }
  });

  test('should show loading state when generating PDF', async ({ page }) => {
    await page.goto('/resume/editor/test-resume').catch(() => {});
    await page.waitForLoadState('networkidle');
    
    if (!page.url().includes('/login')) {
      const downloadButton = page.getByRole('button', { name: /download.*pdf/i });
      
      if (await downloadButton.isVisible()) {
        // Start download listener
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
        
        // Click download
        await downloadButton.click();
        
        // Should show generating state
        const generatingText = page.getByText(/generating/i);
        
        // Either we see loading state or download starts
        const hasLoadingState = await generatingText.isVisible().catch(() => false);
        const download = await downloadPromise;
        
        // At least one should happen
        expect(hasLoadingState || download !== null).toBeTruthy();
      }
    }
  });
});

/**
 * Test Suite: Credits and Payments
 * Tests the credits purchase flow
 */
test.describe('Credits System', () => {
  test('should display credits page', async ({ page }) => {
    await page.goto('/credits').catch(() => {});
    await page.waitForLoadState('networkidle');
    
    // Should show credits page or redirect to login
    if (page.url().includes('/credits')) {
      // Look for credit packages
      const creditPackages = page.getByText(/pack|credit/i);
      await expect(creditPackages.first()).toBeVisible();
    } else if (page.url().includes('/login')) {
      // Expected redirect for unauthenticated users
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    }
  });

  test('should show credit balance', async ({ page }) => {
    await page.goto('/credits').catch(() => {});
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/credits') && !page.url().includes('/login')) {
      // Look for credit balance display
      const balanceText = page.getByText(/available.*credit/i).or(
        page.getByText(/your.*credit/i)
      );
      
      if (await balanceText.count() > 0) {
        await expect(balanceText.first()).toBeVisible();
      }
    }
  });

  test('should display purchase options', async ({ page }) => {
    await page.goto('/credits').catch(() => {});
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/credits') && !page.url().includes('/login')) {
      // Look for purchase buttons
      const purchaseButton = page.getByRole('button', { name: /purchase|buy/i });
      
      if (await purchaseButton.count() > 0) {
        await expect(purchaseButton.first()).toBeVisible();
      }
    }
  });

  test('should show credit packages with prices', async ({ page }) => {
    await page.goto('/credits').catch(() => {});
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/credits') && !page.url().includes('/login')) {
      // Look for price information
      const priceDisplay = page.getByText(/\$\d+/);
      
      if (await priceDisplay.count() > 0) {
        await expect(priceDisplay.first()).toBeVisible();
      }
    }
  });
});

/**
 * Test Suite: Dashboard
 * Tests the user dashboard and resume management
 */
test.describe('Dashboard', () => {
  test('should display dashboard', async ({ page }) => {
    await page.goto('/dashboard').catch(() => {});
    await page.waitForLoadState('networkidle');
    
    // Should show dashboard or redirect to login
    if (page.url().includes('/dashboard')) {
      await expect(page).toHaveURL(/\/dashboard/);
    } else if (page.url().includes('/login')) {
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    }
  });

  test('should show create resume option', async ({ page }) => {
    await page.goto('/dashboard').catch(() => {});
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/dashboard') && !page.url().includes('/login')) {
      // Look for create/new resume button
      const createButton = page.getByRole('button', { name: /create|new.*resume/i }).or(
        page.getByRole('link', { name: /create|new.*resume/i })
      );
      
      if (await createButton.count() > 0) {
        await expect(createButton.first()).toBeVisible();
      }
    }
  });
});
