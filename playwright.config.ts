import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests-e2e',
  webServer: {
    command: 'npm run build && npx astro preview --port 4321 --ignore-lock',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  use: { baseURL: 'http://localhost:4321', channel: 'chrome' },
});
