import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'numbers',
  items: [
    { id: 'users', label: 'Daily users', unit: 'million', max: 100 },
    { id: 'requests', label: 'Requests/day', unit: 'million', max: 1000 },
    { id: 'avg', label: 'Average load', unit: 'req/s', max: 10000 },
    { id: 'peak', label: 'Peak load', unit: 'req/s', max: 10000 },
    { id: 'storage', label: 'New data/day', unit: 'GB', max: 1000 },
  ],
  steps: [
    { caption: 'Estimation turns a vague question into numbers. Start with an assumption about users: 10 million per day.', values: { users: 10 } },
    { caption: 'Assume each user makes about 10 requests a day. That is 100 million requests per day.', values: { requests: 100 } },
    { caption: 'A day has about 86,400 seconds, so the average load is 100 million / 86,400, about 1,157 requests per second.', values: { avg: 1157 } },
    { caption: 'Traffic is not flat. A common rule of thumb is that the peak is about 3 times the average: roughly 3,500 requests per second.', values: { peak: 3500 } },
    { caption: 'If 1 in 10 requests writes 1 KB, that is 10 million x 1 KB = 10 GB of new data per day, about 3.6 TB per year.', values: { storage: 10 } },
    { caption: 'Round numbers and written assumptions are enough. The goal is the right order of magnitude: one server or a hundred?', values: {} },
  ],
};

export default scene;
