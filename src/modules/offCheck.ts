/**
 * Type check that a module's values fit what src/modules/off.ts gives instead: each
 * module has an `off.check.ts` (deleted with it by `npm run strip`) that lists them, so
 * `npm run typecheck` fails as soon as the two differ.
 */
export type Fits<Real, Off> = [Real] extends [Off] ? true : false;

/** The state of a zustand store. */
export type StateOf<Store extends { getState: () => unknown }> = ReturnType<Store['getState']>;
