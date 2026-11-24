import type { Quiz } from '../engine/quiz';

export const level3: Quiz = [
  {
    q: 'One database can no longer hold or serve all the data. What splits it across machines?',
    options: ['Sharding by a key', 'A bigger cache', 'More DNS records'],
    answer: 0,
    explain: 'Sharding partitions data by a key so each machine holds only a part.',
    lesson: 'sharding',
  },
  {
    q: 'Adding a server with simple "key mod N" placement moves almost every key. What avoids that?',
    options: ['Removing the hash', 'Bigger shards', 'Consistent hashing'],
    answer: 2,
    explain: 'Consistent hashing moves only a small share of keys when servers join or leave.',
    lesson: 'consistent-hashing',
  },
  {
    q: 'During a network partition you must choose. Which pair is the CAP trade-off?',
    options: ['Speed or cost', 'Consistency or availability', 'Reads or writes'],
    answer: 1,
    explain: 'When the network splits, a system can stay consistent or stay available, not both.',
    lesson: 'cap-consistency',
  },
  {
    q: 'A payment request times out and the client retries. How do you avoid charging twice?',
    options: ['Never retry', 'Use an idempotency key', 'Retry faster'],
    answer: 1,
    explain: 'An idempotency key lets the server recognise a repeat and return the first result.',
    lesson: 'idempotency-retries',
  },
  {
    q: 'A multi-service order fails at step 3 of 4. How does a saga handle it?',
    options: ['Ignore the failure', 'Lock every database until fixed', 'Run compensating actions for completed steps'],
    answer: 2,
    explain: 'A saga undoes finished steps with compensating actions instead of one global transaction.',
    lesson: 'sagas',
  },
];
