import { afterEach, describe, expect, it, vi } from 'vitest';

import { detectLanguage, languageFromPath, localizedPath, stripLanguage } from './language';

const codes = ['en', 'ru'];
const config = {
  default: 'en',
  languages: codes.map((code) => ({ code, name: code })),
};

describe('language in the URL', () => {
  it('reads a known prefix only', () => {
    expect(languageFromPath('/ru/contact', codes)).toBe('ru');
    expect(languageFromPath('/EN', codes)).toBe('en');
    expect(languageFromPath('/de/contact', codes)).toBeNull();
    expect(languageFromPath('/', codes)).toBeNull();
  });

  it('strips and adds the prefix', () => {
    expect(stripLanguage('/en/login', codes)).toBe('/login');
    expect(stripLanguage('/en', codes)).toBe('/');
    expect(stripLanguage('/login', codes)).toBe('/login');
    expect(localizedPath('/login', 'ru')).toBe('/ru/login');
    expect(localizedPath('/', 'ru')).toBe('/ru');
  });
});

describe('detectLanguage', () => {
  const browser = (saved: string | null, languages: string[]) => {
    vi.stubGlobal('localStorage', { getItem: () => saved });
    vi.stubGlobal('navigator', { languages });
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('prefers the saved choice', () => {
    browser('ru', ['en-US']);
    expect(detectLanguage(config)).toBe('ru');
  });

  it('then the browser language, ignoring the region', () => {
    browser(null, ['de-DE', 'ru-RU']);
    expect(detectLanguage(config)).toBe('ru');
  });

  it('falls back to the backend default', () => {
    browser('fr', ['de-DE']);
    expect(detectLanguage(config)).toBe('en');
  });
});
