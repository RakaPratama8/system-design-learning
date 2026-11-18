import { expect, test } from '@playwright/test';
import { scrollToBlock } from './helpers';
import scene from '../src/scenes/http-request-lifecycle';

if (scene.type !== 'graph') throw new Error('expected a graph scene');
const caps = scene.steps.map((s) => s.caption);
const URL = '/lessons/http-request-lifecycle';

test('caption follows scroll, both directions', async ({ page }) => {
  await page.goto(URL);
  const caption = page.locator('[data-caption]');
  await expect(caption).toHaveText(caps[0]);
  await scrollToBlock(page, 1);
  await expect(caption).toHaveText(caps[1]);
  await scrollToBlock(page, 3);
  await expect(caption).toHaveText(caps[3]);
  await scrollToBlock(page, 0);
  await expect(caption).toHaveText(caps[0]);
});

test('arrow keys step to the next block', async ({ page }) => {
  await page.goto(URL);
  const caption = page.locator('[data-caption]');
  await expect(caption).toHaveText(caps[0]);
  await scrollToBlock(page, 1);
  await expect(caption).toHaveText(caps[1]);
  await page.keyboard.press('ArrowDown');
  await expect(caption).toHaveText(caps[2]);
});

// Step 1 marker path is client -> dns -> client, ending on the client node at (60, 120).
test('reduced motion jumps the marker to the end; normal motion scrubs it', async ({ browser }) => {
  const read = async (reducedMotion: 'reduce' | 'no-preference') => {
    const ctx = await browser.newContext({ reducedMotion });
    const page = await ctx.newPage();
    await page.goto(URL);
    await expect(page.locator('[data-caption]')).toHaveText(caps[0]);
    await scrollToBlock(page, 1, 0.1);
    await expect(page.locator('[data-caption]')).toHaveText(caps[1]);
    const marker = page.locator('circle[data-marker]');
    const pos = { cx: await marker.getAttribute('cx'), cy: await marker.getAttribute('cy') };
    await ctx.close();
    return pos;
  };
  expect(await read('reduce')).toEqual({ cx: '60', cy: '120' });
  expect((await read('no-preference')).cy).not.toBe('120');
});

test('explanation blocks are numbered by a CSS counter', async ({ page }) => {
  await page.goto(URL);
  const rules = await page.locator('[data-step]').first().evaluate((el) => ({
    increment: getComputedStyle(el).counterIncrement,
    label: getComputedStyle(el, '::before').content,
    reset: getComputedStyle(el.closest('.lesson')!).counterReset,
  }));
  expect(rules.increment).toContain('step');
  expect(rules.reset).toContain('step');
  expect(rules.label).toContain('counter(step)');
});

test('ArrowUp at the top of the page does not scroll', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('[data-caption]')).toHaveText(caps[0]);
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => scrollY)).toBe(0);
});
