import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import type { UserRead } from '../../api/generated';
import i18n from '../../i18n';
import { switchLanguage } from '../../i18n/language';
import { useBootstrapStore } from '../../store/bootstrapStore';
import { updateLanguage } from './api';
import { landingPath } from './areas';
import { useAuthStore } from './authStore';

/**
 * The account's language (backend: `users.language`): emails and notifications go in
 * it. Choosing a language in the header or in the profile saves it to the account;
 * signing in opens the site in it.
 */

export interface SignInLanguage {
  /** Open the site in the account's language */
  switchTo?: string;
  /** An account without a language (made before it existed) takes the current one */
  save?: string;
}

export function languageAtSignIn(
  own: string | null | undefined,
  current: string,
  codes: string[],
): SignInLanguage {
  if (own && codes.includes(own)) return own === current ? {} : { switchTo: own };
  return { save: current };
}

/** A language chosen while signed in is saved when it is not the account's one yet. */
export function needsSaving(user: Pick<UserRead, 'language'> | null, language: string) {
  return user !== null && user.language !== language;
}

async function save(language: string) {
  try {
    useAuthStore.getState().setUser(await updateLanguage(language));
  } catch {
    // The interface keeps the language; the account gets it with the next choice
  }
}

/** Saves every language switch of a signed-in user (header switcher, profile, back / forward). */
export function saveLanguageChoices() {
  i18n.on('languageChanged', (language) => {
    if (needsSaving(useAuthStore.getState().user, language)) void save(language);
  });
}

/** After sign-in: open the landing page of the user, in the account's language. */
export function useEnterAccount() {
  const navigate = useNavigate();
  const languages = useBootstrapStore((state) => state.config?.i18n.languages);

  return useCallback(
    async (user: UserRead | null, { replace = false } = {}) => {
      const path = landingPath(user);
      const codes = (languages ?? []).map((language) => language.code);
      const { switchTo, save: current } = user
        ? languageAtSignIn(user.language, i18n.language, codes)
        : {};
      if (current) void save(current);
      // A new prefix builds a new router, which opens the page itself
      if (switchTo) await switchLanguage(switchTo, codes, { path, replace });
      else navigate(path, { replace });
    },
    [navigate, languages],
  );
}
