/**
 * Notifications module — the bell in the header for signed-in users.
 * Enabled by the `notifications` capability from /bootstrap (backend: NOTIFICATIONS_ENABLED).
 * The bell is lazy-loaded: the main bundle only holds this file.
 */
import { Suspense, lazy } from 'react';

const Bell = lazy(() => import('./Bell/Bell'));

export const NotificationBell = () => (
  <Suspense fallback={null}>
    <Bell />
  </Suspense>
);
