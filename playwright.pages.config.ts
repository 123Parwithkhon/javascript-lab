import { defineConfig, devices } from '@playwright/test';

// Проверка сборки для GitHub Pages: сайт живёт не в корне, а в /javascript-lab/.
process.env.PLAYWRIGHT_BROWSERS_PATH ??= `${import.meta.dirname}/.browsers`;

export default defineConfig({
  testDir: './tests-pages',
  reporter: 'list',
  expect: { timeout: 15_000 },
  use: { ...devices['Desktop Chrome'], serviceWorkers: 'block' },
  webServer: {
    command: 'npm run build -- --base=/javascript-lab/ && npx vite preview --base=/javascript-lab/ --port 4174 --strictPort',
    url: 'http://localhost:4174/javascript-lab/',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
