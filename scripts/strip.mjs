// Remove the modules a project does not use (`npm run strip`), like `make strip` in the
// backend.
//
//   npm run strip                        # what would go, by the flags in ../osnova_backend/.env
//   npm run strip -- files notifications # name the modules instead
//   npm run strip -- --apply             # remove (asks first; --yes does not)
//
// A module goes with the modules that need it (auth takes admin, files and notifications).
// Removed: src/modules/<name>, and in the core every `from '.../modules/<name>'` points at
// src/modules/off.ts, which has the same names with the values of a module that is off.
// The CI blocks between `strip:begin <names>` and `strip:end` go too.
//
// Runs only on a clean git working tree, so `git checkout . && git clean -fd` undoes it.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MODULES = join(ROOT, 'src', 'modules');

/** The modules, the backend flag of each and the modules they need (as in the backend). */
export const MODULE_FLAGS = {
  auth: { flag: 'AUTH_ENABLED', requires: [] },
  admin: { flag: 'ADMIN_ENABLED', requires: ['auth'] },
  files: { flag: 'FILES_ENABLED', requires: ['auth'] },
  notifications: { flag: 'NOTIFICATIONS_ENABLED', requires: ['auth'] },
};

const MARKER = /strip:begin\s+([\w ]+)/;

/** KEY=value lines of an .env file (comments and blanks skipped). */
export function parseEnv(text) {
  const values = {};
  for (const line of text.split('\n')) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match) values[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  return values;
}

/** The modules whose flag is off (a missing flag is off, as in the backend). */
export function disabledByEnv(env) {
  return Object.keys(MODULE_FLAGS).filter((name) => env[MODULE_FLAGS[name].flag] !== 'true');
}

/** The modules plus every module that needs one of them. */
export function withDependents(names) {
  const removed = new Set(names);
  let grown = true;
  while (grown) {
    grown = false;
    for (const [name, { requires }] of Object.entries(MODULE_FLAGS)) {
      if (!removed.has(name) && requires.some((need) => removed.has(need))) {
        removed.add(name);
        grown = true;
      }
    }
  }
  return [...removed].sort();
}

/** The import specifiers of the removed modules point at off.ts. */
export function pointAtOff(text, names) {
  let result = text;
  for (const name of names) {
    result = result.replace(
      new RegExp(`(['"])((?:\\.\\./|\\./)+(?:modules/)?)${name}\\1`, 'g'),
      (match, quote, prefix) =>
        prefix.endsWith('modules/') ? `${quote}${prefix}off${quote}` : match,
    );
  }
  return result;
}

/** Drop `strip:begin <names>` ... `strip:end` blocks naming a removed module (or `any`). */
export function removeMarkedBlocks(text, names) {
  const out = [];
  let skipping = false;
  for (const line of text.split(/(?<=\n)/)) {
    const match = !skipping && line.match(MARKER);
    if (match) {
      const listed = match[1].trim().split(/\s+/);
      skipping = listed.includes('any') || listed.some((name) => names.includes(name));
      if (skipping) continue;
    }
    if (skipping) {
      if (line.includes('strip:end')) skipping = false;
      continue;
    }
    out.push(line);
  }
  if (skipping) throw new Error('strip:begin without strip:end');
  return out.join('');
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return [path];
  });
}

/** Core sources (src outside the modules and the generated client) that import a module. */
function coreFiles(names) {
  return walk(join(ROOT, 'src'))
    .filter((path) => /\.tsx?$/.test(path))
    .filter((path) => !path.startsWith(`${MODULES}/`) && !path.includes('/api/generated/'))
    .filter((path) => {
      const text = readFileSync(path, 'utf8');
      return pointAtOff(text, names) !== text;
    });
}

function markedFiles() {
  const workflows = join(ROOT, '.github', 'workflows');
  if (!existsSync(workflows)) return [];
  return walk(workflows).filter((path) => MARKER.test(readFileSync(path, 'utf8')));
}

export function plan(names) {
  const unknown = names.filter((name) => !(name in MODULE_FLAGS));
  if (unknown.length) {
    throw new Error(
      `Unknown modules: ${unknown.join(', ')} (known: ${Object.keys(MODULE_FLAGS).join(', ')})`,
    );
  }
  const removed = withDependents(names).filter((name) => existsSync(join(MODULES, name)));
  const rel = (path) => relative(ROOT, path);
  return {
    removed,
    folders: removed.map((name) => rel(join(MODULES, name))),
    core: coreFiles(removed).map(rel),
    marked: markedFiles().map(rel),
  };
}

export function apply(steps) {
  for (const folder of steps.folders) rmSync(join(ROOT, folder), { recursive: true });
  for (const file of steps.core) {
    const path = join(ROOT, file);
    writeFileSync(path, pointAtOff(readFileSync(path, 'utf8'), steps.removed));
  }
  for (const file of steps.marked) {
    const path = join(ROOT, file);
    writeFileSync(path, removeMarkedBlocks(readFileSync(path, 'utf8'), steps.removed));
  }
  // The new import paths sort differently
  const biome = join(ROOT, 'node_modules', '.bin', 'biome');
  if (steps.core.length && existsSync(biome)) {
    execFileSync(biome, ['check', '--write', ...steps.core], { cwd: ROOT, stdio: 'inherit' });
  }
}

async function main(argv) {
  const flags = new Set(argv.filter((arg) => arg.startsWith('--')));
  let names = argv.filter((arg) => !arg.startsWith('--'));
  if (!names.length) {
    const envPath = join(ROOT, '..', 'osnova_backend', '.env');
    if (!existsSync(envPath)) {
      console.log('No ../osnova_backend/.env to read the flags from: name the modules, e.g.');
      console.log('  npm run strip -- files notifications');
      return 1;
    }
    names = disabledByEnv(parseEnv(readFileSync(envPath, 'utf8')));
  }
  const steps = plan(names);
  if (!steps.removed.length) {
    console.log('Nothing to remove.');
    return 0;
  }
  console.log(`Modules to remove: ${steps.removed.join(', ')}`);
  for (const folder of steps.folders) console.log(`  delete ${folder}`);
  for (const file of steps.core) console.log(`  edit   ${file} (imports from src/modules/off.ts)`);
  for (const file of steps.marked) console.log(`  edit   ${file} (strip:begin blocks)`);
  if (!flags.has('--apply')) {
    console.log('\nNothing changed. Run with --apply to remove: npm run strip -- --apply');
    return 0;
  }
  const status = execFileSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' });
  if (status.trim()) {
    console.log('\nThe git working tree has changes: commit them first, so this can be undone.');
    return 1;
  }
  if (!flags.has('--yes')) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question('\nType yes to remove: ');
    rl.close();
    if (answer.trim() !== 'yes') {
      console.log('Cancelled.');
      return 1;
    }
  }
  apply(steps);
  console.log('\nDone. Check with npm run lint, npm run typecheck, npm test, then commit.');
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv.slice(2)).then((code) => process.exit(code));
}
