import { expect, test } from '@playwright/test';
import { scrollToTryIt } from './helpers';

test('every diagram node in a migrated lesson shows an icon', async ({ page }) => {
  await page.goto('/lessons/http-request-lifecycle');
  const nodes = page.locator('[data-node]');
  expect(await nodes.count()).toBeGreaterThan(0);
  for (const node of await nodes.all()) await expect(node.locator('g[data-icon]')).toHaveCount(1);
});

test('a down server reads as failed: red tile border and a dimmed icon', async ({ page }) => {
  await page.goto('/lessons/load-balancers');
  await scrollToTryIt(page);
  await expect(page.locator('[data-live]')).toBeVisible();
  await page.locator('input[name="s3"]').uncheck();
  const down = page.locator('[data-node="s3"]');
  await expect(down).toHaveAttribute('data-status', 'down');
  const opacity = await down.locator('g[data-icon]').evaluate((el) => getComputedStyle(el).opacity);
  expect(Number(opacity)).toBeLessThan(1);
  const stroke = (id: string) => page.locator(`[data-node="${id}"] rect.tile`).evaluate((el) => getComputedStyle(el).stroke);
  expect(await stroke('s3')).not.toBe(await stroke('s1'));
});
