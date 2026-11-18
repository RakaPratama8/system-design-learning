import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'numbers',
  items: [
    { id: 'scan', label: 'Full scan', unit: 'checks', max: 1000000 },
    { id: 'index', label: 'With index', unit: 'checks', max: 1000000 },
  ],
  steps: [
    { caption: 'A table of 1,000 rows. To find one user, a full scan checks the rows one by one.', values: { scan: 1000, index: 0 } },
    { caption: 'An index is a sorted copy of one column, with a pointer to each row. Finding a value in it takes about 10 checks.', values: { scan: 1000, index: 10 } },
    { caption: 'At 10,000 rows the scan does ten times more work. The index barely changes.', values: { scan: 10000, index: 13 } },
    { caption: 'At 100,000 rows the gap is huge.', values: { scan: 100000, index: 17 } },
    { caption: 'At a million rows: a million checks against about twenty.', values: { scan: 1000000, index: 20 } },
  ],
};

export default scene;
