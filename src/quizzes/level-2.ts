import type { Quiz } from '../engine/quiz';

export const level2: Quiz = [
  {
    q: 'The same product page is read thousands of times and rarely changes. What helps most?',
    options: ['Cache the result', 'Add more write replicas', 'Shorten the URL'],
    answer: 0,
    explain: 'Reads of rarely changing data are ideal for caching: answer once, reuse many times.',
    lesson: 'caching',
  },
  {
    q: 'Sending email after signup slows the request. How do you keep signup fast?',
    options: ['Send it inline and wait', 'Put a job on a message queue for a worker', 'Disable the email'],
    answer: 1,
    explain: 'A queue lets the request return now while a worker does the slow task later.',
    lesson: 'message-queues',
  },
  {
    q: 'A client sends far too many requests and hurts other users. What protects the service?',
    options: ['More indexes', 'A longer timeout', 'Rate limiting'],
    answer: 2,
    explain: 'Rate limiting caps how many requests each client can make in a time window.',
    lesson: 'rate-limiting',
  },
  {
    q: 'Users far from your server see slow image loads. What reduces that delay?',
    options: ['A CDN with edge copies near users', 'A bigger database', 'A queue in front of the images'],
    answer: 0,
    explain: 'A CDN serves static files from locations close to the user, cutting distance.',
    lesson: 'cdn',
  },
  {
    q: 'Your database is a single point of failure. What lowers that risk?',
    options: ['Keep one copy but back it up weekly', 'Add a cache only', 'Replicate it to another server'],
    answer: 2,
    explain: 'A replica can take over if the primary fails, and it can also serve reads.',
    lesson: 'replication',
  },
];
