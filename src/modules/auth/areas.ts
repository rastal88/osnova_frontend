import type { Area } from '../../api/generated';

export type { Area };

/** Start page of each area. The backend lists a user's areas; the first is the landing one. */
export const AREA_HOME: Record<Area, string> = {
  admin: '/admin',
  client: '/dashboard',
};

/** Where to go after sign-in. */
export function landingPath(user: { areas: Area[] } | null): string {
  const area = user?.areas[0];
  return area ? AREA_HOME[area] : '/';
}

/** The area a page belongs to: admin pages live under /admin, the rest is the client side. */
export function areaOfPath(pathname: string): Area {
  return pathname === AREA_HOME.admin || pathname.startsWith(`${AREA_HOME.admin}/`)
    ? 'admin'
    : 'client';
}

/** The area the switcher in the user menu leads to, if the user has another one. */
export function otherArea(pathname: string, areas: Area[]): Area | undefined {
  const current = areaOfPath(pathname);
  return areas.find((area) => area !== current);
}
