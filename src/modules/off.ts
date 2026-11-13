/**
 * What the app gets from a module that `npm run strip` removed: the same names the core
 * imports from the modules, with the values of a module that is off (as when its
 * capability is off in /bootstrap). The strip points the core's imports of the removed
 * module here, so the core keeps working unchanged.
 *
 * Importing a new name from a module into the core: add it here too
 * (src/modules/off.test.ts checks it; <module>/off.check.ts keeps the types in step).
 */
import type { ComponentType } from 'react';
import type { RouteObject } from 'react-router-dom';
import { create } from 'zustand';

import type { Area } from '../config/navigation';

// --- auth: nobody is signed in, nothing is loading
interface SignedOut {
  user: { areas: Area[]; permissions?: string[] } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  fetchUser: () => Promise<unknown>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<SignedOut>(() => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  fetchUser: async () => null,
  logout: async () => {},
}));

export const AREA_HOME: Record<Area, string> = { admin: '/admin', user: '/' };

export const areaOfPath = (_pathname: string): Area => 'user';

export const otherArea = (_pathname: string, _areas: Area[]): Area | undefined => undefined;

export const authPublicRoutes: RouteObject[] = [];

export const authLayoutRoutes: RouteObject[] = [];

// --- admin: added only with the admin capability, which a project without it has off
export const adminRoute: RouteObject = { path: '/admin' };

// --- files
export const filesRoutes: RouteObject[] = [];

// --- notifications
export const NotificationBell: ComponentType = () => null;
