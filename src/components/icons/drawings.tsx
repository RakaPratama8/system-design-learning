import type { JSX } from 'react';
import type { IconName } from '../../engine/icons';

// Every drawing fits a 40x40 box. Classes: m = main fill, s = soft fill, l = line stroke.
export const DRAWINGS: Record<IconName, () => JSX.Element> = {
  phone: () => (
    <>
      <rect className="m" x="12" y="4" width="16" height="32" rx="4" />
      <rect className="s" x="15" y="9" width="10" height="20" rx="1.5" />
      <circle className="s" cx="20" cy="32.5" r="1.3" />
    </>
  ),
  laptop: () => (
    <>
      <rect className="m" x="7" y="9" width="26" height="17" rx="2" />
      <rect className="s" x="10" y="12" width="20" height="11" rx="1" />
      <path className="m" d="M3 29h34l-2.5 4a2 2 0 0 1-1.7 1H7.2a2 2 0 0 1-1.7-1z" />
    </>
  ),
  tablet: () => (
    <>
      <rect className="m" x="8" y="5" width="24" height="30" rx="4" />
      <rect className="s" x="11" y="9" width="18" height="22" rx="1.5" />
      <circle className="s" cx="20" cy="33" r="1.2" />
    </>
  ),
  browser: () => (
    <>
      <rect className="m" x="4" y="7" width="32" height="26" rx="3" />
      <rect className="s" x="7" y="14" width="26" height="16" rx="1.5" />
      <circle className="s" cx="9" cy="10.5" r="1.2" />
      <circle className="s" cx="13" cy="10.5" r="1.2" />
      <circle className="s" cx="17" cy="10.5" r="1.2" />
    </>
  ),
  person: () => (
    <>
      <circle className="m" cx="20" cy="13" r="7" />
      <path className="m" d="M7 35c0-8 6-13 13-13s13 5 13 13z" />
    </>
  ),
  people: () => (
    <>
      <circle className="s" cx="27" cy="13" r="5" />
      <path className="s" d="M18 33c0-6 4.5-10 9-10s9 4 9 10z" />
      <circle className="m" cx="15" cy="15" r="6" />
      <path className="m" d="M4 35c0-7 5-11 11-11s11 4 11 11z" />
    </>
  ),
  server: () => (
    <>
      <rect className="m" x="5" y="6" width="30" height="13" rx="3" />
      <rect className="m" x="5" y="21" width="30" height="13" rx="3" />
      <rect className="s" x="9" y="11" width="10" height="3" rx="1.5" />
      <rect className="s" x="9" y="26" width="10" height="3" rx="1.5" />
      <circle className="s" cx="29" cy="12.5" r="1.8" />
      <circle className="s" cx="29" cy="27.5" r="1.8" />
    </>
  ),
  app: () => (
    <>
      <rect className="m" x="5" y="6" width="30" height="28" rx="4" />
      <rect className="s" x="10" y="11" width="8" height="8" rx="2" />
      <rect className="s" x="22" y="11" width="8" height="8" rx="2" />
      <rect className="s" x="10" y="22" width="8" height="7" rx="2" />
      <rect className="s" x="22" y="22" width="8" height="7" rx="2" />
    </>
  ),
  service: () => (
    <>
      <polygon className="m" points="20,4 34,12 34,28 20,36 6,28 6,12" />
      <polygon className="s" points="20,12 27,16 27,24 20,28 13,24 13,16" />
    </>
  ),
  node: () => (
    <>
      <path className="l" d="M20 20L8 10M20 20L32 10M20 20L20 33" />
      <circle className="m" cx="20" cy="20" r="6" />
      <circle className="m" cx="8" cy="10" r="4" />
      <circle className="m" cx="32" cy="10" r="4" />
      <circle className="m" cx="20" cy="33" r="4" />
    </>
  ),
  search: () => (
    <>
      <path className="l" d="M26 26L35 35" strokeWidth="5" />
      <circle className="m" cx="17" cy="17" r="11" />
      <circle className="s" cx="17" cy="17" r="7" />
    </>
  ),
  analytics: () => (
    <>
      <rect className="m" x="6" y="22" width="6" height="13" rx="1.5" />
      <rect className="m" x="17" y="14" width="6" height="21" rx="1.5" />
      <rect className="m" x="28" y="6" width="6" height="29" rx="1.5" />
      <rect className="s" x="4" y="36" width="32" height="2" rx="1" />
    </>
  ),
  database: () => (
    <>
      <path className="m" d="M6 10v20c0 3.3 6.3 6 14 6s14-2.7 14-6V10z" />
      <path className="s" d="M6 19.5c0 3.2 6.3 5.8 14 5.8s14-2.6 14-5.8v2.2c0 3.2-6.3 5.8-14 5.8S6 24.9 6 21.7z" />
      <ellipse className="s" cx="20" cy="10" rx="14" ry="5.5" />
    </>
  ),
  cache: () => (
    <>
      <rect className="m" x="5" y="5" width="30" height="30" rx="7" />
      <polygon className="s" points="22,9 12,22 19,22 17,31 28,17 21,17" />
    </>
  ),
  shard: () => (
    <>
      <path className="m" d="M6 10v20c0 3.3 6.3 6 14 6s14-2.7 14-6V10z" />
      <ellipse className="s" cx="20" cy="10" rx="14" ry="5.5" />
      <polygon className="s" points="20,21 34,16 34,31 20,35" />
    </>
  ),
  table: () => (
    <>
      <rect className="m" x="4" y="7" width="32" height="26" rx="3" />
      <rect className="s" x="8" y="11" width="24" height="4" rx="1" />
      <rect className="s" x="8" y="18" width="8" height="4" rx="1" />
      <rect className="s" x="18" y="18" width="14" height="4" rx="1" />
      <rect className="s" x="8" y="25" width="8" height="4" rx="1" />
      <rect className="s" x="18" y="25" width="14" height="4" rx="1" />
    </>
  ),
  document: () => (
    <>
      <path className="m" d="M9 4h16l8 8v24H9z" />
      <polygon className="s" points="25,4 25,12 33,12" />
      <rect className="s" x="13" y="19" width="16" height="2.5" rx="1" />
      <rect className="s" x="13" y="25" width="16" height="2.5" rx="1" />
      <rect className="s" x="13" y="31" width="10" height="2.5" rx="1" />
    </>
  ),
  feed: () => (
    <>
      <circle className="m" cx="9" cy="10" r="3.5" />
      <rect className="m" x="16" y="8" width="18" height="3.5" rx="1.75" />
      <rect className="s" x="16" y="13.5" width="12" height="2.5" rx="1.25" />
      <circle className="m" cx="9" cy="21" r="3.5" />
      <rect className="m" x="16" y="19" width="18" height="3.5" rx="1.75" />
      <rect className="s" x="16" y="24.5" width="12" height="2.5" rx="1.25" />
      <circle className="m" cx="9" cy="32" r="3.5" />
      <rect className="m" x="16" y="30" width="18" height="3.5" rx="1.75" />
    </>
  ),
  key: () => (
    <>
      <rect className="m" x="18" y="18" width="18" height="4" rx="2" />
      <rect className="m" x="28" y="22" width="3" height="5" rx="1" />
      <rect className="m" x="33" y="22" width="3" height="4" rx="1" />
      <circle className="m" cx="12" cy="20" r="8" />
      <circle className="s" cx="12" cy="20" r="3" />
    </>
  ),
  order: () => (
    <>
      <path className="m" d="M9 4h22v32l-4-3-3.5 3-3.5-3-3.5 3-3.5-3L9 36z" />
      <rect className="s" x="13" y="10" width="14" height="2.5" rx="1" />
      <rect className="s" x="13" y="16" width="14" height="2.5" rx="1" />
      <rect className="s" x="13" y="22" width="9" height="2.5" rx="1" />
    </>
  ),
  payment: () => (
    <>
      <rect className="m" x="3" y="9" width="34" height="22" rx="4" />
      <rect className="s" x="3" y="15" width="34" height="5" />
      <rect className="s" x="7" y="24" width="9" height="4" rx="1" />
    </>
  ),
  inventory: () => (
    <>
      <rect className="m" x="5" y="14" width="30" height="21" rx="2" />
      <rect className="m" x="3" y="8" width="34" height="8" rx="2" />
      <rect className="s" x="15" y="21" width="10" height="4" rx="1" />
    </>
  ),
  balancer: () => (
    <>
      <path className="l" d="M18 20L32 9M18 20H32M18 20L32 31" />
      <circle className="m" cx="9" cy="20" r="5" />
      <circle className="m" cx="33" cy="8" r="4" />
      <circle className="m" cx="33" cy="20" r="4" />
      <circle className="m" cx="33" cy="32" r="4" />
      <path className="l" d="M14 20H18" />
    </>
  ),
  gateway: () => (
    <>
      <path className="m" d="M6 36V18a14 14 0 0 1 28 0v18z" />
      <path className="s" d="M13 36V19a7 7 0 0 1 14 0v17z" />
    </>
  ),
  router: () => (
    <>
      <path className="l" d="M12 15L9 6M28 15L31 6" />
      <rect className="m" x="5" y="15" width="30" height="15" rx="4" />
      <circle className="s" cx="12" cy="22.5" r="2" />
      <circle className="s" cx="20" cy="22.5" r="2" />
      <circle className="s" cx="28" cy="22.5" r="2" />
    </>
  ),
  dns: () => (
    <>
      <circle className="m" cx="20" cy="20" r="15" />
      <ellipse className="s" cx="20" cy="20" rx="5.5" ry="15" />
      <rect className="s" x="5" y="18.5" width="30" height="3" />
    </>
  ),
  'cdn-edge': () => (
    <>
      <path className="m" d="M20 3c-7 0-12 5-12 11.5C8 24 20 37 20 37s12-13 12-22.5C32 8 27 3 20 3z" />
      <circle className="s" cx="20" cy="14.5" r="5" />
    </>
  ),
  limiter: () => (
    <>
      <polygon className="m" points="5,7 35,7 23,21 23,34 17,34 17,21" />
      <rect className="s" x="9" y="10" width="22" height="3" rx="1.5" />
    </>
  ),
  queue: () => (
    <>
      <rect className="m" x="3" y="11" width="9" height="18" rx="2" />
      <rect className="m" x="15.5" y="11" width="9" height="18" rx="2" />
      <rect className="m" x="28" y="11" width="9" height="18" rx="2" />
      <rect className="s" x="5.5" y="17" width="4" height="6" rx="1" />
      <rect className="s" x="18" y="17" width="4" height="6" rx="1" />
      <rect className="s" x="30.5" y="17" width="4" height="6" rx="1" />
    </>
  ),
  topic: () => (
    <>
      <path className="l" d="M10 10a14 14 0 0 0 0 20M30 10a14 14 0 0 1 0 20M14.5 14.5a8 8 0 0 0 0 11M25.5 14.5a8 8 0 0 1 0 11" />
      <circle className="m" cx="20" cy="20" r="5" />
    </>
  ),
  push: () => (
    <>
      <path className="m" d="M20 4a2.5 2.5 0 0 1 2.5 2.5V8c5 1.3 8 5.6 8 11v6l3 4H6.5l3-4v-6c0-5.4 3-9.7 8-11V6.5A2.5 2.5 0 0 1 20 4z" />
      <path className="m" d="M16 34a4 4 0 0 0 8 0z" />
      <rect className="s" x="13.5" y="14" width="3" height="9" rx="1.5" />
    </>
  ),
  email: () => (
    <>
      <rect className="m" x="4" y="9" width="32" height="22" rx="3" />
      <polygon className="s" points="5,10 20,23 35,10 35,13.5 20,26.5 5,13.5" />
    </>
  ),
};
