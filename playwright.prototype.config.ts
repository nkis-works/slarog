import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './prototypes/slot-analysis-v2',
  testMatch: 'prototype.spec.ts',
  outputDir: './artifacts/prototype-playwright',
  fullyParallel: false,
  forbidOnly: Boolean(process.env['CI']),
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:4175',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'python3 -m http.server 4175 --directory prototypes/slot-analysis-v2',
    url: 'http://127.0.0.1:4175/index.html',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
