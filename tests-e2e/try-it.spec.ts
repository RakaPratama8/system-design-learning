import { expect, test, type Page } from '@playwright/test';

const URL = '/lessons/load-balancers';

async function scrollToTryIt(page: Page) {
  await page.evaluate(() => {
    const pin = document.querySelector('.pin') as HTMLElement;
    const anchor = pin.offsetHeight + (innerHeight - pin.offsetHeight) / 2;
    const top = document.querySelector('[data-tryit]')!.getBoundingClientRect().top;
    window.scrollTo(0, window.scrollY + top - anchor + 20);
  });
}

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
