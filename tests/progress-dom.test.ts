import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEY } from '../src/engine/progress';
import { initProgress } from '../src/scripts/progress-dom';

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = `
    <a data-lesson-link data-slug="a">A</a><a data-lesson-link data-slug="b">B</a>
    <button data-mark-done data-slug="a"></button>`;
});

describe('initProgress', () => {
  it('marks stored lessons as done on load', () => {
    localStorage.setItem(STORAGE_KEY, '["b"]');
    initProgress(document);
    expect(document.querySelector('[data-slug="b"][data-lesson-link]')!.hasAttribute('data-done')).toBe(true);
    expect(document.querySelector('[data-slug="a"][data-lesson-link]')!.hasAttribute('data-done')).toBe(false);
  });
  it('toggles done and persists when the button is clicked', () => {
    initProgress(document);
    const button = document.querySelector<HTMLButtonElement>('[data-mark-done]')!;
    expect(button.textContent).toBe('Mark as done');
    button.click();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(['a']);
    button.click();
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });
  it('updates the progress meter and marks the first undone lesson as current', () => {
    document.body.insertAdjacentHTML('beforeend', '<div data-progress><span data-count></span><div class="bar"></div></div>');
    localStorage.setItem(STORAGE_KEY, '["a"]');
    initProgress(document);
    expect(document.querySelector('[data-count]')!.textContent).toBe('1');
    expect(document.querySelector<HTMLElement>('.bar')!.getAttribute('aria-valuenow')).toBe('1');
    expect(document.querySelector<HTMLElement>('.bar')!.style.getPropertyValue('--pct')).toBe('50%');
    expect(document.querySelector('[data-slug="b"]')!.hasAttribute('data-current')).toBe(true);
  });
});
