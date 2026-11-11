import type { BootstrapI18n } from '../api/bootstrap';
import i18n from './index';

/**
 * Every page lives under a language prefix: /en/..., /ru/...
 * A URL without a known prefix is redirected to the saved language,
 * then the browser language, then the backend default.
 */
const STORAGE_KEY = 'app_language';

function readSaved(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function save(language: string) {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Storage may be unavailable (private mode); the URL still carries the language.
  }
}

export function languageFromPath(pathname: string, codes: string[]): string | null {
  const first = pathname.split('/')[1]?.toLowerCase();
  return first && codes.includes(first) ? first : null;
}

/** '/en/login' -> '/login', '/en' -> '/' */
export function stripLanguage(pathname: string, codes: string[]): string {
  const language = languageFromPath(pathname, codes);
  if (!language) return pathname;
  return pathname.slice(language.length + 1) || '/';
}

/** '/login' -> '/en/login', '/' -> '/en' */
export function localizedPath(path: string, language: string = i18n.language): string {
  return `/${language}${path === '/' ? '' : path}`;
}

export function detectLanguage(config: BootstrapI18n): string {
  const codes = config.languages.map((language) => language.code);
  const saved = readSaved();
  if (saved && codes.includes(saved)) return saved;

  for (const tag of navigator.languages ?? []) {
    const code = tag.toLowerCase().split('-')[0];
    if (codes.includes(code)) return code;
  }
  return config.default;
}

/** Applies the language from the URL, adding a prefix when it is missing. */
export async function setupLanguage(config: BootstrapI18n) {
  const codes = config.languages.map((language) => language.code);
  const { pathname, search, hash } = window.location;
  let language = languageFromPath(pathname, codes);

  if (!language) {
    language = detectLanguage(config);
    window.history.replaceState(
      window.history.state,
      '',
      `${localizedPath(pathname, language)}${search}${hash}`,
    );
  }

  await i18n.changeLanguage(language);
}

interface SwitchOptions {
  /** A page to open instead of the current one, without the prefix (e.g. after sign-in) */
  path?: string;
  /** Replace the history entry instead of adding one */
  replace?: boolean;
}

/**
 * Switches the language, keeping the current page (or opening `path`), and remembers
 * the choice. The router is built again for the new prefix and opens the URL.
 */
export async function switchLanguage(
  language: string,
  codes: string[],
  { path, replace = false }: SwitchOptions = {},
) {
  const { pathname, search, hash } = window.location;
  save(language);
  const url = path
    ? localizedPath(path, language)
    : `${localizedPath(stripLanguage(pathname, codes), language)}${search}${hash}`;
  if (replace) window.history.replaceState(null, '', url);
  else window.history.pushState(null, '', url);
  await i18n.changeLanguage(language);
}
