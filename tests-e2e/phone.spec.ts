import { expect, test } from '@playwright/test';
import { scrollToBlock, scrollToTryIt } from './helpers';

test.use({ viewport: { width: 375, height: 812 } });

test('Try it keeps a readable diagram and a reachable panel on a phone', async ({ page }) => {
  await page.goto('/lessons/load-balancers');
  await scrollToTryIt(page);
  await expect(page.locator('[data-live]')).toBeVisible();
  const stage = (await page.locator('.live .stage').boundingBox())!;
  const panel = (await page.locator('[data-controls]').boundingBox())!;
  expect(stage.width).toBeGreaterThanOrEqual(300);
  expect(stage.height).toBeGreaterThanOrEqual(120);
  expect(panel.y).toBeGreaterThanOrEqual(stage.y + stage.height - 1);
  const pin = (await page.locator('.pin').boundingBox())!;
  expect(panel.y + panel.height).toBeLessThanOrEqual(pin.y + pin.height + 1);
});

test('compare scenes stack their two sides on a phone', async ({ page }) => {
  await page.goto('/lessons/sql-vs-nosql');
  await scrollToBlock(page, 1);
  const [left, right] = await page.locator('.compare .side').all();
  const l = (await left.boundingBox())!;
  const r = (await right.boundingBox())!;
  expect(l.width).toBeGreaterThanOrEqual(300);
  expect(r.y).toBeGreaterThanOrEqual(l.y + l.height - 1);
});
