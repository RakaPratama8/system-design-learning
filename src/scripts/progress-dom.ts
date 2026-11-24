import { loadDone, toggleDone } from '../engine/progress';

// localStorage can throw (blocked, private mode); fall back to memory so toggles still work in-page.
function safeStorage(win: Window | null): Pick<Storage, 'getItem' | 'setItem'> {
  const memory = new Map<string, string>();
  const real = () => {
    try {
      return win?.localStorage ?? null;
    } catch {
      return null;
    }
  };
  return {
    getItem: (k) => {
      try {
        return real()?.getItem(k) ?? memory.get(k) ?? null;
      } catch {
        return memory.get(k) ?? null;
      }
    },
    setItem: (k, v) => {
      memory.set(k, v);
      try {
        real()?.setItem(k, v);
      } catch {
        // kept in memory only
      }
    },
  };
}

export function initProgress(root: Document = document): void {
  const storage = safeStorage(root.defaultView);
  const paint = (done: Set<string>) => {
    let current = true;
    root.querySelectorAll<HTMLElement>('[data-lesson-link]').forEach((el) => {
      const isDone = done.has(el.dataset.slug ?? '');
      el.toggleAttribute('data-done', isDone);
      // first lesson not yet done is the "start here" stop on the path
      el.toggleAttribute('data-current', current && !isDone);
      if (!isDone) current = false;
    });
    const meter = root.querySelector<HTMLElement>('[data-progress]');
    if (meter) {
      const links = [...root.querySelectorAll<HTMLElement>('[data-lesson-link]')];
      const n = links.filter((el) => el.hasAttribute('data-done')).length;
      meter.querySelector('[data-count]')!.textContent = String(n);
      const bar = meter.querySelector<HTMLElement>('.bar')!;
      bar.setAttribute('aria-valuenow', String(n));
      bar.style.setProperty('--pct', `${links.length ? (n / links.length) * 100 : 0}%`);
    }
    root.querySelectorAll<HTMLElement>('[data-mark-done]').forEach((b) => {
      const on = done.has(b.dataset.slug ?? '');
      b.setAttribute('aria-pressed', String(on));
      b.textContent = on ? 'Done ✓ (click to undo)' : 'Mark as done';
    });
  };
  root.querySelectorAll<HTMLElement>('[data-mark-done]').forEach((b) => b.removeAttribute('hidden'));
  paint(loadDone(storage));
  root.querySelectorAll<HTMLElement>('[data-mark-done]').forEach((b) => {
    b.addEventListener('click', () => paint(toggleDone(storage, b.dataset.slug ?? '')));
  });
}
