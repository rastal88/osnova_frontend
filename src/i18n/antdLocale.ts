import type { Locale } from 'antd/es/locale';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Ant Design texts (empty states, pagination, pickers). English is built in;
// other locales are loaded on demand. Add a line here when adding a language.
const loaders: Record<string, () => Promise<{ default: Locale }>> = {
  ru: () => import('antd/locale/ru_RU'),
};

export function useAntdLocale(): Locale | undefined {
  const { i18n } = useTranslation();
  const [locale, setLocale] = useState<Locale>();

  useEffect(() => {
    const load = loaders[i18n.language];
    if (!load) {
      setLocale(undefined);
      return;
    }
    let active = true;
    void load().then((module) => {
      if (active) setLocale(module.default);
    });
    return () => {
      active = false;
    };
  }, [i18n.language]);

  return locale;
}
