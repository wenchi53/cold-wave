import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

mkdirSync('screenshots', { recursive: true });

// zh is reached through the browser language (no ?lang=) to test detection.
const LANGS = [
	{ name: 'en', locale: 'en-US', light: 'light fire', stoke: 'stoke fire' },
	{ name: 'zh_tw', locale: 'zh-TW', light: '生火', stoke: '添柴' }
];

// Third-party analytics is not part of the game; keep it out of the run.
async function blockAnalytics(page) {
	await page.route(/googletagmanager\.com|google-analytics\.com/, (route) =>
		route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
}

// Headless WebKit on Linux may lack the FLAC decoder that real iOS Safari
// has; failing to decode a sound is a test-machine issue, not a game bug.
const IGNORED_ERRORS = /EncodingError|decode audio|decodeAudioData|Decoding failed/i;

function collectErrors(page) {
	const errors = [];
	const add = (text) => { if (!IGNORED_ERRORS.test(text)) errors.push(text); };
	page.on('pageerror', (err) => add('pageerror: ' + err.message));
	page.on('console', (msg) => {
		if (msg.type() === 'error') add('console: ' + msg.text());
	});
	return errors;
}

// Panels slide with jQuery animations; measure after they stop.
async function settle(page) {
	await page.waitForFunction(() => !$('#locationSlider, #outerSlider').is(':animated'));
}

async function expectNoHorizontalScroll(page) {
	const { scrollWidth, innerWidth } = await page.evaluate(() => ({
		scrollWidth: document.documentElement.scrollWidth,
		innerWidth: window.innerWidth
	}));
	expect(scrollWidth, 'page must not scroll sideways').toBeLessThanOrEqual(innerWidth + 1);
}

// Visible, inside the viewport, big enough on phones, and not covered.
async function expectTappable(page, locator, isMobile) {
	await expect(locator).toBeVisible();
	const box = await locator.boundingBox();
	const viewport = page.viewportSize();
	expect(box.x).toBeGreaterThanOrEqual(0);
	expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
	if (isMobile) {
		expect(box.height, 'touch target height').toBeGreaterThanOrEqual(44);
	}
	const onTop = await locator.evaluate((el) => {
		const r = el.getBoundingClientRect();
		const hit = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 20));
		return !!hit && (hit === el || el.contains(hit));
	});
	expect(onTop, 'button is not covered by something else').toBe(true);
}

// The "Sound Available!" event pops up 3s into a new game.
async function dismissSoundEvent(page) {
	const event = page.locator('#event');
	await event.waitFor({ state: 'visible', timeout: 10000 });
	const box = await event.boundingBox();
	expect(box.x).toBeGreaterThanOrEqual(0);
	expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width + 1);
	await event.locator('#buttons .button').last().click();
	await expect(event).toHaveCount(0, { timeout: 5000 });
}

for (const lang of LANGS) {
	test.describe(`${lang.name}`, () => {
		test.use({ locale: lang.locale });

		test('light the fire, stoke it, keep the save', async ({ page, isMobile }, testInfo) => {
			const errors = collectErrors(page);
			await blockAnalytics(page);
			await page.goto('/');

			const light = page.locator('#lightButton');
			await expect(light).toBeVisible();
			await expect(light).toContainText(lang.light);
			await expect(page).not.toHaveURL(/mobileWarning/);

			await dismissSoundEvent(page);
			await expectTappable(page, light, isMobile);
			await expectNoHorizontalScroll(page);

			await light.click();
			const stoke = page.locator('#stokeButton');
			await expect(stoke).toBeVisible();
			await expect(stoke).toContainText(lang.stoke);
			const fireAfterLight = await page.evaluate(() => $SM.get('game.fire.value'));
			expect(fireAfterLight).toBeGreaterThan(0);

			// stoke a couple of times, waiting out the 10s cooldown
			for (let i = 0; i < 2; i++) {
				await expect(stoke).not.toHaveClass(/disabled/, { timeout: 20000 });
				await expectTappable(page, stoke, isMobile);
				await stoke.click();
			}
			await expectNoHorizontalScroll(page);

			await page.screenshot({
				path: `screenshots/${testInfo.project.name}-${lang.name}.png`,
				fullPage: true
			});

			// the save lives in localStorage and survives a reload
			const saved = await page.evaluate(() => {
				Engine.saveGame();
				return JSON.parse(localStorage.gameState).game.fire.value;
			});
			expect(saved).toBeGreaterThan(0);
			await page.reload();
			await expect(page.locator('#stokeButton')).toBeVisible();
			expect(await page.evaluate(() => $SM.get('game.fire.value'))).toBeGreaterThan(0);
			await expect(page.locator('#event')).toHaveCount(0);

			expect(errors, errors.join('\n')).toEqual([]);
		});
	});
}

test('?lang=zh_tw overrides an English browser', async ({ page }) => {
	await blockAnalytics(page);
	await page.goto('/?lang=zh_tw');
	await expect(page.locator('#lightButton')).toContainText('生火');
	expect(await page.evaluate(() => localStorage.lang)).toBe('zh_tw');
});

// Later panels, reached by giving the player supplies directly.
test('village, path and world map fit the screen', async ({ page, isMobile }, testInfo) => {
	const errors = collectErrors(page);
	await blockAnalytics(page);
	await page.goto('/?lang=en');
	await dismissSoundEvent(page);
	await page.locator('#lightButton').click();

	await page.evaluate(() => {
		$SM.setM('stores', { wood: 500, fur: 200, meat: 100, 'cured meat': 30, compass: 1 });
		Outside.init();
		Path.init();
		Engine.travelTo(Outside);
	});
	await expect(page.locator('#outsidePanel')).toBeVisible();
	await settle(page);
	await expectNoHorizontalScroll(page);
	await expectTappable(page, page.locator('#gatherButton'), isMobile);

	await page.evaluate(() => Engine.travelTo(Path));
	await expect(page.locator('#embarkButton')).toBeVisible();
	await settle(page);
	await expectNoHorizontalScroll(page);
	await page.screenshot({ path: `screenshots/${testInfo.project.name}-path.png`, fullPage: true });

	await page.evaluate(() => {
		Path.outfit = { 'cured meat': 5 };
		Path.embark();
	});
	await expect(page.locator('#map')).toBeVisible();
	await settle(page);
	await expectNoHorizontalScroll(page);
	const map = await page.locator('#map').boundingBox();
	expect(map.x + map.width).toBeLessThanOrEqual(page.viewportSize().width + 1);

	const before = await page.evaluate(() => World.curPos.slice());
	if (isMobile) {
		const north = page.locator('#dpad .dpad-north');
		await expectTappable(page, north, isMobile);
		await north.click();
	} else {
		await page.keyboard.press('ArrowUp');
	}
	const after = await page.evaluate(() => World.curPos.slice());
	expect(after[1]).toBe(before[1] - 1);
	await page.screenshot({ path: `screenshots/${testInfo.project.name}-world.png`, fullPage: true });

	expect(errors, errors.join('\n')).toEqual([]);
});
