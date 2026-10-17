import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:5176/shirokuro-tsukenai-lever',
    headless: true,
  },
  webServer: [
    {
      command: 'pnpm wrangler dev --port 8787',
      url: 'http://localhost:8787/api/health',
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: 'pnpm vite --port 5176',
      url: 'http://localhost:5176/shirokuro-tsukenai-lever/',
      reuseExistingServer: true,
      timeout: 10_000,
    },
  ],
});
