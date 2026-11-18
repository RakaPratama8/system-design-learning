export const ICON_NAMES = [
  'phone', 'laptop', 'tablet', 'browser', 'person', 'people',
  'server', 'app', 'service', 'node', 'search', 'analytics',
  'database', 'cache', 'shard', 'table', 'document', 'feed', 'key', 'order', 'payment', 'inventory',
  'balancer', 'gateway', 'router', 'dns', 'cdn-edge', 'limiter',
  'queue', 'topic', 'push', 'email',
] as const;

export type IconName = (typeof ICON_NAMES)[number];
export type IconFamily = 'slate' | 'blue' | 'violet' | 'teal' | 'pink';

// Green, amber and red are reserved for status, so categories use other hues.
export const ICON_FAMILY: Record<IconName, IconFamily> = {
  phone: 'slate', laptop: 'slate', tablet: 'slate', browser: 'slate', person: 'slate', people: 'slate',
  server: 'blue', app: 'blue', service: 'blue', node: 'blue', search: 'blue', analytics: 'blue',
  database: 'violet', cache: 'violet', shard: 'violet', table: 'violet', document: 'violet', feed: 'violet',
  key: 'violet', order: 'violet', payment: 'violet', inventory: 'violet',
  balancer: 'teal', gateway: 'teal', router: 'teal', dns: 'teal', 'cdn-edge': 'teal', limiter: 'teal',
  queue: 'pink', topic: 'pink', push: 'pink', email: 'pink',
};

export function isIconName(x: string): x is IconName {
  return (ICON_NAMES as readonly string[]).includes(x);
}
