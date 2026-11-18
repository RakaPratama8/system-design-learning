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
    root.querySelectorAll<HTMLElement>('[data-lesson-link]').forEach((el) => {
      el.toggleAttribute('data-done', done.has(el.dataset.slug ?? ''));
    });
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
