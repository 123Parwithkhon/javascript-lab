import { defineConfig, devices } from '@playwright/test';

// Браузеры для тестов занимают больше гигабайта, поэтому храним их в папке проекта.
process.env.PLAYWRIGHT_BROWSERS_PATH ??= `${import.meta.dirname}/.browsers`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'list',
  // Песочница стартует дольше, когда браузеры работают параллельно.
  expect: { timeout: 15_000 },
  // Кэш для работы без сети проверяет отдельный тест, остальным он не нужен.
  use: { baseURL: 'http://localhost:4173', serviceWorkers: 'block' },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
