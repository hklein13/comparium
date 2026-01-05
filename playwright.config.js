// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Comparium E2E tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  // Maximum time one test can run
  timeout: 60 * 1000,

  // Test execution settings
  fullyParallel: false, // Run tests sequentially to avoid Firebase conflicts
  forbidOnly: !!process.env.CI, // Fail in CI if test.only is left in
  retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
  workers: 1, // Run one test at a time

  // Reporter to use
  reporter: [['html'], ['list']],

  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: process.env.TEST_URL || 'http://localhost:8080',

    // Collect trace on failure for debugging
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run local dev server if TEST_URL is not set
  webServer: process.env.TEST_URL
    ? undefined
    : {
        command: 'npx http-server -p 8080 -c-1',
        port: 8080,
        reuseExistingServer: true,
        timeout: 10 * 1000,
      },
});
