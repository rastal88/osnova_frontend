import 'i18next';

import type admin from '../locales/en/admin.json';
import type auth from '../locales/en/auth.json';
import type common from '../locales/en/common.json';
import type examples from '../locales/en/examples.json';
import type files from '../locales/en/files.json';
import type forms from '../locales/en/forms.json';
import type home from '../locales/en/home.json';
import type legal from '../locales/en/legal.json';
import type notifications from '../locales/en/notifications.json';
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
      examples: typeof examples;
      files: typeof files;
      seo: typeof seo;
      legal: typeof legal;
      notifications: typeof notifications;
    };
  }
}
