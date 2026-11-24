# Level Quizzes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** One checkpoint quiz at the end of each level path (Foundations, Intermediate, Advanced) so learners test themselves and get a clear "level finished" moment.

**Architecture:** Quiz data is plain TypeScript (`src/quizzes/level-N.ts`). Scoring is a pure module (`src/engine/quiz.ts`). One Astro page `src/pages/quiz/[level].astro` renders the questions as native radio groups; a small vanilla script (`src/scripts/quiz-dom.ts`, same pattern as `progress-dom.ts`) grades, shows feedback, and stores the best score in localStorage. The home page adds a "Level N quiz" stop at the end of each path. No React, no new dependencies.

**Spec:** extends `docs/superpowers/specs/2026-11-18-system-design-learning-design.md`.

## Global Constraints

- 5 multiple-choice questions per level, 3 options each, one correct. Questions test trade-offs ("which would you pick when...") over recall.
- Every question has a one-sentence explanation shown after grading, and names the lesson slug to revisit.
- Static, no backend. Best score per level in `localStorage` key `sdl.quiz.v1` (safe-storage fallback as in `progress-dom.ts`).
- Rules in `tests/rules.test.ts` hold: no raw colors outside `global.css`, motion guarded by `prefers-reduced-motion`, no `:hover`, no banned deps.
- Accessibility: native `<fieldset>`/`<legend>`/radio inputs, visible focus, result announced in `aria-live="polite"`, correct/wrong shown by icon+text, not color alone.
- Quiz is never locked. Pass mark is 4/5 (`PASS = 4`, exported from `src/engine/quiz.ts`).
- A level is **complete** only when every lesson in it is done AND its best quiz score is at least `PASS`. Finishing lessons alone does not complete a level.

## Tasks

### Task 1: Quiz types and scoring (TDD)
- [ ] Add `tests/quiz.test.ts`: `score(answers, quiz)` returns `{correct, total, wrong: number[]}`; unanswered counts wrong; `bestScore` keeps the higher of old and new; `loadBest`/`saveBest` tolerate bad JSON and throwing storage.
- [ ] Implement `src/engine/quiz.ts` (`Question`, `Quiz`, `score`, `loadBest`, `saveBest`, `STORAGE_KEY = 'sdl.quiz.v1'`).
- [ ] `npm run verify`.

### Task 2: Quiz content validator (TDD)
- [ ] Add `tests/quizzes.test.ts`: each of 3 levels has exactly 5 questions, 3 options, `answer` in range, non-empty `explain`, `lesson` slug exists in `src/content/lessons` and belongs to that level.
- [ ] Add `src/quizzes/index.ts` exporting `quizzes` keyed by level, with empty stubs so the test fails first (RED).

### Task 3: Write the 15 questions
- [ ] `src/quizzes/level-1.ts`, `level-2.ts`, `level-3.ts`. Draw each question from a different lesson in that level; check answers against the lesson text. Task 2 test goes GREEN.

### Task 4: Quiz page and grading script
- [ ] `src/pages/quiz/[level].astro` (static paths 1 to 3): fieldset per question, "Check answers" button, back link, result region.
- [ ] `src/scripts/quiz-dom.ts` + `tests/quiz-dom.test.ts` (jsdom): grading marks each question right or wrong with icon+text, shows explanation and lesson link, announces score, saves best, allows retry.
- [ ] CSS in `global.css` using existing tokens only.

### Task 5: Home page stop and level completion
- [ ] In `src/pages/index.astro`, add a final `li.stop` per level linking to `/quiz/N`, showing best score ("4/5") or "Not taken". Extend `progress-dom.ts` to paint the best score and set `data-complete` on each `section.level` (all lesson links `data-done` and best >= `PASS`). A complete level shows a "Level complete" badge on its heading and its quiz stop turns green; an incomplete level whose lessons are all done shows "Pass the quiz to finish" on the quiz stop. Add `isLevelComplete(done, slugs, best)` as a pure function in `src/engine/quiz.ts` with tests (lessons done but quiz failed, quiz passed but a lesson missing, both met). The overall progress bar from the home page stays lessons-only.

### Task 6: Verify and record
- [ ] `npm run verify` and `npm run e2e`; add one e2e: answer all correctly on `/quiz/1`, see 5/5, return home, see badge.
- [ ] Append a line to `decisions.tsv`. Update README only if it lists pages.

## Out of scope
Per-lesson quizzes, timers, leaderboards, question shuffling, locking levels behind passing, accounts.

## Decisions
- Pass mark 4/5 (confirmed).
- Level completion depends on the quiz (confirmed).
