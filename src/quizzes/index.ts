import type { Quiz } from '../engine/quiz';
import { level1 } from './level-1';
import { level2 } from './level-2';
import { level3 } from './level-3';

export const quizzes: Record<number, Quiz> = { 1: level1, 2: level2, 3: level3 };
