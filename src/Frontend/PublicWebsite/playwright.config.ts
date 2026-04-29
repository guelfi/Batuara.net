import { defineConfig } from '@playwright/test';

declare const process: { env: Record<string, string | undefined> };

const port = process.env.PORT ? Number(process.env.PORT) : 4173;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
    },
  },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  webServer: {
    command: 'npm start',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      BROWSER: 'none',
      PORT: String(port),
      REACT_APP_API_URL: '/batuara-api/api',
    },
  },
  projects: [
    {
      name: 'desktop',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'tablet',
      use: {
        browserName: 'chromium',
        viewport: { width: 820, height: 1180 },
        hasTouch: true,
      },
    },
    {
      name: 'mobile',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
        deviceScaleFactor: 3,
      },
    },
  ],
});
