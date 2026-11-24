export const STORAGE_KEY = 'sdl.quiz.v1';
export const PASS = 4;

export interface Question {
  q: string;
  options: [string, string, string];
  answer: 0 | 1 | 2;
  explain: string;
  lesson: string;
}
export type Quiz = Question[];

export function score(answers: number[], quiz: { answer: number }[]) {
  const wrong = quiz.flatMap((q, i) => (answers[i] === q.answer ? [] : [i]));
  return { correct: quiz.length - wrong.length, total: quiz.length, wrong };
}

export function loadBest(storage: Pick<Storage, 'getItem'>): Record<number, number> {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? 'null');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, v]) => typeof v === 'number'));
  } catch {
    return {};
  }
}

export function saveBest(storage: Pick<Storage, 'getItem' | 'setItem'>, level: number, correct: number): void {
  const best = loadBest(storage);
  best[level] = Math.max(best[level] ?? 0, correct);
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(best));
  } catch {
    // storage unavailable or full: best score just won't persist
  }
}

export function isLevelComplete(done: Set<string>, slugs: string[], best: number | undefined): boolean {
  return slugs.every((s) => done.has(s)) && (best ?? 0) >= PASS;
}
