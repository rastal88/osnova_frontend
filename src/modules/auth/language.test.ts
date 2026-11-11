import { describe, expect, it } from 'vitest';

import { languageAtSignIn, needsSaving } from './language';

const codes = ['en', 'ru'];

describe('languageAtSignIn', () => {
  it("opens the site in the account's language", () => {
    expect(languageAtSignIn('ru', 'en', codes)).toEqual({ switchTo: 'ru' });
    expect(languageAtSignIn('en', 'en', codes)).toEqual({});
  });

  it('gives an account without a language the current one', () => {
    expect(languageAtSignIn(null, 'ru', codes)).toEqual({ save: 'ru' });
    expect(languageAtSignIn(undefined, 'en', codes)).toEqual({ save: 'en' });
  });

  it('replaces a language that is no longer enabled', () => {
    expect(languageAtSignIn('de', 'en', codes)).toEqual({ save: 'en' });
  });
});

describe('needsSaving', () => {
  it('saves only for a signed-in user with another language', () => {
    expect(needsSaving({ language: 'en' }, 'ru')).toBe(true);
    expect(needsSaving({ language: null }, 'ru')).toBe(true);
    expect(needsSaving({ language: 'ru' }, 'ru')).toBe(false);
    expect(needsSaving(null, 'ru')).toBe(false);
  });
});
