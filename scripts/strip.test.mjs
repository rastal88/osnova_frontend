import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  ROOT,
  disabledByEnv,
  parseEnv,
  plan,
  pointAtOff,
  removeMarkedBlocks,
  withDependents,
} from './strip.mjs';

describe('which modules go', () => {
  it('reads the flags of the backend .env; a missing flag is off', () => {
    const env = parseEnv(
      '# Capabilities\nAUTH_ENABLED=true\nADMIN_ENABLED="true"\nFILES_ENABLED=false\n',
    );
    expect(disabledByEnv(env)).toEqual(['files', 'notifications']);
    expect(disabledByEnv({})).toEqual(['auth', 'admin', 'files', 'notifications']);
  });

  it('takes the modules that need a removed one', () => {
    expect(withDependents(['files'])).toEqual(['files']);
    expect(withDependents(['auth'])).toEqual(['admin', 'auth', 'files', 'notifications']);
  });

  it('stops on an unknown module', () => {
    expect(() => plan(['shop'])).toThrow('Unknown modules: shop');
  });
});

describe('the core points at off.ts', () => {
  const layout = [
    "import { AREA_HOME, useAuthStore } from '../../modules/auth';",
    "import { NotificationBell } from '../../modules/notifications';",
    "import { filesRoutes } from '../modules/files';",
    "import { lazyElement } from '../routes/lazy';",
    "import { authors } from '../../modules/authors';",
  ].join('\n');

  it('rewrites only the imports of the removed modules', () => {
    expect(pointAtOff(layout, ['auth', 'files']).split('\n')).toEqual([
      "import { AREA_HOME, useAuthStore } from '../../modules/off';",
      "import { NotificationBell } from '../../modules/notifications';",
      "import { filesRoutes } from '../modules/off';",
      "import { lazyElement } from '../routes/lazy';",
      "import { authors } from '../../modules/authors';",
    ]);
  });

  it('leaves the imports between modules alone', () => {
    expect(pointAtOff("import { ProtectedRoute } from '../auth';", ['auth'])).toBe(
      "import { ProtectedRoute } from '../auth';",
    );
  });

  const hasNotifications = existsSync(join(ROOT, 'src', 'modules', 'notifications'));

  it.skipIf(!hasNotifications)('finds the core files of the real project', () => {
    const steps = plan(['notifications']);
    expect(steps.folders).toEqual(['src/modules/notifications']);
    expect(steps.core).toEqual(['src/components/LayoutComponent/LayoutComponent.tsx']);
  });
});

describe('marked blocks', () => {
  const ci =
    'jobs:\n  build: {}\n  # strip:begin any — checks the strip\n  strip: {}\n  # strip:end\n';

  it('go with any strip', () => {
    expect(removeMarkedBlocks(ci, ['files'])).toBe('jobs:\n  build: {}\n');
  });

  it('must be closed', () => {
    expect(() => removeMarkedBlocks('# strip:begin files\nx\n', ['files'])).toThrow();
  });
});
