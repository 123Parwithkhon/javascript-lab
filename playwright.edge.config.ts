import base from './playwright.config';
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({ ...base, projects: [
  { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
  { name: 'edge-mobile', use: { ...devices['Pixel 7'], channel: 'msedge' } },
]});
