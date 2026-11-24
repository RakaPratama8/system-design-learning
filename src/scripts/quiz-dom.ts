import { saveBest, score } from '../engine/quiz';
import { safeStorage } from './progress-dom';

export function initQuiz(root: Document = document): void {
  const form = root.querySelector<HTMLFormElement>('form[data-quiz]');
  if (!form) return;
  const storage = safeStorage(root.defaultView);
  const level = Number(form.dataset.level);
  const pass = Number(form.dataset.pass);
  const sets = [...form.querySelectorAll<HTMLElement>('fieldset[data-q]')];
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const answers = sets.map((s) => {
      const picked = s.querySelector<HTMLInputElement>('input:checked');
      return picked ? Number(picked.value) : -1;
    });
    const res = score(answers, sets.map((s) => ({ answer: Number(s.dataset.answer) })));
    sets.forEach((s, i) => {
      const ok = !res.wrong.includes(i);
      s.dataset.state = ok ? 'right' : 'wrong';
      s.querySelector<HTMLElement>('[data-verdict]')!.textContent = ok ? '✓ Correct.' : answers[i] < 0 ? '✗ Not answered.' : '✗ Not quite.';
      s.querySelector<HTMLElement>('.fb')!.hidden = false;
    });
    saveBest(storage, level, res.correct);
    const passed = res.correct >= pass;
    form.querySelector<HTMLElement>('[data-result]')!.textContent =
      `${res.correct} / ${res.total}. ${passed ? 'Passed. Back on the path, finish any lessons left to complete this level.' : `Pass mark is ${pass}. Review the linked lessons and try again.`}`;
  });
}
