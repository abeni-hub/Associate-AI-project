const { test, expect } = require('@playwright/test');

test.describe('Portal Controlled Failure States and Recovery', () => {
  test('gracefully handles backend 500 server error on login attempt', async ({ page }) => {
    // Intercept login requests to simulate server failure
    await page.route('**/api/v1/auth/login', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Internal server error occurred.',
          data: null,
          errors: null,
        }),
      });
    });

    await page.goto('/login');
    await page.locator('#username').fill('admin.test');
    await page.locator('#password').fill('Password123!');
    await page.locator('button.login-submit, button[type="submit"]').click();

    // Verify error notification is rendered and app did not crash
    const errorNotice = page.locator('.login-error, [role="status"]');
    await expect(errorNotice).toBeVisible();

    // Page still renders interactive form
    await expect(page.locator('#username')).toBeVisible();
  });

  test('gracefully handles network disconnection / request abortion', async ({ page }) => {
    await page.route('**/api/v1/auth/login', (route) => {
      route.abort('failed');
    });

    await page.goto('/login');
    await page.locator('#username').fill('admin.test');
    await page.locator('#password').fill('Password123!');
    await page.locator('button.login-submit, button[type="submit"]').click();

    const errorNotice = page.locator('.login-error, [role="status"]');
    await expect(errorNotice).toBeVisible();
  });

  test('recovers when backend service is restored', async ({ page }) => {
    let failFirst = true;

    await page.route('**/api/v1/auth/login', (route) => {
      if (failFirst) {
        failFirst = false;
        route.fulfill({ status: 503, body: 'Service Unavailable' });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 1,
              name: 'Recovery Admin',
              username: 'admin.recovery',
              token: 'mock-recovery-bearer-token',
              role: { id: 1, slug: 'super_admin', name: 'Super Admin' },
            },
          }),
        });
      }
    });

    await page.goto('/login');
    await page.locator('#username').fill('admin.recovery');
    await page.locator('#password').fill('Password123!');

    // First attempt fails
    await page.locator('button.login-submit, button[type="submit"]').click();
    await expect(page.locator('.login-error, [role="status"]')).toBeVisible();

    // Second attempt recovers
    await page.locator('button.login-submit, button[type="submit"]').click();
    await page.waitForURL(/overview/, { timeout: 10000 });
    await expect(page).toHaveURL(/overview/);
  });
});
