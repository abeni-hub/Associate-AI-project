const { test, expect } = require('@playwright/test');
const { getPersona } = require('../support/config.cjs');

test.describe('Portal Authentication and Session Journeys', () => {
  test('renders login page with username, password, and submit controls', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button.login-submit, button[type="submit"]')).toBeVisible();
  });

  test('displays error message when submitting empty credentials', async ({ page }) => {
    await page.goto('/login');

    const submitBtn = page.locator('button.login-submit, button[type="submit"]');
    await submitBtn.click();

    const errorNotice = page.locator('.login-error, [role="status"]');
    await expect(errorNotice).toBeVisible();
    await expect(errorNotice).toContainText(/enter your username and password/i);
  });

  test('displays error message when submitting invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.locator('#username').fill('nonexistent.user.test');
    await page.locator('#password').fill('WrongPassword123!');
    const submitBtn = page.locator('button.login-submit, button[type="submit"]');
    await submitBtn.click();

    const errorNotice = page.locator('.login-error, [role="status"]');
    await expect(errorNotice).toBeVisible();
  });

  test('allows exploring demo workspaces when demo mode is selected', async ({ page }) => {
    await page.goto('/login');

    const demoBtn = page.locator('.demo-role').first();
    if (await demoBtn.isVisible()) {
      await demoBtn.click();
      await page.waitForURL(/overview/);
      await expect(page).toHaveURL(/overview/);
    }
  });

  test('authenticates with configured persona credentials and enters overview', async ({ page }) => {
    let credentials;
    try {
      credentials = getPersona('super_admin');
    } catch {
      return; // Skip if persona not configured in environment
    }

    await page.goto('/login');
    await page.locator('#username').fill(credentials.username);
    await page.locator('#password').fill(credentials.password);
    await page.locator('button.login-submit, button[type="submit"]').click();

    await page.waitForURL(/overview/, { timeout: 10000 });
    await expect(page).toHaveURL(/overview/);
  });
});
