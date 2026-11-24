import type { Quiz } from '../engine/quiz';

export const level1: Quiz = [
  {
    q: 'One server is overloaded and you add three more. What must sit in front of them so clients still use one address?',
    options: ['A load balancer', 'A bigger database', 'A second DNS provider'],
    answer: 0,
    explain: 'A load balancer spreads requests across the servers behind one address.',
    lesson: 'load-balancers',
  },
  {
    q: 'Your app has fixed, related data (orders, customers, payments) and needs transactions across them. Which fits best?',
    options: ['A key-value store', 'A SQL database', 'A plain text file'],
    answer: 1,
    explain: 'Related data with multi-row transactions is what relational SQL databases are built for.',
    lesson: 'sql-vs-nosql',
  },
  {
    q: 'A query filters a huge table by email and is slow. What is the usual first fix?',
    options: ['Add more RAM to the client', 'Split the table into two copies', 'Add an index on the email column'],
    answer: 2,
    explain: 'An index lets the database jump to matching rows instead of scanning the whole table.',
    lesson: 'indexes',
  },
  {
    q: 'What does DNS do when you type a site name in the browser?',
    options: ['Encrypts the page', 'Picks the fastest server farm', 'Turns the name into an IP address'],
    answer: 2,
    explain: 'DNS maps a human-readable name to the IP address the browser connects to.',
    lesson: 'dns',
  },
  {
    q: 'You keep buying a bigger machine and it is nearly the largest available. What is the next scaling move?',
    options: ['Scale horizontally with more machines', 'Scale vertically again', 'Remove the database'],
    answer: 0,
    explain: 'Vertical scaling hits a hardware ceiling; adding more machines (horizontal) keeps going.',
    lesson: 'scaling-vertical-horizontal',
  },
];
