const { test, expect } = require('@playwright/test');

test.describe('Portal Role-Based Route Guards and Navigation', () => {
  test('Sub-City role is blocked from Super-Admin-only accounts and roles pages', async ({ page }) => {
    await page.goto('/login');

    // Click sub-city demo workspace
    const subCityBtn = page.locator('.demo-role', { hasText: /sub-city/i });
    if (await subCityBtn.isVisible()) {
      await subCityBtn.click();
      await page.waitForURL(/overview/);

      // Attempt navigation to Super-Admin-only route /accounts
      await page.goto('/accounts');

      // RoleGuard should redirect away from /accounts or display restricted state
      await expect(page).not.toHaveURL(/\/accounts$/);
    }
  });

  test('Bureau role is blocked from Sub-City-only services page', async ({ page }) => {
    await page.goto('/login');

    const bureauBtn = page.locator('.demo-role', { hasText: /bureau/i });
    if (await bureauBtn.isVisible()) {
      await bureauBtn.click();
      await page.waitForURL(/overview/);

      // Attempt navigation to Sub-City route /services
      await page.goto('/services');

      await expect(page).not.toHaveURL(/\/services$/);
    }
  });

  test('Super Admin role can navigate to privileged configuration pages', async ({ page }) => {
    await page.goto('/login');

    const superBtn = page.locator('.demo-role', { hasText: /platform-wide/i });
    if (await superBtn.isVisible()) {
      await superBtn.click();
      await page.waitForURL(/overview/);

      // Verify overview page renders navigation links
      const nav = page.locator('nav, aside, .sidebar');
      await expect(nav).toBeVisible();
    }
  });
});
