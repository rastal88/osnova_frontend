import type * as admin from '.';
// The values the core takes from this module fit their stand-ins in ../off.ts
// (src/modules/offCheck.ts); `npm run strip` deletes this file with the module.
import type * as off from '../off';
import type { Fits } from '../offCheck';

export const fitsOff: [Fits<typeof admin.adminRoute, typeof off.adminRoute>] = [true];
