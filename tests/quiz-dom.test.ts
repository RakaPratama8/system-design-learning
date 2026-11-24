import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEY } from '../src/engine/quiz';
import { initQuiz } from '../src/scripts/quiz-dom';
import { initProgress } from '../src/scripts/progress-dom';
import { STORAGE_KEY as DONE_KEY } from '../src/engine/progress';

const fieldset = (i: number, answer: number) => `
  <fieldset data-q data-answer="${answer}">
    <input type="radio" name="q${i}" value="0"><input type="radio" name="q${i}" value="1">
    <p class="fb" hidden><strong data-verdict></strong></p>
  </fieldset>`;

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = `<form data-quiz data-level="1" data-pass="2">${fieldset(0, 0)}${fieldset(1, 1)}
    <p data-result></p></form>`;
});

const answer = (name: string, value: string) =>
  document.querySelector<HTMLInputElement>(`input[name="${name}"][value="${value}"]`)!.click();
const submit = () => document.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));

describe('initQuiz', () => {
  it('grades, shows feedback and saves the best score', () => {
    initQuiz(document);
    answer('q0', '0');
    answer('q1', '0');
    submit();
    const sets = document.querySelectorAll<HTMLElement>('fieldset');
    expect(sets[0].dataset.state).toBe('right');
    expect(sets[1].dataset.state).toBe('wrong');
    expect(sets[1].querySelector<HTMLElement>('.fb')!.hidden).toBe(false);
    expect(document.querySelector('[data-result]')!.textContent).toContain('1 / 2');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({ 1: 1 });
  });
  it('counts unanswered questions as wrong and allows retry', () => {
    initQuiz(document);
    submit();
    expect(document.querySelector('[data-result]')!.textContent).toContain('0 / 2');
    answer('q0', '0');
    answer('q1', '1');
    submit();
    expect(document.querySelector('[data-result]')!.textContent).toContain('Passed');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({ 1: 2 });
  });
});

describe('home level completion', () => {
  const home = () => {
    document.body.innerHTML = `<section class="level" data-level="1" data-slugs="a,b">
      <a data-lesson-link data-slug="a"></a><a data-lesson-link data-slug="b"></a><span data-best></span></section>`;
    return document.querySelector('section')!;
  };
  it('completes only with all lessons done and a passing quiz', () => {
    localStorage.setItem(DONE_KEY, '["a","b"]');
    const sec = home();
    initProgress(document);
    expect(sec.hasAttribute('data-complete')).toBe(false);
    expect(sec.hasAttribute('data-ready')).toBe(true);
    expect(document.querySelector('[data-best]')!.textContent).toBe('Not taken');
    localStorage.setItem(STORAGE_KEY, '{"1":4}');
    const sec2 = home();
    initProgress(document);
    expect(sec2.hasAttribute('data-complete')).toBe(true);
    expect(document.querySelector('[data-best]')!.textContent).toBe('Best 4/5 ✓');
  });
});
