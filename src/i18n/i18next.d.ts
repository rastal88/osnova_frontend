import 'i18next';

import type admin from '../locales/en/admin.json';
import type auth from '../locales/en/auth.json';
import type common from '../locales/en/common.json';
import type forms from '../locales/en/forms.json';
import type home from '../locales/en/home.json';
import type seo from '../locales/en/seo.json';

// Keys are checked against the English files at compile time.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      home: typeof home;
      auth: typeof auth;
      admin: typeof admin;
      forms: typeof forms;
      seo: typeof seo;
    };
  }
}
