import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { quizzes } from '../src/quizzes';

const level = (slug: string) => Number(/^level:\s*(\d)/m.exec(readFileSync(`src/content/lessons/${slug}.mdx`, 'utf8'))?.[1]);

describe('quizzes', () => {
  it('cover levels 1 to 3', () => expect(Object.keys(quizzes)).toEqual(['1', '2', '3']));
  for (const [n, quiz] of Object.entries(quizzes)) {
    describe(`level ${n}`, () => {
      it('has 5 questions', () => expect(quiz).toHaveLength(5));
      quiz.forEach((q, i) => {
        it(`q${i + 1} is well formed and links a lesson of this level`, () => {
          expect(q.q.length).toBeGreaterThan(10);
          expect(q.options).toHaveLength(3);
          expect(new Set(q.options).size).toBe(3);
          expect([0, 1, 2]).toContain(q.answer);
          expect(q.explain.length).toBeGreaterThan(10);
          expect(level(q.lesson)).toBe(Number(n));
        });
      });
      it('uses a different lesson per question', () => expect(new Set(quiz.map((q) => q.lesson)).size).toBe(5));
    });
  }
});
