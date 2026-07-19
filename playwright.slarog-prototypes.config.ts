import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './prototypes/slarog-home-redesign',
  testMatch: '**/*.spec.ts',
  outputDir: './artifacts/slarog-home-redesign/playwright',
  fullyParallel: false,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:4175',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'python3 -m http.server 4175',
    url: 'http://127.0.0.1:4175/prototypes/slarog-home-redesign/',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
