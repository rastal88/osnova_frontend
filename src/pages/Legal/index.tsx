/**
 * Legal pages: privacy policy, terms of use, cookie policy.
 * Owner details: src/config/legal.ts; texts: src/locales/<language>/legal.json.
 */
import type { RouteObject } from 'react-router-dom';

import { lazyElement } from '../../routes/lazy';
import type { LegalDocument } from './LegalPage';

const legalElement = (document: LegalDocument) =>
  lazyElement(() =>
    import('./LegalPage').then(({ default: LegalPage }) => ({
      default: () => <LegalPage document={document} />,
    })),
  );

/** Pages rendered inside the main layout, public. */
export const legalRoutes: RouteObject[] = [
  { path: 'privacy', element: legalElement('privacy') },
  { path: 'terms', element: legalElement('terms') },
  { path: 'cookies', element: legalElement('cookies') },
];

/** Linked from the footer, in this order. */
export const LEGAL_LINKS: { path: string; document: LegalDocument }[] = [
  { path: '/privacy', document: 'privacy' },
  { path: '/terms', document: 'terms' },
  { path: '/cookies', document: 'cookies' },
];
