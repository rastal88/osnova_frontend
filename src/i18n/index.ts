import i18n from 'i18next';
import type { BackendModule } from 'i18next';
import { initReactI18next } from 'react-i18next';

import common from '../locales/en/common.json';

/**
 * Translations live in src/locales/<language>/<namespace>.json.
 * English is the source language: every key exists there, and it is the fallback.
 * Only English `common` is bundled (it is needed before /bootstrap answers);
 * every other file is a separate chunk loaded when a page asks for its namespace.
 */
export const SOURCE_LANGUAGE = 'en';

const loaders = import.meta.glob<{ default: Record<string, unknown> }>([
  '../locales/*/*.json',
  '!../locales/en/common.json',
]);

const lazyLocales: BackendModule = {
  type: 'backend',
  init: () => {},
  read: (language, namespace, callback) => {
    if (language === SOURCE_LANGUAGE && namespace === 'common') {
      callback(null, common);
      return;
    }
    const load = loaders[`../locales/${language}/${namespace}.json`];
    if (!load) {
      callback(null, {});
      return;
    }
    load().then(
      (module) => callback(null, module.default),
      (error) => callback(error, null),
    );
  },
};

void i18n
  .use(lazyLocales)
  .use(initReactI18next)
  .init({
    lng: SOURCE_LANGUAGE,
    fallbackLng: SOURCE_LANGUAGE,
    ns: ['common'],
    defaultNS: 'common',
    resources: { [SOURCE_LANGUAGE]: { common } },
    partialBundledLanguages: true,
    interpolation: { escapeValue: false },
  });

i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language;
});

export default i18n;
