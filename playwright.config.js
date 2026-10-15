// Browser tests for the phone layout. Run in CI (.github/workflows/test.yml);
// locally: python3 -m http.server 8080 & npx playwright test
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: 'tests/e2e',
	timeout: 120 * 1000,
	retries: process.env.CI ? 1 : 0,
	reporter: [['list'], ['html', { open: 'never' }]],
	use: {
		baseURL: process.env.BASE_URL || 'http://127.0.0.1:8080',
		colorScheme: 'light',
		trace: 'retain-on-failure'
	},
	projects: [
		{ name: 'iphone-15', use: { ...devices['iPhone 15'] } },
		{ name: 'pixel-7', use: { ...devices['Pixel 7'] } },
		{ name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } }
	]
});
