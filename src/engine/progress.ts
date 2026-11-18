export const STORAGE_KEY = 'sdl.done.v1';

export function loadDone(storage: Pick<Storage, 'getItem'>): Set<string> {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? 'null');
    return new Set(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

export function toggleDone(storage: Pick<Storage, 'getItem' | 'setItem'>, slug: string): Set<string> {
  const done = loadDone(storage);
  if (!done.delete(slug)) done.add(slug);
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify([...done]));
  } catch {
    // storage unavailable or full: progress just won't persist
  }
  return done;
}
