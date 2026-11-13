import { describe, expect, it } from 'vitest';

import * as off from './off';

// Every source file as text, keyed by its path from this folder ('../routes/routes.tsx')
const sources = import.meta.glob<string>(['../**/*.{ts,tsx}', '!../api/generated/**'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

const isModuleFile = (path: string) => !path.startsWith('../') || path.startsWith('../modules/');

const IMPORT = /import\s+(type\s+)?\{([^}]*)\}\s+from\s+'([^']*\/modules\/([\w-]+)[^']*)'/g;

/** What the core (src outside the modules) imports from each module. */
const imports = Object.entries(sources)
  .filter(([path]) => !isModuleFile(path))
  .flatMap(([path, text]) =>
    [...text.matchAll(IMPORT)].map((match) => ({
      file: path.slice(3),
      typeOnly: Boolean(match[1]),
      names: match[2]
        .split(',')
        .map((name) => name.trim().split(/\s+as\s+/)[0])
        .filter(Boolean),
      specifier: match[3],
      module: match[4],
    })),
  )
  .filter((item) => item.module !== 'off');

describe('the core and the modules (npm run strip)', () => {
  it('reads the sources and finds the imports while there are modules', () => {
    expect(Object.keys(sources)).toContain('../routes/routes.tsx');
    const hasModules = Object.keys(sources).some((path) => /^\.\/[\w-]+\//.test(path));
    expect(imports.length > 0).toBe(hasModules);
  });

  it('imports a module only through its index, so the strip can point it at off.ts', () => {
    for (const item of imports) {
      expect(item.specifier, item.file).toMatch(new RegExp(`/modules/${item.module}$`));
    }
  });

  it('takes from a module only values that off.ts also has', () => {
    for (const item of imports) {
      expect(item.typeOnly, `${item.file}: type imports from a module`).toBe(false);
      for (const name of item.names) {
        expect(name.startsWith('type '), `${item.file}: type ${name}`).toBe(false);
        expect(
          Object.keys(off),
          `${item.file}: ${name} is missing in src/modules/off.ts`,
        ).toContain(name);
      }
    }
  });
});
