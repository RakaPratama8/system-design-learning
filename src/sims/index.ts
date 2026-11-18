import type { Sim } from '../engine/types';

const modules = import.meta.glob<{ default: Sim }>('./*.ts', { eager: true });

export const sims: Record<string, Sim> = Object.fromEntries(
  Object.entries(modules)
    .filter(([path]) => path !== './index.ts')
    .map(([path, mod]) => [path.replace(/^\.\/|\.ts$/g, ''), mod.default]),
);
