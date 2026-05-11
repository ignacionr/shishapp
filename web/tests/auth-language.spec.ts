import { test, expect } from '@playwright/test';

test.describe('Language Persistence during Auth Transitions', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('should revert to guest language preference after logout', async ({ page }) => {
    let contextCallCount = 0;

    // 1. Mock Context (Guest prefers Spanish)
    await page.route('**/api/v1/auth/context', async (route) => {
      contextCallCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ country: 'AR', language: 'es-419' }),
      });
    });

    // 2. Mock /me (User prefers English)
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user123',
          google_id: 'user123',
          email: 'user@example.com',
          name: 'English User',
          country: 'US',
          language: 'en',
          is_admin: false
        }),
      });
    });

    // Mock other public endpoints to avoid 404s
    await page.route('**/api/v1/feed', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.route('**/api/v1/methods', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.route('**/api/v1/equipment', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    // --- STEP 1: GUEST SESSION ---
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify it's in Spanish
    await expect(page.getByRole('link', { name: 'INICIO', exact: false }).first()).toBeVisible();
    expect(contextCallCount).toBe(1);

    // --- STEP 2: LOGIN ---
    // Inject token to simulate being logged in
    await page.evaluate(() => {
      localStorage.setItem('vidita_token', 'mock-token');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify it's in English
    await expect(page.getByRole('link', { name: 'Home', exact: false }).first()).toBeVisible();

    // --- STEP 3: LOGOUT ---
    await page.goto('/login');
    
    // Click Sign Out
    // In English translation, logout is "Sign Out"
    await page.getByRole('button', { name: 'Sign Out' }).click();

    // Should redirect to home
    await expect(page).toHaveURL(/\/$/);
    await page.waitForLoadState('networkidle');

    // Verify it's back in Spanish
    await expect(page.getByRole('link', { name: 'INICIO', exact: false }).first()).toBeVisible();
    
    // CRITICAL CHECK: Did it re-fetch context?
    // Before my fix, this would be 1. After fix, it should be 2.
    expect(contextCallCount).toBeGreaterThanOrEqual(2);
  });
});
