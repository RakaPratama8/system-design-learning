import type { Scene } from '../engine/types';

const modules = import.meta.glob<{ default: Scene }>('./*.ts', { eager: true });

export const scenes: Record<string, Scene> = Object.fromEntries(
  Object.entries(modules)
    .filter(([path]) => path !== './index.ts')
    .map(([path, mod]) => [path.replace(/^\.\/|\.ts$/g, ''), mod.default]),
);
