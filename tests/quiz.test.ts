import { describe, expect, it } from 'vitest';
import { PASS, STORAGE_KEY, isLevelComplete, loadBest, saveBest, score, type Quiz } from '../src/engine/quiz';

const quiz: Quiz = Array.from({ length: 5 }, (_, i) => ({ q: `q${i}`, options: ['a', 'b', 'c'], answer: (i % 3) as 0 | 1 | 2, explain: 'e', lesson: 'x' }));
const right = quiz.map((q) => q.answer);

describe('score', () => {
  it('counts correct and lists wrong indexes', () => {
    expect(score(right, quiz)).toEqual({ correct: 5, total: 5, wrong: [] });
    expect(score([right[0], 9, right[2], right[3], right[4]], quiz)).toEqual({ correct: 4, total: 5, wrong: [1] });
  });
  it('counts unanswered as wrong', () => {
    expect(score([], quiz)).toEqual({ correct: 0, total: 5, wrong: [0, 1, 2, 3, 4] });
  });
});

function store(initial?: string, throws = false) {
  const m = new Map<string, string>(initial ? [[STORAGE_KEY, initial]] : []);
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => {
      if (throws) throw new Error('full');
      m.set(k, v);
    },
  };
}

describe('best score storage', () => {
  it('keeps the higher score', () => {
    const s = store();
    saveBest(s, 1, 3);
    saveBest(s, 1, 2);
    saveBest(s, 2, 5);
    expect(loadBest(s)).toEqual({ 1: 3, 2: 5 });
  });
  it('tolerates bad JSON and a throwing store', () => {
    expect(loadBest(store('{nope'))).toEqual({});
    expect(loadBest(store('[1]'))).toEqual({});
    expect(() => saveBest(store(undefined, true), 1, 4)).not.toThrow();
  });
});

describe('isLevelComplete', () => {
  const slugs = ['a', 'b'];
  it('needs all lessons and a passing quiz', () => {
    expect(isLevelComplete(new Set(['a', 'b']), slugs, PASS - 1)).toBe(false);
    expect(isLevelComplete(new Set(['a']), slugs, PASS)).toBe(false);
    expect(isLevelComplete(new Set(['a', 'b']), slugs, PASS)).toBe(true);
    expect(isLevelComplete(new Set(['a', 'b']), slugs, undefined)).toBe(false);
  });
});
