import { expect, test } from '@playwright/test';
import { level1 } from '../src/quizzes/level-1';

test('passing the level 1 quiz shows the score on the home page', async ({ page }) => {
  await page.goto('/quiz/1');
  for (const [i, q] of level1.entries()) await page.locator(`input[name="q${i}"][value="${q.answer}"]`).check();
  await page.getByRole('button', { name: 'Check answers' }).click();
  await expect(page.locator('[data-result]')).toContainText('5 / 5');
  await page.goto('/');
  await expect(page.locator('[data-best]').first()).toHaveText('Best 5/5 ✓');
});
