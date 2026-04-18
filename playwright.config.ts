import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:5176/shirokuro-tsukenai-lever',
    headless: true,
  },
  webServer: {
    command: 'pnpm vite --port 5176',
    url: 'http://localhost:5176/shirokuro-tsukenai-lever/',
    reuseExistingServer: true,
    timeout: 10_000,
  },
});
