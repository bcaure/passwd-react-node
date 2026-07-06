const { defineConfig, devices } = require('@playwright/test');

const BACKEND_PORT = process.env.BACKEND_PORT || '3001';
const FRONTEND_PORT = process.env.FRONTEND_PORT || '3000';

module.exports = defineConfig({
  testDir: './test/e2e',
  outputDir: './test/e2e/test-results',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test/e2e/playwright-report', open: 'never' }]
  ],
  use: {
    baseURL: `http://localhost:${FRONTEND_PORT}`,
    headless: true,
    viewport: { width: 1280, height: 800 },
    launchOptions: { slowMo: Number(process.env.PW_SLOWMO || 0) },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.PW_VIDEO || 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: [
    {
      command: 'bash test/db/reset-test-db.sh && node --env-file=back/.env.test back/server.js',
      url: `http://localhost:${BACKEND_PORT}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe'
    },
    {
      command: 'npm run dev',
      cwd: 'front',
      url: `http://localhost:${FRONTEND_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe'
    }
  ]
});
