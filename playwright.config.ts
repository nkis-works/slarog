import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tools/slot-balance/e2e',
  outputDir: './artifacts/playwright',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'python3 -m http.server 4173',
    url: 'http://127.0.0.1:4173/tools/slot-balance/index.html',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
