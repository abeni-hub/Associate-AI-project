const { defineConfig } = require('@playwright/test');
const { loadE2EConfig } = require('./tests/support/config.cjs');

let e2e;
try {
  e2e = loadE2EConfig();
} catch {
  e2e = {
    citizenUrl: process.env.E2E_CITIZEN_URL || 'http://127.0.0.1:5173',
    portalUrl: process.env.E2E_PORTAL_URL || 'http://127.0.0.1:5174',
  };
}

module.exports = defineConfig({
  testDir: './tests/browser',
  testMatch: '**/*.spec.cjs',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  timeout: 30000,
  expect: { timeout: 7000 },
  reporter: [['list']],
  outputDir: 'test-results/e2e-browser',
  use: {
    browserName: 'chromium',
    viewport: { width: 1440, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'citizen',
      testMatch: 'citizen-journeys.spec.cjs',
      use: { baseURL: e2e.citizenUrl },
    },
    {
      name: 'portal',
      testMatch: 'portal-*.spec.cjs',
      use: { baseURL: e2e.portalUrl },
    },
  ],
});
