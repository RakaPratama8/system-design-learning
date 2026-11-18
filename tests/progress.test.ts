import { describe, expect, it } from 'vitest';
import { loadDone, STORAGE_KEY, toggleDone } from '../src/engine/progress';

const store = (initial: string | null = null) => {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_k: string, v: string) => { value = v; },
    get value() { return value; },
  };
};

describe('loadDone', () => {
  it('returns an empty set for missing, corrupt, or non-array data', () => {
    expect(loadDone(store(null)).size).toBe(0);
    expect(loadDone(store('{')).size).toBe(0);
    expect(loadDone(store('{}')).size).toBe(0);
  });
  it('reads a stored array', () => {
    expect([...loadDone(store('["a","b"]'))].sort()).toEqual(['a', 'b']);
  });
  it('survives getItem throwing', () => {
    const s = { getItem: () => { throw new Error('denied'); } };
    expect(loadDone(s).size).toBe(0);
  });
  it('ignores non-string entries', () => {
    expect([...loadDone(store('["a",1,null]'))]).toEqual(['a']);
  });
});

describe('toggleDone', () => {
  it('adds then removes a slug and persists a JSON array', () => {
    const s = store();
    expect([...toggleDone(s, 'a')]).toEqual(['a']);
    expect(JSON.parse(s.value!)).toEqual(['a']);
    expect(toggleDone(s, 'a').size).toBe(0);
    expect(JSON.parse(s.value!)).toEqual([]);
  });
  it('still returns the updated set when setItem throws', () => {
    const s = { getItem: () => null, setItem: () => { throw new Error('quota'); } };
    expect([...toggleDone(s, 'a')]).toEqual(['a']);
  });
  it('uses the documented storage key', () => expect(STORAGE_KEY).toBe('sdl.done.v1'));
});
