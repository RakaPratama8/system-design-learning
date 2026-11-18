import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'compare',
  leftTitle: 'SQL (tables)',
  rightTitle: 'NoSQL (documents)',
  left: {
    nodes: [
      { id: 'query', label: 'Query', x: 50, y: 100, icon: 'search' },
      { id: 'orders', label: 'orders', x: 200, y: 44, icon: 'table' },
      { id: 'customers', label: 'customers', x: 200, y: 100, icon: 'table' },
      { id: 'items', label: 'items', x: 200, y: 156, icon: 'table' },
    ],
    edges: [
      { from: 'query', to: 'orders' },
      { from: 'orders', to: 'customers' },
      { from: 'orders', to: 'items' },
    ],
  },
  right: {
    nodes: [
      { id: 'query', label: 'Query', x: 50, y: 100, icon: 'search' },
      { id: 'doc', label: 'Order doc', x: 220, y: 100, icon: 'document' },
    ],
    edges: [{ from: 'query', to: 'doc' }],
  },
  steps: [
    {
      caption: 'SQL keeps data in tables with a fixed set of columns. A document store keeps each record as one flexible document.',
      left: { highlight: ['orders', 'customers', 'items'] },
      right: { highlight: ['doc'] },
    },
    {
      caption: 'The job: load order 42 together with its customer and its items.',
      left: { marker: ['query', 'orders'] },
      right: { marker: ['query', 'doc'] },
    },
    {
      caption: 'In SQL the data is split into tables, so the database joins them to rebuild the order.',
      left: {
        marker: ['orders', 'customers', 'orders', 'items'],
        states: { orders: { status: 'ok', fill: 0.6, label: 'JOIN' } },
      },
    },
    {
      caption: 'The document store returns the order, customer and items together in a single read.',
      right: { marker: ['doc', 'query'], states: { doc: { status: 'ok', label: '1 read' } } },
    },
    {
      caption: 'Trade-off: SQL protects consistency and handles ad hoc queries; documents have a flexible structure and scale out easily, but copy data.',
      left: { highlight: ['customers'], states: { customers: { status: 'ok', label: '1 copy' } } },
      right: { highlight: ['doc'], states: { doc: { status: 'ok', label: 'many copies' } } },
    },
  ],
};

export default scene;
