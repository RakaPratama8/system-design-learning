import { expect, test, type Page } from '@playwright/test';
import scene from '../src/scenes/http-request-lifecycle';

if (scene.type !== 'graph') throw new Error('expected a graph scene');
const caps = scene.steps.map((s) => s.caption);
const URL = '/lessons/http-request-lifecycle';

// Scrolls so the anchor line (middle of the reading area under the sticky pin) sits `frac` of the way down block `i`.
async function scrollToBlock(page: Page, i: number, frac = 0) {
  await page.evaluate(
    ([idx, f]) => {
      const pin = document.querySelector('.pin') as HTMLElement;
      const block = document.querySelectorAll('[data-step]')[idx].getBoundingClientRect();
      const anchor = pin.offsetHeight + (innerHeight - pin.offsetHeight) / 2;
      window.scrollTo(0, window.scrollY + block.top - anchor + (f as number) * block.height + 1);
    },
    [i, frac],
  );
}

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
