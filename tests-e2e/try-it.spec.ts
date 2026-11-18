import { expect, test } from '@playwright/test';
import { scrollToTryIt } from './helpers';

const URL = '/lessons/load-balancers';

test('try it: controls drive the diagram and requests stream', async ({ page }) => {
  await page.goto(URL);
  await scrollToTryIt(page);
  await expect(page.locator('[data-live]')).toBeVisible();
  await expect(page.locator('[data-node="s3"]')).toHaveAttribute('data-status', 'ok');
  await page.locator('input[name="s3"]').uncheck();
  await expect(page.locator('[data-node="s3"]')).toHaveAttribute('data-status', 'down');
  await expect(page.locator('[data-dot]').first()).toBeVisible();
  await page.locator('input[name="traffic"]').fill('400');
  await page.locator('input[name="s2"]').uncheck();
  await expect(page.locator('[data-readout="Dropped"]')).toHaveText('75%');
});

test('try it under reduced motion: states update but no dots stream', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(URL);
  await scrollToTryIt(page);
  await expect(page.locator('[data-live]')).toBeVisible();
  await page.locator('input[name="s3"]').uncheck();
  await expect(page.locator('[data-node="s3"]')).toHaveAttribute('data-status', 'down');
  await page.waitForTimeout(800);
  await expect(page.locator('[data-dot]')).toHaveCount(0);
  await ctx.close();
});

test('scrolling back up returns to the watch view', async ({ page }) => {
  await page.goto(URL);
  await scrollToTryIt(page);
  await expect(page.locator('[data-live]')).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator('[data-live]')).toHaveCount(0);
  await expect(page.locator('[data-caption]')).toBeVisible();
});

test('ArrowDown inside Try it keeps the live view and the scroll position', async ({ page }) => {
  await page.goto(URL);
  await scrollToTryIt(page);
  await expect(page.locator('[data-live]')).toBeVisible();
  const before = await page.evaluate(() => scrollY);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(600);
  await expect(page.locator('[data-live]')).toBeVisible();
  expect(await page.evaluate(() => scrollY)).toBeGreaterThanOrEqual(before);
});
