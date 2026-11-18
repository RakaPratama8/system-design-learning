import type { Page } from '@playwright/test';

// Scrolls so the anchor line (middle of the reading area under the sticky pin) sits `frac` of the way down block `i`.
export async function scrollToBlock(page: Page, i: number, frac = 0) {
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

export async function scrollToTryIt(page: Page) {
  await page.evaluate(() => {
    const pin = document.querySelector('.pin') as HTMLElement;
    const anchor = pin.offsetHeight + (innerHeight - pin.offsetHeight) / 2;
    const top = document.querySelector('[data-tryit]')!.getBoundingClientRect().top;
    window.scrollTo(0, window.scrollY + top - anchor + 20);
  });
}
