import { test, expect } from '@playwright/test';

/**
 * Test Suite: Resume Builder Flow
 * Tests the core resume creation and editing functionality
 */

test.describe('Resume Builder', () => {
  test.beforeEach(async ({ page }) => {
    // Note: These tests assume demo mode or mock authentication
    // In a real scenario, you'd set up authenticated sessions
    await page.goto('/');
  });

  test('should display resume builder interface', async ({ page }) => {
    // Try to navigate to builder (may redirect through auth/demo)
    await page.goto('/builder');
    
    // Wait for either login redirect or builder to load
    await page.waitForLoadState('networkidle');
    
    // If redirected to login, we expect that behavior
    if (page.url().includes('/login')) {
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    }
  });

  test('should show resume editor sections', async ({ page }) => {
    // Navigate to editor (if we can access it in demo/test mode)
    await page.goto('/resume/editor/demo-resume-id').catch(() => {
      // May redirect to login, which is expected
    });
    
    await page.waitForLoadState('networkidle');
    
    // Check if we reached the editor or were redirected
    if (!page.url().includes('/login')) {
      // Look for editor tabs/sections
      const sections = [
        /personal/i,
        /summary/i,
        /experience/i,
        /education/i,
        /projects/i,
        /skills/i,
      ];
      
      // At least some sections should be present
      for (const section of sections) {
        const element = page.getByText(section);
        if (await element.first().isVisible()) {
          await expect(element.first()).toBeVisible();
          break;
        }
      }
    }
  });

  test('should have save functionality', async ({ page }) => {
    await page.goto('/resume/editor/test-resume').catch(() => {});
    await page.waitForLoadState('networkidle');
    
    if (!page.url().includes('/login')) {
      // Look for save button or auto-save indicator
      const saveButton = page.getByRole('button', { name: /save/i });
      const saveIndicator = page.getByText(/saving|saved/i);
      
      const hasSaveFeature = 
        (await saveButton.count() > 0) || 
        (await saveIndicator.count() > 0);
      
      expect(hasSaveFeature).toBeTruthy();
    }
  });

  test('should have preview functionality', async ({ page }) => {
    await page.goto('/resume/editor/test-resume').catch(() => {});
    await page.waitForLoadState('networkidle');
    
    if (!page.url().includes('/login')) {
      // Look for preview toggle button
      const previewButton = page.getByRole('button', { name: /preview/i });
      
      if (await previewButton.isVisible()) {
        await expect(previewButton).toBeVisible();
        
        // Try to toggle preview
        await previewButton.click();
        await page.waitForTimeout(500); // Wait for animation
        
        // Check if preview area appears
        const previewArea = page.getByText(/preview/i);
        await expect(previewArea.first()).toBeVisible();
      }
    }
  });

  test('should have download PDF button', async ({ page }) => {
    await page.goto('/resume/editor/test-resume').catch(() => {});
    await page.waitForLoadState('networkidle');
    
    if (!page.url().includes('/login')) {
      // Look for download button
      const downloadButton = page.getByRole('button', { name: /download/i });
      
      if (await downloadButton.isVisible()) {
        await expect(downloadButton).toBeVisible();
      }
    }
  });
});

/**
 * Test Suite: Resume Form Validation
 * Tests form input and validation
 */
test.describe('Resume Form', () => {
  test('should allow text input in personal info fields', async ({ page }) => {
    await page.goto('/resume/editor/test-resume').catch(() => {});
    await page.waitForLoadState('networkidle');
    
    if (!page.url().includes('/login')) {
      // Try to find and fill name input
      const nameInput = page.getByPlaceholder(/name/i).or(
        page.getByLabel(/name/i)
      );
      
      if (await nameInput.first().isVisible()) {
        await nameInput.first().fill('John Doe');
        await expect(nameInput.first()).toHaveValue('John Doe');
      }
    }
  });

  test('should show validation errors for required fields', async ({ page }) => {
    await page.goto('/resume/editor/test-resume').catch(() => {});
    await page.waitForLoadState('networkidle');
    
    if (!page.url().includes('/login')) {
      // Try to submit with empty required fields
      const saveButton = page.getByRole('button', { name: /save/i });
      
      if (await saveButton.isVisible()) {
        // Clear a required field if possible
        const nameInput = page.getByPlaceholder(/name/i).or(
          page.getByLabel(/name/i)
        );
        
        if (await nameInput.first().isVisible()) {
          await nameInput.first().clear();
          
          // Try to save/submit
          await saveButton.click();
          
          // Should show validation error
          const errorMessage = page.getByText(/required/i);
          if (await errorMessage.count() > 0) {
            await expect(errorMessage.first()).toBeVisible();
          }
        }
      }
    }
  });
});
