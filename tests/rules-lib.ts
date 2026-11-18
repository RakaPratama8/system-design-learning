export const BANNED_DEPS = [
  'framer-motion', 'motion', 'gsap', 'animejs', 'react-spring', '@react-spring/web',
  'lottie-web', 'react-transition-group', 'd3', 'mermaid', 'reactflow', '@xyflow/react',
];

const HEX = /(?<![&\w])(?<!href=["'])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;
const FUNC = /\b(?:rgba?|hsla?)\(/g;

export function findRawColors(text: string): string[] {
  return [...(text.match(HEX) ?? []), ...(text.match(FUNC) ?? [])];
}

export function usesMotionUnguarded(text: string): boolean {
  return /@keyframes|\banimation\s*:|\btransition\s*:/.test(text) && !text.includes('prefers-reduced-motion');
}

export function hasHover(text: string): boolean {
  return text.includes(':hover');
}

export function findBannedDeps(pkg: {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}): string[] {
  const names = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})];
  return names.filter((n) => BANNED_DEPS.includes(n));
}
