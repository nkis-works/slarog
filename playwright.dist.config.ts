import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tools/slot-balance/e2e-dist',
  outputDir: './artifacts/playwright-dist',
  fullyParallel: false,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:4174',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'python3 -m http.server 4174 --directory dist',
    url: 'http://127.0.0.1:4174/tools/slot-balance/index.html',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
