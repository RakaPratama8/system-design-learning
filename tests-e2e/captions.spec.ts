import { readdirSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { scrollToBlock } from './helpers';

const slugs = readdirSync('src/scenes')
  .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
  .map((f) => f.replace(/\.ts$/, ''));

for (const slug of slugs) {
  test(`caption i follows block i: ${slug}`, async ({ page }) => {
    const { default: scene } = await import(`../src/scenes/${slug}`);
    await page.goto(`/lessons/${slug}`);
    await expect(page.locator('[data-caption]')).toBeVisible();
    for (let i = 0; i < scene.steps.length; i++) {
      await scrollToBlock(page, i, 0.1);
      await expect(page.locator('[data-caption]')).toHaveText(scene.steps[i].caption);
    }
  });
}
